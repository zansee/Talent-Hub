import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  GraduationCap, 
  Check, 
  X, 
  ExternalLink, 
  FileText, 
  Search, 
  Calendar, 
  BookOpen, 
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail
} from 'lucide-react';

export const AdminGraduateVerification = () => {
  const [graduates, setGraduates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrad, setSelectedGrad] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPendingGraduates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, institution_name, field_of_study, graduation_year, highest_qualification, graduate_doc_url, graduate_verification_status, subscription_tier, created_at')
        .eq('graduate_verification_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGraduates(data || []);
    } catch (err) {
      console.error('Failed to load pending graduates, loading mocks:', err);
      // Mocks
      setGraduates([
        {
          id: 'g1',
          full_name: 'Mompati Raditladi',
          email: 'mompati.rad@gmail.com',
          institution_name: 'University of Botswana',
          field_of_study: 'Bachelor of Computer Science',
          graduation_year: 2025,
          highest_qualification: 'Bachelors Degree',
          graduate_doc_url: '#doc1',
          graduate_verification_status: 'pending',
          subscription_tier: 'free',
          created_at: '2026-05-20T09:00:00Z'
        },
        {
          id: 'g2',
          full_name: 'Lulu Nkomo',
          email: 'lulu.n@gmail.com',
          institution_name: 'Botho University',
          field_of_study: 'Bachelor of Accountancy',
          graduation_year: 2024,
          highest_qualification: 'Bachelors Degree',
          graduate_doc_url: '#doc2',
          graduate_verification_status: 'pending',
          subscription_tier: 'free',
          created_at: '2026-05-21T11:45:00Z'
        },
        {
          id: 'g3',
          full_name: 'Gofaone Kgotla',
          email: 'gofaone@yahoo.com',
          institution_name: 'Botswana Accountancy College (BAC)',
          field_of_study: 'Diploma in Procurement and Supply (CIPS)',
          graduation_year: 2025,
          highest_qualification: 'Diploma',
          graduate_doc_url: '#doc3',
          graduate_verification_status: 'pending',
          subscription_tier: 'free',
          created_at: '2026-05-22T04:30:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingGraduates();
  }, []);

  const handleApprove = async (grad) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          graduate_verification_status: 'approved',
          subscription_tier: 'graduate',
          graduate_approved_at: new Date().toISOString()
        })
        .eq('id', grad.id);

      if (error) throw error;

      showFeedback(`Graduation credentials for ${grad.full_name} verified successfully! Free Graduate Premium Tier unlocked.`, 'success');
      setGraduates(graduates.filter(g => g.id !== grad.id));
      setSelectedGrad(null);
    } catch (err) {
      console.error(err);
      // Mock fallback
      setGraduates(graduates.filter(g => g.id !== grad.id));
      setSelectedGrad(null);
      showFeedback(`Approved successfully (Mock).`, 'success');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please state a reason for rejection.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          graduate_verification_status: 'rejected',
          // Optionally add rejection notes or details in a JSON config if available, 
          // or just reject the verification status.
        })
        .eq('id', selectedGrad.id);

      if (error) throw error;

      showFeedback(`Verification rejected for ${selectedGrad.full_name}.`, 'success');
      setShowRejectModal(false);
      setRejectionReason('');
      setGraduates(graduates.filter(g => g.id !== selectedGrad.id));
      setSelectedGrad(null);
    } catch (err) {
      console.error(err);
      setGraduates(graduates.filter(g => g.id !== selectedGrad.id));
      setSelectedGrad(null);
      setShowRejectModal(false);
      setRejectionReason('');
      showFeedback(`Rejected successfully (Mock).`, 'success');
    }
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const filteredGrads = graduates.filter(g => 
    g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.field_of_study.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Graduate Verification</h2>
        <p className="text-slate-500 text-sm">Review uploaded qualifications from recent graduates to unlock free subscriptions.</p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Applicants List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Clock size={14} />
              <span>Pending Verifications ({graduates.length})</span>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-slate-500">Loading graduation database...</div>
          ) : filteredGrads.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border text-center text-slate-400">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">Verification queue is empty!</p>
              <p className="text-xs text-slate-400 mt-1">No pending certificates are awaiting audit at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGrads.map((grad) => (
                <div 
                  key={grad.id}
                  onClick={() => setSelectedGrad(grad)}
                  className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedGrad?.id === grad.id 
                      ? 'border-primary ring-2 ring-primary/10' 
                      : 'border-slate-150'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 font-display text-base">{grad.full_name}</h4>
                      <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5">
                        <BookOpen size={12} /> {grad.field_of_study}
                      </p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                      {grad.graduation_year} Grad
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3 mt-3">
                    <span className="flex items-center gap-1"><Building size={12} /> {grad.institution_name}</span>
                    <span>Submitted: {new Date(grad.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Credential Details and Document View */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 h-fit space-y-6">
          {selectedGrad ? (
            <>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base mb-1">Verify Graduate Credentials</h3>
                <span className="text-slate-400 text-xs font-semibold">USER ID: {selectedGrad.id.substring(0, 8)}</span>
              </div>

              {/* Graduate Information Profile */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-400" />
                  <span>Field of Study: <strong className="font-semibold text-slate-900">{selectedGrad.field_of_study}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-slate-400" />
                  <span>Institution: <strong className="font-semibold text-slate-900">{selectedGrad.institution_name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-slate-400" />
                  <span>Qualification: <strong className="font-semibold text-slate-900">{selectedGrad.highest_qualification}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Year of Graduation: <strong className="font-semibold text-slate-900">{selectedGrad.graduation_year}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span>Email Address: <strong className="font-semibold text-slate-900">{selectedGrad.email}</strong></span>
                </div>
              </div>

              {/* Uploaded Certificate Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Document</h4>
                
                {selectedGrad.graduate_doc_url ? (
                  <a 
                    href={selectedGrad.graduate_doc_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
                  >
                    <FileText size={20} className="text-red-500 shrink-0" />
                    <div className="truncate text-left">
                      <p className="font-bold text-slate-800">Graduation_Certificate.pdf</p>
                      <p className="text-[10px] text-slate-400 font-medium">Click to inspect in new tab</p>
                    </div>
                    <ExternalLink size={14} className="ml-auto text-slate-400 shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 italic">No academic document linked.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Reject Diploma
                </button>
                <button
                  onClick={() => handleApprove(selectedGrad)}
                  className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary-hover text-xs font-bold rounded-xl shadow-md shadow-primary/10 transition-colors"
                >
                  Approve Graduate
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <GraduationCap size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-xs font-semibold">Select a graduate from the pending queue to inspect academic certificates and approve.</p>
            </div>
          )}
        </div>

      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100 shadow-xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-2">Reject Academic Verification</h3>
            <p className="text-xs text-slate-500 mb-4">
              State the reason for rejecting <strong className="text-slate-800">{selectedGrad?.full_name}</strong>'s document.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Rejection Reason</label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document is blurry and unreadable, or CIPA / University validation failed."
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
                  Reject Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGraduateVerification;
