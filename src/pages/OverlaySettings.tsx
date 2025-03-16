
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import OverlayCustomizer from '@/components/overlay/OverlayCustomizer';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';

export default function OverlaySettings() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-100"></div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Overlay Settings</h1>
          <p className="text-zinc-400 mt-1">Customize how your challenges appear on stream</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            variant="outline" 
            onClick={() => setShowHelpDialog(true)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
          >
            Help & Instructions
          </Button>
          <Button
            variant="outline" 
            onClick={() => navigate('/overlay')}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
          >
            View Overlay
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <OverlayCustomizer />
      </div>
      
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="bg-zinc-800 text-white border-zinc-700">
          <DialogHeader>
            <DialogTitle>Overlay Setup Guide</DialogTitle>
            <DialogDescription className="text-zinc-400">
              How to use your custom overlay with streaming software
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <h3 className="text-lg font-medium">Adding to OBS Studio</h3>
            <ol className="list-decimal list-inside space-y-2 text-zinc-300">
              <li>In OBS, add a new <strong>Browser Source</strong> to your scene</li>
              <li>Enter this URL: <code className="bg-zinc-900 px-2 py-1 rounded">{window.location.origin}/overlay</code></li>
              <li>Set the width and height to match your stream canvas</li>
              <li>Check <strong>"Control audio via OBS"</strong> if you want sound effects</li>
              <li>Click OK to add the overlay</li>
            </ol>
            
            <h3 className="text-lg font-medium mt-6">Using with Streamlabs</h3>
            <ol className="list-decimal list-inside space-y-2 text-zinc-300">
              <li>In Streamlabs, add a new <strong>Web Page</strong> source</li>
              <li>Enter this URL: <code className="bg-zinc-900 px-2 py-1 rounded">{window.location.origin}/overlay</code></li>
              <li>Set the width and height to match your stream canvas</li>
              <li>Click Add Source to complete setup</li>
            </ol>
            
            <div className="bg-zinc-900 p-4 rounded-lg mt-6">
              <h4 className="font-medium text-rose-400">Important Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-300 mt-2">
                <li>Make sure you're logged in to your account in the browser source</li>
                <li>Consider adding a cache clear/refresh button in your stream software for when you make updates</li>
                <li>Press <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded border border-zinc-600 text-xs">Ctrl+H</kbd> while focused on the overlay to toggle debug controls</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
