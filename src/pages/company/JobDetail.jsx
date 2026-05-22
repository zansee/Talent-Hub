import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Briefcase, FileText, Share2, Users, Edit3, Power, PowerOff, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuth from '../../hooks/useAuth';
import { formatBWP, formatDate, getInitials } from '../../utils/formatters';
import Badge from '../../components/shared/Badge';
import { statusConfig } from '../../utils/helpers';

export const JobDetail = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, applications, analytics
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          supabase.from('jobs').select('*, companies(*)').eq('id', id).single(),
          supabase.from('applications').select('*, profiles(*)').eq('job_id', id).order('created_at', { ascending: false })
        ]);
        
        if (jobRes.data) setJob(jobRes.data);
        if (appsRes.data) setApplications(appsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const toggleStatus = async () => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    await supabase.from('jobs').update({ status: newStatus }).eq('id', id);
    setJob({ ...job, status: newStatus });
  };

  const copyLink = () => {
    const url = `${window.location.origin}/j/${job.public_token}`;
    navigator.clipboard.writeText(url);
    alert('Public link copied to clipboard!');
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading job details...</div>;
  if (!job) return <div className="p-10 text-center text-red-500">Job not found</div>;

  const mockAnalyticsData = [
    { name: 'Views', value: 450 },
    { name: 'Swipes Right', value: 120 },
    { name: 'Applied', value: applications.length },
    { name: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-display font-bold text-slate-900">{job.title}</h1>
              <Badge variant={job.status === 'open' ? 'success' : 'default'} className="uppercase">{job.status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase size={16} /> {job.employment_type}</span>
              <span className="flex items-center gap-1.5"><FileText size={16} /> Posted {formatDate(job.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={copyLink} className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer" title="Copy public link">
               <Share2 size={18} />
             </button>
             <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
               <Edit3 size={16} /> Edit Job
             </button>
             <button onClick={toggleStatus} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${job.status === 'open' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
               {job.status === 'open' ? <><PowerOff size={16} /> Close Job</> : <><Power size={16} /> Reopen Job</>}
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-8 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', count: null },
            { id: 'applications', label: 'Applications', count: applications.length },
            { id: 'analytics', label: 'Analytics', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
                 <div>
                   <h3 className="font-display font-bold text-slate-900 mb-2">Job Description</h3>
                   <div className="text-sm text-slate-600 font-sans leading-relaxed whitespace-pre-line">
                     {job.description}
                   </div>
                 </div>
                 {job.required_skills && job.required_skills.length > 0 && (
                   <div>
                     <h3 className="font-display font-bold text-slate-900 mb-3">Required Skills</h3>
                     <div className="flex flex-wrap gap-2">
                       {job.required_skills.map(skill => (
                         <span key={skill} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">{skill}</span>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
              <div className="col-span-1 flex flex-col gap-4">
                 <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
                   <h3 className="font-display font-bold text-slate-900 border-b border-slate-100 pb-2">Key Details</h3>
                   <div className="flex flex-col gap-3 text-sm text-slate-600">
                     <div>
                       <span className="block text-[10px] font-bold uppercase text-slate-400">Salary Range</span>
                       <span className="font-medium text-slate-900">{formatBWP(job.salary_min)} - {formatBWP(job.salary_max)}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] font-bold uppercase text-slate-400">Experience</span>
                       <span className="font-medium text-slate-900">{job.required_experience} years</span>
                     </div>
                     <div>
                       <span className="block text-[10px] font-bold uppercase text-slate-400">Qualification</span>
                       <span className="font-medium text-slate-900">{job.required_qualification}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] font-bold uppercase text-slate-400">Industry</span>
                       <span className="font-medium text-slate-900">{job.industry}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] font-bold uppercase text-slate-400">Deadline</span>
                       <span className="font-medium text-red-600">{formatDate(job.application_deadline)}</span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-500 tracking-wider">
                     <th className="px-5 py-3">Candidate</th>
                     <th className="px-5 py-3">Applied</th>
                     <th className="px-5 py-3">Match Score</th>
                     <th className="px-5 py-3">Status</th>
                     <th className="px-5 py-3 text-right"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                   {applications.map(app => {
                     const profile = app.profiles || {};
                     const sc = statusConfig[app.status] || statusConfig.applied;
                     return (
                       <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-5 py-3 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                             {getInitials(profile.full_name || 'Candidate')}
                           </div>
                           <div>
                             <p className="font-semibold text-slate-900">{profile.full_name || 'Anonymous'}</p>
                             <p className="text-[10px] text-slate-500">{profile.highest_qualification}</p>
                           </div>
                         </td>
                         <td className="px-5 py-3 text-slate-500">{formatDate(app.created_at)}</td>
                         <td className="px-5 py-3">
                           <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary text-primary font-bold text-xs">
                             {app.match_score || 0}
                           </span>
                         </td>
                         <td className="px-5 py-3">
                           <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
                             {sc.label}
                           </span>
                         </td>
                         <td className="px-5 py-3 text-right">
                           <Link to={`/company/candidate/${app.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                             <ChevronRight size={18} />
                           </Link>
                         </td>
                       </tr>
                     )
                   })}
                   {applications.length === 0 && (
                     <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">No applications yet.</td></tr>
                   )}
                 </tbody>
               </table>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
              <h3 className="font-display font-bold text-slate-900 mb-6">Engagement Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockAnalyticsData} layout="vertical" barSize={24} margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="value" fill="#6B7C3A" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#0f172a', fontSize: 12, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default JobDetail;
