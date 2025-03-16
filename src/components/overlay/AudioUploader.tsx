
import { useState } from 'react';
import { useOverlaySettingsStore } from '@/store/overlaySettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Play, Trash2, Loader2 } from 'lucide-react';

interface AudioUploaderProps {
  type: 'increment' | 'decrement' | 'reset';
}

export default function AudioUploader({ type }: AudioUploaderProps) {
  const { settings, uploadAudio, deleteAudio } = useOverlaySettingsStore();
  
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioPlayer = new Audio();
  
  const typeLabels = {
    increment: 'Increment Sound',
    decrement: 'Decrement Sound',
    reset: 'Reset Sound'
  };
  
  const typeDescriptions = {
    increment: 'Plays when increasing a challenge value',
    decrement: 'Plays when decreasing a challenge value',
    reset: 'Plays when resetting a challenge'
  };
  
  const currentAudioUrl = settings?.[`sound_${type}_url` as keyof typeof settings] as string | null;
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate audio file
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }
    
    setLoading(true);
    try {
      await uploadAudio(file, type);
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this ${type} sound?`)) {
      setLoading(true);
      try {
        await deleteAudio(type);
      } catch (error) {
        console.error('Error deleting audio:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handlePlay = () => {
    if (!currentAudioUrl) return;
    
    audioPlayer.src = currentAudioUrl;
    audioPlayer.onplay = () => setPlaying(true);
    audioPlayer.onended = () => setPlaying(false);
    audioPlayer.onpause = () => setPlaying(false);
    audioPlayer.play().catch(err => {
      console.error('Error playing audio:', err);
      setPlaying(false);
    });
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-zinc-100">{typeLabels[type]}</Label>
      <p className="text-xs text-zinc-400">{typeDescriptions[type]}</p>
      
      {currentAudioUrl ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-900 text-zinc-400 text-sm truncate rounded p-2 border border-zinc-700">
            {currentAudioUrl.split('/').pop()}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={handlePlay}
            disabled={loading || playing}
            className="bg-zinc-900 border-zinc-700 text-zinc-100"
          >
            {playing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            size="icon"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={loading}
            className="bg-zinc-900 border-zinc-700 text-zinc-100"
          />
          {loading && (
            <Button variant="outline" size="icon" disabled className="bg-zinc-900 border-zinc-700">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
