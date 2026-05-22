import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import { 
  Users, 
  MapPin, 
  Search, 
  GitPullRequest, 
  Sparkles, 
  Check, 
  X, 
  Download,
  AlertCircle,
  FileCheck2,
  ChevronDown
} from 'lucide-react';

export const Applications = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('job_id');

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & search
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(jobIdParam || 'all');
  const [activeTab, setActiveTab] = useState('all'); // all, shortlisted, rejected, active

  // Selected candidates for comparison
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchData = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      // 1. Fetch company jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', profile.company_id);
      setJobs(jobsData || []);

      // 2. Fetch applications
      let query = supabase
        .from('applications')
        .select('*, jobs(*), seeker:user_id(*)')
        .eq('company_id', profile.company_id);

      if (selectedJob !== 'all') {
        query = query.eq('job_id', selectedJob);
      }

      const { data: appsData, error } = await query;
      if (error) throw error;
      setApplications(appsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchData();
    }
  }, [profile, selectedJob]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;

      // Update local state
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));

      // Trigger automatic match notification or email alert (handled by DB triggers or simulated notification here)
      await supabase.from('notifications').insert({
        user_id: applications.find(a => a.id === appId)?.user_id,
        title: `💼 Application Status Update`,
        body: `Your application has been updated to "${newStatus.toUpperCase()}". Check details in applications tab.`,
        type: 'application_status'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCandidate = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can select a maximum of 3 candidates for side-by-side comparison.');
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      alert('Select at least 2 candidates to compare.');
      return;
    }
    navigate(`/company/compare?ids=${selectedIds.join(',')}`);
  };

  const filteredApps = applications.filter(app => {
    const seekerName = app.seeker?.full_name || app.external_name || '';
    const jobTitle = app.jobs?.title || '';
    const matchesSearch = seekerName.toLowerCase().includes(search.toLowerCase()) || 
                          jobTitle.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'shortlisted') return app.status === 'shortlisted' && matchesSearch;
    if (activeTab === 'rejected') return app.status === 'rejected' && matchesSearch;
    if (activeTab === 'active') return ['applied', 'reviewed', 'shortlisted', 'interviewed'].includes(app.status) && matchesSearch;
    return matchesSearch; // all
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Job Applications</h1>
          <p className="text-xs text-slate-500 mt-1">Review applicant profiles, CV scores, and progress candidates down the funnel.</p>
        </div>

        {selectedIds.length >= 2 && (
          <button
            onClick={handleCompare}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
          >
            <Sparkles size={14} /> Compare Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Filters card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search candidates or jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-sans rounded-xl border bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Job select filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2 text-xs font-sans rounded-xl border bg-white border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-auto"
          >
            <option value="all">All Job Postings</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          {/* Status Filter tabs */}
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-full md:w-auto">
            {['all', 'active', 'shortlisted', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                  activeTab === tab ? 'bg-white text-slate-950 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Applications Table list */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading applicants data...</div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
            <Users size={28} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 font-display">No applicants matching filters</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-sans">
            Adjust filters or search parameters. Candidates appear here after swiping right on job posts.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 w-10">Select</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Job Role</th>
                <th className="py-3.5 px-4 text-center">CV Score</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApps.map((app) => {
                const seeker = app.seeker || {};
                const name = seeker.full_name || app.external_name || 'Anonymous candidate';
                const email = seeker.email || app.external_email || '';
                const jobTitle = app.jobs?.title || 'Job post';

                return (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => handleSelectCandidate(app.id)}
                        className="rounded border-slate-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900">{name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{jobTitle}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {seeker.cv_score ? (
                        <span className="px-2 py-0.5 rounded font-bold bg-primary/10 text-primary border border-primary/20">
                          {seeker.cv_score}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-bold capitalize text-[10px] bg-slate-100 border border-slate-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {app.status === 'applied' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <Check size={12} /> Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'rejected')}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200/50 font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <X size={12} /> Reject
                            </button>
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <button
                            onClick={() => navigate(`/company/interviews?app_id=${app.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200/50 font-bold transition-colors cursor-pointer"
                          >
                            Schedule Interview
                          </button>
                        )}
                        <Link
                          to={`/company/pipeline`}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold hover:text-slate-900 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default Applications;
