import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles,
  ChevronRight,
  Clock,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviewsScheduled: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  // Mock analytics data for Chart
  const analyticsData = [
    { name: 'Jan', applicants: 15, hires: 1 },
    { name: 'Feb', applicants: 28, hires: 2 },
    { name: 'Mar', applicants: 42, hires: 3 },
    { name: 'Apr', applicants: 38, hires: 2 },
    { name: 'May', applicants: 56, hires: 4 },
  ];

  const fetchDashboardData = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      // 1. Jobs count
      const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      // 2. Total applicants
      const { count: applicantsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id);

      // 3. Shortlisted
      const { count: shortlistCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'shortlisted');

      // 4. Interviews
      const { count: interviewsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'interviewed');

      setStats({
        activeJobs: jobsCount || 0,
        totalApplicants: applicantsCount || 0,
        shortlisted: shortlistCount || 0,
        interviewsScheduled: interviewsCount || 0
      });

      // Fetch mock recent actions
      setRecentActivities([
        { id: 1, action: "Applied to Software Engineer", name: "Thabo Kealotswe", time: "2 hours ago" },
        { id: 2, action: "Completed CV revamp download", name: "Mothusi Segokgo", time: "5 hours ago" },
        { id: 3, action: "Updated screening question details", name: "Recruiter Thato", time: "1 day ago" },
        { id: 4, action: "Scheduled interview with Neo", name: "Hiring Manager", time: "1 day ago" }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchDashboardData();
    }
  }, [profile]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {profile?.full_name || 'Hiring Team member'}. Here's an overview of your recruitment progress.
          </p>
        </div>
        <Link 
          to="/company/jobs" 
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all cursor-pointer"
        >
          Post New Role <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs</span>
            <span className="text-2xl font-display font-bold text-slate-900">{stats.activeJobs}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Briefcase size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidates</span>
            <span className="text-2xl font-display font-bold text-slate-900">{stats.totalApplicants}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted Candidates</span>
            <span className="text-2xl font-display font-bold text-slate-900">{stats.shortlisted}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interviews booked</span>
            <span className="text-2xl font-display font-bold text-slate-900">{stats.interviewsScheduled}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
        </div>

      </div>

      {/* Dashboard Analytics & Activities grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-display text-slate-900">Application Volume Analytics</h3>
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">Monthly trends</span>
          </div>
          <div className="h-[250px] w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="applicants" fill="#6B7C3A" radius={[4, 4, 0, 0]} name="Applicants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Actions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold font-display text-slate-900">Recent Activity</h3>
            <Link to="/company/activities" className="text-[10px] font-bold text-primary hover:underline">
              View Audit Log
            </Link>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs leading-normal items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center text-slate-500">
                  <Clock size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-slate-800 truncate">{act.name}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">{act.action}</span>
                  <span className="text-[9px] text-slate-400 mt-1 font-semibold">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
