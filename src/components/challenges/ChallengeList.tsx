
import { useEffect } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import ActionButton from './ActionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ProgressBarUI } from '@/components/ui/ProgressBarUI';

export default function ChallengeList() {
  const { challenges, loading, fetchChallenges, subscribeToChanges } = useChallengeStore();
  
  useEffect(() => {
    fetchChallenges();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToChanges();
    
    return () => {
      unsubscribe();
    };
  }, [fetchChallenges, subscribeToChanges]);
  
  return (
    <ScrollArea className="h-[600px]">
      <Card className="bg-zinc-800 border-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-zinc-100 flex items-center justify-between">
            <span>Your Challenges</span>
            {loading && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-accent"></span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {challenges.length > 0 ? (
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 challenge-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-zinc-200">{challenge.title}</h3>
                        <Badge variant={challenge.is_active ? "default" : "outline"} className={challenge.is_active ? "bg-accent/20 text-accent border-accent/30" : ""}>
                          {challenge.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Created: {format(new Date(challenge.created_at), 'PPP')}
                        {challenge.endDate && (
                          <span> · Ends: {format(new Date(challenge.endDate), 'PPP')}</span>
                        )}
                      </div>
                    </div>
                    <ActionButton id={challenge.id} />
                  </div>
                  
                  <ProgressBarUI 
                    value={challenge.currentValue} 
                    max={challenge.maxValue} 
                    className="h-2.5 mt-2"
                    variant={challenge.is_active ? "default" : "default"}
                    indicator={false}
                  />
                  
                  <div className="text-xs text-zinc-400 mt-1.5 flex justify-end">
                    <span>{challenge.currentValue} / {challenge.maxValue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-700 rounded-lg bg-zinc-900/50">
              <div className="rounded-full bg-zinc-800 p-3 mb-3">
                <svg 
                  className="w-6 h-6 text-zinc-500"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-zinc-300 font-medium">No challenges yet</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                Create your first challenge to track progress and display on your stream
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
