import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export interface OverlaySettings {
  id: number;
  user_id: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  react_code: string;
  confetti_enabled: boolean;
  sound_enabled: boolean;
  sound_type: {
    increment_url: string | null;
    decrement_url: string | null;
    reset_url: string | null;
  } | null;
  confetti_type: {
    increment_url: string | null;
    decrement_url: string | null;
    reset_url: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  challenge_id: number | null;
}

interface OverlaySettingsState {
  loading: boolean;
  settings: OverlaySettings | null;
  defaultSettings: {
    react_code: string;
  };

  // Actions
  fetchSettings: () => Promise<void>;
  fetchSettingsAll: () => Promise<OverlaySettings[]> ;
  saveSettings: (settings: Partial<OverlaySettings>) => Promise<void>;
  uploadConfetti: (file: File, type: 'increment' | 'decrement' | 'reset') => Promise<string>;
  uploadAudio: (file: File, type: 'increment' | 'decrement' | 'reset') => Promise<string>;
  deleteAudio: (type: 'increment' | 'decrement' | 'reset') => Promise<void>;
  resetToDefaults: () => Promise<void>;

    // Subscription
    subscribeToOverlayChanges: () => () => void;
}

export const useOverlaySettingsStore = create<OverlaySettingsState>((set, get) => ({
  loading: false,
  settings: null,
  defaultSettings: {
    react_code: '',
  },

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      // Get all settings for the user
      const { data, error } = await supabase
        .from('overlay_settings')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      // Find the first active setting or the first setting if none are active
      const activeChallenge = await supabase
        .from('challenges')
        .select('id')
        .eq('user_id', session.session.user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      let settingToUse = null;
      
      if (activeChallenge?.data.id) {
        // Try to find setting for active challenge
        settingToUse = data.find(setting => setting.challenge_id === activeChallenge.data.id);
      }
      
      // If no setting for active challenge, use the first one or null
      if (!settingToUse && data.length > 0) {
        settingToUse = data[0];
      }

      if (settingToUse) {
        // Parse confetti_type and sound_type if they are strings
        if (typeof settingToUse.confetti_type === 'string') {
          settingToUse.confetti_type = JSON.parse(settingToUse.confetti_type as unknown as string);
        }
        if (typeof settingToUse.sound_type === 'string') {
          settingToUse.sound_type = JSON.parse(settingToUse.sound_type as unknown as string);
        }
        
        set({
          settings: settingToUse as OverlaySettings,
          loading: false
        });
      } else {
        // No settings found, create default settings
        await get().resetToDefaults();
      }
    } catch (error: any) {
      console.error('Error fetching overlay settings:', error.message);
      set({ loading: false });
    }
  },

  fetchSettingsAll: async () => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }
  
      const { data, error } = await supabase
        .from('overlay_settings')
        .select('*')
        .eq('user_id', session.session.user.id);
  
      if (error) throw error;
      
      // Parse confetti_type and sound_type if they are strings for all settings
      const parsedData = data.map(setting => {
        if (typeof setting.confetti_type === 'string') {
          setting.confetti_type = JSON.parse(setting.confetti_type as unknown as string);
        }
        if (typeof setting.sound_type === 'string') {
          setting.sound_type = JSON.parse(setting.sound_type as unknown as string);
        }
        return setting;
      });
  
      set({ loading: false });
      return parsedData;
    } catch (error: any) {
      console.error('Error fetching overlay settings:', error.message);
      set({ loading: false });
      return [];
    }
  },
  

  saveSettings: async (settings: Partial<OverlaySettings>) => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const userId = session.session.user.id;
      // Check if an ID is provided in the incoming settings or already exists in store
      const idToUse = settings.id ?? get().settings?.id;

      if (!idToUse) {
        // Create new settings
        const { data, error } = await supabase
          .from('overlay_settings')
          .insert([{
            ...get().defaultSettings,
            position_x: 10,
            position_y: 10,
            width: 300,
            height: 200,
            confetti_enabled: true,
            sound_enabled: true,
            sound_type: {
              increment_url: null,
              decrement_url: null,
              reset_url: null
            },
            confetti_type: {
              increment_url: null,
              decrement_url: null,
              reset_url: null
            },
            ...settings,
            user_id: userId
          }])
          .select();

        if (error) throw error;

        set({
          settings: data[0] as OverlaySettings,
          loading: false
        });
      } else {
        // Update existing settings using the provided or stored id
        const { data, error } = await supabase
          .from('overlay_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', idToUse)
          .select();

        if (error) throw error;

        set({
          settings: data[0] as OverlaySettings,
          loading: false
        });
      }

      toast({
        title: "Settings saved",
        description: "Your overlay settings have been updated successfully"
      });
    } catch (error: any) {
      console.error('Error saving overlay settings:', error.message);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
      set({ loading: false });
    }
  },

  uploadAudio: async (file: File, type: 'increment' | 'decrement' | 'reset') => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const userId = session.session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_sound.${fileExt}`;

      const { data, error } = await supabase
        .storage
        .from('overlay_assets')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: urlData } = supabase
        .storage
        .from('overlay_assets')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Get current settings
      const currentSettings = get().settings;
      const currentSoundType = currentSettings?.sound_type || {
        increment_url: null,
        decrement_url: null,
        reset_url: null
      };

      // Update the sound_type object with the new URL
      const updatedSoundType = {
        ...currentSoundType,
        [`${type}_url`]: publicUrl
      };

      // Save the updated sound_type object
      await get().saveSettings({ sound_type: updatedSoundType });

      return publicUrl;
    } catch (error: any) {
      console.error(`Error uploading ${type} sound:`, error.message);
      toast({
        title: `Error uploading ${type} sound`,
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  },

  uploadConfetti: async (file: File, type: 'increment' | 'decrement' | 'reset') => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const userId = session.session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_confetti.${fileExt}`;

      const { data, error } = await supabase
        .storage
        .from('overlay_assets')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: urlData } = supabase
        .storage
        .from('overlay_assets')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Get current settings
      const currentSettings = get().settings;
      const currentConfettiType = currentSettings?.confetti_type || {
        increment_url: null,
        decrement_url: null,
        reset_url: null
      };

      // Update the confetti_type object with the new URL
      const updatedConfettiType = {
        ...currentConfettiType,
        [`${type}_url`]: publicUrl
      };

      // Save the updated confetti_type object
      await get().saveSettings({ confetti_type: updatedConfettiType });

      return publicUrl;
    } catch (error: any) {
      console.error(`Error uploading ${type} confetti:`, error.message);
      toast({
        title: `Error uploading ${type} confetti`,
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  },

  deleteAudio: async (type: 'increment' | 'decrement' | 'reset') => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const userId = session.session.user.id;
      const settings = get().settings;

      if (!settings) {
        throw new Error("No settings found");
      }

      // Get the file path from the URL
      const soundUrl = settings.sound_type?.[`${type}_url`] as string | null;

      if (soundUrl) {
        // Extract filename from URL
        const filePath = `${userId}/${type}_sound.${soundUrl.split('.').pop()}`;

        // Delete from storage
        const { error: deleteError } = await supabase
          .storage
          .from('overlay_assets')
          .remove([filePath]);

        if (deleteError) throw deleteError;
      }

      // Update the sound_type object to remove the URL
      const currentSoundType = settings.sound_type || {
        increment_url: null,
        decrement_url: null,
        reset_url: null
      };

      const updatedSoundType = {
        ...currentSoundType,
        [`${type}_url`]: null
      };

      // Save the updated sound_type object
      await get().saveSettings({ sound_type: updatedSoundType });

      toast({
        title: "Sound removed",
        description: `The ${type} sound has been removed successfully`
      });
    } catch (error: any) {
      console.error(`Error deleting ${type} sound:`, error.message);
      toast({
        title: `Error deleting ${type} sound`,
        description: error.message,
        variant: "destructive"
      });
    }
  },

  subscribeToOverlayChanges: () => {
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('public:overlay_settings')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'overlay_settings', 
      }, async (payload) => {
        // Refresh challenges on change
        await get().fetchSettings();
      })
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  },

  resetToDefaults: async () => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const userId = session.session.user.id;
      const defaults = get().defaultSettings;

      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('overlay_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('overlay_settings')
          .update({
            ...defaults,
            position_x: 10,
            position_y: 10,
            width: 300,
            height: 200,
            confetti_enabled: true,
            sound_enabled: true,
            sound_type: {
              increment_url: null,
              decrement_url: null,
              reset_url: null
            },
            confetti_type: {
              increment_url: null,
              decrement_url: null,
              reset_url: null
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select();

        if (error) throw error;

        set({
          settings: data[0] as OverlaySettings,
          loading: false
        });
      } else {
        // Create new settings with defaults
        const { data, error } = await supabase
          .from('overlay_settings')
          .insert([{
            ...defaults,
            position_x: 10,
            position_y: 10,
            width: 300,
            height: 200,
            confetti_enabled: true,
            sound_enabled: true,
            sound_type: {
              increment_url: null,
              decrement_url: null,
              reset_url: null
            },
            confetti_type: {
              increment_url: null,
              decrement_url: null,
              reset_url: null
            },
            user_id: userId
          }])
          .select();

        if (error) throw error;

        set({
          settings: data[0] as OverlaySettings,
          loading: false
        });
      }

      toast({
        title: "Settings reset",
        description: "Your overlay settings have been reset to defaults"
      });
    } catch (error: any) {
      console.error('Error resetting overlay settings:', error.message);
      toast({
        title: "Error resetting settings",
        description: error.message,
        variant: "destructive"
      });
      set({ loading: false });
    }
  },
}));
