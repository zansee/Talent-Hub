import React, { useState } from 'react';
import { Search, Filter, Download, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Badge from '../../components/shared/Badge';

// Mock data
const mockLogs = Array.from({ length: 25 }, (_, i) => ({
  id: `log-${i}`,
  action: ['Job Created', 'User Role Updated', 'Company Approved', 'Job Deleted', 'Account Suspended'][i % 5],
  user_email: ['admin@talenthub.bw', 'support@talenthub.bw', 'system@talenthub.bw'][i % 3],
  resource_type: ['Job', 'Profile', 'Company', 'System'][i % 4],
  resource_id: `res-${Math.floor(Math.random() * 1000)}`,
  created_at: new Date(Date.now() - i * 3600000 * 24).toISOString(),
  ip_address: `192.168.1.${i % 255}`,
}));

export const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">System-wide activity and security logs.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-colors cursor-pointer">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search user or action..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="relative max-w-xs">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-sm focus:border-primary outline-none cursor-pointer appearance-none"
          >
            <option value="">All Actions</option>
            <option value="Job Created">Job Created</option>
            <option value="User Role Updated">User Role Updated</option>
            <option value="Company Approved">Company Approved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Resource</th>
                <th className="px-5 py-3 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {formatDate(log.created_at, { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">{log.user_email}</td>
                  <td className="px-5 py-3">
                    <Badge variant={log.action.includes('Deleted') || log.action.includes('Suspended') ? 'danger' : 'info'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                    {log.resource_type}:{log.resource_id}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{log.ip_address}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-500">No logs found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredLogs.length} results</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
