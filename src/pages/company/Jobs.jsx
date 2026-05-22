import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import { 
  Briefcase, 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  CheckCircle2, 
  XCircle,
  MoreVertical
} from 'lucide-react';

export const Jobs = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, draft, closed

  const fetchJobs = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, applications(count)')
        .eq('company_id', profile.company_id);

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchJobs();
    }
  }, [profile]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          (job.location && job.location.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">● Active</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 flex items-center gap-1">● Draft</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">● Closed</span>;
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Job Postings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and track your active job listings and candidates.</p>
        </div>
        <button
          onClick={() => navigate('/company/jobs/create')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} /> Post a Job
        </button>
      </div>

      {/* Filters row */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search jobs by title or town..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-sans rounded-xl border bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter status tabs */}
        <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto">
          {['all', 'active', 'draft', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                filterStatus === status ? 'bg-white text-slate-950 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* Jobs grid/list */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-sans">
          Loading jobs list...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
            <Briefcase size={28} />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-sm font-bold text-slate-800 font-display">No jobs found</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Get started by creating your first job post. You can specify match weights, screening questions, and filters.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/company/jobs/create')}
            className="mt-2"
          >
            Create Job Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const applicantsCount = job.applications?.[0]?.count || 0;
            return (
              <div 
                key={job.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative hover:border-primary/30 transition-all hover:translate-y-[-1px] group"
              >
                {/* Header status */}
                <div className="flex justify-between items-start">
                  {getStatusBadge(job.status)}
                  <button className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Job Title details */}
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-bold font-display text-slate-900 group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-slate-400" /> {job.location || 'Gaborone'}
                  </span>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100 text-center text-xs font-sans text-slate-600 mt-1">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Views</span>
                    <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Eye size={12} className="text-slate-400" /> {job.view_count || 0}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-x border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Applicants</span>
                    <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Users size={12} className="text-slate-400" /> {applicantsCount}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Type</span>
                    <span className="font-bold text-slate-800 text-[10px] tracking-tight truncate px-1">
                      {job.employment_type || 'Full-time'}
                    </span>
                  </div>
                </div>

                {/* CTA Links */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-1 text-xs">
                  <Link
                    to={`/company/applications?job_id=${job.id}`}
                    className="text-primary hover:underline font-bold text-[10px] uppercase tracking-wider"
                  >
                    View Applicants →
                  </Link>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Jobs;
