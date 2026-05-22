import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, DollarSign, CheckCircle2, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { BOTSWANA_TOWNS } from '../../lib/constants';
import { formatBWP } from '../../utils/formatters';
import Button from '../../components/shared/Button';
import Teemane from '../../components/shared/Teemane';

export const PostQuickJob = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    phone: profile?.phone || '',
    pay_amount: '',
    category_id: '',
  });

  useEffect(() => {
    supabase.from('quick_job_categories')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => setCategories(data || []));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Job title required';
    if (!form.description.trim()) e.description = 'Description required';
    if (!form.location) e.location = 'Location required';
    if (!form.phone.trim()) e.phone = 'Contact number required';
    if (!form.category_id) e.category_id = 'Category required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase.from('quick_jobs').insert({
        posted_by: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location,
        phone: form.phone.trim(),
        pay_amount: form.pay_amount ? parseFloat(form.pay_amount) : null,
        category_id: form.category_id,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      });
      setSubmitted(true);
    } catch (err) {
      setErrors({ form: 'Failed to post job. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-full flex flex-col items-center justify-center p-8 bg-[#12160d] text-center gap-6"
      >
        <Teemane pose="celebrating" size={160} animate />
        <div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Job Posted! 🎉</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your quick job is under review by our admin team. Once approved, it'll be visible on the platform for 30 days.
          </p>
        </div>
        <Button onClick={() => navigate('/mobile/quick-jobs')} variant="primary" fullWidth>
          Back to Quick Jobs
        </Button>
      </motion.div>
    );
  }

  const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-400 font-semibold">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-full flex flex-col bg-[#12160d] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-900 sticky top-0 bg-[#12160d]/95 backdrop-blur-md z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display font-bold text-sm">Post a Quick Job</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col gap-5 pb-8">
        {errors.form && (
          <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 font-semibold">
            {errors.form}
          </div>
        )}

        {/* Category */}
        <Field label="Category" error={errors.category_id}>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm(p => ({ ...p, category_id: cat.id }))}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  form.category_id === cat.id
                    ? 'bg-primary border-primary text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </Field>

        {/* Title */}
        <Field label="Job Title" error={errors.title}>
          <input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Need a housekeeper for 2 days"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors font-sans"
          />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4}
            placeholder="Describe what needs to be done, schedule, requirements..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors font-sans resize-none"
          />
        </Field>

        {/* Location */}
        <Field label="Location" error={errors.location}>
          <select
            value={form.location}
            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
          >
            <option value="">Select town...</option>
            {BOTSWANA_TOWNS.map(t => (
              <option key={t} value={t} className="bg-zinc-950">{t}</option>
            ))}
          </select>
        </Field>

        {/* Phone */}
        <Field label="Contact Number" error={errors.phone}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">+267</span>
            <input
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
              placeholder="71234567"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-3 pl-14 text-sm text-white outline-none transition-colors font-sans"
            />
          </div>
        </Field>

        {/* Pay */}
        <Field label="Pay Amount (BWP) — Optional">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">P</span>
            <input
              type="number"
              value={form.pay_amount}
              onChange={e => setForm(p => ({ ...p, pay_amount: e.target.value }))}
              placeholder="e.g. 250"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary rounded-xl px-4 py-3 pl-8 text-sm text-white outline-none transition-colors font-sans"
            />
          </div>
        </Field>

        <Button onClick={handleSubmit} variant="primary" loading={loading} fullWidth className="py-3.5 mt-2">
          Submit Quick Job
        </Button>

        <p className="text-[10px] text-zinc-600 text-center font-sans">
          Jobs are reviewed within 24 hours. Once approved they appear for 30 days.
        </p>
      </div>
    </div>
  );
};

export default PostQuickJob;
