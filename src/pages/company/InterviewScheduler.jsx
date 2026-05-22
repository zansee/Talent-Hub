import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Briefcase, 
  Check, 
  X, 
  Sparkles,
  Link as LinkIcon,
  ArrowRight
} from 'lucide-react';

export const InterviewScheduler = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appIdParam = searchParams.get('app_id');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Form details
  const [dateTime, setDateTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/mock-thbw-room');
  const [scheduling, setScheduling] = useState(false);

  // Scheduled list mock
  const [upcomingInterviews, setUpcomingInterviews] = useState([
    { id: 1, candidate: "Thabo Kealotswe", role: "Software Engineer", date: "May 26, 2026", time: "10:00 AM", link: "https://meet.google.com/abc-defg-hij" },
    { id: 2, candidate: "Mothusi Segokgo", role: "Financial Analyst", date: "May 28, 2026", time: "2:00 PM", link: "https://meet.google.com/xyz-pdqr-lmn" }
  ]);

  const fetchApplications = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*), seeker:user_id(*)')
        .eq('company_id', profile.company_id)
        .eq('status', 'shortlisted');

      if (error) throw error;
      setApplications(data || []);

      if (appIdParam && data) {
        const found = data.find(a => a.id === appIdParam);
        if (found) setSelectedApp(found);
      }
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
  }, [profile, appIdParam]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!selectedApp || !dateTime) return;

    setScheduling(true);
    try {
      // Mock saving meeting inside supporting_docs or comments
      const prevDocs = selectedApp.supporting_docs || {};
      const meetingDetails = {
        date: dateTime,
        meeting_link: meetingLink,
        status: 'scheduled'
      };

      const { error } = await supabase
        .from('applications')
        .update({
          status: 'interviewed',
          supporting_docs: { ...prevDocs, interview: meetingDetails }
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      // Add to notifications
      await supabase.from('notifications').insert({
        user_id: selectedApp.user_id,
        title: '📅 Interview Invitation Scheduled!',
        body: `You are invited for an interview for the ${selectedApp.jobs?.title} role on ${new Date(dateTime).toLocaleString()}. Meeting link: ${meetingLink}`,
        type: 'interview_invite',
        data: { application_id: selectedApp.id }
      });

      // Update local state list
      setUpcomingInterviews(prev => [
        ...prev,
        {
          id: selectedApp.id,
          candidate: selectedApp.seeker?.full_name || selectedApp.external_name || 'Candidate',
          role: selectedApp.jobs?.title || 'Role',
          date: new Date(dateTime).toLocaleDateString(),
          time: new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          link: meetingLink
        }
      ]);

      // Reset
      setSelectedApp(null);
      setDateTime('');
      alert('Interview scheduled and invitation sent to the candidate!');
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="flex grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Schedule Form */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 font-bold">Interview Scheduler</h1>
          <p className="text-xs text-slate-500 mt-1">Book virtual mock/live interviews and send invites to shortlisted candidates.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Book Interview Slot</h3>

          {loading ? (
            <div className="text-center text-slate-400">Loading shortlisted candidates...</div>
          ) : applications.length === 0 && !selectedApp ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500 leading-relaxed font-sans">
              No shortlisted candidates require interviews at this moment.
            </div>
          ) : (
            <form onSubmit={handleSchedule} className="flex flex-col gap-4">
              
              {/* Candidate selector */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Select Shortlisted Candidate</label>
                <select
                  value={selectedApp ? selectedApp.id : ''}
                  onChange={(e) => setSelectedApp(applications.find(a => a.id === e.target.value))}
                  required
                  className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">-- Choose Candidate --</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.seeker?.full_name || app.external_name} ({app.jobs?.title})
                    </option>
                  ))}
                </select>
              </div>

              {selectedApp && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Input
                    label="Interview Date & Time"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                  />

                  <Input
                    label="Video Call Meeting Link"
                    placeholder="e.g. https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    required
                  />

                  <div className="col-span-full flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit" loading={scheduling}>
                      Schedule Interview <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              )}

            </form>
          )}

        </div>
      </div>

      {/* Sidebar Scheduled Interviews */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-slate-100 pb-3">
          Upcoming Interviews
        </h3>

        <div className="flex flex-col gap-4">
          {upcomingInterviews.map((item) => (
            <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col gap-2 relative">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="text-[11px] font-bold text-slate-900 truncate">{item.candidate}</span>
                  <span className="text-[9px] text-slate-500 font-semibold truncate">{item.role}</span>
                </div>
                <Calendar size={14} className="text-slate-400 shrink-0" />
              </div>

              <div className="flex flex-col gap-1 text-[9px] text-slate-600 font-semibold border-t border-slate-100/80 pt-2 mt-1">
                <div className="flex items-center gap-1">
                  <Clock size={10} className="text-slate-400" />
                  <span>{item.date} at {item.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-primary">
                  <Video size={10} className="text-primary/70" />
                  <a href={item.link} target="_blank" className="hover:underline truncate">{item.link}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default InterviewScheduler;
