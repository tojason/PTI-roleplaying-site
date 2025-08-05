'use client';

import { useState } from 'react';
import { OnboardingTutorial } from './OnboardingTutorial';
import { Button } from './Button';
import { useAppStore } from '@/store/useAppStore';

/**
 * Demo component for testing the onboarding tutorial
 * Remove this in production or guard behind development environment
 */
export function TutorialDemo() {
  const [showTutorial, setShowTutorial] = useState(false);
  const { updateNotificationSettings } = useAppStore();

  const handleComplete = () => {
    setShowTutorial(false);
    updateNotificationSettings({ tutorialCompleted: true });
    console.log('Tutorial completed!');
  };

  const handleSkip = () => {
    setShowTutorial(false);
    updateNotificationSettings({ tutorialSkipped: true });
    console.log('Tutorial skipped!');
  };

  const resetTutorial = () => {
    updateNotificationSettings({ 
      tutorialCompleted: false, 
      tutorialSkipped: false 
    });
    console.log('Tutorial reset - will show on next dashboard visit');
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 space-y-2 sm:bottom-4" style={{ zIndex: 60 }}>
      <Button
        onClick={() => setShowTutorial(true)}
        size="sm"
        className="block w-full text-xs min-h-[44px] touch-manipulation active:scale-95 transition-transform"
      >
        🎯 Demo Tutorial
      </Button>
      <Button
        onClick={resetTutorial}
        variant="secondary"
        size="sm"
        className="block w-full text-xs min-h-[44px] touch-manipulation active:scale-95 transition-transform"
      >
        🔄 Reset Tutorial
      </Button>

      <OnboardingTutorial
        isOpen={showTutorial}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}