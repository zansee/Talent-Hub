import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { 
  MessageSquare, 
  Sparkles, 
  FileText, 
  Video, 
  Check, 
  ChevronRight, 
  Send,
  User,
  Paperclip,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

export const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Creation flows state
  const [showRequestModal, setShowRequestModal] = useState(null); // 'cv_revamp' or 'interview_prep'
  const [cvRevampForm, setCvRevampForm] = useState({
    experienceLevel: 'Entry Level',
    price: 200,
    credentials: ''
  });
  const [interviewPrepForm, setInterviewPrepForm] = useState({
    serviceType: 'script_only',
    price: 150,
    preferredDate: ''
  });
  
  // Selected active request for chat/details sheet
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: revampData, error: rError } = await supabase
        .from('cv_revamp_requests')
        .select('*, partner:partner_id(full_name)')
        .eq('user_id', user.id);

      const { data: prepData, error: pError } = await supabase
        .from('interview_prep_requests')
        .select('*, partner:partner_id(full_name)')
        .eq('user_id', user.id);

      if (rError) throw rError;
      if (pError) throw pError;

      const combined = [
        ...(revampData || []).map(r => ({ ...r, type: 'cv_revamp' })),
        ...(prepData || []).map(p => ({ ...p, type: 'interview_prep' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setActiveRequests(combined);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (reqId, reqType) => {
    try {
      const { data, error } = await supabase
        .from('request_messages')
        .select('*')
        .eq('request_id', reqId)
        .eq('request_type', reqType)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRequest) {
      fetchChatMessages(selectedRequest.id, selectedRequest.type);
      
      // Setup realtime listener for new chat messages
      const channel = supabase
        .channel(`chat_${selectedRequest.type}_${selectedRequest.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'request_messages',
            filter: `request_id=eq.${selectedRequest.id}`
          },
          (payload) => {
            setChatMessages(prev => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedRequest]);

  const handleCreateCvRevamp = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('cv_revamp_requests')
        .insert({
          user_id: user.id,
          experience_level: cvRevampForm.experienceLevel,
          price: cvRevampForm.price,
          status: 'pending',
          cv_url: cvRevampForm.credentials // Mock credentials field / CV text
        });

      if (error) throw error;
      
      setShowRequestModal(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInterviewPrep = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('interview_prep_requests')
        .insert({
          user_id: user.id,
          service_type: interviewPrepForm.serviceType,
          price: interviewPrepForm.price,
          preferred_interview_date: interviewPrepForm.preferredDate ? new Date(interviewPrepForm.preferredDate).toISOString() : null,
          status: 'pending'
        });

      if (error) throw error;

      setShowRequestModal(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRequest) return;
    setSendingMsg(true);

    try {
      const { error } = await supabase
        .from('request_messages')
        .insert({
          request_id: selectedRequest.id,
          request_type: selectedRequest.type,
          sender_id: user.id,
          message: newMessage
        });

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="min-h-full bg-[#12160d] text-white flex flex-col font-sans p-4 relative">
      
      {selectedRequest ? (
        /* CHAT DETAIL INTERFACE */
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-3 mb-3">
            <button
              onClick={() => setSelectedRequest(null)}
              className="p-1 hover:bg-zinc-800/40 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold font-display">
                {selectedRequest.type === 'cv_revamp' ? 'CV Revamp Chat' : 'Interview Prep Chat'}
              </h1>
              <span className="text-[10px] text-zinc-500">
                Partner: {selectedRequest.partner?.full_name || 'Assigning soon...'}
              </span>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold border bg-zinc-950/40 text-primary border-primary/20 capitalize">
              {selectedRequest.status}
            </span>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-2 bg-zinc-950/20 border border-zinc-900/50 rounded-2xl mb-4 max-h-[350px] min-h-[250px]">
            {chatMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <MessageSquare size={36} className="text-zinc-700 mb-2" />
                <span className="text-xs font-semibold">No messages yet</span>
                <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">
                  Introduce yourself to the career consultant and outline your specific requirements.
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] rounded-2xl p-3 ${
                      isMe 
                        ? 'bg-[#6B7C3A] text-white self-end rounded-tr-none' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 self-start rounded-tl-none'
                    }`}
                  >
                    <span className="text-[11px] font-sans leading-relaxed break-words">{msg.message}</span>
                    <span className="text-[8px] text-white/50 self-end mt-1 font-sans">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Form input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Type message to career partner..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendingMsg}
              className="flex-1 px-4 py-2.5 text-xs font-sans rounded-xl bg-zinc-950/60 border border-zinc-800 text-white focus:outline-none focus:border-primary placeholder-zinc-600"
            />
            <button
              type="submit"
              disabled={sendingMsg || !newMessage.trim()}
              className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all flex items-center justify-center cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        /* MAIN CAREER SERVICES SELECTION */
        <div className="flex-1 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Sparkles size={20} className="text-primary" />
            <h1 className="text-lg font-display font-bold">Career Development Services</h1>
          </div>

          {/* Cards for CV revamp and Mock Interview */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* CV Revamp card */}
            <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText size={22} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold font-display text-white">Professional CV Revamp</h3>
                  <p className="text-xs text-zinc-400 leading-normal font-sans">
                    Collaborate with verified Botswana HR consultants to optimize, tailor, and format your CV to pass ATS and stand out to local employers.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900/40 pt-3.5">
                <span className="text-sm font-bold font-display text-primary">P200.00 BWP</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRequestModal('cv_revamp')}
                >
                  Request Revamp
                </Button>
              </div>
            </div>

            {/* Interview Prep card */}
            <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Video size={22} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold font-display text-white">Mock Interview Prep</h3>
                  <p className="text-xs text-zinc-400 leading-normal font-sans">
                    Get custom Q&A prep sheets, or schedule simulated live video interviews with experts for detailed feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900/40 pt-3.5">
                <span className="text-sm font-bold font-display text-primary">P150.00 BWP</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRequestModal('interview_prep')}
                >
                  Book Prep Session
                </Button>
              </div>
            </div>

          </div>

          {/* Active / Past requests status list */}
          <div className="mt-2 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">My Consultations</h3>
            
            {activeRequests.length === 0 ? (
              <div className="p-5 border border-zinc-900 bg-zinc-950/20 text-center text-xs text-zinc-500 rounded-2xl">
                No active service requests. Get started by hiring a career partner above.
              </div>
            ) : (
              activeRequests.map((req) => (
                <div 
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="bg-zinc-900/40 border border-zinc-800/40 hover:border-primary/40 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all hover:translate-x-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-850 border border-zinc-800 text-zinc-400 flex items-center justify-center">
                      {req.type === 'cv_revamp' ? <FileText size={16} /> : <Video size={16} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-display text-white">
                        {req.type === 'cv_revamp' ? 'CV Revamp Service' : 'Mock Interview Prep'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-sans mt-0.5">
                        Status: <span className="text-primary font-semibold capitalize">{req.status}</span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REQUEST MODAL POPUPS */}
      {showRequestModal === 'cv_revamp' && (
        <div className="absolute inset-0 bg-[#12160d]/95 backdrop-blur-sm z-50 p-6 flex flex-col justify-center animate-slide-up">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold font-display border-b border-zinc-800 pb-2">Request CV Revamp</h2>
            <form onSubmit={handleCreateCvRevamp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Experience Level</label>
                <select
                  value={cvRevampForm.experienceLevel}
                  onChange={(e) => setCvRevampForm(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-zinc-950 text-white border-zinc-800 focus:outline-none focus:border-primary"
                >
                  <option>Entry Level</option>
                  <option>Mid Level (3-5 years)</option>
                  <option>Senior Level (6+ years)</option>
                  <option>Executive</option>
                </select>
              </div>

              <Input
                label="Professional credentials & specializations"
                placeholder="e.g. BGCSE, CIPS Level 4, ACCA candidate..."
                value={cvRevampForm.credentials}
                onChange={(e) => setCvRevampForm(prev => ({ ...prev, credentials: e.target.value }))}
                required
              />

              <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 flex justify-between items-center font-sans">
                <span>Fee Amount (Simulated)</span>
                <span className="font-bold text-primary text-xs">P{cvRevampForm.price}.00 BWP</span>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowRequestModal(null)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal === 'interview_prep' && (
        <div className="absolute inset-0 bg-[#12160d]/95 backdrop-blur-sm z-50 p-6 flex flex-col justify-center animate-slide-up">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold font-display border-b border-zinc-800 pb-2">Book Mock Interview</h2>
            <form onSubmit={handleCreateInterviewPrep} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Service Type</label>
                <select
                  value={interviewPrepForm.serviceType}
                  onChange={(e) => setInterviewPrepForm(prev => ({ ...prev, serviceType: e.target.value, price: e.target.value === 'script_only' ? 150 : 250 }))}
                  className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-zinc-950 text-white border-zinc-800 focus:outline-none focus:border-primary"
                >
                  <option value="script_only">Q&A Script Only (P150)</option>
                  <option value="virtual_plus_script">Video Interview Mock + Script (P250)</option>
                </select>
              </div>

              <Input
                label="Preferred Date & Time"
                type="datetime-local"
                value={interviewPrepForm.preferredDate}
                onChange={(e) => setInterviewPrepForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                required
              />

              <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 flex justify-between items-center font-sans">
                <span>Fee Amount (Simulated)</span>
                <span className="font-bold text-primary text-xs">P{interviewPrepForm.price}.00 BWP</span>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowRequestModal(null)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Submit Booking</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
