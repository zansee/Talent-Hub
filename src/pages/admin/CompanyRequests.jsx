import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Globe, ExternalLink, Check, X } from 'lucide-react';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import { formatDate } from '../../utils/formatters';

const mockRequests = [
  { id: 1, company_name: 'Debswana Diamond Company', contact_person: 'Tshepo K.', email: 'tshepo@debswana.bw', phone: '71234567', industry: 'Mining & Diamonds', location: 'Gaborone', website: 'https://debswana.com', reason: 'To post engineering and mining roles.', status: 'pending', created_at: new Date().toISOString() },
  { id: 2, company_name: 'FNB Botswana', contact_person: 'Lerato M.', email: 'lerato@fnb.bw', phone: '72345678', industry: 'Banking, Finance & Insurance', location: 'Gaborone', website: 'https://fnb.bw', reason: 'Bulk hiring for new branch.', status: 'approved', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 3, company_name: 'Fake Corp', contact_person: 'Scammer', email: 'fake@gmail.com', phone: '73456789', industry: 'Retail & Wholesale', location: 'Francistown', website: '', reason: 'Just testing.', status: 'rejected', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
];

export const CompanyRequests = () => {
  const [filter, setFilter] = useState('pending');
  const [requests, setRequests] = useState(mockRequests);
  const [selectedReq, setSelectedReq] = useState(null);
  
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = requests.filter(r => r.status === filter);

  const handleApprove = () => {
    setRequests(requests.map(r => r.id === selectedReq.id ? { ...r, status: 'approved' } : r));
    setShowApproveModal(false);
    setSelectedReq(null);
    setAdminEmail('');
  };

  const handleReject = () => {
    setRequests(requests.map(r => r.id === selectedReq.id ? { ...r, status: 'rejected' } : r));
    setShowRejectModal(false);
    setSelectedReq(null);
    setRejectReason('');
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-900">Company Access Requests</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review and approve companies requesting access to the employer portal.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {['pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-3 text-sm font-semibold capitalize border-b-2 transition-colors cursor-pointer ${
              filter === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {tab === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(req => (
          <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 leading-tight">{req.company_name}</h3>
                  <p className="text-[10px] text-slate-500">{req.industry}</p>
                </div>
              </div>
              {req.status === 'pending' && <Badge variant="warning">Pending</Badge>}
              {req.status === 'approved' && <Badge variant="success">Approved</Badge>}
              {req.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
            </div>

            <div className="flex flex-col gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {req.email}</span>
              <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {req.phone}</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {req.location}</span>
              {req.website && (
                <a href={req.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <Globe size={14} className="text-primary"/> {req.website} <ExternalLink size={10} />
                </a>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Reason for joining</span>
              "{req.reason}"
            </div>

            {req.status === 'pending' && (
              <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                <button onClick={() => { setSelectedReq(req); setShowRejectModal(true); }} className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center">
                  Reject
                </button>
                <button onClick={() => { setSelectedReq(req); setAdminEmail(req.email); setShowApproveModal(true); }} className="px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center">
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            No {filter} requests found.
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Company">
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-slate-600">You are approving <span className="font-bold">{selectedReq?.company_name}</span>. This will create a company profile.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company Admin Email</label>
            <input 
              type="email" 
              value={adminEmail} 
              onChange={e => setAdminEmail(e.target.value)} 
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" 
            />
            <p className="text-[10px] text-slate-400">An invitation link will be sent to this email.</p>
          </div>
          <Button onClick={handleApprove} variant="primary" fullWidth>Approve & Send Invite</Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Request">
         <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-slate-600">Rejecting request for <span className="font-bold">{selectedReq?.company_name}</span>.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason (Sent to user)</label>
            <textarea 
              value={rejectReason} 
              onChange={e => setRejectReason(e.target.value)} 
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary resize-none" 
            />
          </div>
          <Button onClick={handleReject} variant="danger" fullWidth>Reject Request</Button>
        </div>
      </Modal>

    </div>
  );
};

export default CompanyRequests;
