
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChallengeStore } from '@/store/challengeStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import ProgressBar from '@/components/challenges/ProgressBar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Overlay() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { challenges, fetchChallenges, subscribeToChanges } = useChallengeStore();
  const [showControls, setShowControls] = useState(false);
  
  // Get active challenges
  const activeChallenges = challenges.filter(c => c.is_active);
  
  useEffect(() => {
    // Initial load
    if (isAuthenticated) {
      fetchChallenges();
    }
    
    // Subscribe to updates
    let unsubscribe: (() => void) | undefined;
    if (isAuthenticated) {
      unsubscribe = subscribeToChanges();
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, fetchChallenges, subscribeToChanges]);
  
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
