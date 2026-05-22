import React, { useState } from 'react';
import { Send, Bell, Smartphone, User, Briefcase, Eye } from 'lucide-react';
import { BOTSWANA_TOWNS } from '../../lib/constants';
import Button from '../../components/shared/Button';
import { formatDate } from '../../utils/formatters';

const mockHistory = [
  { id: 1, date: new Date().toISOString(), title: 'System Maintenance', target: 'All Users', count: 1736 },
  { id: 2, date: new Date(Date.now() - 86400000 * 2).toISOString(), title: 'New Mining Jobs Available', target: 'Job Seekers (Mining)', count: 245 },
];

export const BroadcastNotification = () => {
  const [form, setForm] = useState({
    title: '',
    body: '',
    target: 'all', // all, job_seekers, companies, location
    locationTarget: '',
    priority: 'normal'
  });
  
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');

  const handleSend = () => {
    if (!form.title || !form.body) {
      alert("Title and Body are required.");
      return;
    }
    if (window.confirm(`Are you sure you want to send this broadcast to ${form.target}?`)) {
      setSending(true);
      // Simulate API call
      setTimeout(() => {
        setSending(false);
        setToast('Broadcast sent successfully!');
        setForm({ title: '', body: '', target: 'all', locationTarget: '', priority: 'normal' });
        setTimeout(() => setToast(''), 3000);
      }, 1000);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-900">Broadcast Notification</h1>
        <p className="text-sm text-slate-500 mt-0.5">Send bulk push notifications and in-app alerts to users.</p>
      </div>

      {toast && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-semibold text-sm">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h2 className="font-display font-bold text-slate-800">Compose Message</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Audience</label>
            <select 
              value={form.target} 
              onChange={e => setForm({...form, target: e.target.value})}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="all">All Users</option>
              <option value="job_seekers">Job Seekers Only</option>
              <option value="companies">Companies Only</option>
              <option value="location">By Location...</option>
            </select>
          </div>

          {form.target === 'location' && (
             <div className="flex flex-col gap-1.5">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Town/City</label>
               <select 
                 value={form.locationTarget} 
                 onChange={e => setForm({...form, locationTarget: e.target.value})}
                 className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary"
               >
                 <option value="">Select location...</option>
                 {BOTSWANA_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Title</label>
            <input 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="e.g. System Maintenance Update"
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary"
              maxLength={65}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Body</label>
            <textarea 
              value={form.body} 
              onChange={e => setForm({...form, body: e.target.value})}
              placeholder="Type your message here..."
              rows={4}
              className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary resize-none"
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority</label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={form.priority === 'normal'} onChange={() => setForm({...form, priority: 'normal'})} className="accent-primary" />
                  Normal (In-app only)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={form.priority === 'high'} onChange={() => setForm({...form, priority: 'high'})} className="accent-red-500" />
                  High (Push Notification + In-app)
                </label>
             </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSend} variant="primary" loading={sending} fullWidth>
              <Send size={16} /> Send Broadcast
            </Button>
          </div>
        </div>

        {/* Preview & History */}
        <div className="flex flex-col gap-6">
          {/* Mobile Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner flex flex-col items-center">
            <h2 className="font-display font-bold text-slate-800 mb-6 flex items-center gap-2 self-start"><Eye size={18} /> Preview (Mobile)</h2>
            
            <div className="w-[300px] h-[100px] bg-white rounded-2xl shadow-lg border border-slate-100 flex p-4 gap-3 relative overflow-hidden">
               <div className="w-10 h-10 bg-[#12160d] rounded-xl flex items-center justify-center shrink-0">
                 <img src="/assets/logo.png" alt="TH" className="w-6 h-6 object-contain" />
               </div>
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                 <p className="text-xs font-bold text-slate-900 truncate">{form.title || 'Notification Title'}</p>
                 <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{form.body || 'Your message body will appear here. Keep it concise for mobile screens.'}</p>
               </div>
               <span className="absolute top-3 right-3 text-[9px] text-slate-400 font-medium">now</span>
            </div>
          </div>

          {/* History */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
             <div className="px-5 py-4 border-b border-slate-100">
               <h2 className="font-display font-bold text-slate-800">Recent Broadcasts</h2>
             </div>
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase text-slate-500 tracking-wider">
                   <th className="px-5 py-2">Date</th>
                   <th className="px-5 py-2">Title</th>
                   <th className="px-5 py-2">Target</th>
                   <th className="px-5 py-2 text-right">Sent To</th>
                 </tr>
               </thead>
               <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                 {mockHistory.map(h => (
                   <tr key={h.id}>
                     <td className="px-5 py-3">{formatDate(h.date)}</td>
                     <td className="px-5 py-3 font-semibold text-slate-900 truncate max-w-[150px]">{h.title}</td>
                     <td className="px-5 py-3">{h.target}</td>
                     <td className="px-5 py-3 text-right font-medium">{h.count.toLocaleString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastNotification;
