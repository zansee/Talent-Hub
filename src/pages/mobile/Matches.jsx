import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import { 
  Heart, 
  Star, 
  X, 
  MapPin, 
  Briefcase, 
  Sparkles,
  ChevronRight,
  ArrowLeft 
} from 'lucide-react';

export const Matches = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('liked'); // liked, saved, passed
  const [swipes, setSwipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSwipes = async () => {
    setLoading(true);
    try {
      // Get swiped jobs
      const { data, error } = await supabase
        .from('job_swipes')
        .select('*, jobs(*, companies(*))')
        .eq('user_id', user.id);

      if (error) throw error;
      setSwipes(data || []);
    } catch (err) {
      console.error('Error fetching swipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSwipes();
    }
  }, [user]);

  const handleDeleteSwipe = async (swipeId) => {
    try {
      const { error } = await supabase
        .from('job_swipes')
        .delete()
        .eq('id', swipeId);
      
      if (error) throw error;
      setSwipes(prev => prev.filter(s => s.id !== swipeId));
    } catch (err) {
      console.error('Error removing swipe:', err);
    }
  };

  const filteredSwipes = swipes.filter(swipe => {
    if (activeTab === 'liked') return swipe.direction === 'right';
    if (activeTab === 'passed') return swipe.direction === 'left';
    return false;
  });

  return (
    <div className="min-h-full bg-[#12160d] text-white flex flex-col font-sans p-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-3 mb-4">
        <button
          onClick={() => navigate('/mobile/feed')}
          className="p-1 hover:bg-zinc-800/40 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-display font-bold">My Matches & Swipes</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-950/60 rounded-xl p-1 border border-zinc-900/50 mb-4">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'liked' ? 'bg-[#6B7C3A] text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart size={14} className={activeTab === 'liked' ? 'fill-current' : ''} />
          <span>Liked ({swipes.filter(s => s.direction === 'right').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('passed')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'passed' ? 'bg-[#6B7C3A] text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <X size={14} />
          <span>Passed ({swipes.filter(s => s.direction === 'left').length})</span>
        </button>
      </div>

      {/* Swipe List */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <Teemane pose="thinking" size={80} animate />
          <span className="text-xs text-zinc-500 mt-3 animate-pulse">Loading swipes...</span>
        </div>
      ) : filteredSwipes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 bg-zinc-950/20 border border-zinc-900/50 rounded-2xl">
          <Teemane pose="thinking" size={100} />
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-300">No {activeTab} jobs found</h3>
            <p className="text-xs text-zinc-500 max-w-[240px] mt-1.5 mx-auto leading-relaxed">
              {activeTab === 'liked' 
                ? "You haven't liked any roles yet. Swipe right on jobs in the feed to see them here!" 
                : "You haven't passed on any roles. Swipe left on jobs in the feed."}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/mobile/feed')}
            className="mt-2"
          >
            Start Swiping
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
          {filteredSwipes.map((swipe) => {
            const job = swipe.jobs;
            if (!job) return null;
            return (
              <div 
                key={swipe.id}
                className="bg-[#1a1f14] border border-zinc-800/60 rounded-2xl p-4 flex flex-col gap-3 relative group overflow-hidden"
              >
                {/* Score overlay */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-zinc-950/40 rounded-bl-2xl border-l border-b border-zinc-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary font-display">
                    {activeTab === 'liked' ? 'Fit' : 'Left'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pr-10">
                  <h3 className="text-sm font-bold font-display text-white line-clamp-1">{job.title}</h3>
                  <span className="text-[11px] text-zinc-400 font-semibold">{job.companies?.name || 'Direct Employer'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {job.location || 'Botswana'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} /> {job.employment_type || 'Full-time'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900/50 pt-2.5 mt-1">
                  <button
                    onClick={() => handleDeleteSwipe(swipe.id)}
                    className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                  >
                    Delete Swipe
                  </button>

                  <button
                    onClick={() => navigate(`/mobile/feed`)}
                    className="text-[10px] font-bold text-primary hover:text-white transition-colors uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                  >
                    View in Feed <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;
