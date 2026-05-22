import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Clock, UserCheck, ShieldAlert, Briefcase, FileCheck2 } from 'lucide-react';

export const LiveActivities = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Mock recruiter audit trails logs
  const activities = [
    { id: 1, type: "shortlist", user: "Recruiter Thato", job: "Financial Manager", target: "Thabo Kealotswe", date: "May 22, 2026", time: "11:20 AM" },
    { id: 2, type: "reject", user: "Hiring Manager Neo", job: "Junior Teller", target: "Kabo Segokgo", date: "May 22, 2026", time: "9:45 AM" },
    { id: 3, type: "publish", user: "Admin", job: "Corporate Accountant", target: "", date: "May 21, 2026", time: "4:30 PM" },
    { id: 4, type: "invite", user: "Recruiter Thato", job: "Software Developer", target: "Neo Molefe", date: "May 20, 2026", time: "2:15 PM" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3 mb-2">
        <button
          onClick={() => navigate('/company/dashboard')}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 font-bold">Recruiter Audit Logs</h1>
          <p className="text-xs text-slate-500">Track and monitor recruiter action trails, status adjustments, and publishing events.</p>
        </div>
      </div>

      {/* Audit Log Table layout */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-800">Recruitment Activity Trails</span>
          <span className="text-[10px] text-slate-400 font-semibold font-sans">POPIA compliant logs</span>
        </div>

        <div className="divide-y divide-slate-150 text-xs font-sans text-slate-600">
          {activities.map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center text-slate-400">
                <Clock size={14} />
              </div>
              <div className="flex flex-col min-w-0 gap-0.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-bold text-slate-900">{item.user}</span>
                  <span className="text-slate-400 font-medium">
                    {item.type === 'shortlist' && 'shortlisted candidate'}
                    {item.type === 'reject' && 'marked candidate as rejected'}
                    {item.type === 'publish' && 'published a new job role'}
                    {item.type === 'invite' && 'sent virtual interview invitation to'}
                  </span>
                  {item.target && <span className="font-bold text-slate-800">{item.target}</span>}
                </div>
                {item.job && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-semibold">
                    <Briefcase size={12} className="text-slate-400" /> {item.job}
                  </span>
                )}
                <span className="text-[9px] text-slate-400 font-semibold mt-1 font-sans">{item.date} at {item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LiveActivities;
