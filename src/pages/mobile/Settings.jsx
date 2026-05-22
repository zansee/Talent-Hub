import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import useTheme from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Monitor, 
  Eye, 
  Download, 
  Trash2, 
  Check, 
  Palette,
  ShieldAlert,
  Settings as SettingsIcon
} from 'lucide-react';

export const Settings = () => {
  const { user, profile, logout, refreshProfile, updateProfile } = useAuth();
  const { themeMode, themeColor, changeThemeMode, changeThemeColor } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Visibility States
  const [visibility, setVisibility] = useState(profile?.profile_visibility || 'active');
  const [showCityOnly, setShowCityOnly] = useState(profile?.show_city_only ?? true);

  const colors = [
    { name: 'Olive (Default)', hex: '#6B7C3A' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Rose Gold', hex: '#B76E79' },
    { name: 'Deep Navy', hex: '#1B4D3E' },
    { name: 'Warm Amber', hex: '#D27D2D' },
    { name: 'Emerald', hex: '#046307' },
    { name: 'Slate Blue', hex: '#4682B4' },
    { name: 'Plum Purple', hex: '#5E2129' },
  ];

  const handleSaveVisibility = async (newVal) => {
    setVisibility(newVal);
    try {
      await updateProfile({ profile_visibility: newVal });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCityOnly = async () => {
    const nextVal = !showCityOnly;
    setShowCityOnly(nextVal);
    try {
      await updateProfile({ show_city_only: nextVal });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPOPIA = () => {
    setLoading(true);
    // Simulate generating ZIP/JSON data download
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `talenthub_popia_data_${profile?.full_name?.replace(/\s+/g, '_') || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setLoading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1500);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "WARNING: Deleting your account will schedule it for permanent erasure under POPIA guidelines in 14 days. Are you sure you want to deactivate and delete?"
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const now = new Date();
      const deletionDate = new Date();
      deletionDate.setDate(now.getDate() + 14);

      const { error } = await supabase
        .from('profiles')
        .update({
          deactivated_at: now.toISOString(),
          scheduled_deletion_at: deletionDate.toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      alert("Your account is deactivated. Permanent deletion scheduled in 14 days. Logging out.");
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#12160d] text-white flex flex-col font-sans p-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-3 mb-4">
        <button
          onClick={() => navigate('/mobile/profile')}
          className="p-1 hover:bg-zinc-800/40 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-display font-bold">Preferences</h1>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
        
        {/* Accent Colors Theme Picker */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Palette size={14} /> Brand Accent Color
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  changeThemeColor(c.hex);
                  updateProfile({ theme_color: c.hex });
                }}
                style={{ backgroundColor: c.hex }}
                className={`h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  themeColor === c.hex ? 'border-white ring-2 ring-primary/45' : 'border-zinc-950/40'
                }`}
                title={c.name}
              >
                {themeColor === c.hex && <Check size={16} className="text-white drop-shadow-md" />}
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode toggle */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Moon size={14} /> Display Mode
          </h3>
          <div className="flex bg-zinc-950/60 rounded-xl p-1 border border-zinc-900/50">
            <button
              onClick={() => {
                changeThemeMode('light');
                updateProfile({ dark_mode: 'light' });
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                themeMode === 'light' ? 'bg-[#6B7C3A] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              onClick={() => {
                changeThemeMode('dark');
                updateProfile({ dark_mode: 'dark' });
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                themeMode === 'dark' ? 'bg-[#6B7C3A] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Moon size={14} /> Dark
            </button>
            <button
              onClick={() => {
                changeThemeMode('system');
                updateProfile({ dark_mode: 'system' });
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                themeMode === 'system' ? 'bg-[#6B7C3A] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Monitor size={14} /> System
            </button>
          </div>
        </div>

        {/* Profile Visibility */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Eye size={14} /> Profile Visibility
          </h3>
          
          <div className="flex flex-col bg-[#1a1f14] border border-zinc-800/60 rounded-2xl p-4 gap-3">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-white">Active Status</span>
                <span className="text-[10px] text-zinc-400 leading-normal">
                  Control who can see your qualifications & CV
                </span>
              </div>
              <select
                value={visibility}
                onChange={(e) => handleSaveVisibility(e.target.value)}
                className="px-3 py-1.5 text-xs font-sans rounded-xl border bg-zinc-950 text-white border-zinc-800 focus:outline-none focus:border-primary"
              >
                <option value="active">Active & Swiping</option>
                <option value="open">Open to Headhunting</option>
                <option value="hidden">Hidden from search</option>
              </select>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-900/40 pt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-white">City Only Mode</span>
                <span className="text-[10px] text-zinc-400 leading-normal">
                  Hide full street address from matching employers
                </span>
              </div>
              <button
                onClick={handleToggleCityOnly}
                className={`w-10 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                  showCityOnly ? 'bg-primary' : 'bg-zinc-800'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                    showCityOnly ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* POPIA Privacy Controls */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ShieldAlert size={14} /> POPIA Data Protection
          </h3>

          <div className="bg-[#1a1f14] border border-zinc-800/60 rounded-2xl p-4 flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-white">Download Personal Data</span>
              <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                Under the Botswana Data Protection Act, you can download a full archive of all information stored on your profile.
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              loading={loading}
              onClick={handleDownloadPOPIA}
              className="w-full flex items-center justify-center gap-1.5"
            >
              {downloadSuccess ? <Check size={14} className="text-green-500" /> : <Download size={14} />}
              <span>{downloadSuccess ? 'JSON Archive Downloaded' : 'Export Profile Data'}</span>
            </Button>
          </div>
        </div>

        {/* Deactivation & deletion */}
        <div className="flex flex-col gap-2.5 mt-2">
          <button
            onClick={handleDeleteAccount}
            className="w-full py-3 rounded-2xl border border-red-900/30 bg-red-950/10 text-red-500 hover:bg-red-950/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} /> Delete Profile Account
          </button>
        </div>

      </div>

    </div>
  );
};

export default Settings;
