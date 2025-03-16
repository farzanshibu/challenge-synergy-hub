
import { useEffect } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import FullActionButton from './FullActionButton';
import ProgressBar from './ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChallengeButton() {
  const { 
    activeChallenge, 
    challenges, 
    fetchChallenges, 
    subscribeToChanges 
  } = useChallengeStore();
  
  useEffect(() => {
    fetchChallenges();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToChanges();
    
    return () => {
      unsubscribe();
    };
  }, [fetchChallenges, subscribeToChanges]);
  
  if (!activeChallenge) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <Card className="bg-zinc-800 border-zinc-900 w-full">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-zinc-700/50 p-3 mb-3">
              <svg 
                className="w-6 h-6 text-zinc-400"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-zinc-300 font-medium">No active challenge</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-xs">
              Create a challenge or activate an existing one from the list
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="flex flex-col gap-5">
        <ProgressBar
          title={activeChallenge.title}
          maxValue={activeChallenge.maxValue}
          minValue={0}
          currentValue={activeChallenge.currentValue}
          endDate={activeChallenge.endDate}
          className="w-full"
        />
        
        <Card className="bg-zinc-800 border-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Challenge Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <FullActionButton />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
