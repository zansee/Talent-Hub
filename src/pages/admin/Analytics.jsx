import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Briefcase, FileText, Download } from 'lucide-react';
import { formatBWP } from '../../utils/formatters';

// Mock data
const registrationData = [
  { month: 'Jun', users: 12 }, { month: 'Jul', users: 28 }, { month: 'Aug', users: 45 },
  { month: 'Sep', users: 38 }, { month: 'Oct', users: 62 }, { month: 'Nov', users: 80 },
  { month: 'Dec', users: 54 }, { month: 'Jan', users: 90 }, { month: 'Feb', users: 110 },
  { month: 'Mar', users: 132 }, { month: 'Apr', users: 148 }, { month: 'May', users: 165 },
];

const appsByIndustry = [
  { industry: 'Finance', count: 142 }, { industry: 'ICT', count: 98 },
  { industry: 'Mining', count: 76 }, { industry: 'Tourism', count: 61 },
  { industry: 'Retail', count: 55 }, { industry: 'Health', count: 48 },
  { industry: 'Govt', count: 44 }, { industry: 'Education', count: 39 },
];

const roleBreakdown = [
  { name: 'Job Seekers', value: 1240, color: '#6B7C3A' },
  { name: 'Quick Posters', value: 380, color: '#8D9F56' },
  { name: 'Companies', value: 95, color: '#F59E0B' },
  { name: 'Partners', value: 18, color: '#3B82F6' },
  { name: 'Admins', value: 3, color: '#8B5CF6' },
];

const KPICard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-display font-extrabold text-slate-900">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

export const Analytics = () => {
  const [toast, setToast] = useState('');

  const handleExport = () => {
    setToast('Export coming soon — CSV download will be available once connected to live data.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of platform-wide metrics and trends</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {toast && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary font-semibold">
          {toast}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Total Registered Users" value="1,736" sub="+165 this month" color="bg-primary" />
        <KPICard icon={Briefcase} label="Active Job Posts" value="284" sub="Across all companies" color="bg-amber-500" />
        <KPICard icon={FileText} label="Applications This Month" value="1,243" sub="↑ 18% vs last month" color="bg-blue-500" />
        <KPICard icon={TrendingUp} label="Platform Revenue (Mock)" value={formatBWP(48600)} sub="Payments not yet live" color="bg-purple-500" />
      </div>

      {/* Line Chart: Registrations */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-display font-bold text-sm text-slate-900 mb-4">User Registrations — Last 12 Months</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={registrationData}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Line type="monotone" dataKey="users" stroke="#6B7C3A" strokeWidth={2.5} dot={{ fill: '#6B7C3A', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column: Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart: Applications by Industry */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-sm text-slate-900 mb-4">Applications by Industry</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={appsByIndustry} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="industry" tick={{ fontSize: 10, fill: '#64748b' }} width={60} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" fill="#6B7C3A" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Role Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-sm text-slate-900 mb-4">User Role Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={roleBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {roleBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(val, name) => [val.toLocaleString(), name]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
