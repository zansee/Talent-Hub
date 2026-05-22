import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  X, 
  Heart, 
  Star, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  ChevronUp, 
  ChevronDown,
  Building,
  Sparkles,
  Info,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Teemane from '../../components/shared/Teemane';
import Button from '../../components/shared/Button';
import calculateMatchScore from '../../utils/matchScore';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router';

// High-fidelity Framer Motion swipe card wrapper
const DragCard = ({ children, onSwipe, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 120) {
      onSwipe('right');
    } else if (info.offset.x < -120) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, y, rotate, opacity, zIndex: 100 - index }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      whileTap={{ scale: 0.98 }}
    >
      {/* Swipe Badges Overlay */}
      <motion.div 
        style={{ opacity: likeOpacity }} 
        className="absolute top-10 left-10 z-50 border-4 border-green-500 text-green-500 font-bold uppercase rounded-lg px-4 py-1.5 rotate-[-12deg] text-xl font-display pointer-events-none"
      >
        Like
      </motion.div>
      <motion.div 
        style={{ opacity: nopeOpacity }} 
        className="absolute top-10 right-10 z-50 border-4 border-red-500 text-red-500 font-bold uppercase rounded-lg px-4 py-1.5 rotate-[12deg] text-xl font-display pointer-events-none"
      >
        Nope
      </motion.div>
      
      {children}
    </motion.div>
  );
};

