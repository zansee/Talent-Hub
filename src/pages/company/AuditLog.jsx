import React, { useState } from 'react';
import { Search, Download, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Badge from '../../components/shared/Badge';

const mockLogs = Array.from({ length: 15 }, (_, i) => ({
  id: `clog-${i}`,
  user: ['Tshepo (Admin)', 'Sarah (Hiring Manager)', 'Kagiso (Recruiter)'][i % 3],
  action: ['Job Posted', 'Job Closed', 'Candidate Shortlisted', 'Interview Scheduled', 'Offer Sent'][i % 5],
  details: ['Senior Accountant role', 'Marketing Executive role', 'John Doe for Developer', 'Jane Smith tomorrow at 2PM', 'Tshepo for Analyst'][i % 5],
  created_at: new Date(Date.now() - i * 3600000 * 12).toISOString(),
}));

export const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = mockLogs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900">Company Activity Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track actions taken by your recruitment team.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-colors cursor-pointer">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search team member, action, or details..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-primary outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 font-semibold">Date & Time</th>
              <th className="px-5 py-3 font-semibold">Team Member</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 flex items-center gap-2 whitespace-nowrap">
                  <Clock size={14} className="text-slate-400" />
                  {formatDate(log.created_at, { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-5 py-4 font-medium text-slate-900">{log.user}</td>
                <td className="px-5 py-4">
                  <Badge variant="default" className="bg-slate-100 border-none text-slate-600 font-semibold">
                    {log.action}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-slate-500">{log.details}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-slate-500">No activity found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
