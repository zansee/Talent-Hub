import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import { 
  GitPullRequest, 
  MapPin, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Tag, 
  Check, 
  ChevronRight,
  User,
  ArrowRight,
  FileText
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'applied', label: 'Applied', color: 'border-t-blue-500 bg-blue-50/50' },
  { id: 'reviewed', label: 'Reviewed', color: 'border-t-indigo-500 bg-indigo-50/50' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-t-purple-500 bg-purple-50/50' },
  { id: 'interviewed', label: 'Interviewed', color: 'border-t-orange-500 bg-orange-50/50' },
  { id: 'offer', label: 'Offer Sent', color: 'border-t-green-500 bg-green-50/50' },
  { id: 'rejected', label: 'Rejected', color: 'border-t-red-500 bg-red-50/50' }
];

export const CandidatePipeline = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Note creation overlay
  const [activeNoteAppId, setActiveNoteAppId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const fetchApplications = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*), seeker:user_id(*)')
        .eq('company_id', profile.company_id);

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchApplications();
    }
  }, [profile]);

  const handleMoveStage = async (appId, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));

      // Trigger user notification
      const applicantId = applications.find(a => a.id === appId)?.user_id;
      if (applicantId) {
        await supabase.from('notifications').insert({
          user_id: applicantId,
          title: `💼 Pipeline Status Changed`,
          body: `Your application stage has been updated to "${newStatus.toUpperCase()}"`,
          type: 'pipeline_update'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !activeNoteAppId) return;

    try {
      // Mock saving notes inside supporting_docs or comments (as an audit log update)
      const app = applications.find(a => a.id === activeNoteAppId);
      const prevDocs = app.supporting_docs || {};
      const updatedNotes = [...(prevDocs.notes || []), { text: noteText, author: profile.full_name, date: new Date().toLocaleDateString() }];

      const { error } = await supabase
        .from('applications')
        .update({
          supporting_docs: { ...prevDocs, notes: updatedNotes }
        })
        .eq('id', activeNoteAppId);

      if (error) throw error;

      // Update state locally
      setApplications(prev => prev.map(a => a.id === activeNoteAppId ? { ...a, supporting_docs: { ...prevDocs, notes: updatedNotes } } : a));
      setNoteText('');
      setActiveNoteAppId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans h-full">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Candidate Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual Board for candidate stages. Change a candidate's status by using the action menus on each card.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading Pipeline columns...</div>
      ) : (
        /* Columns Scroll Board container */
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar items-start h-[500px]">
          {PIPELINE_STAGES.map((column) => {
            const colApps = applications.filter(a => a.status === column.id);

            return (
              <div 
                key={column.id}
                className="w-72 bg-white border border-slate-200/80 rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-sm max-h-full border-t-4"
                style={{ borderTopColor: column.id === 'applied' ? '#3b82f6' : column.id === 'reviewed' ? '#6366f1' : column.id === 'shortlisted' ? '#a855f7' : column.id === 'interviewed' ? '#f97316' : column.id === 'offer' ? '#22c55e' : '#ef4444' }}
              >
                {/* Column header */}
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center select-none">
                  <span className="text-xs font-bold text-slate-800">{column.label}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 text-[10px] font-bold">
                    {colApps.length}
                  </span>
                </div>

                {/* Column cards container */}
                <div className="p-3 flex flex-col gap-3 overflow-y-auto no-scrollbar flex-1 bg-slate-50/10">
                  {colApps.length === 0 ? (
                    <div className="py-8 text-center text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No candidates in this stage
                    </div>
                  ) : (
                    colApps.map((app) => {
                      const seeker = app.seeker || {};
                      const name = seeker.full_name || app.external_name || 'Anonymous';
                      
                      return (
                        <div 
                          key={app.id}
                          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5 hover:border-primary/20 transition-colors"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-[11px] font-bold text-slate-900 truncate">{name}</span>
                              <span className="text-[9px] text-slate-500 font-semibold truncate">{app.jobs?.title}</span>
                            </div>
                            
                            {/* Score badge */}
                            {seeker.cv_score && (
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold shrink-0">
                                {seeker.cv_score}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-semibold">
                            <MapPin size={10} className="text-slate-400" />
                            <span>{seeker.location || 'Botswana'}</span>
                          </div>

                          {/* Notes/Tags summary */}
                          {app.supporting_docs?.notes && app.supporting_docs.notes.length > 0 && (
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-[9px] text-slate-500 leading-normal flex items-start gap-1">
                              <MessageSquare size={10} className="text-slate-400 shrink-0 mt-0.5" />
                              <p className="truncate">
                                "{app.supporting_docs.notes[app.supporting_docs.notes.length - 1].text}"
                              </p>
                            </div>
                          )}

                          {/* Action footer */}
                          <div className="flex justify-between items-center border-t border-slate-100 pt-2.5 mt-1">
                            <button
                              onClick={() => setActiveNoteAppId(app.id)}
                              className="text-[9px] font-bold text-slate-500 hover:text-slate-950 flex items-center gap-0.5 transition-colors cursor-pointer"
                            >
                              <MessageSquare size={10} /> + Note
                            </button>

                            {/* Quick Move stage selector */}
                            <select
                              value={app.status}
                              onChange={(e) => handleMoveStage(app.id, e.target.value)}
                              className="px-2 py-1 text-[9px] font-bold rounded bg-slate-50 border border-slate-200 text-slate-600 focus:outline-none cursor-pointer"
                            >
                              {PIPELINE_STAGES.map(s => (
                                <option key={s.id} value={s.id}>Move: {s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Addition Overlay Modal */}
      {activeNoteAppId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl animate-slide-up">
            <h3 className="text-sm font-bold font-display text-slate-900">Add Evaluator Note</h3>
            <form onSubmit={handleAddNote} className="flex flex-col gap-3">
              <textarea
                placeholder="Type interview notes, feedback, or follow-up plans..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-slate-50 border-slate-200 focus:outline-none text-slate-800 placeholder-slate-400"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveNoteAppId(null)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Note</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidatePipeline;
