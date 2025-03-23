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
  settings: OverlaySettings | null; // Fixed from OverlaySettings[] | null
  defaultSettings: Partial<OverlaySettings>;

  // Actions
  fetchSettings: (challengeId?: number) => Promise<void>;
  fetchSettingsAll: () => Promise<OverlaySettings[]>;
  addSettings: (settings: Partial<OverlaySettings>) => Promise<void>;
  saveSettings: (settings: Partial<OverlaySettings>) => Promise<void>;
  uploadConfetti: (file: File, type: 'increment' | 'decrement' | 'reset') => Promise<string>;
  uploadAudio: (file: File, type: 'increment' | 'decrement' | 'reset') => Promise<string>;
  deleteAudio: (type: 'increment' | 'decrement' | 'reset') => Promise<void>;
  resetToDefaults: (challengeId?: number) => Promise<void>;
  subscribeToOverlayChanges: () => () => void;
}

export const useOverlaySettingsStore = create<OverlaySettingsState>((set, get) => ({
  loading: false,
  settings: null,
  defaultSettings: {
    position_x: 10,
    position_y: 10,
    width: 300,
    height: 200,
    react_code: "",
    confetti_enabled: true,
    sound_enabled: true,
    sound_type: {
      increment_url: null,
      decrement_url: null,
      reset_url: null,
    },
    confetti_type: {
      increment_url: null,
      decrement_url: null,
      reset_url: null,
    },
  },

  fetchSettings: async (challengeId?: number) => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const userId = session.session.user.id;

      // Determine the challenge ID to use
      let targetChallengeId: number | null = challengeId ?? null;
      if (challengeId === undefined) {
        // If no challengeId provided, default to active challenge
        const { data: activeChallenge } = await supabase
          .from('challenges')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();
        targetChallengeId = activeChallenge?.id ?? null;
      }

      // Fetch settings based on challenge_id
      let query = supabase
        .from('overlay_settings')
        .select('*')
        .eq('user_id', userId);

      if (targetChallengeId !== null) {
        query = query.eq('challenge_id', targetChallengeId);
      } else {
        query = query.is('challenge_id', null);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found

      if (data) {
        // Parse confetti_type and sound_type if they are strings
        if (typeof data.confetti_type === 'string') {
          data.confetti_type = JSON.parse(data.confetti_type);
        }
        if (typeof data.sound_type === 'string') {
          data.sound_type = JSON.parse(data.sound_type);
        }
        set({
          settings: data as OverlaySettings,
          loading: false,
        });
      } else {
        // No settings found, create default settings with the target challenge ID
        await get().resetToDefaults(targetChallengeId);
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
      if (!session.session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('overlay_settings')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      const parsedData = data.map((setting) => {
        if (typeof setting.confetti_type === 'string') {
          setting.confetti_type = JSON.parse(setting.confetti_type);
        }
        if (typeof setting.sound_type === 'string') {
          setting.sound_type = JSON.parse(setting.sound_type);
        }
        return setting as OverlaySettings;
      });

      set({ loading: false });
      return parsedData;
    } catch (error: any) {
      console.error('Error fetching all overlay settings:', error.message);
      set({ loading: false });
      return [];
    }
  },

  addSettings: async (settings: Partial<OverlaySettings>) => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const userId = session.session.user.id;
      let settingsToSave = { ...settings };

      // Ensure sound_type and confetti_type are properly formatted
      settingsToSave.sound_type = settingsToSave.sound_type ?? {
        increment_url: null,
        decrement_url: null,
        reset_url: null,
      };
      settingsToSave.confetti_type = settingsToSave.confetti_type ?? {
        increment_url: null,
        decrement_url: null,
        reset_url: null,
      };

      const { data, error } = await supabase
        .from('overlay_settings')
        .insert([{ ...settingsToSave, user_id: userId }])
        .select();

      if (error) throw error;

      set({
        settings: data[0] as OverlaySettings,
        loading: false,
      });
      toast({
        title: "Settings created",
        description: "Your overlay settings have been created successfully",
      });
    } catch (error: any) {
      console.error('Error creating overlay settings:', error.message);
      toast({
        title: "Error creating settings",
        description: error.message,
        variant: "destructive",
      });
      set({ loading: false });
    }
  },

  saveSettings: async (settings: Partial<OverlaySettings>) => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const userId = session.session.user.id;
      const idToUse = settings.id ?? get().settings?.id;

      if (!idToUse) {
        // Create new settings
        const { data, error } = await supabase
          .from('overlay_settings')
          .insert([{ ...get().defaultSettings, ...settings, user_id: userId }])
          .select();

        if (error) throw error;

        set({
          settings: data[0] as OverlaySettings,
          loading: false,
        });
      } else {
        // Update existing settings
        const { data, error } = await supabase
          .from('overlay_settings')
          .update({ ...settings, updated_at: new Date().toISOString() })
          .eq('id', idToUse)
          .select();

        if (error) throw error;

        set({
          settings: data[0] as OverlaySettings,
          loading: false,
        });
      }

      toast({
        title: "Settings saved",
        description: "Your overlay settings have been updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving overlay settings:', error.message);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
      set({ loading: false });
    }
  },

  uploadAudio: async (file: File, type: 'increment' | 'decrement' | 'reset') => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const userId = session.session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_sound.${fileExt}`;

      const { error } = await supabase.storage
        .from('overlay_assets')
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('overlay_assets')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      const currentSettings = get().settings;
      const updatedSoundType = {
        ...(currentSettings?.sound_type ?? { increment_url: null, decrement_url: null, reset_url: null }),
        [`${type}_url`]: publicUrl,
      };

      await get().saveSettings({ sound_type: updatedSoundType });
      return publicUrl;
    } catch (error: any) {
      console.error(`Error uploading ${type} sound:`, error.message);
      toast({
        title: `Error uploading ${type} sound`,
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  uploadConfetti: async (file: File, type: 'increment' | 'decrement' | 'reset') => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const userId = session.session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_confetti.${fileExt}`;

      const { error } = await supabase.storage
        .from('overlay_assets')
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('overlay_assets')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      const currentSettings = get().settings;
      const updatedConfettiType = {
        ...(currentSettings?.confetti_type ?? { increment_url: null, decrement_url: null, reset_url: null }),
        [`${type}_url`]: publicUrl,
      };

      await get().saveSettings({ confetti_type: updatedConfettiType });
      return publicUrl;
    } catch (error: any) {
      console.error(`Error uploading ${type} confetti:`, error.message);
      toast({
        title: `Error uploading ${type} confetti`,
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  },

  deleteAudio: async (type: 'increment' | 'decrement' | 'reset') => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const userId = session.session.user.id;
      const settings = get().settings;
      if (!settings) throw new Error("No settings found");

      const soundUrl = settings.sound_type?.[`${type}_url`];
      if (soundUrl) {
        const filePath = `${userId}/${type}_sound.${soundUrl.split('.').pop()}`;
        const { error } = await supabase.storage.from('overlay_assets').remove([filePath]);
        if (error) throw error;
      }

      const updatedSoundType = {
        ...(settings.sound_type ?? { increment_url: null, decrement_url: null, reset_url: null }),
        [`${type}_url`]: null,
      };

      await get().saveSettings({ sound_type: updatedSoundType });
      toast({
        title: "Sound removed",
        description: `The ${type} sound has been removed successfully`,
      });
    } catch (error: any) {
      console.error(`Error deleting ${type} sound:`, error.message);
      toast({
        title: `Error deleting ${type} sound`,
        description: error.message,
        variant: "destructive",
      });
    }
  },

  resetToDefaults: async (challengeId?: number) => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const userId = session.session.user.id;
      const defaults = get().defaultSettings;

      const settingsToInsert = {
        ...defaults,
        position_x: 10,
        position_y: 10,
        width: 300,
        height: 200,
        confetti_enabled: true,
        sound_enabled: true,
        sound_type: { increment_url: null, decrement_url: null, reset_url: null },
        confetti_type: { increment_url: null, decrement_url: null, reset_url: null },
        user_id: userId,
        challenge_id: challengeId ?? null,
      };

      const { data, error } = await supabase
        .from('overlay_settings')
        .insert([settingsToInsert])
        .select();

      if (error) throw error;

      set({
        settings: data[0] as OverlaySettings,
        loading: false,
      });
      toast({
        title: "Settings reset",
        description: "Your overlay settings have been reset to defaults",
      });
    } catch (error: any) {
      console.error('Error resetting overlay settings:', error.message);
      toast({
        title: "Error resetting settings",
        description: error.message,
        variant: "destructive",
      });
      set({ loading: false });
    }
  },

  subscribeToOverlayChanges: () => {
    const subscription = supabase
      .channel('public:overlay_settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'overlay_settings' }, async () => {
        await get().fetchSettings();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  },
}));