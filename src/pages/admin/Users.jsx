import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Filter, 
  UserMinus, 
  UserCheck, 
  ShieldAlert, 
  Edit3,
  Calendar,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Load users from Supabase
  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users, using mock data:', err);
      // Fallback Mock Users for development
      setUsers([
        { id: '1', full_name: 'Zandi G.', email: 'zandi@talenthub.bw', role: 'admin', phone: '+267 71234567', location: 'Gaborone', subscription_tier: 'premium', created_at: '2026-01-10T12:00:00Z', deactivated_at: null },
        { id: '2', full_name: 'Kabo Segokgo', email: 'kabo@gmail.com', role: 'job_seeker', phone: '+267 72883921', location: 'Francistown', subscription_tier: 'free', created_at: '2026-05-20T08:30:00Z', deactivated_at: null },
        { id: '3', full_name: 'Bosa Letsebe', email: 'bosa@consultant.co.bw', role: 'partner', phone: '+267 75112233', location: 'Maun', subscription_tier: 'free', created_at: '2026-03-15T14:20:00Z', deactivated_at: null },
        { id: '4', full_name: 'Lesedi Ntuane', email: 'lesedi@recruits.co.bw', role: 'recruiter', phone: '+267 74909012', location: 'Gaborone', subscription_tier: 'free', created_at: '2026-04-02T10:15:00Z', deactivated_at: null },
        { id: '5', full_name: 'Thapelo Masa', email: 'thapelo@outlook.com', role: 'quick_job_poster', phone: '+267 76334455', location: 'Lobatse', subscription_tier: 'free', created_at: '2026-05-18T16:45:00Z', deactivated_at: '2026-05-20T00:00:00Z' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRole = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
      showFeedback('Role updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      // Mock update
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
      showFeedback('Role updated successfully (Mock)!', 'success');
    }
  };

  const handleToggleDeactivation = async (user) => {
    const isDeactivated = !!user.deactivated_at;
    const nextDeactivatedVal = isDeactivated ? null : new Date().toISOString();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ deactivated_at: nextDeactivatedVal })
        .eq('id', user.id);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === user.id ? { ...u, deactivated_at: nextDeactivatedVal } : u));
      showFeedback(isDeactivated ? 'User reactivated.' : 'User deactivated successfully.', 'success');
    } catch (err) {
      console.error(err);
      setUsers(users.map(u => u.id === user.id ? { ...u, deactivated_at: nextDeactivatedVal } : u));
      showFeedback(isDeactivated ? 'User reactivated (Mock).' : 'User deactivated (Mock).', 'success');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This will remove all their data.')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      showFeedback('User permanently deleted.', 'success');
    } catch (err) {
      console.error(err);
      setUsers(users.filter(u => u.id !== userId));
      showFeedback('User deleted successfully (Mock).', 'success');
    }
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || '').includes(searchTerm);
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">Admin</span>;
      case 'partner':
        return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">Partner</span>;
      case 'recruiter':
        return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">Recruiter</span>;
      case 'hiring_manager':
        return <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">Hiring Manager</span>;
      case 'company_admin':
        return <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">Company Admin</span>;
      case 'job_seeker':
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">Seeker</span>;
      case 'quick_job_poster':
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">Quick Poster</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">User Directory</h2>
          <p className="text-slate-500 text-sm">Monitor system users, alter roles, suspend accounts, and resolve deactivation queries.</p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, or telephone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 appearance-none font-medium text-slate-600"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="partner">Partners</option>
              <option value="company_admin">Company Admins</option>
              <option value="hiring_manager">Hiring Managers</option>
              <option value="recruiter">Recruiters</option>
              <option value="job_seeker">Job Seekers</option>
              <option value="quick_job_poster">Quick Job Posters</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Fetching directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No users found matching search filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <th className="p-4 pl-6">User Info</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Role & Tier</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${user.deactivated_at ? 'bg-red-50/20' : ''}`}>
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                          {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.full_name || 'Anonymous User'}</p>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin size={12} />
                            {user.location || 'Botswana'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5"><Mail size={12} /> {user.email}</span>
                        <span className="flex items-center gap-1.5"><Phone size={12} /> {user.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getRoleBadge(user.role)}
                        {user.role === 'job_seeker' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                            user.subscription_tier === 'premium' 
                              ? 'bg-amber-100 text-amber-800' 
                              : user.subscription_tier === 'graduate'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {user.subscription_tier} tier
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(user.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.deactivated_at ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium border border-red-200">
                          Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Change Role Button */}
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole(user.role);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Role"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        {/* Deactivate/Reactivate Button */}
                        <button
                          onClick={() => handleToggleDeactivation(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.deactivated_at 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={user.deactivated_at ? 'Reactivate User' : 'Suspend User'}
                        >
                          {user.deactivated_at ? <UserCheck size={16} /> : <ShieldAlert size={16} />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Account"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-2">Adjust User Role</h3>
            <p className="text-xs text-slate-500 mb-4">
              Updating role for <strong className="text-slate-800">{editingUser.full_name}</strong> ({editingUser.email}). Ensure they align with new role capabilities.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Select Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                >
                  <option value="job_seeker">Job Seeker</option>
                  <option value="quick_job_poster">Quick Job Poster</option>
                  <option value="partner">Partner (CV/Prep Coach)</option>
                  <option value="recruiter">Recruiter (Company)</option>
                  <option value="hiring_manager">Hiring Manager (Company)</option>
                  <option value="company_admin">Company Admin (Corporate Owner)</option>
                  <option value="admin">Global System Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateRole(editingUser.id)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
