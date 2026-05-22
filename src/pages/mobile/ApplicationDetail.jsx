import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Briefcase, MapPin, Calendar, Clock, ChevronDown, ChevronUp,
  FileText, AlertTriangle, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { statusConfig } from '../../utils/helpers';
import { WITHDRAWAL_REASONS as REASONS_LIST } from '../../lib/constants';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

const STAGES = ['applied', 'reviewed', 'shortlisted', 'interviewed', 'offer'];

export const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawCustom, setWithdrawCustom] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, jobs(*, companies(*))')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        if (error) throw error;
        setApplication(data);
      } catch (err) {
        setError('Could not load application.');
      } finally {
        setLoading(false);
      }
    };
    if (user && id) fetchApplication();
  }, [user, id]);

  const handleWithdraw = async () => {
    if (!withdrawReason) { setError('Please select a reason.'); return; }
    setWithdrawing(true);
    try {
      await supabase
        .from('applications')
        .update({
          status: 'withdrawn',
          withdrawn_at: new Date().toISOString(),
          withdrawal_reason: withdrawReason,
          withdrawal_reason_custom: withdrawReason === 'Other' ? withdrawCustom : null,
        })
        .eq('id', id);
      setApplication(prev => ({ ...prev, status: 'withdrawn' }));
      setShowWithdrawModal(false);
    } catch (err) {
      setError('Failed to withdraw. Try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#12160d]">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#12160d] text-zinc-400 gap-3">
        <AlertTriangle size={40} className="text-red-500" />
        <p className="text-sm font-semibold text-white">Application not found</p>
        <button onClick={() => navigate(-1)} className="text-primary text-xs cursor-pointer">Go back</button>
      </div>
    );
  }

  const job = application.jobs;
  const company = job?.companies;
  const stsCfg = statusConfig[application.status] || statusConfig.applied;
  const currentStageIdx = STAGES.indexOf(application.status);
  const canWithdraw = ['applied', 'reviewed'].includes(application.status);

  return (
    <div className="min-h-full flex flex-col bg-[#12160d] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-900 sticky top-0 bg-[#12160d]/95 backdrop-blur-md z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-sm truncate">{job?.title}</h1>
          <p className="text-[10px] text-zinc-500">{company?.name}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stsCfg.bg} ${stsCfg.color}`}>
          {stsCfg.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Job Quick Info */}
        <div className="px-5 py-4 border-b border-zinc-900/50 flex flex-col gap-2 text-xs text-zinc-400 font-sans">
          {job?.location && (
            <span className="flex items-center gap-2"><MapPin size={12} className="text-zinc-500" />{job.location}</span>
          )}
          <span className="flex items-center gap-2"><Calendar size={12} className="text-zinc-500" />Applied {formatRelativeTime(application.created_at)}</span>
          {job?.application_deadline && (
            <span className="flex items-center gap-2"><Clock size={12} className="text-zinc-500" />Deadline: {formatDate(job.application_deadline)}</span>
          )}
        </div>

        {/* Status Timeline */}
        {application.status !== 'withdrawn' && application.status !== 'rejected' && (
          <div className="px-5 py-4 border-b border-zinc-900/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Application Progress</p>
            <div className="flex items-center gap-1">
              {STAGES.map((stage, i) => {
                const isPast = i <= currentStageIdx;
                const isCurrent = i === currentStageIdx;
                return (
                  <React.Fragment key={stage}>
                    <div className={`flex flex-col items-center gap-1 flex-1`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                        isPast ? 'bg-primary border-primary text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-600'
                      } ${isCurrent ? 'ring-2 ring-primary/40' : ''}`}>
                        {isPast ? <CheckCircle2 size={12} /> : i + 1}
                      </div>
                      <span className={`text-[8px] font-semibold capitalize ${isPast ? 'text-primary' : 'text-zinc-600'}`}>
                        {stage}
                      </span>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 ${i < currentStageIdx ? 'bg-primary' : 'bg-zinc-800'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {application.status === 'rejected' && (
          <div className="mx-5 my-4 p-4 bg-red-950/20 border border-red-900/30 rounded-2xl flex items-center gap-3">
            <XCircle size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-400">Not Selected</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">The employer has reviewed your application and moved in a different direction. Keep going!</p>
            </div>
          </div>
        )}

        {application.status === 'withdrawn' && (
          <div className="mx-5 my-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <p className="text-xs font-bold text-zinc-400">Application Withdrawn</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Reason: {application.withdrawal_reason}{application.withdrawal_reason_custom ? ` — ${application.withdrawal_reason_custom}` : ''}</p>
          </div>
        )}

        {/* Cover Letter */}
        {application.cover_letter && (
          <div className="mx-5 my-4 border border-zinc-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowCoverLetter(!showCoverLetter)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-white hover:bg-zinc-900/30 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2"><FileText size={14} className="text-primary" /> Cover Letter</span>
              {showCoverLetter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {showCoverLetter && (
                <motion.div
                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-[11px] text-zinc-400 font-sans leading-relaxed border-t border-zinc-800/50 pt-3 whitespace-pre-line">
                    {application.cover_letter}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Screening Answers */}
        {application.screening_answers && Object.keys(application.screening_answers).length > 0 && (
          <div className="mx-5 mb-4 p-4 border border-zinc-800 rounded-2xl flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Screening Answers</p>
            {Object.entries(application.screening_answers).map(([q, a]) => (
              <div key={q}>
                <p className="text-[10px] font-semibold text-zinc-300">{q}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Withdraw Button */}
        {canWithdraw && (
          <div className="px-5 mt-2">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full py-3 rounded-xl border border-red-900/40 text-red-500 text-xs font-semibold hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              Withdraw Application
            </button>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Withdraw Application">
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400">Why are you withdrawing this application?</p>
          {REASONS_LIST.map(reason => (
            <button
              key={reason}
              onClick={() => setWithdrawReason(reason)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                withdrawReason === reason
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-primary/40'
              }`}
            >
              {reason}
            </button>
          ))}
          {withdrawReason === 'Other' && (
            <textarea
              value={withdrawCustom}
              onChange={e => setWithdrawCustom(e.target.value)}
              placeholder="Please describe..."
              rows={3}
              className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white outline-none focus:border-primary resize-none"
            />
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button variant="danger" onClick={handleWithdraw} loading={withdrawing} fullWidth>
            Confirm Withdrawal
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationDetail;
