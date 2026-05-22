import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { 
  LayoutDashboard, Users, Building2, Briefcase, ClipboardList,
  GraduationCap, Handshake, ToggleLeft, Settings, BarChart3,
  ScrollText, CreditCard, UserX, Bell, FileEdit, BookOpen,
  ChevronRight, LogOut, Shield
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
        isActive
          ? 'bg-primary text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    <Icon size={16} className="shrink-0" />
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </NavLink>
);

const SectionLabel = ({ children }) => (
  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-4 mb-1 block">
    {children}
  </span>
);

/**
 * AdminSidebar — Full sidebar for the admin portal
 */
export const AdminSidebar = ({ collapsed = false }) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0">
      {/* Logo + Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <img src="/assets/logo.png" alt="TH Logo" className="h-8 w-auto object-contain" />
        <div>
          <h1 className="font-display font-extrabold text-sm text-slate-900">TalentHub BW</h1>
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Shield size={9} className="text-primary" /> Admin Portal
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        <SectionLabel>Overview</SectionLabel>
        <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" />

        <SectionLabel>Platform</SectionLabel>
        <NavItem to="/admin/users" icon={Users} label="Users" />
        <NavItem to="/admin/companies" icon={Building2} label="Companies" />
        <NavItem to="/admin/company-requests" icon={ClipboardList} label="Company Requests" />
        <NavItem to="/admin/jobs" icon={Briefcase} label="Jobs" />
        <NavItem to="/admin/quick-job-approvals" icon={ClipboardList} label="Quick Job Approvals" />

        <SectionLabel>Services</SectionLabel>
        <NavItem to="/admin/graduate-verification" icon={GraduationCap} label="Graduate Verification" />
        <NavItem to="/admin/cv-revamp" icon={FileEdit} label="CV Revamp Requests" />
        <NavItem to="/admin/interview-prep" icon={BookOpen} label="Interview Prep" />
        <NavItem to="/admin/partners" icon={Handshake} label="Partners" />

        <SectionLabel>System</SectionLabel>
        <NavItem to="/admin/broadcast" icon={Bell} label="Broadcast" />
        <NavItem to="/admin/transactions" icon={CreditCard} label="Transactions" />
        <NavItem to="/admin/audit-log" icon={ScrollText} label="Audit Log" />
        <NavItem to="/admin/account-deletions" icon={UserX} label="Account Deletions" />
        <NavItem to="/admin/feature-flags" icon={ToggleLeft} label="Feature Flags" />
        <NavItem to="/admin/settings" icon={Settings} label="Settings" />
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{profile?.full_name}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

/**
 * CompanySidebar — Sidebar for company portal
 */
export const CompanySidebar = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <img src="/assets/logo.png" alt="TH Logo" className="h-8 w-auto object-contain" />
        <div>
          <h1 className="font-display font-extrabold text-sm text-slate-900 truncate max-w-[140px]">
            {profile?.companies?.name || 'Company Portal'}
          </h1>
          <span className="text-[10px] text-primary font-semibold">
            {profile?.role === 'company_admin' ? 'Admin' : profile?.role === 'hiring_manager' ? 'Hiring Manager' : 'Recruiter'}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        <SectionLabel>Recruitment</SectionLabel>
        <NavItem to="/company/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/company/jobs" icon={Briefcase} label="Job Postings" />
        <NavItem to="/company/create-job" icon={ChevronRight} label="Post a Job" />
        <NavItem to="/company/applications" icon={ClipboardList} label="Applications" />
        <NavItem to="/company/pipeline" icon={BarChart3} label="Candidate Pipeline" />

        <SectionLabel>Tools</SectionLabel>
        <NavItem to="/company/headhunting" icon={Users} label="Headhunting" />
        <NavItem to="/company/comparison" icon={GraduationCap} label="Candidate Compare" />
        <NavItem to="/company/interviews" icon={BookOpen} label="Interview Scheduler" />
        <NavItem to="/company/batch-import" icon={FileEdit} label="Batch Import" />

        <SectionLabel>Manage</SectionLabel>
        <NavItem to="/company/activities" icon={Bell} label="Live Activity" />
        <NavItem to="/company/team" icon={Handshake} label="Team" />
        <NavItem to="/company/audit-log" icon={ScrollText} label="Audit Log" />
      </nav>

      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{profile?.full_name}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

/**
 * PartnerSidebar — Sidebar for partner portal
 */
export const PartnerSidebar = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <img src="/assets/logo.png" alt="TH Logo" className="h-8 w-auto object-contain" />
        <div>
          <h1 className="font-display font-extrabold text-sm text-slate-900">Partner Portal</h1>
          <span className="text-[10px] text-primary font-semibold">{profile?.full_name}</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        <NavItem to="/partner/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/partner/requests" icon={ClipboardList} label="Service Requests" />
        <NavItem to="/partner/invoices" icon={CreditCard} label="Invoices" />
      </nav>
      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{profile?.full_name}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
          </div>
          <button onClick={async () => { await logout(); navigate('/login'); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer" title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
