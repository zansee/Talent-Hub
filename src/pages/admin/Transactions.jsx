import React, { useState } from 'react';
import { CreditCard, Filter, AlertCircle, Download } from 'lucide-react';
import { formatBWP, formatDate } from '../../utils/formatters';
import Badge from '../../components/shared/Badge';

const mockTransactions = [
  { id: 'TX-1', date: new Date().toISOString(), user: 'john@example.com', type: 'subscription', amount: 250, status: 'paid' },
  { id: 'TX-2', date: new Date(Date.now() - 86400000).toISOString(), user: 'sarah@example.com', type: 'cv_revamp', amount: 150, status: 'pending' },
  { id: 'TX-3', date: new Date(Date.now() - 172800000).toISOString(), user: 'mike@example.com', type: 'interview_prep', amount: 300, status: 'failed' },
  { id: 'TX-4', date: new Date(Date.now() - 259200000).toISOString(), user: 'tech_bw@company.com', type: 'subscription', amount: 1500, status: 'paid' },
];

export const Transactions = () => {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = mockTransactions.filter(tx => {
    return (!typeFilter || tx.type === typeFilter) && (!statusFilter || tx.status === statusFilter);
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'failed': return <Badge variant="danger">Failed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type) => {
    const labels = { subscription: 'Subscription', cv_revamp: 'CV Revamp', interview_prep: 'Interview Prep' };
    return labels[type] || type;
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage platform payments and subscriptions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-colors cursor-pointer">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="text-sm font-bold text-amber-800">Payments are currently disabled</h3>
          <p className="text-xs text-amber-700 mt-1">The payments module is turned off via Feature Flags. These are mock transactions. Enable payments in Settings &gt; Feature Flags.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
           <div className="p-3 rounded-xl bg-primary/10 text-primary"><CreditCard size={20} /></div>
           <div>
             <p className="text-2xl font-bold font-display text-slate-900">{formatBWP(15450)}</p>
             <p className="text-xs text-slate-500 font-medium">Total Revenue (30d)</p>
           </div>
        </div>
      </div>

      <div className="flex gap-4">
         <div className="relative max-w-xs">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-sm outline-none">
            <option value="">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="cv_revamp">CV Revamp</option>
            <option value="interview_prep">Interview Prep</option>
          </select>
        </div>
        <div className="relative max-w-xs">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-sm outline-none">
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-500 tracking-wider">
              <th className="px-5 py-3">Transaction ID</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filtered.map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{tx.id}</td>
                <td className="px-5 py-3">{formatDate(tx.date)}</td>
                <td className="px-5 py-3 font-medium">{tx.user}</td>
                <td className="px-5 py-3">{getTypeLabel(tx.type)}</td>
                <td className="px-5 py-3 text-right font-semibold">{formatBWP(tx.amount)}</td>
                <td className="px-5 py-3">{getStatusBadge(tx.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
