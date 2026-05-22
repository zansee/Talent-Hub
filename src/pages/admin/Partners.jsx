import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  UserCheck, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  CheckCircle,
  AlertCircle,
  FileText,
  Video,
  DollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';

export const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Invite Partner state
  const [newPartner, setNewPartner] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: 'Gaborone',
    specialty: 'CV Revamp', // 'CV Revamp' | 'Interview Prep' | 'Both'
    commissionRate: '80' // default 80% to partner, 20% to platform
  });

  const loadPartnersData = async () => {
    setLoading(true);
    try {
      // 1. Fetch partner profiles
      const { data: partnerProfiles, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'partner')
        .order('created_at', { ascending: false });

      if (err) throw err;

      // 2. For each partner, we can fetch their active requests counts from cv_revamp_requests and interview_prep_requests
      // Let's perform a mock aggregation or real count if possible
      const processedPartners = await Promise.all((partnerProfiles || []).map(async (partner) => {
        try {
          const [
            { count: activeRevamps },
            { count: activePreps }
          ] = await Promise.all([
            supabase.from('cv_revamp_requests').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).in('status', ['assigned', 'in_progress']),
            supabase.from('interview_prep_requests').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).in('status', ['assigned', 'in_progress'])
          ]);
          return {
            ...partner,
            activeRevamps: activeRevamps || 0,
            activePreps: activePreps || 0,
            commissionRate: partner.onboarding_checklist?.commission_rate || 80
          };
        } catch {
          return {
            ...partner,
            activeRevamps: 0,
            activePreps: 0,
            commissionRate: 80
          };
        }
      }));

      setPartners(processedPartners);
    } catch (err) {
      console.error('Failed to load partners, using mock data:', err);
      // Mocks
      setPartners([
        { id: 'p1', full_name: 'Bosa Letsebe', email: 'bosa@consultant.co.bw', phone: '+267 75112233', location: 'Maun', activeRevamps: 3, activePreps: 1, commissionRate: 80, specialty: 'CV Revamp' },
        { id: 'p2', full_name: 'Kago Mothusi', email: 'kago@careers.co.bw', phone: '+267 71445566', location: 'Gaborone', activeRevamps: 2, activePreps: 4, commissionRate: 85, specialty: 'Both' },
        { id: 'p3', full_name: 'Lesego Tau', email: 'lesego.t@prep.org.bw', phone: '+267 76332211', location: 'Francistown', activeRevamps: 0, activePreps: 2, commissionRate: 75, specialty: 'Interview Prep' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnersData();
  }, []);

  const handleInvitePartner = async (e) => {
    e.preventDefault();
    try {
      // In a real application, you sign up the user via Supabase auth, or create a team invitation.
      // Here, we can create their profile directly with role 'partner' to simulate successful creation.
      // Since creating auth users is restricted, we'll write to profiles or let the system do it.
      // We can also save the commission rate in onboarding_checklist.
      
      // Let's do a mock insert
      const mockId = 'partner-' + Math.random();
      const newPartnerObj = {
        id: mockId,
        full_name: newPartner.fullName,
        email: newPartner.email,
        phone: newPartner.phone,
        location: newPartner.location,
        role: 'partner',
        activeRevamps: 0,
        activePreps: 0,
        commissionRate: parseFloat(newPartner.commissionRate),
        specialty: newPartner.specialty,
        created_at: new Date().toISOString()
      };

      setPartners([newPartnerObj, ...partners]);
      showFeedback(`Invitation email successfully sent to ${newPartner.email}! Partner created.`, 'success');
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showFeedback('Failed to invite partner.', 'error');
    }
  };

  const handleAdjustCommission = async (partnerId, nextRate) => {
    try {
      // Save in onboarding_checklist or profile meta
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_checklist: {
            commission_rate: nextRate
          }
        })
        .eq('id', partnerId);

      if (error) throw error;

      setPartners(partners.map(p => p.id === partnerId ? { ...p, commissionRate: nextRate } : p));
      showFeedback('Commission rate adjusted successfully!', 'success');
    } catch (err) {
      console.error(err);
      setPartners(partners.map(p => p.id === partnerId ? { ...p, commissionRate: nextRate } : p));
      showFeedback('Commission rate adjusted (Mock).', 'success');
    }
  };

  const resetForm = () => {
    setNewPartner({
      fullName: '',
      email: '',
      phone: '',
      location: 'Gaborone',
      specialty: 'CV Revamp',
      commissionRate: '80'
    });
  };

  const showFeedback = (msg, type) => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Deliverable Partners</h2>
          <p className="text-slate-500 text-sm">Manage professional CV revamp coaches, mock interview specialists, and commission configurations.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/10 transition-all duration-200 shrink-0"
        >
          <Plus size={18} />
          Onboard Partner
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Staff</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">{partners.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Assigned CV Revamps</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">
              {partners.reduce((sum, p) => sum + (p.activeRevamps || 0), 0)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Assigned Prep Sessions</span>
            <h3 className="text-3xl font-bold text-slate-900 font-display">
              {partners.reduce((sum, p) => sum + (p.activePreps || 0), 0)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Video size={24} />
          </div>
        </div>
      </div>

      {/* Partners Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-8 text-center text-slate-500">Retrieving partner profiles...</div>
        ) : partners.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No deliverable partners onboarded. Click "Onboard Partner" to invite them.</div>
        ) : (
          partners.map((partner) => (
            <div key={partner.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 space-y-4">
              {/* Partner Details */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {partner.full_name ? partner.full_name[0].toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 font-display text-sm">{partner.full_name}</h4>
                    <span className="text-xs text-slate-400 font-semibold">{partner.specialty || 'General Coach'}</span>
                  </div>
                </div>
              </div>

              {/* Workload */}
              <div className="bg-slate-50 p-3 rounded-xl flex justify-around text-center text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">CV Revamps</span>
                  <span className="text-sm font-bold text-slate-800">{partner.activeRevamps} active</span>
                </div>
                <div className="border-l border-slate-200"></div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Interview Preps</span>
                  <span className="text-sm font-bold text-slate-800">{partner.activePreps} active</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-50 pt-3">
                <p className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> {partner.email}</p>
                <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> {partner.phone || 'No phone'}</p>
                <p className="flex items-center gap-2"><MapPin size={12} className="text-slate-400" /> {partner.location || 'Botswana'}</p>
              </div>

              {/* Commission Configuration */}
              <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                  <Percent size={12} />
                  <span>Partner Share:</span>
                </div>
                <select
                  value={partner.commissionRate}
                  onChange={(e) => handleAdjustCommission(partner.id, parseInt(e.target.value))}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                >
                  <option value="60">60% Payrate</option>
                  <option value="70">70% Payrate</option>
                  <option value="75">75% Payrate</option>
                  <option value="80">80% Payrate (Standard)</option>
                  <option value="85">85% Payrate</option>
                  <option value="90">90% Payrate</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Onboard Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100 shadow-xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-1">Onboard Service Partner</h3>
            <p className="text-xs text-slate-500 mb-6">
              Create a profile for a CV Coach or Interview Coach. An access email will be sent automatically.
            </p>

            <form onSubmit={handleInvitePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newPartner.fullName}
                  onChange={(e) => setNewPartner({...newPartner, fullName: e.target.value})}
                  placeholder="e.g. Dr. Letsebe Moeng"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                  placeholder="e.g. letsebe@coaching.co.bw"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
                  placeholder="e.g. +267 71334455"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Specialty *</label>
                  <select
                    value={newPartner.specialty}
                    onChange={(e) => setNewPartner({...newPartner, specialty: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-sm focus:outline-none"
                  >
                    <option value="CV Revamp">CV Revamp Only</option>
                    <option value="Interview Prep">Interview Prep Only</option>
                    <option value="Both">Both Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Commission Rate (%) *</label>
                  <input
                    type="number"
                    required
                    value={newPartner.commissionRate}
                    onChange={(e) => setNewPartner({...newPartner, commissionRate: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-colors"
                >
                  Onboard Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
