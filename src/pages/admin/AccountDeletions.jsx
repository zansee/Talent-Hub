import React, { useState } from 'react';
import { UserX, AlertTriangle, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/shared/Button';

// Mock data
const mockDeletions = [
  { id: 'del-1', name: 'Thabo M.', email: 'thabo@example.com', requested_at: new Date(Date.now() - 86400000 * 5).toISOString(), deletes_on: new Date(Date.now() + 86400000 * 25).toISOString() },
  { id: 'del-2', name: 'Kagiso S.', email: 'kagiso@example.com', requested_at: new Date(Date.now() - 86400000 * 28).toISOString(), deletes_on: new Date(Date.now() + 86400000 * 2).toISOString() },
];

export const AccountDeletions = () => {
  const [deletions, setDeletions] = useState(mockDeletions);

  const handleCancel = (id) => {
    setDeletions(deletions.filter(d => d.id !== id));
    // In real app, update scheduled_deletion_at = null
  };

  const handleDeleteNow = (id) => {
    if(window.confirm('Are you sure you want to permanently delete this account?')) {
       setDeletions(deletions.filter(d => d.id !== id));
       // In real app, trigger edge function to delete user
    }
  };

  const getDaysRemaining = (deletesOn) => {
    const diff = new Date(deletesOn).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-900">Account Deletions</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage users who have requested account deletion (30-day grace period).</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-500 tracking-wider">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Requested At</th>
              <th className="px-5 py-3">Deletes On</th>
              <th className="px-5 py-3">Days Remaining</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {deletions.map(del => {
              const days = getDaysRemaining(del.deletes_on);
              const isUrgent = days <= 3;
              return (
                <tr key={del.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">{del.name}</td>
                  <td className="px-5 py-4 text-slate-600">{del.email}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(del.requested_at)}</td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(del.deletes_on)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-bold ${isUrgent ? 'text-red-500 flex items-center gap-1' : 'text-slate-600'}`}>
                      {isUrgent && <AlertTriangle size={14} />} {days} days
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleCancel(del.id)} className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                         Cancel
                       </button>
                       <button onClick={() => handleDeleteNow(del.id)} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                         Delete Now
                       </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {deletions.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                   <UserX size={32} className="text-slate-300" />
                   <p>No pending account deletions.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountDeletions;
