'use client';

import { useAppStore } from '@/store/useAppStore';
import { useOnboardingTutorial } from '@/components/ui/OnboardingTutorial';
import { useEffect, useState } from 'react';

export function TutorialDebug() {
  const { user, userSettings, updateNotificationSettings } = useAppStore();
  const { showTutorial } = useOnboardingTutorial();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const debugInfo = {
    timestamp: new Date().toISOString(),
    showTutorial,
    user: user ? { id: user.id, name: user.name } : null,
    userSettings: userSettings ? {
      notifications: {
        tutorialCompleted: userSettings.notifications?.tutorialCompleted,
        tutorialSkipped: userSettings.notifications?.tutorialSkipped,
      }
    } : null,
    localStorage: typeof window !== 'undefined' ? 
      localStorage.getItem('police-training-app') : null
  };

  const clearTutorialState = () => {
    updateNotificationSettings({ 
      tutorialCompleted: false, 
      tutorialSkipped: false 
    });
  };

  const completeTutorial = () => {
    updateNotificationSettings({ tutorialCompleted: true });
  };

  return (
    <div className="fixed right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-md z-[60] opacity-90 mobile-above-nav fixed-above-nav">
      <h3 className="font-bold mb-2">Tutorial Debug Info</h3>
      <pre className="whitespace-pre-wrap text-xs mb-2">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <div className="flex gap-2">
        <button 
          onClick={clearTutorialState}
          className="bg-red-600 px-2 py-1 rounded text-xs"
        >
          Reset Tutorial
        </button>
        <button 
          onClick={completeTutorial}
          className="bg-green-600 px-2 py-1 rounded text-xs"
        >
          Complete Tutorial
        </button>
      </div>
    </div>
  );
}