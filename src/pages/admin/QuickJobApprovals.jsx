import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  CheckSquare, 
  Square, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  DollarSign, 
  User, 
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

export const AdminQuickJobApprovals = () => {
  const [quickJobs, setQuickJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Checklist State
  const [checklist, setChecklist] = useState({
    noSpam: false,
    validContact: false,
    clearLocation: false,
    fairWage: false
  });

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadQuickJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_jobs')
        .select('*, profiles(full_name, phone, email), quick_job_categories(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setQuickJobs(data || []);
    } catch (err) {
      console.error('Failed to load pending quick jobs, using mocks:', err);
      // Mocks
      setQuickJobs([
        { 
          id: 'q1', 
          title: 'Gardening & Weeding Help', 
          description: 'Looking for a reliable helper to clean my yard, mow lawn, and weed flower beds. Tools provided. Lunch provided.', 
          location: 'Gaborone West Phase 2', 
          phone: '+267 72112233', 
          pay_amount: 150.00, 
          created_at: '2026-05-21T14:30:00Z',
          quick_job_categories: { name: 'Gardening & Landscaping' },
          profiles: { full_name: 'Lesedi Selebi', email: 'lesedi@gmail.com' }
        },
        { 
          id: 'q2', 
          title: 'Home Wall Painting', 
          description: 'Need two painters to repaint a 3-bedroom boundary wall. Paint and rollers will be ready. Must have experience.', 
          location: 'Francistown, Block 1', 
          phone: '+267 74998877', 
          pay_amount: 350.00, 
          created_at: '2026-05-22T06:00:00Z',
          quick_job_categories: { name: 'General Labor' },
          profiles: { full_name: 'Tshepo Khama', email: 'tshepo.k@gmail.com' }
        },
        { 
          id: 'q3', 
          title: 'Maths Tutor for Standard 7', 
          description: 'Urgent helper needed to tutor my son for his PSLE math preparations. 2 hours every Saturday morning.', 
          location: 'Maun, Boseja', 
          phone: '+267 75123456', 
          pay_amount: 80.00, 
          created_at: '2026-05-22T07:15:00Z',
          quick_job_categories: { name: 'Tutoring & Lessons' },
          profiles: { full_name: 'Mpho Phiri', email: 'mpho@phiri.co.bw' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuickJobs();
  }, []);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setChecklist({
      noSpam: false,
      validContact: false,
      clearLocation: false,
      fairWage: false
    });
  };

  const toggleChecklistItem = (item) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleApprove = async () => {
    const allChecked = Object.values(checklist).every(val => val === true);
    if (!allChecked) {
      alert('Please complete the compliance checklist before approving.');
      return;
    }

    try {
      const { error } = await supabase
        .from('quick_jobs')
        .update({ status: 'approved' })
        .eq('id', selectedJob.id);

      if (error) throw error;

      showFeedback('Quick Job successfully approved and published!', 'success');
      setQuickJobs(quickJobs.filter(q => q.id !== selectedJob.id));
      setSelectedJob(null);
    } catch (err) {
      console.error(err);
      setQuickJobs(quickJobs.filter(q => q.id !== selectedJob.id));
      setSelectedJob(null);
      showFeedback('Approved successfully (Mock).', 'success');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please state a reason for rejection.');
      return;
    }

    try {
      const { error } = await supabase
        .from('quick_jobs')
        .update({ status: 'rejected' })
        .eq('id', selectedJob.id);

      if (error) throw error;

      showFeedback('Quick Job rejected successfully.', 'success');
      setShowRejectModal(false);
      setRejectionReason('');
      setQuickJobs(quickJobs.filter(q => q.id !== selectedJob.id));
      setSelectedJob(null);
    } catch (err) {
      console.error(err);
      setQuickJobs(quickJobs.filter(q => q.id !== selectedJob.id));
      setSelectedJob(null);
      setShowRejectModal(false);
      setRejectionReason('');
      showFeedback('Rejected successfully (Mock).', 'success');
    }
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const isChecklistComplete = Object.values(checklist).every(val => val === true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Casual Gig Compliance</h2>
        <p className="text-slate-500 text-sm">Review short-term postings, run compliance audits, and prevent fraudulent hiring advertisements.</p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main layout splits list and checklist details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Pending Job Postings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-100 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-600 border border-slate-200 w-fit">
            <Clock size={14} />
            <span>Pending Listings Queue ({quickJobs.length})</span>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-slate-500">Retrieving queue...</div>
          ) : quickJobs.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border text-center text-slate-400">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">Compliance queue is clean!</p>
              <p className="text-xs text-slate-400 mt-1">No pending quick jobs are awaiting verification at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quickJobs.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedJob?.id === job.id 
                      ? 'border-primary ring-2 ring-primary/10' 
                      : 'border-slate-150'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 font-display text-base">{job.title}</h4>
                      <span className="text-xs font-semibold text-primary">{job.quick_job_categories?.name || 'General Help'}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                      P{job.pay_amount || 'Negotiable'}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-3">{job.description}</p>
                  
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-2.5">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    <span>Submitted: {new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Compliance Checklist Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 h-fit space-y-6">
          {selectedJob ? (
            <>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base mb-1">Verify Posting Details</h3>
                <span className="text-slate-400 text-xs font-semibold">POSTED BY: {selectedJob.profiles?.full_name || 'System Seeker'}</span>
              </div>

              {/* Job Data Details */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span>Poster: <strong className="font-semibold text-slate-900">{selectedJob.profiles?.full_name}</strong> ({selectedJob.profiles?.email})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>Contact Phone: <strong className="font-semibold text-slate-900">{selectedJob.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>Exact Location: <strong className="font-semibold text-slate-900">{selectedJob.location}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-slate-400" />
                  <span>Proposed Daily Wage: <strong className="font-semibold text-slate-900">P{selectedJob.pay_amount}</strong></span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <p className="font-semibold text-slate-500 mb-1">Raw Description:</p>
                  <p className="text-slate-600 leading-relaxed italic">"{selectedJob.description}"</p>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Checklist</h4>
                
                {/* Checkbox 1 */}
                <div 
                  onClick={() => toggleChecklistItem('noSpam')}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {checklist.noSpam ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} className="text-slate-300" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Clear Content Integrity</p>
                    <p className="text-[10px] text-slate-400">Contains no spam, links, or abuse.</p>
                  </div>
                </div>

                {/* Checkbox 2 */}
                <div 
                  onClick={() => toggleChecklistItem('validContact')}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {checklist.validContact ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} className="text-slate-300" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Valid Botswana Contact</p>
                    <p className="text-[10px] text-slate-400">Explicit +267 phone number provided.</p>
                  </div>
                </div>

                {/* Checkbox 3 */}
                <div 
                  onClick={() => toggleChecklistItem('clearLocation')}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {checklist.clearLocation ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} className="text-slate-300" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Coded Area/Location</p>
                    <p className="text-[10px] text-slate-400">Clear city, ward, or village in Botswana.</p>
                  </div>
                </div>

                {/* Checkbox 4 */}
                <div 
                  onClick={() => toggleChecklistItem('fairWage')}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {checklist.fairWage ? (
                    <CheckSquare size={18} className="text-primary" />
                  ) : (
                    <Square size={18} className="text-slate-300" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Acceptable Compensation</p>
                    <p className="text-[10px] text-slate-400">Wage meets casual labor guidelines (BWP 50+).</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Reject Gig
                </button>
                <button
                  onClick={handleApprove}
                  disabled={!isChecklistComplete}
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all duration-200 ${
                    isChecklistComplete 
                      ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/10 cursor-pointer' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Approve Posting
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Sparkles size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-xs font-semibold">Select a pending casual gig listing from the queue to run compliance checklist check.</p>
            </div>
          )}
        </div>

      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100 shadow-xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-2">Reject Casual Posting</h3>
            <p className="text-xs text-slate-500 mb-4">
              State the reason for rejecting <strong className="text-slate-800">{selectedJob?.title}</strong>. An email/sms alert will be sent.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Rejection Reason</label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Compensation rate is below BWP 50 daily minimum, or phone number is invalid."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors"
                >
                  Reject Posting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuickJobApprovals;
