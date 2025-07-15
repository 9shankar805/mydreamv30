import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, VolumeX, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SoundTestButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const playNotificationSound = () => {
    try {
      setIsPlaying(true);
      
      // Create audio context for better mobile support
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple notification beep
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      setTimeout(() => {
        setIsPlaying(false);
        toast({
          title: "Sound Test",
          description: "Notification sound played successfully!",
        });
      }, 500);
      
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsPlaying(false);
      
      // Fallback: try to play a simple beep
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBDWN1fLNfSwEJXXGDj8FJAIGAAAAAAATbBzEAAAAAElFTkSuQmCC');
        audio.play();
      } catch (fallbackError) {
        toast({
          title: "Sound Test Failed",
          description: "Could not play notification sound",
          variant: "destructive"
        });
      }
    }
  };

  const testVibration = () => {
    if ('vibrate' in navigator) {
      // Test vibration pattern: short-long-short
      navigator.vibrate([200, 100, 200]);
      toast({
        title: "Vibration Test",
        description: "Vibration pattern sent to device",
      });
    } else {
      toast({
        title: "Vibration Not Supported",
        description: "This device doesn't support vibration",
        variant: "destructive"
      });
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-green-600" />
          <CardTitle className="text-green-800">Notification Sound & Vibration Test</CardTitle>
        </div>
        <CardDescription className="text-green-700">
          Test notification sounds and vibrations for mobile devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button 
            onClick={playNotificationSound}
            disabled={isPlaying}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {isPlaying ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                Playing...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Test Sound
              </>
            )}
          </Button>

          <Button 
            onClick={testVibration}
            size="sm"
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            📳 Test Vibration
          </Button>
        </div>

        <div className="text-xs text-green-600 space-y-1">
          <p>• Sound: Tests notification audio for browsers</p>
          <p>• Vibration: Tests haptic feedback on mobile devices</p>
        </div>
      </CardContent>
    </Card>
  );
}