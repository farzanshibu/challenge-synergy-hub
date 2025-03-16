
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChallengeStore } from '@/store/challengeStore';
import { useOverlaySettingsStore, OverlaySettings } from '@/store/overlaySettingsStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import ProgressBar from '@/components/challenges/ProgressBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import confetti from 'canvas-confetti';

export default function Overlay() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { challenges, fetchChallenges, subscribeToChanges } = useChallengeStore();
  const { settings, fetchSettings } = useOverlaySettingsStore();
  const [showControls, setShowControls] = useState(false);
  const [previousValues, setPreviousValues] = useState<Record<number, number>>({});
  const [audioPlayers, setAudioPlayers] = useState<Record<string, HTMLAudioElement>>({});
  
  // Get active challenges
  const activeChallenges = challenges.filter(c => c.is_active);
  
  useEffect(() => {
    // Initial load
    if (isAuthenticated) {
      fetchChallenges();
      fetchSettings();
    }
    
    // Subscribe to updates
    let unsubscribe: (() => void) | undefined;
    if (isAuthenticated) {
      unsubscribe = subscribeToChanges();
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, fetchChallenges, fetchSettings, subscribeToChanges]);
  
  // Toggle controls visibility on key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        setShowControls(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Setup audio players when settings load
  useEffect(() => {
    if (settings && settings.sound_enabled && settings.sound_type) {
      const players: Record<string, HTMLAudioElement> = {};
      
      if (settings.sound_type.increment_url) {
        players.increment = new Audio(settings.sound_type.increment_url);
      }
      
      if (settings.sound_type.decrement_url) {
        players.decrement = new Audio(settings.sound_type.decrement_url);
      }
      
      if (settings.sound_type.reset_url) {
        players.reset = new Audio(settings.sound_type.reset_url);
      }
      
      setAudioPlayers(players);
    }
  }, [settings]);
  
  // Track value changes and play sounds/animations
  useEffect(() => {
    if (!settings || challenges.length === 0) return;
    
    const updatedValues: Record<number, number> = {};
    let valueChanged = false;
    let actionType: 'increment' | 'decrement' | 'reset' | null = null;
    
    challenges.forEach(challenge => {
      updatedValues[challenge.id] = challenge.currentValue;
      
      // Check if this is a value change
      if (previousValues[challenge.id] !== undefined && 
          previousValues[challenge.id] !== challenge.currentValue) {
        valueChanged = true;
        
        // Determine action type
        if (challenge.currentValue > previousValues[challenge.id]) {
          actionType = 'increment';
        } else if (challenge.currentValue < previousValues[challenge.id]) {
          if (challenge.currentValue === 0) {
            actionType = 'reset';
          } else {
            actionType = 'decrement';
          }
        }
        
        // Play confetti for increments at milestone values
        if (actionType === 'increment' && 
            settings.confetti_enabled && 
            challenge.currentValue % Math.ceil(challenge.maxValue / 10) === 0) {
          playConfetti('increment');
        }
      }
    });
    
    // Play sound if enabled and available
    if (valueChanged && actionType && settings.sound_enabled) {
      const player = audioPlayers[actionType];
      if (player) {
        player.currentTime = 0;
        player.play().catch(err => console.error('Error playing sound:', err));
      }
    }
    
    setPreviousValues(updatedValues);
  }, [challenges, settings, audioPlayers]);
  
  // Play confetti animation
  const playConfetti = (type: 'increment' | 'decrement' | 'reset') => {
    if (!settings?.confetti_enabled) return;

    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };
    
    // Check for custom animation URL in settings
    if (settings?.confetti_type?.[`${type}_url`]) {
      confetti({
        ...defaults,
        particleCount: type === 'increment' ? 80 : 40,
        spread: type === 'increment' ? 60 : 45,
        colors: type === 'reset' ? ['#FF6B6B', '#FF8787', '#FFA8A8'] : undefined
      });
      return;
    }

    // Default animations based on action type
    switch (type) {
      case 'increment':
        confetti({
          ...defaults,
          particleCount: 80,
          spread: 60,
          colors: ['#4CAF50', '#8BC34A', '#CDDC39']
        });
        break;

      case 'decrement':
        confetti({
          ...defaults,
          particleCount: 40,
          spread: 45,
          colors: ['#FFA726', '#FFB74D', '#FFCC80'],
          gravity: 1.2
        });
        break;

      case 'reset':
        confetti({
          ...defaults,
          particleCount: 60,
          spread: 70,
          colors: ['#FF6B6B', '#FF8787', '#FFA8A8'],
          gravity: 0.8,
          ticks: 150
        });
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 30,
            spread: 90,
            origin: { y: 0.8, x: 0.3 },
            colors: ['#FF6B6B', '#FF8787', '#FFA8A8']
          });
        }, 150);
        break;
    }
  };
  
  // If loading, show nothing (transparent overlay)
  if (isLoading) {
    return null;
  }
  
  // If not authenticated, show message
  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 left-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md">
        <p>Please log in to view your challenges overlay.</p>
      </div>
    );
  }
  
  // If no active challenges, show message (only if controls are shown)
  if (activeChallenges.length === 0) {
    return showControls ? (
      <div className="fixed top-4 left-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md">
        <p>No active challenges to display.</p>
        <p className="text-xs text-zinc-400 mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs">Ctrl+H</kbd> to toggle this message.
        </p>
      </div>
    ) : null;
  }
  
  // Use custom styles if available, otherwise fall back to default
  if (settings) {
  // Evaluate custom React code if provided
  const CustomComponent = settings?.react_code ? eval(`(${settings.react_code})`) : null;

  return (
    <div 
      className="fixed pointer-events-none"
      style={{
        top: settings?.position_y ?? 0,
        left: settings?.position_x ?? 0,
        width: settings?.width ?? '100%',
        height: settings?.height ?? '100%'
      }}
    >
      {/* Controls */}
      {showControls && (
        <div className="fixed top-4 left-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-sm max-w-xs animate-fade-in backdrop-blur-md pointer-events-auto">
          <p>Press <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl + H</kbd> to hide controls</p>
        </div>
      )}
      
      {/* Active Challenges */}
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {CustomComponent ? (
            <CustomComponent 
              challenges={activeChallenges}
              settings={settings}
            />
          ) : (
            activeChallenges.map(challenge => (
              <ProgressBar
                key={challenge.id}
                title={challenge.title}
                maxValue={challenge.maxValue}
                minValue={0}
                currentValue={challenge.currentValue}
                endDate={challenge.endDate}
                className="w-full max-w-lg"
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
}
