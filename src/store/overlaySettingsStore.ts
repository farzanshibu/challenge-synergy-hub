
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface OverlaySettings {
  id: number;
  user_id: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  css_code: string;
  js_code: string;
  html_template: string;
  confetti_enabled: boolean;
  sound_enabled: boolean;
  sound_increment_url: string | null;
  sound_decrement_url: string | null;
  sound_reset_url: string | null;
  confetti_type: string;
  created_at: string;
  updated_at: string;
}

// Default overlay HTML template with variable placeholders
const DEFAULT_HTML_TEMPLATE = `
<div class="overlay-challenge">
  <div class="challenge-title">{{title}}</div>
  <div class="challenge-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {{progressPercent}}%"></div>
    </div>
    <div class="progress-text">{{currentValue}}/{{maxValue}}</div>
  </div>
  <div class="challenge-timer" data-show="{{hasEndDate}}">Time left: {{timeLeft}}</div>
</div>
`;

// Default CSS
const DEFAULT_CSS = `
.overlay-challenge {
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-family: 'Arial', sans-serif;
  max-width: 300px;
}

.challenge-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.progress-bar {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  height: 12px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  background-color: #ff3e00;
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  text-align: right;
}

.challenge-timer {
  margin-top: 8px;
  font-size: 12px;
  color: #ccc;
}

[data-show="false"] {
  display: none;
}
`;

// Default JS
const DEFAULT_JS = `
// This code runs when a challenge value changes
function onChallengeUpdate(challenge) {
  console.log('Challenge updated:', challenge);
  // You can add custom animations or logic here
}

// This fires when a challenge is completed
function onChallengeComplete(challenge) {
  console.log('Challenge completed!', challenge);
  // Custom completion celebration logic
}
`;

interface OverlaySettingsState {
  loading: boolean;
  settings: OverlaySettings | null;
  defaultSettings: {
    html_template: string;
    css_code: string;
    js_code: string;
  };
  
  // Actions
  fetchSettings: () => Promise<void>;
  saveSettings: (settings: Partial<OverlaySettings>) => Promise<void>;
  uploadAudio: (file: File, type: 'increment' | 'decrement' | 'reset') => Promise<string>;
  deleteAudio: (type: 'increment' | 'decrement' | 'reset') => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const useOverlaySettingsStore = create<OverlaySettingsState>((set, get) => ({
  loading: false,
  settings: null,
  defaultSettings: {
    html_template: DEFAULT_HTML_TEMPLATE,
    css_code: DEFAULT_CSS,
    js_code: DEFAULT_JS,
  },
  
  fetchSettings: async () => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }
      
      const { data, error } = await supabase
        .from('overlay_settings')
        .select('*')
        .eq('user_id', session.session.user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        set({ 
          settings: data as OverlaySettings,
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
  
  saveSettings: async (settings: Partial<OverlaySettings>) => {
    set({ loading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }
      
      const userId = session.session.user.id;
      const currentSettings = get().settings;
      
      if (!currentSettings) {
        // Create new settings
        const { data, error } = await supabase
          .from('overlay_settings')
          .insert([{
            ...get().defaultSettings,
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
        // Update existing settings
        const { data, error } = await supabase
          .from('overlay_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSettings.id)
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
      
      // Update the settings with the new URL
      const settingKey = `sound_${type}_url` as keyof OverlaySettings;
      await get().saveSettings({ [settingKey]: publicUrl } as Partial<OverlaySettings>);
      
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
      const soundUrl = settings[`sound_${type}_url` as keyof OverlaySettings] as string;
      
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
      
      // Update settings to remove the URL
      const settingKey = `sound_${type}_url` as keyof OverlaySettings;
      await get().saveSettings({ [settingKey]: null } as Partial<OverlaySettings>);
      
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
            confetti_type: 'default',
            sound_increment_url: null,
            sound_decrement_url: null,
            sound_reset_url: null,
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
            confetti_type: 'default',
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
