import React, { useState } from 'react';
import { FileText, UserPlus, FileEdit } from 'lucide-react';
import { formatDate, formatBWP } from '../../utils/formatters';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';

const mockRequests = [
  { id: 'CVR-101', requester: 'Kagiso Modise', email: 'kagiso@example.com', exp_level: 'Entry Level', requested_at: new Date().toISOString(), status: 'pending', partner: null },
  { id: 'CVR-102', requester: 'Tshepo Ndlovu', email: 'tshepo@example.com', exp_level: 'Mid Level', requested_at: new Date(Date.now() - 86400000).toISOString(), status: 'assigned', partner: 'Neo Consulting' },
  { id: 'CVR-103', requester: 'Lesego Phiri', email: 'lesego@example.com', exp_level: 'Senior Level', requested_at: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'completed', partner: 'Neo Consulting' },
];

const mockPartners = ['Neo Consulting', 'Botswana HR Experts', 'Gaborone Resumes'];

export const CVRevampAdmin = () => {
  const [filter, setFilter] = useState('pending');
  const [requests, setRequests] = useState(mockRequests);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState('');

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const handleAssign = () => {
    if(!selectedPartner) return;
    setRequests(requests.map(r => r.id === selectedReq.id ? { ...r, status: 'assigned', partner: selectedPartner } : r));
    setShowAssignModal(false);
    setSelectedReq(null);
    setSelectedPartner('');
  };

  const getStatusBadge = (status) => {
    const map = { pending: 'warning', assigned: 'info', in_progress: 'primary', completed: 'success' };
    return <Badge variant={map[status] || 'default'} className="uppercase">{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-900">CV Revamp Requests</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage and assign CV revamp service requests to partners.</p>
      </div>

      <div className="flex border-b border-slate-200">
        {['pending', 'assigned', 'completed', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-3 text-sm font-semibold capitalize border-b-2 transition-colors cursor-pointer ${
              filter === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.replace('_', ' ')}
            {tab === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-500 tracking-wider">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Requester</th>
              <th className="px-5 py-3">Experience</th>
              <th className="px-5 py-3">Requested On</th>
              <th className="px-5 py-3">Partner Assigned</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filtered.map(req => (
              <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-mono text-[11px] text-slate-400">{req.id}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{req.requester}</p>
                  <p className="text-[10px] text-slate-500">{req.email}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{req.exp_level}</td>
                <td className="px-5 py-4 text-slate-500">{formatDate(req.requested_at)}</td>
                <td className="px-5 py-4 font-medium text-slate-700">{req.partner || <span className="text-slate-400 italic">Unassigned</span>}</td>
                <td className="px-5 py-4">{getStatusBadge(req.status)}</td>
                <td className="px-5 py-4 text-right">
                  {req.status === 'pending' && (
                    <button onClick={() => { setSelectedReq(req); setShowAssignModal(true); }} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold transition-colors cursor-pointer ml-auto">
                      <UserPlus size={14} /> Assign Partner
                    </button>
                  )}
                  {req.status !== 'pending' && (
                    <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer ml-auto">
                      <FileText size={14} /> View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="px-5 py-12 text-center text-slate-500">No requests found for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Partner">
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-slate-600">Select a career services partner to handle request <span className="font-bold">{selectedReq?.id}</span> for <span className="font-bold">{selectedReq?.requester}</span>.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Partner</label>
            <select value={selectedPartner} onChange={e => setSelectedPartner(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary">
              <option value="">Choose partner...</option>
              {mockPartners.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Button onClick={handleAssign} variant="primary" fullWidth disabled={!selectedPartner}>Confirm Assignment</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CVRevampAdmin;
