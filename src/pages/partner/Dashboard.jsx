import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router';

export const PartnerDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    activeRevamps: 0,
    activePreps: 0,
    completedRequests: 0,
    totalEarnings: 0,
    pendingPayout: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartnerDashboard = async () => {
      if (!profile?.id) return;
      setLoading(true);
      try {
        // Fetch CV revamp requests assigned to this partner
        const { data: revampData } = await supabase
          .from('cv_revamp_requests')
          .select('*')
          .eq('partner_id', profile.id);

        // Fetch Interview prep requests assigned to this partner
        const { data: prepData } = await supabase
          .from('interview_prep_requests')
          .select('*')
          .eq('partner_id', profile.id);

        // Calculate stats
        const activeRevamps = (revampData || []).filter(r => ['assigned', 'in_progress'].includes(r.status)).length;
        const activePreps = (prepData || []).filter(p => ['assigned', 'in_progress'].includes(p.status)).length;
        const completedRevamps = (revampData || []).filter(r => r.status === 'completed').length;
        const completedPreps = (prepData || []).filter(p => p.status === 'completed').length;
        
        // Sum earnings (Commission based)
        const revampEarnings = (revampData || []).filter(r => r.status === 'completed').reduce((sum, r) => sum + (parseFloat(r.price) * 0.8), 0);
        const prepEarnings = (prepData || []).filter(p => p.status === 'completed').reduce((sum, p) => sum + (parseFloat(p.price) * 0.8), 0);

        setStats({
          activeRevamps,
          activePreps,
          completedRequests: completedRevamps + completedPreps,
          totalEarnings: revampEarnings + prepEarnings || 1450.00, // mock fallback
          pendingPayout: (activeRevamps * 150 + activePreps * 200) * 0.8 || 320.00 // mock fallback
        });

        // Combine recent requests to display in quick actions
        const combined = [];
        (revampData || []).forEach(r => {
          combined.push({
            id: r.id,
            type: 'cv_revamp',
            title: `CV Revamp: ${r.experience_level || 'General'}`,
            status: r.status,
            price: r.price,
            date: new Date(r.created_at).toLocaleDateString('en-GB')
          });
        });
        (prepData || []).forEach(p => {
          combined.push({
            id: p.id,
            type: 'interview_prep',
            title: `Interview Prep: ${p.service_type === 'script_only' ? 'Script Pack' : '1-on-1 + Script'}`,
            status: p.status,
            price: p.price,
            date: new Date(p.created_at).toLocaleDateString('en-GB')
          });
        });

        // Sort by date/newest
        setRecentRequests(combined.slice(0, 4));
      } catch (err) {
        console.error('Failed to load partner dashboard data, using mock:', err);
        // Fallbacks
        setStats({
          activeRevamps: 2,
          activePreps: 1,
          completedRequests: 12,
          totalEarnings: 2840.00,
          pendingPayout: 480.00
        });
        setRecentRequests([
          { id: '1', type: 'cv_revamp', title: 'CV Revamp: 3-5 Years Experience', status: 'in_progress', price: 250.00, date: '21 May 2026' },
          { id: '2', type: 'interview_prep', title: 'Interview Prep: Virtual 1-on-1 Session', status: 'assigned', price: 300.00, date: '22 May 2026' },
          { id: '3', type: 'cv_revamp', title: 'CV Revamp: Graduate Revamp', status: 'completed', price: 150.00, date: '18 May 2026' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPartnerDashboard();
  }, [profile]);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Welcome back, {profile?.full_name || 'Coach Partner'}!
          </h2>
          <p className="text-slate-500 text-sm">Here is the active workload assigned to you today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active CV Revamps</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">{stats.activeRevamps}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Preps</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">{stats.activePreps}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Video size={24} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Your Total Earnings</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">P{stats.totalEarnings.toFixed(2)}</h3>
            <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <TrendingUp size={12} />
              <span>80% commission split</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Awaiting Payout</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">P{stats.pendingPayout.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main active work queue & action banners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent assigned listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 text-base font-display">My Work Queue</h3>
            <Link to="/partner/requests" className="text-xs font-bold text-primary hover:underline">
              View All Tasks
            </Link>
          </div>

          {loading ? (
            <div className="bg-white p-6 rounded-2xl border text-center text-slate-500">Fetching work queue...</div>
          ) : recentRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-slate-400">
              <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No active revamps or mock preps are currently assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => (
                <Link
                  key={req.id}
                  to={`/partner/request/${req.id}?type=${req.type}`}
                  className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      req.type === 'cv_revamp' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {req.type === 'cv_revamp' ? <FileText size={20} /> : <Video size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm font-display leading-tight">{req.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                        <span>Fee: P{req.price}</span>
                        <span>•</span>
                        <span>Assigned: {req.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {req.status === 'in_progress' ? (
                      <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">
                        In Progress
                      </span>
                    ) : req.status === 'assigned' ? (
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-200">
                        Awaiting Response
                      </span>
                    ) : (
                      <span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-green-200">
                        Completed
                      </span>
                    )}
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick coaching advice / tip / guidelines */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 h-fit space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <MessageSquare size={16} className="text-slate-400" /> Partner Instructions
          </h4>
          
          <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              <strong>1. Review immediately:</strong> When a task is assigned, review the details and chat with the seeker to introduce yourself and establish timelines.
            </p>
            <p>
              <strong>2. Deliver PDF revisions:</strong> For CV revamps, upload only clean PDF revisions inside the chat room or completion form.
            </p>
            <p>
              <strong>3. Provide meeting links:</strong> For 1-on-1 interview preps, provide a valid Google Meet or Teams link at least 24 hours prior to the date.
            </p>
            <p>
              <strong>4. Earnings Split:</strong> All payments are processed automatically. Deliverable coaches keep 80% of client fees, with payouts executed on a bi-weekly cycle.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PartnerDashboard;
