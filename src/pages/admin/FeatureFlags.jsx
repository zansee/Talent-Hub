import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  Info,
  RefreshCw,
  Zap,
  CreditCard,
  Brain,
  FileCode,
  GraduationCap
} from 'lucide-react';

export const AdminFeatureFlags = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setFlags(data || []);
    } catch (err) {
      console.error('Failed to load feature flags, using mocks:', err);
      // Mocks matching database seed
      setFlags([
        { id: 'f1', name: 'payments_enabled', is_enabled: false, description: 'Shift between "Simulated Payments (Admin approved)" and "Real Stripe/Credit Card mock"' },
        { id: 'f2', name: 'ai_cv_scoring_enabled', is_enabled: true, description: 'Enable automatic AI extraction and scoring on CV upload' },
        { id: 'f3', name: 'ai_cover_letter_enabled', is_enabled: true, description: 'Allow job seekers to generate AI-tailored cover letters on applications' },
        { id: 'f4', name: 'graduate_tier_verification_enabled', is_enabled: true, description: 'Require graduates to upload academic documents for verification' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (flag) => {
    const nextVal = !flag.is_enabled;
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: nextVal, updated_at: new Date().toISOString() })
        .eq('id', flag.id);

      if (error) throw error;

      setFlags(flags.map(f => f.id === flag.id ? { ...f, is_enabled: nextVal } : f));
      showFeedback(`Feature flag "${flag.name}" is now ${nextVal ? 'ENABLED' : 'DISABLED'}.`, 'success');
    } catch (err) {
      console.error(err);
      setFlags(flags.map(f => f.id === flag.id ? { ...f, is_enabled: nextVal } : f));
      showFeedback(`Feature flag "${flag.name}" toggled (Mock).`, 'success');
    }
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const getIcon = (name) => {
    switch (name) {
      case 'payments_enabled':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'ai_cv_scoring_enabled':
        return <Brain className="w-5 h-5 text-amber-600" />;
      case 'ai_cover_letter_enabled':
        return <FileCode className="w-5 h-5 text-emerald-600" />;
      case 'graduate_tier_verification_enabled':
        return <GraduationCap className="w-5 h-5 text-primary" />;
      default:
        return <Zap className="w-5 h-5 text-slate-500" />;
    }
  };

  const getPaymentStateText = (isEnabled) => {
    return isEnabled 
      ? 'Stripe Credit Card Portal (Mock Pay)'
      : 'Simulated Platform Wallet / Cash Approvals';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">System Feature Flags</h2>
          <p className="text-slate-500 text-sm">Toggle platform modules dynamically, modify integration modes, and change payment structures.</p>
        </div>
        <button
          onClick={loadFlags}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          title="Sync Flags"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-5 flex gap-4">
        <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <h4 className="font-bold text-rose-900 text-sm">Production Warning</h4>
          <p className="text-rose-700 text-xs leading-relaxed">
            Modifying these configurations alters platform behavior globally and in real-time. Make sure you align with other administrators and system builders before shutting down payment networks or matching services.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <CheckCircle size={18} />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Feature Flags Cards list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-8 text-center text-slate-500">Checking parameters status...</div>
        ) : (
          flags.map((flag) => (
            <div 
              key={flag.id} 
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 ${
                flag.is_enabled 
                  ? 'border-primary/20 bg-gradient-to-tr from-white to-primary/5' 
                  : 'border-slate-150'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    flag.is_enabled ? 'bg-primary/10' : 'bg-slate-100'
                  }`}>
                    {getIcon(flag.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 font-display text-sm tracking-tight">{flag.name}</h3>
                    <span className={`text-[10px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                      flag.is_enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {flag.is_enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => handleToggle(flag)}
                  className={`text-slate-400 hover:text-slate-800 transition-colors ${
                    flag.is_enabled ? 'text-primary' : 'text-slate-300'
                  }`}
                  title={flag.is_enabled ? 'Disable Flag' : 'Enable Flag'}
                >
                  {flag.is_enabled ? (
                    <ToggleRight size={44} className="text-primary hover:opacity-90" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-400 hover:opacity-90" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-4 leading-relaxed">{flag.description}</p>
              
              {/* Highlight payment details */}
              {flag.name === 'payments_enabled' && (
                <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
                  flag.is_enabled ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  <Info size={14} className="shrink-0" />
                  <span>
                    Current Gateway: <strong className="font-bold">{getPaymentStateText(flag.is_enabled)}</strong>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFeatureFlags;
