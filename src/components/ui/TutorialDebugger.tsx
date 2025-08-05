'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from './Button';
import { Card, CardContent } from './Card';

/**
 * Advanced tutorial debugging component
 * Shows real-time state and provides debugging tools
 */
export function TutorialDebugger() {
  const { user, userSettings, updateNotificationSettings } = useAppStore();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update debug info in real-time
    const interval = setInterval(() => {
      const localStorage = typeof window !== 'undefined' ? window.localStorage : null;
      const storedData = localStorage?.getItem('police-training-app');
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        user: {
          exists: !!user,
          id: user?.id,
          name: user?.name
        },
        userSettings: {
          exists: !!userSettings,
          notifications: !!userSettings?.notifications,
          tutorialCompleted: userSettings?.notifications?.tutorialCompleted,
          tutorialSkipped: userSettings?.notifications?.tutorialSkipped
        },
        localStorage: {
          exists: !!storedData,
          size: storedData?.length || 0,
          parseable: (() => {
            try {
              return storedData ? JSON.parse(storedData) : null;
            } catch {
              return 'PARSE_ERROR';
            }
          })()
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, userSettings]);

  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('police-training-app');
      sessionStorage.clear();
      console.log('🧹 Cleared all browser storage');
      window.location.reload();
    }
  };

  const handleCompleteTutorial = () => {
    console.log('🎯 Debug: Manually completing tutorial');
    updateNotificationSettings({ 
      tutorialCompleted: true,
      tutorialSkipped: false 
    });
  };

  const handleSkipTutorial = () => {
    console.log('🎯 Debug: Manually skipping tutorial');
    updateNotificationSettings({ 
      tutorialCompleted: false,
      tutorialSkipped: true 
    });
  };

  const handleResetTutorial = () => {
    console.log('🎯 Debug: Resetting tutorial state');
    updateNotificationSettings({ 
      tutorialCompleted: false,
      tutorialSkipped: false 
    });
  };

  const handleLogState = () => {
    console.group('🏪 Tutorial State Debug');
    console.log('User:', user);
    console.log('UserSettings:', userSettings);
    console.log('LocalStorage:', localStorage.getItem('police-training-app'));
    console.log('Debug Info:', debugInfo);
    console.groupEnd();
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 z-50 sm:bottom-4" style={{ zIndex: 60 }}>
      <Card className="bg-red-50 border-red-200 shadow-lg max-w-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-red-800">Tutorial Debug</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-red-600 hover:text-red-800 active:text-red-900 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 p-2 touch-manipulation"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>

          {/* Quick Status */}
          <div className="text-xs space-y-1 mb-3">
            <div className={`flex justify-between ${debugInfo.user?.exists ? 'text-green-700' : 'text-red-700'}`}>
              <span>User:</span>
              <span>{debugInfo.user?.exists ? '✅' : '❌'}</span>
            </div>
            <div className={`flex justify-between ${debugInfo.userSettings?.exists ? 'text-green-700' : 'text-red-700'}`}>
              <span>Settings:</span>
              <span>{debugInfo.userSettings?.exists ? '✅' : '❌'}</span>
            </div>
            <div className={`flex justify-between ${debugInfo.userSettings?.tutorialCompleted ? 'text-green-700' : 'text-orange-700'}`}>
              <span>Completed:</span>
              <span>{String(debugInfo.userSettings?.tutorialCompleted)}</span>
            </div>
            <div className={`flex justify-between ${debugInfo.userSettings?.tutorialSkipped ? 'text-yellow-700' : 'text-orange-700'}`}>
              <span>Skipped:</span>
              <span>{String(debugInfo.userSettings?.tutorialSkipped)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-1">
              <Button
                onClick={handleCompleteTutorial}
                size="sm"
                variant="secondary"
                className="text-xs py-1 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
              >
                ✅ Complete
              </Button>
              <Button
                onClick={handleSkipTutorial}
                size="sm"
                variant="secondary"
                className="text-xs py-1 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
              >
                ⏭️ Skip
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Button
                onClick={handleResetTutorial}
                size="sm"
                variant="secondary"
                className="text-xs py-1 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
              >
                🔄 Reset
              </Button>
              <Button
                onClick={handleLogState}
                size="sm" 
                variant="secondary"
                className="text-xs py-1 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
              >
                📋 Log
              </Button>
            </div>
            <Button
              onClick={handleClearStorage}
              size="sm"
              className="w-full text-xs py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
            >
              🧹 Clear Storage & Reload
            </Button>
          </div>

          {/* Extended Debug Info */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="text-xs text-red-700 space-y-1">
                <div><strong>Storage Size:</strong> {debugInfo.localStorage?.size || 0} chars</div>
                <div><strong>User ID:</strong> {debugInfo.user?.id || 'None'}</div>
                <div><strong>Last Update:</strong> {debugInfo.timestamp?.split('T')[1]?.split('.')[0]}</div>
                
                {/* Tutorial Logic Status */}
                <div className="mt-2 pt-2 border-t border-red-200">
                  <div><strong>Tutorial Should Show:</strong></div>
                  <div className="ml-2 text-xs">
                    {(() => {
                      const shouldShow = debugInfo.user?.exists && 
                                       debugInfo.userSettings?.exists &&
                                       !debugInfo.userSettings?.tutorialCompleted && 
                                       !debugInfo.userSettings?.tutorialSkipped;
                      return shouldShow ? '🔴 YES' : '🟢 NO';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}