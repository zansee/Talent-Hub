import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/shared/Loader';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  GraduationCap, 
  UserCheck, 
  ToggleLeft, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, profile, loading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        // Logged-in user is not admin, send to their respective home
        if (profile?.role === 'job_seeker' || profile?.role === 'quick_job_poster') {
          navigate('/mobile/feed');
        } else if (profile?.role === 'partner') {
          navigate('/partner/dashboard');
        } else {
          navigate('/company/dashboard');
        }
      }
    }
  }, [user, profile, loading, navigate, isAdmin]);

  if (loading) {
    return <Loader fullScreen message="Loading Admin Workspace..." />;
  }

  if (!user || !isAdmin) {
    return null; // Redirecting
  }

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Company Partners', path: '/admin/companies', icon: Building2 },
    { label: 'Manage Jobs', path: '/admin/jobs', icon: Briefcase },
    { label: 'Quick Job Approvals', path: '/admin/quick-job-approvals', icon: CheckCircle2 },
    { label: 'Graduate Verification', path: '/admin/graduate-verification', icon: GraduationCap },
    { label: 'Deliverable Partners', path: '/admin/partners', icon: UserCheck },
    { label: 'Feature Flags', path: '/admin/feature-flags', icon: ToggleLeft },
    { label: 'Pricing & Limits', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans transition-colors duration-200">
      
      {/* Sidebar navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo and Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <img src="/assets/logo.png" alt="Talenthub Logo" className="h-8 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm tracking-tight text-slate-900">TalentHub</span>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider font-sans -mt-1">Admin</span>
              </div>
            </Link>
            <button className="lg:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary text-white shadow-md shadow-primary/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate">{profile?.full_name || 'Admin User'}</span>
              <span className="text-[10px] text-slate-500 truncate">{profile?.email}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-600 hover:text-slate-900 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-slate-800 font-display font-bold text-lg select-none hidden md:block">
              TalentHub Botswana Management System
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* System Status indicator */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>System Live</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
