import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import { 
  CheckSquare, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Sparkles,
  ChevronRight,
  Info,
  Clock
} from 'lucide-react';

export const Applications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // all, active, archive
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*, companies(*))')
        .eq('user_id', user.id);

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const filteredApps = applications.filter(app => {
    if (activeTab === 'active') return ['applied', 'reviewed', 'shortlisted', 'interviewed'].includes(app.status);
    if (activeTab === 'archive') return ['offer', 'rejected', 'withdrawn'].includes(app.status);
    return true; // all
  });

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-950/20 text-blue-400 border-blue-900/20';
      case 'reviewed':
        return 'bg-indigo-950/20 text-indigo-400 border-indigo-900/20';
      case 'shortlisted':
        return 'bg-purple-950/20 text-purple-400 border-purple-900/20';
      case 'interviewed':
        return 'bg-orange-950/20 text-orange-400 border-orange-900/20';
      case 'offer':
        return 'bg-green-950/20 text-green-400 border-green-900/20';
      case 'rejected':
        return 'bg-red-950/20 text-red-400 border-red-900/20';
      default:
        return 'bg-zinc-950/20 text-zinc-400 border-zinc-900/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'reviewed': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interviewed': return 'Interview Scheduled';
      case 'offer': return 'Job Offer Received';
      case 'rejected': return 'Not Selected';
      case 'withdrawn': return 'Withdrawn';
      default: return status;
    }
  };

  return (
    <div className="min-h-full bg-[#12160d] text-white flex flex-col font-sans p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className="text-primary" />
          <h1 className="text-lg font-display font-bold">Applications</h1>
        </div>
        <button
          onClick={() => navigate('/mobile/matches')}
          className="text-xs font-bold text-primary hover:text-white transition-colors"
        >
          View Swipes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-950/60 rounded-xl p-1 border border-zinc-900/50 mb-4">
        {['all', 'active', 'archive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
              activeTab === tab ? 'bg-[#6B7C3A] text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab} ({
              tab === 'all' 
                ? applications.length 
                : tab === 'active' 
                ? applications.filter(a => ['applied', 'reviewed', 'shortlisted', 'interviewed'].includes(a.status)).length 
                : applications.filter(a => ['offer', 'rejected', 'withdrawn'].includes(a.status)).length
            })
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <Teemane pose="thinking" size={80} animate />
          <span className="text-xs text-zinc-500 mt-3 animate-pulse">Loading applications...</span>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 bg-zinc-950/20 border border-zinc-900/50 rounded-2xl">
          <Teemane pose="thinking" size={100} />
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-300">No applications</h3>
            <p className="text-xs text-zinc-500 max-w-[240px] mt-1.5 mx-auto leading-relaxed">
              {activeTab === 'all' 
                ? "You haven't applied for any roles yet. Swipe right on jobs you're interested in to begin." 
                : activeTab === 'active' 
                ? 'No active applications in process.' 
                : 'No archived applications.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/mobile/feed')}
            className="mt-2"
          >
            Browse Jobs
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
          {filteredApps.map((app) => {
            const job = app.jobs;
            if (!job) return null;
            return (
              <div 
                key={app.id}
                className="bg-[#1a1f14] border border-zinc-800/60 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group"
              >
                {/* Header details */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1 min-w-0 pr-8">
                    <h3 className="text-sm font-bold font-display text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <span className="text-[11px] text-zinc-400 font-semibold">{job.companies?.name || 'Direct Employer'}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getStatusBadgeStyles(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500 font-medium border-t border-zinc-900/40 pt-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-zinc-600" /> {job.location || 'Botswana'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} className="text-zinc-600" /> {job.employment_type || 'Full-time'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-zinc-600" /> Applied: {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Service/Interview prep hints */}
                {app.status === 'shortlisted' && (
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-zinc-300 flex items-start gap-2">
                    <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-white">Shortlisted! Ready for the Interview?</span>
                      <p className="text-zinc-400 leading-normal">
                        Boost your confidence with our professional mock interview preparation service.
                      </p>
                      <button
                        onClick={() => navigate('/mobile/services')}
                        className="text-primary font-bold hover:underline self-start uppercase tracking-wider text-[9px] cursor-pointer mt-0.5"
                      >
                        Request Interview Prep →
                      </button>
                    </div>
                  </div>
                )}

                {app.status === 'interviewed' && (
                  <div className="p-2.5 rounded-lg bg-orange-950/20 border border-orange-900/20 text-[10px] text-zinc-300 flex items-start gap-2">
                    <Clock size={14} className="text-orange-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-white">Interview Scheduled</span>
                      <p className="text-zinc-400 leading-normal">
                        Check your email for the interview invitation link, or reach out to the recruiter for timing details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
