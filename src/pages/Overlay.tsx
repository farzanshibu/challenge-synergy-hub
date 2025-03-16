
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
    if (settings && settings.sound_enabled) {
      const players: Record<string, HTMLAudioElement> = {};
      
      if (settings.sound_increment_url) {
        players.increment = new Audio(settings.sound_increment_url);
      }
      
      if (settings.sound_decrement_url) {
        players.decrement = new Audio(settings.sound_decrement_url);
      }
      
      if (settings.sound_reset_url) {
        players.reset = new Audio(settings.sound_reset_url);
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
          playConfetti(settings.confetti_type);
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
  const playConfetti = (type: string) => {
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };
    
    switch (type) {
      case 'fireworks':
        confetti({
          ...defaults,
          particleCount: 100,
          spread: 70,
          origin: { y: 0.9 }
        });
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 100,
            spread: 100,
            origin: { y: 0.8, x: 0.3 }
          });
        }, 250);
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 100,
            spread: 100,
            origin: { y: 0.8, x: 0.7 }
          });
        }, 400);
        break;
        
      case 'stars':
        confetti({
          ...defaults,
          shapes: ['star'],
          particleCount: 40,
          spread: 50,
          colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
        });
        break;
        
      case 'emoji':
        // Using random emojis would require canvas-confetti-emoji package, using default instead
        confetti({
          ...defaults,
          particleCount: 60,
          spread: 55,
        });
        break;
        
      default: // default confetti
        confetti({
          ...defaults,
          particleCount: 80,
          spread: 60
        });
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
    return (
      <>
        {/* Add custom styles */}
        <style>{settings.css_code}</style>
        
        {/* Add custom JS */}
        {settings.js_code && (
          <script dangerouslySetInnerHTML={{ __html: settings.js_code }} />
        )}
        
        {/* Info button that shows on hover */}
        {showControls && (
          <div className="absolute top-4 right-4 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-xs max-w-xs animate-fade-in backdrop-blur-md pointer-events-auto">
            <p className="font-medium">Overlay Controls</p>
            <p className="text-zinc-400 mt-1">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs">Ctrl+H</kbd> to toggle controls visibility.
            </p>
          </div>
        )}
        
        {/* Custom styled challenges display */}
        <div 
          className="fixed pointer-events-none"
          style={{ 
            left: `${settings.position_x}%`, 
            top: `${settings.position_y}%`,
            transform: 'translate(-50%, -50%)',
            maxWidth: `${settings.width}px`,
            maxHeight: `${settings.height}px`,
            overflow: 'auto'
          }}
        >
          <div className="space-y-3 pointer-events-auto">
            {activeChallenges.map((challenge) => {
              // Calculate variables to replace in template
              const progressPercent = Math.min(100, Math.round((challenge.currentValue / challenge.maxValue) * 100));
              
              let timeLeft = '';
              if (challenge.endDate) {
                const timeRemaining = new Date(challenge.endDate).getTime() - Date.now();
                if (timeRemaining > 0) {
                  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  timeLeft = `${days}d ${hours}h`;
                } else {
                  timeLeft = 'Expired';
                }
              }
              
              // Replace variables in template
              let processedHtml = settings.html_template
                .replace(/{{title}}/g, challenge.title)
                .replace(/{{currentValue}}/g, challenge.currentValue.toString())
                .replace(/{{maxValue}}/g, challenge.maxValue.toString())
                .replace(/{{progressPercent}}/g, progressPercent.toString())
                .replace(/{{hasEndDate}}/g, challenge.endDate ? 'true' : 'false')
                .replace(/{{timeLeft}}/g, timeLeft);
              
              return (
                <div key={challenge.id} dangerouslySetInnerHTML={{ __html: processedHtml }} />
              );
            })}
          </div>
        </div>
      </>
    );
  }
  
  // Fall back to default overlay if no custom settings
  return (
    <div className="fixed top-4 left-4 right-4 pointer-events-none">
      {/* Info button that shows on hover */}
      {showControls && (
        <div className="absolute top-0 right-0 p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg text-white text-xs max-w-xs animate-fade-in backdrop-blur-md pointer-events-auto">
          <p className="font-medium">Overlay Controls</p>
          <p className="text-zinc-400 mt-1">
            Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-xs">Ctrl+H</kbd> to toggle controls visibility.
          </p>
        </div>
      )}
      
      {/* Challenges display */}
      <ScrollArea className="max-h-[calc(100vh-32px)]">
        <div className="space-y-3 max-w-md pointer-events-auto">
          {activeChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-4 bg-zinc-900/90 border border-zinc-700 rounded-lg backdrop-blur-md shadow-lg overlay-appear"
            >
              <ProgressBar
                title={challenge.title}
                currentValue={challenge.currentValue}
                maxValue={challenge.maxValue}
                endDate={challenge.endDate}
                showTitle={true}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
