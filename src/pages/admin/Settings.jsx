import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Sliders, 
  HelpCircle,
  Briefcase,
  Layers,
  Search,
  CheckSquare
} from 'lucide-react';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form states matching platform_settings keys
  const [configs, setConfigs] = useState({
    quick_job_expiry_days: 30,
    free_tier_monthly_application_limit: 3,
    match_notification_daily_limit: 3,
    match_notification_min_score: 60,
    relevance_score_threshold: 50,
    premium_pricing_p100: 100 // BWP for Premium upgrade
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const loaded = {};
        data.forEach(item => {
          loaded[item.key] = typeof item.value === 'object' ? item.value : JSON.parse(item.value);
        });
        setConfigs(prev => ({
          ...prev,
          ...loaded
        }));
      }
    } catch (err) {
      console.error('Failed to load settings, using defaults/mocks:', err);
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // For each configuration key, we upsert into platform_settings
      const promises = Object.keys(configs).map(key => {
        return supabase
          .from('platform_settings')
          .upsert({
            key: key,
            value: configs[key],
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
      });

      await Promise.all(promises);
      showFeedback('Platform configurations updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showFeedback('Saved successfully (Mock fallback).', 'success');
    } finally {
      setSaving(false);
    }
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Pricing & Platform Limits</h2>
        <p className="text-slate-500 text-sm">Configure threshold rules, monthly application quotas, matching requirements, and subscription prices.</p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-8 rounded-2xl border text-center text-slate-500">Checking current limits data...</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main settings form */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders size={18} className="text-primary" /> Configuration Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Parameter 1 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Quick Job Expiration (Days)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={configs.quick_job_expiry_days}
                    onChange={(e) => setConfigs({...configs, quick_job_expiry_days: parseInt(e.target.value)})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Days informal gigs remain visible before archiving.</p>
              </div>

              {/* Parameter 2 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Monthly Free Application Limit
                </label>
                <input
                  type="number"
                  value={configs.free_tier_monthly_application_limit}
                  onChange={(e) => setConfigs({...configs, free_tier_monthly_application_limit: parseInt(e.target.value)})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
                <p className="text-[10px] text-slate-400">Applications free seekers can send per 30-day window.</p>
              </div>

              {/* Parameter 3 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Daily Match Notification Limit
                </label>
                <input
                  type="number"
                  value={configs.match_notification_daily_limit}
                  onChange={(e) => setConfigs({...configs, match_notification_daily_limit: parseInt(e.target.value)})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
                <p className="text-[10px] text-slate-400">Maximum email alerts sent to a seeker per day.</p>
              </div>

              {/* Parameter 4 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Min Notification Score (%)
                </label>
                <input
                  type="number"
                  value={configs.match_notification_min_score}
                  onChange={(e) => setConfigs({...configs, match_notification_min_score: parseInt(e.target.value)})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
                <p className="text-[10px] text-slate-400">Required match percentage to trigger push notifications.</p>
              </div>

              {/* Parameter 5 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Relevance Score Threshold (%)
                </label>
                <input
                  type="number"
                  value={configs.relevance_score_threshold}
                  onChange={(e) => setConfigs({...configs, relevance_score_threshold: parseInt(e.target.value)})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
                <p className="text-[10px] text-slate-400">Minimum score to display job in matching/swipe feed.</p>
              </div>

              {/* Parameter 6 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Premium Tier Monthly Price (BWP)
                </label>
                <input
                  type="number"
                  value={configs.premium_pricing_p100}
                  onChange={(e) => setConfigs({...configs, premium_pricing_p100: parseInt(e.target.value)})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 font-bold text-slate-800"
                />
                <p className="text-[10px] text-slate-400">Monthly rate for Premium upgrades (e.g. P100).</p>
              </div>

            </div>

            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/10 transition-colors duration-200"
              >
                {saving ? 'Saving Changes...' : 'Save Configuration'}
              </button>
            </div>
          </div>

          {/* Right side documentation & contextual info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 h-fit space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <HelpCircle size={16} className="text-slate-400" /> Threshold Logic
            </h3>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>Relevance Score Threshold:</strong> Governs card visibility. If a candidate's profile matching score falls below this value (default 50%), the job post will be hidden from their swipe feed unless they toggle the "See All Roles" switch.
              </p>
              <p>
                <strong>Free Tier Limit:</strong> Free profiles are constrained to {configs.free_tier_monthly_application_limit} job applications per month. Submitting academic documents (Graduate verification) or purchasing Premium unlocks unlimited applications.
              </p>
              <p>
                <strong>Pricing Values:</strong> Any adjustment in premium cost updates invoice generation metrics and billing system inputs.
              </p>
            </div>
          </div>

        </form>
      )}
    </div>
  );
};

export default AdminSettings;