export const SwipeFeed = () => {
  const { user, profile } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  
  // relevance filter state (jobs < 50% match score are hidden by default)
  const [relevanceFilter, setRelevanceFilter] = useState(true);
  
  // Saved job ID list for local indicators
  const [savedJobs, setSavedJobs] = useState([]);

  // Load jobs from DB
  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(*)')
        .eq('status', 'active');

      if (error) throw error;

      // Calculate match score for all jobs
      const scoredJobs = data.map(job => {
        const score = calculateMatchScore(job, profile || {});
        return { ...job, matchScore: score };
      }).sort((a, b) => b.matchScore - a.matchScore); // Highest matches first

      setJobs(scoredJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadJobs();
    }
  }, [profile]);

  // Filter jobs based on relevance filter
  const filteredJobs = relevanceFilter
    ? jobs.filter(job => job.matchScore >= 50)
    : jobs;

  // Active job in stack
  const activeJob = filteredJobs[currentIndex];

  const handleSwipe = async (direction) => {
    if (!activeJob) return;

    // Save swipe event in database
    try {
      await supabase.from('job_swipes').insert({
        user_id: user.id,
        job_id: activeJob.id,
        direction: direction === 'right' ? 'right' : 'left'
      });

      // If swiped right (like), record application or match
      if (direction === 'right') {
        // If match score is high, create a match automatically
        if (activeJob.matchScore >= 60) {
          // create a notification
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: '🎯 High Match Potential!',
            body: `You matched ${activeJob.matchScore}% with ${activeJob.title} at ${activeJob.companies?.name || 'employer'}. Tap to apply!`,
            type: 'job_match',
            data: { job_id: activeJob.id }
          });
        }
      }
    } catch (err) {
      console.error('Failed to log swipe:', err);
    }

    // Advance stack
    setShowDetail(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSaveJob = async () => {
    if (!activeJob) return;
    try {
      // Save/unsave logic
      const isSaved = savedJobs.includes(activeJob.id);
      if (isSaved) {
        setSavedJobs(prev => prev.filter(id => id !== activeJob.id));
      } else {
        setSavedJobs(prev => [...prev, activeJob.id]);
        
        // Save to DB (mock or using saved_documents/swipes metadata)
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: '⭐️ Job Bookmarked',
          body: `You saved ${activeJob.title} at ${activeJob.companies?.name}. Access it from applications tab later!`,
          type: 'system'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset stack
  const handleResetStack = () => {
    setCurrentIndex(0);
    setShowDetail(false);
  };

  // Skill Gap Helper
  const getMissingSkills = (job, profile) => {
    const jobSkills = job?.required_skills || [];
    const profileSkills = profile?.skills || [];
    return jobSkills.filter(skill => !profileSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#12160d] text-white">
        <Teemane pose="thinking" size={100} animate={true} />
        <span className="text-xs text-zinc-400 mt-4 animate-pulse">Running match calculations...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between bg-[#12160d] text-white overflow-hidden relative p-4">
      
      {/* Header bar */}
      <div className="flex justify-between items-center z-30 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="TH Logo" className="h-6 w-auto" />
          <span className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
            TalentHub Feed
          </span>
        </div>
        
        {/* Toggle Relevance Filter Control */}
        <button
          onClick={() => setRelevanceFilter(!relevanceFilter)}
          className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold ${
            relevanceFilter 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-zinc-800 bg-zinc-900/30 text-zinc-500'
          }`}
          title="Filter low match score jobs (<50%)"
        >
          <SlidersHorizontal size={12} />
          <span>{relevanceFilter ? 'Relevant Matches' : 'All Jobs'}</span>
        </button>
      </div>

      {/* Cards Deck Area */}
      <div className="flex-1 my-4 flex items-center justify-center relative select-none">
        <AnimatePresence>
          {activeJob ? (
            <DragCard 
              key={activeJob.id} 
              index={currentIndex} 
              onSwipe={handleSwipe}
            >
              {/* Job Card Interface */}
              <div className="w-full h-full rounded-3xl bg-[#1a1f14] border border-zinc-800/60 shadow-xl overflow-hidden flex flex-col justify-between relative group select-none">
                
                {/* Background lighting effect based on match score */}
                <div 
                  className={`absolute top-0 inset-x-0 h-40 opacity-10 blur-xl pointer-events-none transition-colors duration-300 ${
                    activeJob.matchScore >= 80 ? 'bg-green-500' : activeJob.matchScore >= 50 ? 'bg-primary' : 'bg-orange-500'
                  }`}
                />

                {/* Card Top Section */}
                <div className="p-5 flex flex-col gap-3.5 z-10">
                  <div className="flex justify-between items-start">
                    {/* Badge details */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#12160d] text-[10px] font-bold border border-zinc-800 text-zinc-400">
                        {activeJob.employment_type || 'Full-time'}
                      </span>
                      {activeJob.companies?.is_verified && (
                        <span className="px-2 py-0.5 rounded-md bg-green-950/20 text-green-400 text-[10px] font-bold border border-green-900/20 flex items-center gap-1">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    
                    {/* Match Score Circle */}
                    <div 
                      className={`w-10 h-10 rounded-full flex flex-col items-center justify-center border font-display font-extrabold text-xs shadow-md ${
                        activeJob.matchScore >= 80 
                          ? 'border-green-500 bg-green-500/10 text-green-400' 
                          : activeJob.matchScore >= 60 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-orange-500 bg-orange-500/10 text-orange-400'
                      }`}
                    >
                      <span>{activeJob.matchScore}%</span>
                    </div>
                  </div>

                  {/* Title & Employer */}
                  <div>
                    <h3 className="text-xl font-bold font-display leading-tight text-white line-clamp-2">
                      {activeJob.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans mt-1 flex items-center gap-1.5">
                      <Building size={12} className="text-zinc-500" />
                      {activeJob.companies?.name || 'Direct Employer'}
                    </p>
                  </div>
                </div>

                {/* Card Center Specifications */}
                <div className="px-5 py-4 bg-zinc-950/30 border-y border-zinc-900/50 flex flex-col gap-2.5 z-10 text-xs font-sans text-zinc-300">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-zinc-500 shrink-0" />
                    <span>{activeJob.location || 'Botswana'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-zinc-500 shrink-0" />
                    <span>{activeJob.required_qualification || 'No specific education'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-500 shrink-0" />
                    <span>Experience required: {activeJob.required_experience || 'Any'} years</span>
                  </div>
                </div>

                {/* Card Bottom Expand CTA */}
                <button
                  type="button"
                  onClick={() => setShowDetail(!showDetail)}
                  className="w-full py-4 text-center text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors z-20 cursor-pointer border-t border-zinc-900/30"
                >
                  {showDetail ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  <span>{showDetail ? 'Collapse Details' : 'Tap to View Description & Skills'}</span>
                </button>
              </div>
            </DragCard>
          ) : (
            /* Empty Stack State */
            <div className="flex flex-col items-center justify-center text-center p-6 gap-5 animate-slide-up bg-[#1a1f14]/20 border border-zinc-900 rounded-3xl w-full h-full max-w-sm">
              <Teemane pose="thinking" size={140} animate={true} />
              <div className="flex flex-col gap-2.5 max-w-xs">
                <h3 className="font-display font-bold text-base text-white">No More Matching Jobs!</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  You've swiped through all jobs that fit your profile. Try toggling the relevance filter below to explore all available listings!
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRelevanceFilter(!relevanceFilter)}
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <SlidersHorizontal size={14} />
                  <span>Show All Opportunities</span>
                </Button>
                <button 
                  onClick={handleResetStack}
                  className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1 mt-1"
                >
                  <RefreshCw size={10} /> Reset Stack & Re-review
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Stack Interactive Action Buttons */}
      {activeJob && (
        <div className="flex items-center justify-center gap-5 pb-2.5 z-20 select-none">
          <button
            onClick={() => handleSwipe('left')}
            className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-950/10 text-red-500 flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
            title="Pass (Swipe Left)"
          >
            <X size={20} />
          </button>
          
          <button
            onClick={handleSaveJob}
            className={`w-10 h-10 rounded-full bg-zinc-900 border flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer ${
              savedJobs.includes(activeJob.id) 
                ? 'border-yellow-500 text-yellow-500 bg-yellow-950/10' 
                : 'border-zinc-800 text-zinc-400 hover:border-yellow-500/50 hover:text-yellow-500'
            }`}
            title="Bookmark / Save Job"
          >
            <Star size={16} className={savedJobs.includes(activeJob.id) ? 'fill-current' : ''} />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:bg-green-950/10 text-green-400 flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
            title="Interested (Swipe Right)"
          >
            <Heart size={20} />
          </button>
        </div>
      )}

      {/* Slide out Bottom Detail Sheet (only if activeJob & showDetail is true) */}
      <AnimatePresence>
        {activeJob && showDetail && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 bg-[#1a1f14] border-t border-zinc-800 shadow-2xl rounded-t-[32px] max-h-[70%] z-40 overflow-y-auto flex flex-col font-sans no-scrollbar"
          >
            {/* Sheet Handle */}
            <div className="flex justify-center py-3 sticky top-0 bg-[#1a1f14] border-b border-zinc-900/40 z-10 cursor-pointer" onClick={() => setShowDetail(false)}>
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </div>

            {/* Content Container */}
            <div className="p-6 flex flex-col gap-5 text-sm text-zinc-300">
              
              {/* Header */}
              <div className="flex flex-col gap-1 border-b border-zinc-900/40 pb-4">
                <h2 className="text-lg font-bold text-white font-display leading-tight">{activeJob.title}</h2>
                <span className="text-xs text-primary font-semibold">{activeJob.companies?.name}</span>
              </div>

              {/* Match Scoring Insights (Polite Skill Gap Analysis) */}
              <div className="p-4 bg-zinc-950/30 border border-zinc-800/40 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Sparkles size={14} className="text-primary" />
                  <span>Teemane Compatibility Analysis</span>
                </div>
                
                {activeJob.matchScore >= 80 ? (
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    🌟 **Excellent match!** You meet all core requirements for education, industry background, and skills. We highly recommend swiping right to apply.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      You are a strong candidate! To strengthen your compatibility match even further, consider adding the following skills to your profile:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {getMissingSkills(activeJob, profile).length > 0 ? (
                        getMissingSkills(activeJob, profile).map(skill => (
                          <span key={skill} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                            + {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-500">None identified (great skills profile)</span>
                      )}
                    </div>
                    <Link to="/mobile/services" className="text-[10px] font-bold text-primary hover:text-white transition-colors mt-1.5 inline-flex items-center gap-0.5">
                      <Info size={10} /> Upgrading qualifications or request a professional CV revamp →
                    </Link>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Job Description</h4>
                <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-line font-sans">
                  {activeJob.description || 'No description provided by employer.'}
                </p>
              </div>

              {/* Skills required */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeJob.required_skills?.map(skill => (
                    <span 
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-[#12160d] border border-zinc-800 text-[10px] font-semibold text-zinc-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SwipeFeed;
