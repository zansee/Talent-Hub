import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Building2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import { supabase } from '../../lib/supabase';

export const RequestAccess = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'Banking, Finance & Insurance',
    location: 'Gaborone',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.companyName.trim()) errs.companyName = 'Company name is required.';
    if (!formData.contactPerson.trim()) errs.contactPerson = 'Contact person name is required.';
    if (!formData.contactEmail.trim()) {
      errs.contactEmail = 'Contact email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errs.contactEmail = 'Enter a valid email address.';
    }
    if (!formData.contactPhone.trim()) errs.contactPhone = 'Contact phone number is required.';
    if (!formData.reason.trim()) errs.reason = 'Please explain why you want to join.';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('company_access_requests')
        .insert({
          company_name: formData.companyName,
          industry: formData.industry,
          location: formData.location,
          website: formData.website,
          contact_person: formData.contactPerson,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          reason: formData.reason,
          status: 'pending'
        });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Company request error:', err);
      setErrors({ form: err.message || 'Failed to submit request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex justify-center items-center p-4 md:p-8 transition-colors duration-200 font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 flex flex-col gap-6 animate-slide-up">
        
        {/* Back Link */}
        <Link
          to="/login"
          className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Login
        </Link>

        {/* Title */}
        <div className="flex flex-col gap-2 border-b border-slate-100 dark:border-zinc-800/40 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Building2 size={22} />
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Employer Access Request</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
            Submit your organization's details to register as an employer on TalentHub Botswana. The platform administrator will review your application within 24 hours.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center text-center p-6 gap-4 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center shadow-inner">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Request Submitted Successfully!</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md font-sans">
              Thank you for requesting access. Our administrators will review the information for **{formData.companyName}** and notify you via **{formData.contactEmail}** once approved.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="mt-2"
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {errors.form && (
              <div className="col-span-full p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.form}
              </div>
            )}

            <div className="col-span-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary font-sans mb-2">Company Information</h3>
            </div>

            <Input
              label="Company Name"
              name="companyName"
              placeholder="e.g. Botswana Power Corporation"
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
              required
              disabled={loading}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-zinc-400 font-sans uppercase">
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 text-sm font-sans rounded-xl border bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option>Banking, Finance & Insurance</option>
                <option>Mining & Diamonds</option>
                <option>Tourism & Hospitality</option>
                <option>Agriculture & Beef</option>
                <option>Telecommunications & ICT</option>
                <option>Government & Public Sector</option>
                <option>Manufacturing</option>
                <option>Education & Training</option>
                <option>Health & Medical Services</option>
                <option>Construction & Infrastructure</option>
                <option>Retail & Wholesale</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold tracking-wider text-slate-600 dark:text-zinc-400 font-sans uppercase">
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 text-sm font-sans rounded-xl border bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option>Gaborone</option>
                <option>Francistown</option>
                <option>Maun</option>
                <option>Mogoditshane</option>
                <option>Molepolole</option>
                <option>Serowe</option>
                <option>Palapye</option>
                <option>Selebi-Phikwe</option>
                <option>Jwaneng</option>
                <option>Kasane</option>
                <option>Lobatse</option>
                <option>Kanye</option>
                <option>Mochudi</option>
                <option>Orapa</option>
              </select>
            </div>

            <Input
              label="Company Website"
              name="website"
              placeholder="e.g. www.bpc.co.bw"
              value={formData.website}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="col-span-full mt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary font-sans mb-2">Contact Person Details</h3>
            </div>

            <Input
              label="Contact Person Name"
              name="contactPerson"
              placeholder="e.g. Thabo Molefe"
              value={formData.contactPerson}
              onChange={handleChange}
              error={errors.contactPerson}
              required
              disabled={loading}
            />

            <Input
              label="Contact Email"
              name="contactEmail"
              placeholder="e.g. tmolefe@bpc.co.bw"
              value={formData.contactEmail}
              onChange={handleChange}
              error={errors.contactEmail}
              required
              disabled={loading}
            />

            <Input
              label="Contact Phone"
              name="contactPhone"
              placeholder="e.g. +267 360 1800"
              value={formData.contactPhone}
              onChange={handleChange}
              error={errors.contactPhone}
              required
              disabled={loading}
            />

            <div className="col-span-full">
              <Input
                label="Reason for Joining & Hiring Plans"
                name="reason"
                type="textarea"
                placeholder="Describe your organization and types of roles you wish to advertise on TalentHub Botswana..."
                value={formData.reason}
                onChange={handleChange}
                error={errors.reason}
                required
                disabled={loading}
              />
            </div>

            <div className="col-span-full flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-zinc-800/40 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Submit Request <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestAccess;
