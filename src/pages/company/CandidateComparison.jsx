import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  X, 
  HelpCircle, 
  Eye, 
  FileText,
  User
} from 'lucide-react';

export const CandidateComparison = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get('ids');

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hiring Manager preferences toggle (local or setting config)
  const [hiringManagerView, setHiringManagerView] = useState(true);

  const fetchCandidates = async () => {
    if (!idsParam) return;
    setLoading(true);
    try {
      const ids = idsParam.split(',');
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs(*), seeker:user_id(*)')
        .in('id', ids);

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idsParam) {
      fetchCandidates();
    }
  }, [idsParam]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/company/applications')}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900 font-bold">Candidate Comparison Matrix</h1>
            <p className="text-xs text-slate-500">Comparing candidates side-by-side across key profile weights and scoring credentials.</p>
          </div>
        </div>

        {/* Hiring Manager Toggle control */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/30">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-1.5">Hiring Manager Mode</span>
          <button
            onClick={() => setHiringManagerView(!hiringManagerView)}
            className={`w-10 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
              hiringManagerView ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                hiringManagerView ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading candidate matrix...</div>
      ) : candidates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          No candidates selected. Go back to Applications and choose 2-3 profiles.
        </div>
      ) : (
        /* Matrix Table comparison layout */
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6 border-r border-slate-200/80 w-52">Evaluation Factors</th>
                {candidates.map((c, idx) => (
                  <th key={c.id} className="py-4 px-6 border-r border-slate-200/80 text-slate-900 font-bold font-display">
                    Candidate {idx + 1}: {c.seeker?.full_name || c.external_name || 'Anonymous'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              
              {/* CV Score */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6 font-bold border-r border-slate-200/80 bg-slate-50/20 text-slate-800">AI CV Score</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3.5 px-6 border-r border-slate-200/80 font-bold">
                    {c.seeker?.cv_score ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[11px]">
                        {c.seeker.cv_score} / 100
                      </span>
                    ) : (
                      <span className="text-slate-400">Not Graded</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Education */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6 font-bold border-r border-slate-200/80 bg-slate-50/20 text-slate-800">Highest Qualification</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3.5 px-6 border-r border-slate-200/80">
                    <span className="font-semibold text-slate-900">{c.seeker?.highest_qualification || 'Degree details missing'}</span>
                  </td>
                ))}
              </tr>

              {/* Years of Experience */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6 font-bold border-r border-slate-200/80 bg-slate-50/20 text-slate-800">Experience Range</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3.5 px-6 border-r border-slate-200/80">
                    <span className="font-semibold text-slate-900">{c.seeker?.years_of_experience || '0-2'} years</span>
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6 font-bold border-r border-slate-200/80 bg-slate-50/20 text-slate-800">Town / Location</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3.5 px-6 border-r border-slate-200/80">
                    <span>{c.seeker?.location || 'Botswana'}</span>
                  </td>
                ))}
              </tr>

              {/* Skills matching comparison list */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6 font-bold border-r border-slate-200/80 bg-slate-50/20 text-slate-800">Skills list</td>
                {candidates.map(c => (
                  <td key={c.id} className="py-3.5 px-6 border-r border-slate-200/80">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {c.seeker?.skills?.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200/50">
                          {s}
                        </span>
                      )) || <span className="text-slate-400">None added</span>}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Pre-screening Questions & Answers (Hiring Manager details view) */}
              {hiringManagerView && (
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-6 font-bold border-r border-slate-200/80 bg-slate-50/20 text-slate-800">Screening Answers</td>
                  {candidates.map(c => {
                    const answers = c.screening_answers || {};
                    return (
                      <td key={c.id} className="py-3.5 px-6 border-r border-slate-200/80 text-slate-600 font-sans leading-normal">
                        {Object.keys(answers).length === 0 ? (
                          <span className="text-slate-400">No questions answered</span>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            {Object.entries(answers).map(([qText, ansVal]) => (
                              <div key={qText} className="flex flex-col gap-0.5 text-[11px]">
                                <span className="font-bold text-slate-800">{qText}</span>
                                <span className="text-slate-500 font-medium">Answer: {ansVal}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )}

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default CandidateComparison;
