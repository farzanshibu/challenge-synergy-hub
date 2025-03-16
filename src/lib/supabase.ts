
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Authentication might not work correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type Challenge = {
  id: number;
  title: string;
  maxValue: number;
  currentValue: number;
  endDate: Date | null;
  is_active: boolean;
  created_at: string;
  user_id: string;
};

// This is a placeholder interface for the Database type
// Replace this with your actual Supabase types once you've set up your database
export interface Database {
  public: {
    Tables: {
      challenges: {
        Row: Challenge;
        Insert: Omit<Challenge, 'id' | 'created_at'>;
        Update: Partial<Omit<Challenge, 'id' | 'created_at'>>;
      };
    };
  };
}
