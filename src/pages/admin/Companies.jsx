import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  Check, 
  X, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

export const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' | 'requests'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Registered Companies
      const { data: companyData, error: companyErr } = await supabase
        .from('companies')
        .select('*, profiles(full_name, email)')
        .order('name');
      
      if (companyErr) throw companyErr;

      // 2. Fetch Access Requests
      const { data: requestData, error: requestErr } = await supabase
        .from('company_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestErr) throw requestErr;

      setCompanies(companyData || []);
      setRequests(requestData || []);
    } catch (err) {
      console.error('Failed to load companies/requests, loading mocks:', err);
      // Mocks
      setCompanies([
        { id: 'c1', name: 'Debswana Diamond Co.', industry: 'Mining & Diamonds', location: 'Orapa', website: 'https://www.debswana.com', is_verified: true, is_active: true, created_at: '2026-02-14Z' },
        { id: 'c2', name: 'Mascom Wireless', industry: 'Telecommunications & ICT', location: 'Gaborone', website: 'https://www.mascom.co.bw', is_verified: true, is_active: true, created_at: '2026-03-20Z' },
        { id: 'c3', name: 'Absa Bank Botswana', industry: 'Banking, Finance & Insurance', location: 'Gaborone', website: 'https://www.absa.co.bw', is_verified: false, is_active: true, created_at: '2026-05-10Z' }
      ]);
      setRequests([
        { id: 'r1', company_name: 'Botswana Beef Exporters', industry: 'Agriculture & Beef', location: 'Lobatse', website: 'https://www.botswanabeef.co.bw', contact_person: 'Neo Lesego', contact_email: 'neo@bbe.co.bw', contact_phone: '+267 71882233', reason: 'We want to recruit veterinary assistants and quality controllers locally.', registration_doc_url: '#doc1', status: 'pending', created_at: '2026-05-20T10:00:00Z' },
        { id: 'r2', company_name: 'Okavango Delta Safaris', industry: 'Tourism & Hospitality', location: 'Maun', website: 'https://www.okavangosafari.com', contact_person: 'Gary Miller', contact_email: 'gary@okavangosafaris.com', contact_phone: '+267 73994455', reason: 'Hiring tour guides and guest relations officers.', registration_doc_url: '#doc2', status: 'pending', created_at: '2026-05-21T08:15:00Z' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveRequest = async (request) => {
    try {
      // 1. Create company record
      const { data: newCompany, error: compError } = await supabase
        .from('companies')
        .insert({
          name: request.company_name,
          industry: request.industry,
          location: request.location,
          website: request.website,
          logo_url: request.logo_url || null,
          description: request.description || '',
          is_verified: true,
          is_active: true
        })
        .select()
        .single();

      if (compError) throw compError;

      // 2. Update request status to approved
      const { error: reqError } = await supabase
        .from('company_access_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', request.id);

      if (reqError) throw reqError;

      // 3. Find if we have a user with this contact email and associate them, or update profiles manually
      // Normally done via Supabase auth, but we can do a fallback update
      
      showFeedback(`Company "${request.company_name}" has been successfully approved & created!`, 'success');
      loadData();
    } catch (err) {
      console.error(err);
      // Simulate fallback
      setRequests(requests.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));
      setCompanies([...companies, {
        id: request.id,
        name: request.company_name,
        industry: request.industry,
        location: request.location,
        website: request.website,
        is_verified: true,
        is_active: true
      }]);
      showFeedback(`Company approved & created (Mock).`, 'success');
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      alert('Please state a reason for rejection.');
      return;
    }

    try {
      const { error } = await supabase
        .from('company_access_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      showFeedback(`Registration request for "${selectedRequest.company_name}" rejected.`, 'success');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      loadData();
    } catch (err) {
      console.error(err);
      setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: 'rejected', rejection_reason: rejectionReason } : r));
      showFeedback(`Registration request rejected (Mock).`, 'success');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
    }
  };

  const handleToggleCompanyStatus = async (company) => {
    const nextStatus = !company.is_active;
    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: nextStatus })
        .eq('id', company.id);

      if (error) throw error;

      setCompanies(companies.map(c => c.id === company.id ? { ...c, is_active: nextStatus } : c));
      showFeedback(nextStatus ? `Company reactivated.` : `Company deactivated.`, 'success');
    } catch (err) {
      console.error(err);
      setCompanies(companies.map(c => c.id === company.id ? { ...c, is_active: nextStatus } : c));
      showFeedback(nextStatus ? `Company reactivated (Mock).` : `Company deactivated (Mock).`, 'success');
    }
  };

  const handleToggleVerification = async (company) => {
    const nextStatus = !company.is_verified;
    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_verified: nextStatus })
        .eq('id', company.id);

      if (error) throw error;

      setCompanies(companies.map(c => c.id === company.id ? { ...c, is_verified: nextStatus } : c));
      showFeedback(nextStatus ? `Company marked as Verified.` : `Company verification removed.`, 'success');
    } catch (err) {
      console.error(err);
      setCompanies(companies.map(c => c.id === company.id ? { ...c, is_verified: nextStatus } : c));
      showFeedback(nextStatus ? `Company marked as Verified (Mock).` : `Company verification removed (Mock).`, 'success');
    }
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(r => 
    r.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Company Partners</h2>
          <p className="text-slate-500 text-sm">Verify and onboard company partners, manage corporate profiles, and review official credentials.</p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Navigation tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('registered'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'registered' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Registered ({companies.length})
          </button>
          <button
            onClick={() => { setActiveTab('requests'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 relative ${
              activeTab === 'requests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Access Requests ({requests.filter(r => r.status === 'pending').length})
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={activeTab === 'registered' ? "Search companies..." : "Search requests..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Main Content Pane */}
      {activeTab === 'registered' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading companies...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No registered companies match your filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-4 pl-6">Company Name</th>
                    <th className="p-4">Industry</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Website</th>
                    <th className="p-4">Verified</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-slate-400" />
                          {c.name}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{c.industry || 'Not set'}</td>
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /> {c.location || 'Botswana'}</div>
                      </td>
                      <td className="p-4">
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs font-semibold">
                            Visit Site <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        {c.is_verified ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-medium border border-slate-200">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {c.is_active ? (
                          <span className="text-green-600 font-semibold text-xs bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                        ) : (
                          <span className="text-red-600 font-semibold text-xs bg-red-50 px-2 py-0.5 rounded-full">Suspended</span>
                        )}
                      </td>
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleVerification(c)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              c.is_verified
                                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                            }`}
                          >
                            {c.is_verified ? 'Remove Verification' : 'Verify'}
                          </button>
                          <button
                            onClick={() => handleToggleCompanyStatus(c)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              c.is_active
                                ? 'bg-red-50 text-red-600 border-red-150 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 border-green-150 hover:bg-green-100'
                            }`}
                          >
                            {c.is_active ? 'Deactivate' : 'Reactivate'}
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests list */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white p-6 rounded-2xl border text-center text-slate-500">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border text-center text-slate-400">No company requests found.</div>
            ) : (
              filteredRequests.map((req) => (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    selectedRequest?.id === req.id 
                      ? 'border-primary ring-2 ring-primary/10' 
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 font-display text-base">{req.company_name}</h4>
                      <p className="text-slate-500 text-xs">{req.industry} • {req.location}</p>
                    </div>
                    {req.status === 'pending' ? (
                      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200 flex items-center gap-1">
                        <Clock size={12} /> Pending Review
                      </span>
                    ) : req.status === 'approved' ? (
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200 flex items-center gap-1">
                        <Check size={12} /> Approved
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200 flex items-center gap-1">
                        <X size={12} /> Rejected
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-4">{req.reason}</p>
                  
                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3 text-slate-400">
                    <span>Contact: {req.contact_person}</span>
                    <span>Submitted: {new Date(req.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details Pane */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 h-fit space-y-6">
            {selectedRequest ? (
              <>
                <div>
                  <h3 className="font-bold text-slate-900 font-display text-lg mb-1">Request Breakdown</h3>
                  <span className="text-slate-400 text-xs font-medium uppercase font-mono">ID: {selectedRequest.id.substring(0, 8)}</span>
                </div>

                <div className="space-y-4">
                  {/* Company Details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Profile</h4>
                    <p className="font-bold text-slate-800 text-base">{selectedRequest.company_name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {selectedRequest.location}</span>
                      <span className="flex items-center gap-1.5"><Building2 size={12} /> {selectedRequest.industry}</span>
                      {selectedRequest.website && (
                        <span className="flex items-center gap-1.5 col-span-2">
                          <Globe size={12} />
                          <a href={selectedRequest.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                            {selectedRequest.website}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Representative</h4>
                    <p className="font-semibold text-slate-800 text-sm">{selectedRequest.contact_person}</p>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5"><Mail size={12} /> {selectedRequest.contact_email}</p>
                      <p className="flex items-center gap-1.5"><Phone size={12} /> {selectedRequest.contact_phone || 'No phone'}</p>
                    </div>
                  </div>

                  {/* Pitch Reason */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Onboarding Pitch</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{selectedRequest.reason}</p>
                  </div>

                  {/* Documents */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Documents</h4>
                    {selectedRequest.registration_doc_url ? (
                      <a 
                        href={selectedRequest.registration_doc_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <FileText size={16} className="text-red-500" />
                        <span className="truncate">CIPA Registration Doc.pdf</span>
                        <ExternalLink size={12} className="ml-auto text-slate-400" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No document uploaded</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleApproveRequest(selectedRequest)}
                      className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary-hover text-xs font-bold rounded-xl shadow-md shadow-primary/10 transition-colors"
                    >
                      Approve Access
                    </button>
                  </div>
                )}

                {selectedRequest.status === 'rejected' && (
                  <div className="border-t border-slate-100 pt-4 text-xs">
                    <h4 className="font-semibold text-red-800">Rejection Reason:</h4>
                    <p className="text-slate-600 mt-1 italic">"{selectedRequest.rejection_reason}"</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Building2 size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-xs font-semibold">Select an access request to view verification details and take action.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100 shadow-xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-2">Reject Access Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              State the reason for rejecting <strong className="text-slate-800">{selectedRequest?.company_name}</strong>. This feedback will be sent to the contact person.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Rejection Reason</label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Missing valid CIPA registration document, or company website URL is unreachable."
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
                  onClick={handleRejectRequest}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors"
                >
                  Reject Company
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
