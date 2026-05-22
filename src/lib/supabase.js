import { createClient } from '@supabase/supabase-js';

// Read values from environment variables or use the provided defaults for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ktrpgthjkhmaaqxhvzsh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_npxVBqeHgICcxtwOi_tAiw_2pAUhs6j';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
