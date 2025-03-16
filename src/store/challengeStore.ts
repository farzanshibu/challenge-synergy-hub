
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { FormValues } from '@/schema/formSchema';
import { toast } from '@/components/ui/use-toast';

// Interface for the Challenge as used in our application
export interface Challenge {
  id: number;
  title: string;
  maxValue: number;
  currentValue: number;
  endDate: Date | null;
  is_active: boolean;
  created_at: string;
  user_id: string;
}

// Interface matching the Supabase database structure
interface SupabaseChallenge {
  id: number;
  title: string;
  maxvalue: number;
  currentvalue: number;
  enddate: string | null;
  is_active: boolean;
  created_at: string;
  user_id: string;
}

// Conversion functions between our app model and Supabase model
const toAppChallenge = (dbChallenge: SupabaseChallenge): Challenge => ({
  id: dbChallenge.id,
  title: dbChallenge.title,
  maxValue: dbChallenge.maxvalue,
  currentValue: dbChallenge.currentvalue,
  endDate: dbChallenge.enddate ? new Date(dbChallenge.enddate) : null,
  is_active: dbChallenge.is_active,
  created_at: dbChallenge.created_at,
  user_id: dbChallenge.user_id
});

const toDbChallenge = (challenge: FormValues, userId: string): Omit<SupabaseChallenge, 'id' | 'created_at'> => ({
  title: challenge.title,
  maxvalue: challenge.maxValue,
  currentvalue: challenge.currentValue,
  enddate: challenge.endDate ? challenge.endDate.toISOString() : null,
  is_active: challenge.is_active,
  user_id: userId
});

interface ChallengeState {
  loading: boolean;
  challenges: Challenge[];
  activeChallenge: Challenge | null;
  
  // Actions
  fetchChallenges: () => Promise<void>;
  setActiveChallenge: (challenge: Challenge | null) => void;
  addChallenge: (challenge: FormValues) => Promise<number | null>;
  updateChallenge: (id: number, data: Partial<Challenge>) => Promise<void>;
  deleteChallenge: (id: number) => Promise<void>;
  incrementChallenge: (id: number) => Promise<void>;
  decrementChallenge: (id: number) => Promise<void>;
  resetChallenge: (id: number) => Promise<void>;
  
  // Subscription
  subscribeToChanges: () => () => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  loading: false,
  challenges: [],
  activeChallenge: null,
  
  fetchChallenges: async () => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert from DB model to App model
      const appChallenges = (data as SupabaseChallenge[]).map(toAppChallenge);
      
      set({ 
        challenges: appChallenges,
        loading: false 
      });
      
      // Set the first active challenge if none is selected
      const state = get();
      if (!state.activeChallenge && appChallenges && appChallenges.length > 0) {
        const activeOnes = appChallenges.filter(c => c.is_active);
        if (activeOnes.length > 0) {
          set({ activeChallenge: activeOnes[0] });
        } else if (appChallenges.length > 0) {
          set({ activeChallenge: appChallenges[0] });
        }
      }
    } catch (error: any) {
      console.error('Error fetching challenges:', error.message);
      set({ loading: false });
    }
  },
  
  setActiveChallenge: (challenge) => {
    set({ activeChallenge: challenge });
  },
  
  addChallenge: async (challenge) => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }
      
      // Convert to DB model before inserting
      const dbChallenge = toDbChallenge(challenge, session.session.user.id);
      
      const { data, error } = await supabase
        .from('challenges')
        .insert([dbChallenge])
        .select();
        
      if (error) throw error;
      
      // Convert back to app model
      const newChallenge = toAppChallenge(data[0] as SupabaseChallenge);
      
      set(state => ({ 
        challenges: [newChallenge, ...state.challenges],
        loading: false 
      }));
      
      toast({
        title: "Challenge added",
        description: "Your challenge has been created successfully"
      });
      
      // Set as active challenge if it's the first one
      const state = get();
      if (!state.activeChallenge) {
        set({ activeChallenge: newChallenge });
      }

      // Return the new challenge ID
      return newChallenge.id;
    } catch (error: any) {
      console.error('Error adding challenge:', error.message);
      toast({
        title: "Error adding challenge",
        description: error.message,
        variant: "destructive"
      });
      set({ loading: false });
      return null
    }
  },
  
  updateChallenge: async (id, data) => {
    set({ loading: true });
    try {
      // Convert app model fields to DB model fields
      const dbData: Partial<SupabaseChallenge> = {};
      
      if (data.title !== undefined) dbData.title = data.title;
      if (data.maxValue !== undefined) dbData.maxvalue = data.maxValue;
      if (data.currentValue !== undefined) dbData.currentvalue = data.currentValue;
      if (data.endDate !== undefined) dbData.enddate = data.endDate ? data.endDate.toISOString() : null;
      if (data.is_active !== undefined) dbData.is_active = data.is_active;
      
      const { error } = await supabase
        .from('challenges')
        .update(dbData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state - map the changes back to our app model
      set(state => ({
        challenges: state.challenges.map(c => 
          c.id === id ? { ...c, ...data } : c
        ),
        activeChallenge: state.activeChallenge?.id === id 
          ? { ...state.activeChallenge, ...data }
          : state.activeChallenge,
        loading: false
      }));
      
      toast({
        title: "Challenge updated",
        description: "Your challenge has been updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating challenge:', error.message);
      toast({
        title: "Error updating challenge",
        description: error.message,
        variant: "destructive"
      });
      set({ loading: false });
    }
  },
  
  deleteChallenge: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      set(state => {
        const updatedChallenges = state.challenges.filter(c => c.id !== id);
        let updatedActiveChallenge = state.activeChallenge;
        
        // If we deleted the active challenge, set a new one
        if (state.activeChallenge?.id === id) {
          updatedActiveChallenge = updatedChallenges.length > 0 ? updatedChallenges[0] : null;
        }
        
        return {
          challenges: updatedChallenges,
          activeChallenge: updatedActiveChallenge,
          loading: false
        };
      });
      
      toast({
        title: "Challenge deleted",
        description: "Your challenge has been deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting challenge:', error.message);
      toast({
        title: "Error deleting challenge",
        description: error.message,
        variant: "destructive"
      });
      set({ loading: false });
    }
  },
  
  incrementChallenge: async (id) => {
    const challenge = get().challenges.find(c => c.id === id);
    if (!challenge) return;
    
    if (challenge.currentValue >= challenge.maxValue) {
      toast({
        title: "Maximum value reached",
        description: "Challenge is already at maximum value"
      });
      return;
    }
    
    await get().updateChallenge(id, { 
      currentValue: challenge.currentValue + 1 
    });
  },
  
  decrementChallenge: async (id) => {
    const challenge = get().challenges.find(c => c.id === id);
    if (!challenge) return;
    
    if (challenge.currentValue <= 0) {
      toast({
        title: "Minimum value reached",
        description: "Challenge is already at minimum value"
      });
      return;
    }
    
    await get().updateChallenge(id, { 
      currentValue: challenge.currentValue - 1 
    });
  },
  
  resetChallenge: async (id) => {
    await get().updateChallenge(id, { currentValue: 0 });
  },
  
  subscribeToChanges: () => {
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('public:challenges')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'challenges' 
      }, async (payload) => {
        // Refresh challenges on change
        await get().fetchChallenges();
      })
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
}));
