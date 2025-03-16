
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { FormValues } from '@/schema/formSchema';
import { toast } from '@/components/ui/use-toast';

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

interface ChallengeState {
  loading: boolean;
  challenges: Challenge[];
  activeChallenge: Challenge | null;
  
  // Actions
  fetchChallenges: () => Promise<void>;
  setActiveChallenge: (challenge: Challenge | null) => void;
  addChallenge: (challenge: FormValues) => Promise<void>;
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
      
      set({ 
        challenges: data as Challenge[],
        loading: false 
      });
      
      // Set the first active challenge if none is selected
      const state = get();
      if (!state.activeChallenge && data && data.length > 0) {
        const activeOnes = data.filter(c => c.is_active);
        if (activeOnes.length > 0) {
          set({ activeChallenge: activeOnes[0] as Challenge });
        } else if (data.length > 0) {
          set({ activeChallenge: data[0] as Challenge });
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
      
      const { data, error } = await supabase
        .from('challenges')
        .insert([{ ...challenge, user_id: session.session.user.id }])
        .select();
        
      if (error) throw error;
      
      const newChallenge = data[0] as Challenge;
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
    } catch (error: any) {
      console.error('Error adding challenge:', error.message);
      toast({
        title: "Error adding challenge",
        description: error.message,
        variant: "destructive"
      });
      set({ loading: false });
    }
  },
  
  updateChallenge: async (id, data) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('challenges')
        .update(data)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
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
