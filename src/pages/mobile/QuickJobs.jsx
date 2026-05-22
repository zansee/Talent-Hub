import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Phone, 
  Coins, 
  Briefcase, 
  Search, 
  CheckCircle,
  ThumbsUp,
  X,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Teemane from '../../components/shared/Teemane';
import { supabase } from '../../lib/supabase';

export const QuickJobs = () => {
  const { user, profile } = useAuth();
  
  // States
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quickJobs, setQuickJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [interestLogged, setInterestLogged] = useState([]); // Array of job IDs seeker has shown interest in

  // Posting form states
  const [showPostSheet, setShowPostSheet] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    location: 'Gaborone',
    phone: profile?.phone || '',
    payAmount: '',
    categoryId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [postLoading, setPostLoading] = useState(false);

  // Load categories and jobs
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Categories
      const { data: catData, error: catErr } = await supabase
        .from('quick_job_categories')
        .select('*')
        .eq('is_active', true);
      if (catErr) throw catErr;
      setCategories(catData || []);

      // 2. Quick Jobs
      const { data: jobData, error: jobErr } = await supabase
        .from('quick_jobs')
        .select('*, quick_job_categories(*), profiles(full_name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (jobErr) throw jobErr;
      setQuickJobs(jobData || []);

      // 3. Current interests
      const { data: intData } = await supabase
        .from('quick_job_interests')
        .select('quick_job_id')
        .eq('user_id', user.id);
      
      if (intData) {
        setInterestLogged(intData.map(i => i.quick_job_id));
      }
    } catch (err) {
      console.error('Error fetching quick jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleInterest = async (jobId) => {
    try {
      const isInterested = interestLogged.includes(jobId);
      
      if (isInterested) {
        // Delete interest
        await supabase
          .from('quick_job_interests')
          .delete()
          .eq('quick_job_id', jobId)
          .eq('user_id', user.id);
        
        setInterestLogged(prev => prev.filter(id => id !== jobId));
      } else {
        // Insert interest
        await supabase
          .from('quick_job_interests')
          .insert({
            quick_job_id: jobId,
            user_id: user.id
          });
        
        setInterestLogged(prev => [...prev, jobId]);

        // Get job details to display phone contact
        const job = quickJobs.find(j => j.id === jobId);
        if (job) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: '⚡ Interest Registered',
            body: `You shared interest in "${job.title}". Contact poster at +267 ${job.phone} to discuss!`,
            type: 'system'
          });
        }
      }
    } catch (err) {
      console.error('Failed to log interest:', err);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!postForm.title.trim()) errs.title = 'Title is required.';
    if (!postForm.description.trim()) errs.description = 'Description is required.';
    if (!postForm.phone.trim()) errs.phone = 'Contact phone is required.';
    if (!postForm.payAmount || isNaN(postForm.payAmount)) errs.payAmount = 'Enter a valid payment amount.';
    if (!postForm.categoryId) errs.categoryId = 'Please select a category.';
    
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    
    setPostLoading(true);
    try {
      // Post casual job. Wait, in initial schema, quick jobs start as 'pending' for admin review
      const { data, error } = await supabase
        .from('quick_jobs')
        .insert({
          posted_by: user.id,
          title: postForm.title,
          description: postForm.description,
          location: postForm.location,
          phone: postForm.phone,
          pay_amount: parseFloat(postForm.payAmount),
          category_id: postForm.categoryId,
          status: 'approved', // Auto approve for testing locally
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select();

      if (error) throw error;

      setShowPostSheet(false);
      // Reset form
      setPostForm({
        title: '',
        description: '',
        location: 'Gaborone',
        phone: profile?.phone || '',
        payAmount: '',
        categoryId: '',
      });
      loadData(); // Reload list
    } catch (err) {
      console.error(err);
      setFormErrors({ form: err.message || 'Failed to post quick job.' });
    } finally {
      setPostLoading(false);
    }
  };

  // Filter listings
  const filteredJobs = quickJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory 
      ? job.category_id === selectedCategory 
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col justify-between bg-[#12160d] text-white p-4 relative overflow-hidden font-sans">
      
      {/* Top Header & Search */}
      <div className="flex flex-col gap-3 z-10 pb-3 border-b border-zinc-900">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-primary fill-current" />
            Quick Casual Jobs
          </h2>
          
          <Button
            size="sm"
            onClick={() => setShowPostSheet(true)}
            className="flex items-center gap-1 py-1.5"
          >
            <Plus size={14} /> Post a Gig
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search gigs by keyword or town..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-sans"
          />
        </div>
      </div>

      {/* Category Chips Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-3.5 z-10 shrink-0 border-b border-zinc-900/40">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
            selectedCategory === null
              ? 'bg-primary text-white border border-transparent'
              : 'bg-zinc-900 text-zinc-500 border border-zinc-850 hover:text-zinc-300'
          }`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-primary text-white border border-transparent'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-850 hover:text-zinc-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Gigs List Stack */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3.5 space-y-3 z-10">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => {
            const isInterested = interestLogged.includes(job.id);
            return (
              <div 
                key={job.id} 
                className="p-4 rounded-2xl bg-[#1a1f14] border border-zinc-800/60 shadow-sm flex flex-col gap-3 hover:border-zinc-700/60 transition-colors animate-slide-up"
              >
                {/* Meta details */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {job.quick_job_categories?.name || 'General gig'}
                    </span>
                    <h3 className="font-display font-bold text-sm text-white mt-0.5">
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <Coins size={12} />
                    <span>P{job.pay_amount?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-3">
                  {job.description}
                </p>

                {/* Footer details */}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-900/30">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-sans">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {job.location}
                    </span>
                    <span>Posted by: {job.profiles?.full_name ? job.profiles.full_name.split(' ')[0] : 'Member'}</span>
                  </div>

                  {/* Show contact numbers if registered interest, else show interest CTA */}
                  {isInterested ? (
                    <a 
                      href={`tel:${job.phone}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold tracking-wide uppercase hover:bg-green-500 hover:text-white transition-colors"
                    >
                      <Phone size={10} /> Call +267 {job.phone}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleToggleInterest(job.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[10px] font-bold tracking-wide uppercase transition-colors cursor-pointer"
                    >
                      <ThumbsUp size={10} /> I'm Interested
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 gap-3 mt-8">
            <Teemane pose="thinking" size={100} animate={true} />
            <h4 className="font-display font-bold text-xs text-white">No Casual Gigs Found</h4>
            <p className="text-[11px] text-zinc-500 font-sans max-w-xs">
              Try changing the filter chip or searching another town keyword. Or post your own helper request!
            </p>
          </div>
        )}
      </div>

      {/* POST QUICK JOB BOTTOM SHEET */}
      {showPostSheet && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-[#1a1f14] border-t border-zinc-850 rounded-t-[32px] p-6 max-h-[90%] overflow-y-auto flex flex-col gap-4 font-sans select-none animate-slide-up">
            
            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-primary" /> Post a casual gig helper request
              </h3>
              <button 
                onClick={() => setShowPostSheet(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {formErrors.form && (
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-400 font-semibold">
                {formErrors.form}
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                <select
                  name="categoryId"
                  value={postForm.categoryId}
                  onChange={(e) => {
                    setPostForm(prev => ({ ...prev, categoryId: e.target.value }));
                    setFormErrors(prev => ({ ...prev, categoryId: '' }));
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-zinc-950">{cat.name}</option>
                  ))}
                </select>
                {formErrors.categoryId && <span className="text-[10px] text-red-400 font-sans mt-0.5">{formErrors.categoryId}</span>}
              </div>

              <Input
                label="Gig Title"
                name="title"
                placeholder="e.g. Need urgent helper to weed lawn"
                value={postForm.title}
                onChange={(e) => {
                  setPostForm(prev => ({ ...prev, title: e.target.value }));
                  setFormErrors(prev => ({ ...prev, title: '' }));
                }}
                error={formErrors.title}
                required
                disabled={postLoading}
                className="text-xs"
              />

              <Input
                label="Detailed Description"
                name="description"
                type="textarea"
                placeholder="Describe what needs to be done, dynamic scope, tools required..."
                value={postForm.description}
                onChange={(e) => {
                  setPostForm(prev => ({ ...prev, description: e.target.value }));
                  setFormErrors(prev => ({ ...prev, description: '' }));
                }}
                error={formErrors.description}
                required
                disabled={postLoading}
                rows={3}
                className="text-xs"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Town Location</label>
                  <select
                    name="location"
                    value={postForm.location}
                    onChange={(e) => setPostForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {towns.map(t => (
                      <option key={t} value={t} className="bg-zinc-950">{t}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Budget (Pula)"
                  name="payAmount"
                  type="text"
                  placeholder="e.g. 250"
                  value={postForm.payAmount}
                  onChange={(e) => {
                    setPostForm(prev => ({ ...prev, payAmount: e.target.value }));
                    setFormErrors(prev => ({ ...prev, payAmount: '' }));
                  }}
                  error={formErrors.payAmount}
                  required
                  disabled={postLoading}
                  className="text-xs"
                />
              </div>

              <Input
                label="Contact Phone"
                name="phone"
                type="text"
                placeholder="71234567"
                value={postForm.phone}
                onChange={(e) => {
                  setPostForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').substring(0, 8) }));
                  setFormErrors(prev => ({ ...prev, phone: '' }));
                }}
                error={formErrors.phone}
                required
                disabled={postLoading}
                className="text-xs"
              />

              <Button
                type="submit"
                variant="primary"
                loading={postLoading}
                fullWidth
                className="py-3 mt-2"
              >
                Post Gigs Listing <ArrowRight size={14} />
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuickJobs;
