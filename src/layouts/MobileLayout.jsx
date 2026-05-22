import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { isMobilePlatform } from '../lib/platform';
import Loader from '../components/shared/Loader';
import { 
  Flame, 
  Briefcase, 
  CheckSquare, 
  MessageSquare, 
  User, 
  Wifi, 
  Battery,
  Smartphone
} from 'lucide-react';

export const MobileLayout = () => {
  const { user, profile, loading, isSeeker, isPoster } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState('');

  // Keep simulated phone status bar clock updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isSeeker && !isPoster) {
        // Logged-in user is a desktop user, send to web dashboard
        if (profile?.role === 'admin') navigate('/admin/dashboard');
        else if (profile?.role === 'partner') navigate('/partner/dashboard');
        else navigate('/company/dashboard');
      }
    }
  }, [user, profile, loading, navigate, isSeeker, isPoster]);

  if (loading) {
    return <Loader fullScreen message="Setting up your Talenthub Botswana workspace..." />;
  }

  if (!user || (!isSeeker && !isPoster)) {
    return null; // Redirecting
  }

  // Active navigation helper
  const isActive = (path) => location.pathname.startsWith(path);

  // Layout structure
  const content = (
    <div className="flex flex-col h-full bg-[#12160d] text-white overflow-hidden relative font-sans">
      
      {/* Simulated Phone Status Bar (only if simulated or native) */}
      <div className="flex justify-between items-center px-6 py-2 text-xs font-semibold text-zinc-400 select-none bg-[#12160d]/90 backdrop-blur-md z-30 border-b border-zinc-900">
        <span>{time}</span>
        <div className="w-20 h-4 bg-zinc-950/60 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 border border-zinc-800/20 z-40 hidden sm:block"></div>
        <div className="flex items-center gap-1.5">
          <Wifi size={12} className="text-zinc-400" />
          <span className="text-[10px]">TH BW</span>
          <Battery size={14} className="text-zinc-400" />
        </div>
      </div>

      {/* Main Page Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 z-10">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 inset-x-0 bg-[#1a1f14]/90 backdrop-blur-md border-t border-zinc-800/40 px-4 py-2 pb-5 flex justify-around items-center z-30">
        <Link
          to="/mobile/feed"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            isActive('/mobile/feed') ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Flame size={20} className={isActive('/mobile/feed') ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium font-sans">Swipe</span>
        </Link>

        <Link
          to="/mobile/quick-jobs"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            isActive('/mobile/quick-jobs') ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Briefcase size={20} />
          <span className="text-[10px] font-medium font-sans">Quick Jobs</span>
        </Link>

        <Link
          to="/mobile/applications"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            isActive('/mobile/applications') || isActive('/mobile/matches') ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <CheckSquare size={20} />
          <span className="text-[10px] font-medium font-sans">Applications</span>
        </Link>

        <Link
          to="/mobile/services"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            isActive('/mobile/services') ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium font-sans">Services</span>
        </Link>

        <Link
          to="/mobile/profile"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            isActive('/mobile/profile') ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User size={20} className={isActive('/mobile/profile') ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium font-sans">Profile</span>
        </Link>
      </nav>

      {/* Simulated Home Indicator Bar */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-700/50 rounded-full z-40 pointer-events-none hidden sm:block"></div>
    </div>
  );

  // If on actual mobile browser or native Capacitor, render full screen
  const isMobileSize = isMobilePlatform() || window.innerWidth < 1024;
  
  if (isMobileSize) {
    return <div className="h-screen w-screen overflow-hidden bg-[#12160d]">{content}</div>;
  }

  // Else, render inside a high-fidelity desktop mockup of an iPhone 15 Pro
  return (
    <div className="min-h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Premium background styling */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-hover/5 blur-[120px] pointer-events-none"></div>

      {/* Outer simulator controls/header */}
      <div className="mb-4 text-center max-w-sm">
        <h2 className="text-white text-lg font-bold font-display flex items-center gap-2 justify-center">
          <Smartphone size={20} className="text-primary animate-pulse" />
          Mobile Simulator
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Simulating <span className="font-semibold text-primary">TalentHub Botswana</span> mobile app. Resize your browser or open on a mobile device for full-screen.
        </p>
      </div>

      {/* iPhone 15 Pro Frame */}
      <div className="relative w-[390px] h-[844px] rounded-[55px] border-[10px] border-zinc-800 bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 ring-4 ring-zinc-700/20">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-end pr-4 pointer-events-none">
          {/* Camera lens reflection effect */}
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800/30 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/60"></div>
          </div>
        </div>

        {/* Speaker notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-zinc-900 rounded-full z-50 pointer-events-none"></div>

        {/* Content Container */}
        <div className="h-full w-full">{content}</div>
      </div>
    </div>
  );
};

export default MobileLayout;
