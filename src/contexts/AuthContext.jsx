import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch profile data
  const fetchProfile = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', uid)
        .single();

      if (error) {
        // If profile doesn't exist, we might need to create it (fallback)
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error initializing session:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // 2. Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Register function (inserts manual profile record to ensure database integrity)
  const register = async (email, password, fullName, role) => {
    setLoading(true);
    try {
      // 1. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });
      if (error) throw error;

      if (data?.user) {
        // Generate a random referral code for the user
        const referralCode = 'TH-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // 2. Create profile manually
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
            referral_code: referralCode,
            onboarding_completed: false,
            onboarding_checklist: {
              account_created: true,
              profile_setup: false,
              cv_uploaded: false,
              referral_shared: false
            }
          });

        if (profileError) {
          console.error('Error creating profile record:', profileError);
          throw profileError;
        }

        // Fetch the profile we just created
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
      }
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile in database and state
  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(prev => ({ ...prev, ...data }));
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Computed role helpers
  const isAdmin = profile?.role === 'admin';
  const isCompany = ['company_admin', 'hiring_manager', 'recruiter'].includes(profile?.role);
  const isPartner = profile?.role === 'partner';
  const isSeeker = profile?.role === 'job_seeker';
  const isPoster = profile?.role === 'quick_job_poster';

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isCompany,
    isPartner,
    isSeeker,
    isPoster,
    refreshProfile: () => user && fetchProfile(user.id).then(setProfile),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
