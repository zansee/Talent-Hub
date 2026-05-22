import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  XOctagon, 
  Plus, 
  Calendar,
  Building,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Building2,
  ExternalLink
} from 'lucide-react';

export const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New Job Form State (for Admin Announcement postings)
  const [newJob, setNewJob] = useState({
    title: '',
    company_id: '', // can be blank/system for admin posts
    description: '',
    location: 'Gaborone',
    industry: 'Banking, Finance & Insurance',
    employment_type: 'Full-time',
    salary_min: '',
    salary_max: '',
    required_skills: '',
    required_experience: '0-2',
    required_qualification: 'Degree',
    field_of_study: '',
    application_email: '',
    application_deadline: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Jobs
      const { data: jobsData, error: jobsErr } = await supabase
        .from('jobs')
        .select('*, companies(name, logo_url)')
        .order('created_at', { ascending: false });

      if (jobsErr) throw jobsErr;

      // 2. Fetch Companies for dropdown
      const { data: compData, error: compErr } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true);

      if (compErr) throw compErr;

      setJobs(jobsData || []);
      setCompanies(compData || []);
    } catch (err) {
      console.error('Failed to load jobs/companies, loading mocks:', err);
      // Mocks
      setJobs([
        { id: 'j1', title: 'Graduate Trainee Accountant', description: 'Exciting training contract in financial reporting.', location: 'Gaborone', industry: 'Banking, Finance & Insurance', employment_type: 'Graduate-Programme', salary_min: 8000, salary_max: 12000, required_experience: '0-2', status: 'active', is_admin_posted: false, created_at: '2026-05-18Z', companies: { name: 'Absa Bank Botswana' } },
        { id: 'j2', title: 'Safety Inspector', description: 'Perform audit drills and mine shaft compliance audits.', location: 'Jwaneng', industry: 'Mining & Diamonds', employment_type: 'Full-time', salary_min: 25000, salary_max: 35000, required_experience: '6-9', status: 'active', is_admin_posted: false, created_at: '2026-05-15Z', companies: { name: 'Debswana Diamond Co.' } },
        { id: 'j3', title: 'CIPA Registration Officer (Admin Post)', description: 'Government contract announcement for registration auditors.', location: 'Francistown', industry: 'General', employment_type: 'Contract', salary_min: 15000, salary_max: 20000, required_experience: '3-5', status: 'active', is_admin_posted: true, created_at: '2026-05-20Z', companies: null, application_email: 'gov-careers@cipa.co.bw' }
      ]);
      setCompanies([
        { id: 'c1', name: 'Debswana Diamond Co.' },
        { id: 'c2', name: 'Mascom Wireless' },
        { id: 'c3', name: 'Absa Bank Botswana' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = newJob.required_skills
        ? newJob.required_skills.split(',').map(s => s.trim())
        : [];

      const jobData = {
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        industry: newJob.industry,
        employment_type: newJob.employment_type,
        salary_min: newJob.salary_min ? parseFloat(newJob.salary_min) : null,
        salary_max: newJob.salary_max ? parseFloat(newJob.salary_max) : null,
        required_skills: skillsArray,
        required_experience: newJob.required_experience,
        required_qualification: newJob.required_qualification,
        field_of_study: newJob.field_of_study || null,
        application_email: newJob.application_email || null,
        application_deadline: newJob.application_deadline ? newJob.application_deadline : null,
        is_admin_posted: true,
        company_id: newJob.company_id || null, // Can link to a company if desired
        status: 'active'
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      showFeedback(`Job post "${newJob.title}" created successfully!`, 'success');
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      // Fallback Mock Add
      const mockNewJob = {
        id: 'mock-' + Math.random(),
        title: newJob.title,
        description: newJob.description,
        location: newJob.location,
        industry: newJob.industry,
        employment_type: newJob.employment_type,
        salary_min: newJob.salary_min,
        salary_max: newJob.salary_max,
        required_experience: newJob.required_experience,
        status: 'active',
        is_admin_posted: true,
        created_at: new Date().toISOString(),
        companies: newJob.company_id 
          ? { name: companies.find(c => c.id === newJob.company_id)?.name || 'Linked Partner' }
          : null,
        application_email: newJob.application_email
      };
      setJobs([mockNewJob, ...jobs]);
      showFeedback(`Job post created (Mock fallback).`, 'success');
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'closed' })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'closed' } : j));
      showFeedback('Job successfully closed for applications.', 'success');
    } catch (err) {
      console.error(err);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'closed' } : j));
      showFeedback('Job successfully closed (Mock).', 'success');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job post permanently? All seeker applications for this job will be dropped.')) return;
    
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.filter(j => j.id !== jobId));
      showFeedback('Job permanently deleted.', 'success');
    } catch (err) {
      console.error(err);
      setJobs(jobs.filter(j => j.id !== jobId));
      showFeedback('Job permanently deleted (Mock).', 'success');
    }
  };

  const resetForm = () => {
    setNewJob({
      title: '',
      company_id: '',
      description: '',
      location: 'Gaborone',
      industry: 'Banking, Finance & Insurance',
      employment_type: 'Full-time',
      salary_min: '',
      salary_max: '',
      required_skills: '',
      required_experience: '0-2',
      required_qualification: 'Degree',
      field_of_study: '',
      application_email: '',
      application_deadline: ''
    });
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.companies?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Manage Job Board</h2>
          <p className="text-slate-500 text-sm">Monitor all platform job activities, flag inappropriate contents, or post direct announcements.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/10 transition-all duration-200 shrink-0"
        >
          <Plus size={18} />
          Post Admin Job
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <Search className="absolute left-7 top-7 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search jobs by title, company name, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
        />
      </div>

      {/* Jobs Board Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading jobs database...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No jobs listed match your search filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <th className="p-4 pl-6">Job Post Info</th>
                  <th className="p-4">Provider / Company</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{job.title}</p>
                        <span className="text-xs text-slate-400 font-medium">ID: {job.id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {job.is_admin_posted ? (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold border border-indigo-200">
                          Platform Admin
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Building size={14} className="text-slate-400" />
                          {job.companies?.name || 'Linked Partner'}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {job.employment_type}</span>
                        {(job.salary_min || job.salary_max) && (
                          <span className="flex items-center gap-0.5 text-slate-600 font-semibold">
                            <DollarSign size={12} /> {job.salary_min ? `P${job.salary_min}` : '0'} - {job.salary_max ? `P${job.salary_max}` : 'Negotiable'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {job.application_deadline 
                          ? new Date(job.application_deadline).toLocaleDateString('en-GB')
                          : 'No limit'}
                      </span>
                    </td>
                    <td className="p-4">
                      {job.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-medium border border-slate-200">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        {job.status === 'active' && (
                          <button
                            onClick={() => handleCloseJob(job.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold border"
                            title="Close Applications"
                          >
                            <XOctagon size={14} /> Close
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold border border-red-200"
                          title="Delete Listing"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Admin Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl border border-slate-100 shadow-xl my-8 animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-1">Post Official Admin Listing</h3>
            <p className="text-xs text-slate-500 mb-6">
              Create an announcement or direct listing. This won't require standard company verification.
            </p>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g. CIPA Audit Officer"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Link to Company Profile (Optional)</label>
                  <select
                    value={newJob.company_id}
                    onChange={(e) => setNewJob({...newJob, company_id: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  >
                    <option value="">None (Independent Platform Post)</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location *</label>
                  <select
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  >
                    <option value="Gaborone">Gaborone</option>
                    <option value="Francistown">Francistown</option>
                    <option value="Maun">Maun</option>
                    <option value="Jwaneng">Jwaneng</option>
                    <option value="Orapa">Orapa</option>
                    <option value="Lobatse">Lobatse</option>
                    <option value="Selibe Phikwe">Selibe Phikwe</option>
                    <option value="Palapye">Palapye</option>
                    <option value="Serowe">Serowe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Employment Type *</label>
                  <select
                    value={newJob.employment_type}
                    onChange={(e) => setNewJob({...newJob, employment_type: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Graduate-Programme">Graduate Programme</option>
                    <option value="Temporary">Temporary Gig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Min Salary (BWP Monthly)</label>
                  <input
                    type="number"
                    value={newJob.salary_min}
                    onChange={(e) => setNewJob({...newJob, salary_min: e.target.value})}
                    placeholder="e.g. 5000"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Max Salary (BWP Monthly)</label>
                  <input
                    type="number"
                    value={newJob.salary_max}
                    onChange={(e) => setNewJob({...newJob, salary_max: e.target.value})}
                    placeholder="e.g. 8000"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Application Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={newJob.application_email}
                    onChange={(e) => setNewJob({...newJob, application_email: e.target.value})}
                    placeholder="e.g. applications@cipa.co.bw"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={newJob.application_deadline}
                    onChange={(e) => setNewJob({...newJob, application_deadline: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({...newJob, required_skills: e.target.value})}
                  placeholder="e.g. SQL, Financial Auditing, CIPS"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Job Description *</label>
                <textarea
                  rows={4}
                  required
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  placeholder="Provide details about key tasks, eligibility requirements, and application procedures..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-colors"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
