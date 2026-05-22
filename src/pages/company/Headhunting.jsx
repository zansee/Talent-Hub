import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import { 
  Compass, 
  Search, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  Mail, 
  Check, 
  FileText,
  UserCheck
} from 'lucide-react';

export const Headhunting = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Track requested CVs (to display requested state)
  const [requestedCvIds, setRequestedCvIds] = useState([]);

  const fetchSeekers = async () => {
    setLoading(true);
    try {
      // Fetch public profiles of seekers
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'job_seeker')
        .eq('profile_visibility', 'open');

      if (error) throw error;
      setSeekers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeekers();
  }, []);

  const handleRequestCV = async (seekerId) => {
    try {
      // Mock sending CV request (as a notification in the DB to the seeker)
      const { error } = await supabase
        .from('notifications').insert({
          user_id: seekerId,
          title: '⭐️ CV Access Requested',
          body: `${profile?.companies?.name || 'A company'} has requested access to view your full CV document.`,
          type: 'cv_request',
          data: { company_id: profile?.company_id }
        });

      if (error) throw error;
      setRequestedCvIds(prev => [...prev, seekerId]);
      alert('CV access request sent to candidate successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSeekers = seekers.filter(seeker => {
    const name = seeker.full_name || '';
    const title = seeker.current_job_title || '';
    const location = seeker.location || '';
    const skills = seeker.skills?.join(' ') || '';

    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                          title.toLowerCase().includes(search.toLowerCase()) || 
                          location.toLowerCase().includes(search.toLowerCase()) || 
                          skills.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">Talent Search (Headhunting)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Search the directory of candidate profiles who are actively open to new job offers.
        </p>
      </div>

      {/* Filters row */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by candidate name, current job role, town, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-sans rounded-xl border bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Showing {filteredSeekers.length} available profiles
        </div>

      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading seeker directory...</div>
      ) : filteredSeekers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <Compass size={32} className="text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800 font-display">No open candidates found</h3>
          <p className="text-xs text-slate-500 max-w-xs leading-normal">
            Try adjusting your search criteria. Only profiles with "Open to Headhunting" visibility appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeekers.map((seeker) => (
            <div 
              key={seeker.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:border-primary/20 transition-all hover:translate-y-[-1px] group"
            >
              
              {/* Profile Details */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {seeker.full_name ? seeker.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h3 className="text-sm font-bold font-display text-slate-900 group-hover:text-primary transition-colors truncate">
                    {seeker.full_name || 'Anonymous Seeker'}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold truncate">
                    {seeker.current_job_title || 'Unemployed / Seeker'}
                  </span>
                </div>
              </div>

              {/* Specific stats */}
              <div className="flex flex-col gap-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100/60 text-xs font-sans text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span>{seeker.location || 'Gaborone'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{seeker.highest_qualification || 'Degree details'}</span>
                </div>
              </div>

              {/* Skills chips */}
              <div className="flex flex-wrap gap-1">
                {seeker.skills?.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 border border-slate-200/40">
                    {s}
                  </span>
                ))}
                {seeker.skills?.length > 3 && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-400 border border-slate-200/40">
                    +{seeker.skills.length - 3} more
                  </span>
                )}
              </div>

              {/* Actions footer */}
              <div className="border-t border-slate-100 pt-3.5 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {seeker.cv_score && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold">
                      CV: {seeker.cv_score}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRequestCV(seeker.id)}
                  disabled={requestedCvIds.includes(seeker.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    requestedCvIds.includes(seeker.id)
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-primary hover:bg-primary-hover text-white border-primary shadow-sm'
                  }`}
                >
                  {requestedCvIds.includes(seeker.id) ? (
                    <>
                      <Check size={12} /> Requested
                    </>
                  ) : (
                    <>
                      <FileText size={12} /> Request Full CV
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Headhunting;
