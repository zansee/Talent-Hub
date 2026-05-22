import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Import Layouts
import MobileLayout from './layouts/MobileLayout';
import CompanyLayout from './layouts/CompanyLayout';
import PartnerLayout from './layouts/PartnerLayout';
import AdminLayout from './layouts/AdminLayout';

// Import Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import TwoFactorSetup from './pages/auth/TwoFactorSetup';
import TwoFactorVerify from './pages/auth/TwoFactorVerify';

// Import Public Pages
import RequestAccess from './pages/public/RequestAccess';
import PublicJobApplication from './pages/public/PublicJobApplication';

// Import Mobile Pages
import Onboarding from './pages/mobile/Onboarding';
import ProfileSetup from './pages/mobile/ProfileSetup';
import SwipeFeed from './pages/mobile/SwipeFeed';
import Matches from './pages/mobile/Matches';
import MobileApplications from './pages/mobile/Applications';
import Services from './pages/mobile/Services';
import Profile from './pages/mobile/Profile';
import Subscription from './pages/mobile/Subscription';
import MobileSettings from './pages/mobile/Settings';
import QuickJobs from './pages/mobile/QuickJobs';
import Notifications from './pages/mobile/Notifications';
import ApplicationDetail from './pages/mobile/ApplicationDetail';
import PostQuickJob from './pages/mobile/PostQuickJob';
import UpgradeAccount from './pages/mobile/UpgradeAccount';
// Import Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import CompanyJobs from './pages/company/Jobs';
import CreateJob from './pages/company/CreateJob';
import CompanyApplications from './pages/company/Applications';
import CandidatePipeline from './pages/company/CandidatePipeline';
import Headhunting from './pages/company/Headhunting';
import InterviewScheduler from './pages/company/InterviewScheduler';
import Team from './pages/company/Team';
import LiveActivities from './pages/company/LiveActivities';
import CandidateComparison from './pages/company/CandidateComparison';
import JobDetail from './pages/company/JobDetail';
import CandidateDetail from './pages/company/CandidateDetail';
import BatchImport from './pages/company/BatchImport';
import CompanyAuditLog from './pages/company/AuditLog';
// Import Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import QuickJobApprovals from './pages/admin/QuickJobApprovals';
import GraduateVerification from './pages/admin/GraduateVerification';
import AdminPartners from './pages/admin/Partners';
import FeatureFlags from './pages/admin/FeatureFlags';
import AdminSettings from './pages/admin/Settings';
import Analytics from './pages/admin/Analytics';
import AdminAuditLog from './pages/admin/AuditLog';
import Transactions from './pages/admin/Transactions';
import AccountDeletions from './pages/admin/AccountDeletions';
import BroadcastNotification from './pages/admin/BroadcastNotification';
import CompanyRequests from './pages/admin/CompanyRequests';
import CVRevampAdmin from './pages/admin/CVRevampAdmin';
import InterviewPrepAdmin from './pages/admin/InterviewPrepAdmin';
// Import Partner Pages
import PartnerDashboard from './pages/partner/Dashboard';
import PartnerRequests from './pages/partner/Requests';
import PartnerRequestDetail from './pages/partner/RequestDetail';
import PartnerInvoices from './pages/partner/Invoices';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
          <Routes>
            {/* Public/Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/two-factor-setup" element={<TwoFactorSetup />} />
            <Route path="/two-factor-verify" element={<TwoFactorVerify />} />
            <Route path="/request-access" element={<RequestAccess />} />
            <Route path="/jobs/public/:token" element={<PublicJobApplication />} />

            {/* Mobile (Job Seeker / Quick Poster) Routes */}
            <Route path="/mobile" element={<MobileLayout />}>
              <Route index element={<Navigate to="/mobile/feed" replace />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="profile-setup" element={<ProfileSetup />} />
              <Route path="feed" element={<SwipeFeed />} />
              <Route path="matches" element={<Matches />} />
              <Route path="applications" element={<MobileApplications />} />
              <Route path="services" element={<Services />} />
              <Route path="profile" element={<Profile />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="settings" element={<MobileSettings />} />
              <Route path="quick-jobs" element={<QuickJobs />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="post-quick-job" element={<PostQuickJob />} />
              <Route path="upgrade" element={<UpgradeAccount />} />
            </Route>

            {/* Company Routes */}
            <Route path="/company" element={<CompanyLayout />}>
              <Route index element={<Navigate to="/company/dashboard" replace />} />
              <Route path="dashboard" element={<CompanyDashboard />} />
              <Route path="jobs" element={<CompanyJobs />} />
              <Route path="create-job" element={<CreateJob />} />
              <Route path="applications" element={<CompanyApplications />} />
              <Route path="pipeline" element={<CandidatePipeline />} />
              <Route path="headhunting" element={<Headhunting />} />
              <Route path="interviews" element={<InterviewScheduler />} />
              <Route path="team" element={<Team />} />
              <Route path="activities" element={<LiveActivities />} />
              <Route path="comparison" element={<CandidateComparison />} />
              <Route path="job/:id" element={<JobDetail />} />
              <Route path="candidate/:id" element={<CandidateDetail />} />
              <Route path="batch-import" element={<BatchImport />} />
              <Route path="audit-log" element={<CompanyAuditLog />} />
            </Route>

            {/* Partner Routes */}
            <Route path="/partner" element={<PartnerLayout />}>
              <Route index element={<Navigate to="/partner/dashboard" replace />} />
              <Route path="dashboard" element={<PartnerDashboard />} />
              <Route path="requests" element={<PartnerRequests />} />
              <Route path="requests/:id" element={<PartnerRequestDetail />} />
              <Route path="invoices" element={<PartnerInvoices />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="quick-job-approvals" element={<QuickJobApprovals />} />
              <Route path="graduate-verification" element={<GraduateVerification />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="feature-flags" element={<FeatureFlags />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="audit-log" element={<AdminAuditLog />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="account-deletions" element={<AccountDeletions />} />
              <Route path="broadcast" element={<BroadcastNotification />} />
              <Route path="company-requests" element={<CompanyRequests />} />
              <Route path="cv-revamp" element={<CVRevampAdmin />} />
              <Route path="interview-prep" element={<InterviewPrepAdmin />} />
            </Route>

            {/* Root Redirect Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
