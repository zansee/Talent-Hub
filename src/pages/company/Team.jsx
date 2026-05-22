import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const Team = () => {
  const { profile } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Invite members state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchMembers();
    }
  }, [profile]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !profile?.company_id) return;

    setInviting(true);
    try {
      // Mock inserting team member or sending invitation link
      // For simulated testing, we create a notification or log a success message
      alert(`Invitation sent successfully to ${inviteEmail} for the ${inviteRole} role!`);
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (memberId === profile.id) {
      alert("You cannot remove yourself from the company team.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to remove this member from the organization?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: null })
        .eq('id', memberId);

      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 font-bold">Team Members</h1>
          <p className="text-xs text-slate-500 mt-1">Manage team members, roles, and recruitment collaboration permissions.</p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {/* Grid of Team Members */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading team members...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div 
              key={m.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative group"
            >
              
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center font-bold text-slate-700">
                    {m.full_name ? m.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">{m.full_name || 'Member'}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{m.email}</span>
                  </div>
                </div>

                {m.id !== profile.id && (
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="text-slate-400 hover:text-red-500 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Role</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] border border-primary/20 capitalize">
                  {m.role?.replace('_', ' ')}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl animate-slide-up">
            <h3 className="text-sm font-bold font-display text-slate-900">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. colleague@company.co.bw"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Company Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="company_admin">Company Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" loading={inviting}>Send Invitation</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Team;
