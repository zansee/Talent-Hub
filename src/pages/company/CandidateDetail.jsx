import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Mail, Phone, MapPin, Download, CheckCircle2, ChevronDown, MessageSquare, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatBWP, formatDate, formatRelativeTime, getInitials } from '../../utils/formatters';
import { statusConfig } from '../../utils/helpers';
import CircularProgress from '../../components/shared/CircularProgress';

export const CandidateDetail = () => {
  const { id } = useParams(); // Application ID
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cv'); // cv, screening, notes

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, profiles(*), jobs(*)')
          .eq('id', id)
          .single();
        if (data) setApp(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchApp();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    await supabase.from('applications').update({ status: newStatus }).eq('id', id);
    setApp({ ...app, status: newStatus });
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading candidate profile...</div>;
  if (!app) return <div className="p-10 text-center text-red-500">Candidate not found</div>;

  const profile = app.profiles;
  const job = app.jobs;
  const sc = statusConfig[app.status] || statusConfig.applied;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 flex items-center justify-between">
        <Link to={`/company/job/${job.id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Back to Job: <span className="font-semibold text-slate-700">{job.title}</span>
        </Link>
        <div className="relative group">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border cursor-pointer ${sc.bg} ${sc.color}`}>
            {sc.label} <ChevronDown size={14} />
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button 
                key={key} 
                onClick={() => handleStatusChange(key)}
                className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${app.status === key ? 'bg-slate-50 text-slate-900' : 'text-slate-600'}`}
              >
                Move to: {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
          
          {/* Left Column: Profile Summary */}
          <div className="col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-3xl mb-4 relative">
                {getInitials(profile.full_name)}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                  <CircularProgress value={app.match_score || 0} size={40} strokeWidth={4} />
                </div>
              </div>
              <h2 className="font-display font-bold text-xl text-slate-900">{profile.full_name}</h2>
              <p className="text-sm text-slate-500 mt-1">{profile.current_job_title || 'Professional'}</p>
              
              <div className="w-full flex flex-col gap-3 mt-6 text-sm text-slate-600">
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-primary transition-colors"><Mail size={16} className="text-slate-400" /> {profile.email}</a>
                <a href={`tel:${profile.phone}`} className="flex items-center gap-3 hover:text-primary transition-colors"><Phone size={16} className="text-slate-400" /> {profile.phone || 'Not provided'}</a>
                <span className="flex items-center gap-3"><MapPin size={16} className="text-slate-400" /> {profile.location || 'Location not specified'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Experience</h3>
                <p className="text-sm font-semibold text-slate-800">{profile.years_of_experience} years</p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Education</h3>
                <p className="text-sm font-semibold text-slate-800">{profile.highest_qualification}</p>
                <p className="text-xs text-slate-500 mt-0.5">{profile.field_of_study}</p>
                <p className="text-xs text-slate-500 mt-0.5">{profile.institution_name}</p>
              </div>
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(s => <span key={s} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">{s}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              
              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50/50 px-2">
                {[
                  { id: 'cv', label: 'CV & Cover Letter', icon: FileText },
                  { id: 'screening', label: 'Screening Answers', icon: CheckCircle2 },
                  { id: 'notes', label: 'Internal Notes', icon: MessageSquare }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === tab.id ? 'border-primary text-primary bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8 flex-1 overflow-y-auto">
                {activeTab === 'cv' && (
                  <div className="flex flex-col gap-8">
                    {app.cover_letter && (
                      <div>
                        <h3 className="font-display font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-primary" /> Cover Letter</h3>
                        <div className="text-sm text-slate-600 font-sans leading-relaxed whitespace-pre-line p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          {app.cover_letter}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-display font-bold text-slate-900 mb-4 flex items-center gap-2"><Download size={18} className="text-primary" /> Curriculum Vitae (CV)</h3>
                      {profile.cv_url ? (
                        <a href={profile.cv_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-primary/50 transition-colors group">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center"><FileText size={20} /></div>
                             <div>
                               <p className="text-sm font-semibold text-slate-900">{profile.full_name.split(' ')[0]}_CV.pdf</p>
                               <p className="text-xs text-slate-500">Uploaded {formatDate(profile.updated_at)}</p>
                             </div>
                           </div>
                           <Download size={18} className="text-slate-400 group-hover:text-primary" />
                        </a>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No CV uploaded.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'screening' && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-display font-bold text-slate-900 mb-2">Applicant Answers</h3>
                    {app.screening_answers && Object.keys(app.screening_answers).length > 0 ? (
                      Object.entries(app.screening_answers).map(([q, a], i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-700">Q: {q}</p>
                          <p className="text-sm text-slate-600 font-medium">A: {a}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic">No screening questions were asked for this job.</p>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="flex flex-col h-full gap-4">
                     <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                       <p className="text-xs font-semibold text-amber-800 flex items-center gap-2">
                         <MessageSquare size={14} /> Internal notes are only visible to your hiring team.
                       </p>
                     </div>
                     
                     <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-[200px]">
                        <p className="text-sm text-slate-400 text-center py-10 italic">No notes added yet.</p>
                     </div>

                     <div className="mt-auto border border-slate-200 rounded-xl p-2 flex gap-2">
                       <input type="text" placeholder="Add a note about this candidate..." className="flex-1 bg-transparent px-3 text-sm outline-none" />
                       <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer">Post</button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
