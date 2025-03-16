
import { useChallengeStore } from '@/store/challengeStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, MinusCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FullActionButton() {
  const { activeChallenge, incrementChallenge, decrementChallenge, resetChallenge } = useChallengeStore();

  if (!activeChallenge) {
    return (
      <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
        <p className="text-zinc-400">No active challenge selected</p>
      </div>
    );
  }

  const handleIncrement = () => {
    incrementChallenge(activeChallenge.id);
  };

  const handleDecrement = () => {
    decrementChallenge(activeChallenge.id);
  };

  const handleReset = () => {
    resetChallenge(activeChallenge.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-200">
        {activeChallenge.title}
      </h2>
      
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={handleDecrement}
          disabled={activeChallenge.currentValue <= 0}
          className={`bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600 ${
            activeChallenge.currentValue <= 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <MinusCircle className="mr-2 h-4 w-4" />
          <span>Decrease</span>
        </Button>
        
        <Button
          onClick={handleIncrement}
          disabled={activeChallenge.currentValue >= activeChallenge.maxValue}
          className={`bg-accent hover:bg-accent/90 text-white ${
            activeChallenge.currentValue >= activeChallenge.maxValue ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>Increase</span>
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Reset</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset the current value of "{activeChallenge.title}" to zero.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-zinc-700 hover:bg-zinc-600"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="mt-2 text-sm text-zinc-400">
        <p>Current: {activeChallenge.currentValue} / Max: {activeChallenge.maxValue}</p>
        {activeChallenge.endDate && (
          <p className="mt-1">
            End date: {new Date(activeChallenge.endDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
