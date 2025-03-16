
import { useState, useEffect } from 'react';
import { useChallengeStore } from '@/store/challengeStore';

interface OverlayPreviewProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
  htmlTemplate: string;
  cssCode: string;
  jsCode: string;
}

export default function OverlayPreview({ 
  position, 
  size, 
  htmlTemplate, 
  cssCode, 
  jsCode 
}: OverlayPreviewProps) {
  const { challenges } = useChallengeStore();
  const [previewHtml, setPreviewHtml] = useState('');
  
  // Create a sample challenge if none exists
  const sampleChallenge = challenges.length > 0 
    ? challenges[0] 
    : {
        id: 0,
        title: "Sample Challenge",
        maxValue: 100,
        currentValue: 65,
        endDate: new Date(Date.now() + 86400000), // Tomorrow
        is_active: true,
        created_at: new Date().toISOString(),
        user_id: "sample"
      };
  
  // Process template with variables
  useEffect(() => {
    try {
      // Calculate progress percentage
      const progressPercent = Math.min(100, Math.round((sampleChallenge.currentValue / sampleChallenge.maxValue) * 100));
      
      // Calculate time left
      let timeLeft = '';
      if (sampleChallenge.endDate) {
        const timeRemaining = new Date(sampleChallenge.endDate).getTime() - Date.now();
        if (timeRemaining > 0) {
          const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          timeLeft = `${days}d ${hours}h`;
        } else {
          timeLeft = 'Expired';
        }
      }
      
      // Replace variables in template
      let processed = htmlTemplate
        .replace(/{{title}}/g, sampleChallenge.title)
        .replace(/{{currentValue}}/g, sampleChallenge.currentValue.toString())
        .replace(/{{maxValue}}/g, sampleChallenge.maxValue.toString())
        .replace(/{{progressPercent}}/g, progressPercent.toString())
        .replace(/{{hasEndDate}}/g, sampleChallenge.endDate ? 'true' : 'false')
        .replace(/{{timeLeft}}/g, timeLeft);
      
      setPreviewHtml(processed);
    } catch (error) {
      console.error('Error processing template:', error);
      setPreviewHtml('<div class="error">Error in template</div>');
    }
  }, [htmlTemplate, sampleChallenge]);
  
  // Style for the preview frame
  const frameStyle = {
    position: 'relative',
    width: '100%',
    height: '400px',
    backgroundColor: '#333',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23444\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/svg%3E")',
    overflow: 'hidden',
    border: '1px solid #666',
    borderRadius: '4px',
  };
  
  // Style for the overlay container
  const overlayStyle = {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${size.width}px`,
    maxWidth: '90%',
    transform: 'translate(-50%, -50%)',
  };
  
  return (
    <div>
      <div style={frameStyle}>
        <div style={overlayStyle}>
          <style>{cssCode}</style>
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
      </div>
      <div className="mt-4 text-center text-zinc-400 text-xs">
        <p>This is a preview of how your overlay will appear on stream</p>
        <p>Position: X: {position.x}%, Y: {position.y}%</p>
      </div>
    </div>
  );
}
