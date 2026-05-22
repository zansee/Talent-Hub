import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Video, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Upload, 
  ExternalLink,
  MessageSquare,
  Clock,
  Sparkles,
  Link2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const PartnerRequestDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requestType = searchParams.get('type') || 'cv_revamp'; // 'cv_revamp' | 'interview_prep'
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const chatBottomRef = useRef(null);

  // Completion/Update States
  const [completedCvUrl, setCompletedCvUrl] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [scriptUrl, setScriptUrl] = useState('');
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  const loadDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch Request
      let reqData = null;
      if (requestType === 'cv_revamp') {
        const { data, error } = await supabase
          .from('cv_revamp_requests')
          .select('*, profiles(*)')
          .eq('id', id)
          .single();
        if (error) throw error;
        reqData = data;
        setCompletedCvUrl(data.completed_cv_url || '');
      } else {
        const { data, error } = await supabase
          .from('interview_prep_requests')
          .select('*, profiles(*)')
          .eq('id', id)
          .single();
        if (error) throw error;
        reqData = data;
        setMeetingLink(data.meeting_link || '');
        setScriptUrl(data.script_url || '');
      }

      setRequest(reqData);

      // 2. Fetch Chat messages
      const { data: msgData, error: msgError } = await supabase
        .from('request_messages')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;
      setMessages(msgData || []);

      // 3. Mark request as 'in_progress' automatically if it's currently 'assigned'
      if (reqData.status === 'assigned') {
        const table = requestType === 'cv_revamp' ? 'cv_revamp_requests' : 'interview_prep_requests';
        await supabase
          .from(table)
          .update({ status: 'in_progress' })
          .eq('id', id);
        
        setRequest(prev => ({ ...prev, status: 'in_progress' }));
      }
    } catch (err) {
      console.error('Failed to load request detail, using mocks:', err);
      // Mocks
      if (requestType === 'cv_revamp') {
        setRequest({
          id,
          status: 'in_progress',
          experience_level: '3-5 Years (Mid-level)',
          price: 250.00,
          cv_url: '#original-cv',
          certificates_urls: ['#cert1', '#cert2'],
          professional_certs_urls: ['#cips-cert'],
          created_at: new Date().toISOString(),
          profiles: {
            full_name: 'Kago Seretse',
            email: 'kago@gmail.com',
            phone: '+267 71445566',
            location: 'Francistown'
          }
        });
      } else {
        setRequest({
          id,
          status: 'in_progress',
          service_type: 'virtual_plus_script',
          price: 300.00,
          preferred_interview_date: '2026-05-25T14:00:00Z',
          meeting_link: '',
          script_url: '',
          created_at: new Date().toISOString(),
          profiles: {
            full_name: 'Neo Khama',
            email: 'neo.k@gmail.com',
            phone: '+267 75331199',
            location: 'Maun'
          }
        });
      }
      setMessages([
        { id: '1', sender_id: 'client-id', message: 'Hello coach! I paid for the revamp. I need to emphasize my CIPS purchasing experience in Botswana.', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
        { id: '2', sender_id: user?.id || 'partner-id', message: 'Hi. Glad to assist! Let me review your files and I will draft a revamped copy incorporating local supply chain keywords.', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id, requestType]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const msgObj = {
        request_id: id,
        request_type: requestType,
        sender_id: user.id,
        message: newMessage.trim(),
        attachments: []
      };

      const { data, error } = await supabase
        .from('request_messages')
        .insert(msgObj)
        .select()
        .single();

      if (error) throw error;

      setMessages([...messages, data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
      // Mock append
      const mockMsg = {
        id: 'msg-' + Math.random(),
        request_id: id,
        sender_id: user?.id || 'partner-id',
        message: newMessage.trim(),
        created_at: new Date().toISOString()
      };
      setMessages([...messages, mockMsg]);
      setNewMessage('');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDeliverService = async (e) => {
    e.preventDefault();
    setSubmittingDelivery(true);
    try {
      const table = requestType === 'cv_revamp' ? 'cv_revamp_requests' : 'interview_prep_requests';
      const updates = requestType === 'cv_revamp' 
        ? { completed_cv_url: completedCvUrl, status: 'completed', updated_at: new Date().toISOString() }
        : { meeting_link: meetingLink, script_url: scriptUrl, status: 'completed', updated_at: new Date().toISOString() };

      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setRequest(prev => ({ ...prev, ...updates }));
      showFeedback('Service package delivered successfully! Job status set to Completed.', 'success');
    } catch (err) {
      console.error(err);
      const updates = requestType === 'cv_revamp' 
        ? { completed_cv_url: completedCvUrl, status: 'completed' }
        : { meeting_link: meetingLink, script_url: scriptUrl, status: 'completed' };
      setRequest(prev => ({ ...prev, ...updates }));
      showFeedback('Package delivered (Mock fallback).', 'success');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate('/partner/requests')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </button>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <CheckCircle size={18} />
          <span>{feedback.msg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-8 rounded-2xl border text-center text-slate-500">Retrieving details...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Client Info & Delivery Form */}
          <div className="space-y-6 lg:col-span-1">
            {/* Client Profile Brief */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 font-display text-base mb-1">Client Profile</h3>
                <span className="text-[10px] text-slate-400 font-mono font-bold">CLIENT REF: {request.profiles?.id?.substring(0, 8)}</span>
              </div>

              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                  {request.profiles?.full_name ? request.profiles.full_name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{request.profiles?.full_name}</p>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <MapPin size={10} /> {request.profiles?.location || 'Botswana'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="flex items-center gap-2"><Mail size={12} className="text-slate-400 shrink-0" /> {request.profiles?.email}</p>
                <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400 shrink-0" /> {request.profiles?.phone || 'No Phone'}</p>
              </div>

              {/* Service specs details */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Request Type:</span>
                  <span className="text-slate-800 uppercase font-mono">{requestType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Total Price Paid:</span>
                  <span className="text-slate-800">P{request.price}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Service Status:</span>
                  {request.status === 'completed' ? (
                    <span className="text-green-600 font-bold">Completed</span>
                  ) : (
                    <span className="text-amber-600 font-bold">In Progress</span>
                  )}
                </div>
              </div>
            </div>

            {/* Original Uploaded Assets brief (only for CV revamp) */}
            {requestType === 'cv_revamp' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm font-display">Client Attachment Files</h4>
                <div className="space-y-2">
                  {request.cv_url && (
                    <a 
                      href={request.cv_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText size={16} className="text-indigo-500" />
                      <span className="truncate">Original Seeker CV.pdf</span>
                      <ExternalLink size={12} className="ml-auto text-slate-400" />
                    </a>
                  )}
                  
                  {/* Additional degree documents */}
                  {request.certificates_urls && request.certificates_urls.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Degrees & Academic Papers</p>
                      {request.certificates_urls.map((url, index) => (
                        <a 
                          key={index}
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <FileText size={14} className="text-slate-400" />
                          <span className="truncate">Certificate_{index + 1}.pdf</span>
                          <ExternalLink size={10} className="ml-auto text-slate-400" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Professional credentials (like CIPS) */}
                  {request.professional_certs_urls && request.professional_certs_urls.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Professional Credentials (CIPS/ACCA)</p>
                      {request.professional_certs_urls.map((url, index) => (
                        <a 
                          key={index}
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Sparkles size={14} className="text-amber-500" />
                          <span className="truncate">Credentials_{index + 1}.pdf</span>
                          <ExternalLink size={10} className="ml-auto text-slate-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery/Completion submission form */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm font-display">Service Delivery Form</h4>
              <form onSubmit={handleDeliverService} className="space-y-4">
                
                {requestType === 'cv_revamp' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Upload Completed CV (PDF Url)</label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={completedCvUrl}
                        onChange={(e) => setCompletedCvUrl(e.target.value)}
                        placeholder="Paste PDF link (e.g. Supabase Storage link)"
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Video Meeting Link (Google Meet/Teams)</label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          required={request.service_type !== 'script_only'}
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="Paste Meet / Teams link"
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Interview Prep Script (PDF Url)</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          required
                          value={scriptUrl}
                          onChange={(e) => setScriptUrl(e.target.value)}
                          placeholder="Paste PDF script link"
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submittingDelivery}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  {submittingDelivery ? 'Delivering...' : 'Submit Final Package'}
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-150 flex flex-col h-[600px] overflow-hidden shadow-sm">
            {/* Chat header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <MessageSquare className="text-slate-400" size={18} />
              <div>
                <h4 className="font-bold text-slate-800 text-sm font-display">Client Chat Timeline</h4>
                <p className="text-[10px] text-slate-400">Direct instant messaging with candidate.</p>
              </div>
            </div>

            {/* Message timelines */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare size={36} className="text-slate-300 mb-2" />
                  <p className="text-xs">No chat logs yet. Type a welcome message below to introduce yourself.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/5' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60 shadow-sm'
                      }`}>
                        <p>{msg.message}</p>
                        <span className={`text-[9px] block text-right mt-1.5 ${
                          isMe ? 'text-white/70' : 'text-slate-400'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat input footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={sendingMsg}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="bg-primary hover:bg-primary-hover disabled:bg-slate-100 disabled:text-slate-400 text-white p-2 rounded-xl transition-all duration-200"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default PartnerRequestDetail;
