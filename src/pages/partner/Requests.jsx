import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Video, 
  Search, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router';

export const PartnerRequests = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('cv_revamp'); // 'cv_revamp' | 'interview_prep'
  const [revamps, setRevamps] = useState([]);
  const [preps, setPreps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRequests = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // 1. Fetch CV Revamps
      const { data: revampData } = await supabase
        .from('cv_revamp_requests')
        .select('*, profiles(full_name, location)')
        .eq('partner_id', profile.id)
        .order('created_at', { ascending: false });

      // 2. Fetch Interview Preps
      const { data: prepData } = await supabase
        .from('interview_prep_requests')
        .select('*, profiles(full_name, location)')
        .eq('partner_id', profile.id)
        .order('created_at', { ascending: false });

      setRevamps(revampData || []);
      setPreps(prepData || []);
    } catch (err) {
      console.error('Failed to fetch requests, loading mocks:', err);
      // Mocks
      setRevamps([
        { id: 'v1', experience_level: '0-2 Years', status: 'in_progress', price: 150.00, created_at: '2026-05-20T10:00:00Z', profiles: { full_name: 'Thato Mokgosi', location: 'Gaborone' } },
        { id: 'v2', experience_level: '3-5 Years', status: 'assigned', price: 250.00, created_at: '2026-05-22T08:00:00Z', profiles: { full_name: 'Kago Seretse', location: 'Francistown' } },
        { id: 'v3', experience_level: '10+ Years', status: 'completed', price: 400.00, created_at: '2026-05-15T09:15:00Z', profiles: { full_name: 'Lerato Kgotla', location: 'Jwaneng' } }
      ]);
      setPreps([
        { id: 'p1', service_type: 'virtual_plus_script', status: 'in_progress', price: 300.00, created_at: '2026-05-21T07:00:00Z', preferred_interview_date: '2026-05-25T14:00:00Z', profiles: { full_name: 'Neo Khama', location: 'Maun' } },
        { id: 'p2', service_type: 'script_only', status: 'completed', price: 150.00, created_at: '2026-05-18T12:30:00Z', preferred_interview_date: null, profiles: { full_name: 'Bakang Masa', location: 'Orapa' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [profile]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">Completed</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">In Progress</span>;
      case 'assigned':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">Assigned</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  // Filter logic
  const filteredRevamps = revamps.filter(r => {
    const matchesSearch = (r.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || r.experience_level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPreps = preps.filter(p => {
    const label = p.service_type === 'script_only' ? 'script pack' : '1-on-1 prep';
    const matchesSearch = (p.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || label.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Service Assignments</h2>
        <p className="text-slate-500 text-sm">Monitor all career coaching requests, revamp CV timelines, or upload mock interview scripts.</p>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('cv_revamp'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'cv_revamp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            CV Revamps ({revamps.length})
          </button>
          <button
            onClick={() => { setActiveTab('interview_prep'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'interview_prep' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Interview Prep ({preps.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 bg-slate-50/50 focus:outline-none"
          >
            <option value="all">All States</option>
            <option value="assigned">Awaiting Response</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests table listing */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading assignments...</div>
        ) : activeTab === 'cv_revamp' ? (
          filteredRevamps.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No CV revamp requests match your search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-4 pl-6">Client Name</th>
                    <th className="p-4">Experience Tier</th>
                    <th className="p-4">Assigned Date</th>
                    <th className="p-4">Your Fee (80%)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center pr-6">Open Task</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRevamps.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-800">
                        {item.profiles?.full_name}
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {item.profiles?.location || 'Botswana'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{item.experience_level}</td>
                      <td className="p-4 text-slate-500 text-xs">{new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="p-4 font-bold text-slate-800">P{(parseFloat(item.price) * 0.8).toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-center pr-6">
                        <Link 
                          to={`/partner/request/${item.id}?type=cv_revamp`}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold text-xs border border-primary/20 px-3 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          View Details <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredPreps.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No mock interview requests match your search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-4 pl-6">Client Name</th>
                    <th className="p-4">Service Type</th>
                    <th className="p-4">Preferred Date</th>
                    <th className="p-4">Your Fee (80%)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center pr-6">Open Task</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreps.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-800">
                        {item.profiles?.full_name}
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {item.profiles?.location || 'Botswana'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium capitalize">
                        {item.service_type === 'script_only' ? 'Script Pack' : '1-on-1 Prep + Script'}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {item.preferred_interview_date ? (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(item.preferred_interview_date).toLocaleDateString('en-GB')}
                          </span>
                        ) : (
                          'Anytime / Script only'
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800">P{(parseFloat(item.price) * 0.8).toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-center pr-6">
                        <Link 
                          to={`/partner/request/${item.id}?type=interview_prep`}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold text-xs border border-primary/20 px-3 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          View Details <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PartnerRequests;
