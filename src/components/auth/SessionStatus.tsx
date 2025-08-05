'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSessionManager, SessionInfo, formatTimeUntilExpiry } from '@/lib/session-utils';
import { ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SessionStatusProps {
  showDetails?: boolean;
  className?: string;
  onSessionExpiring?: () => void;
}

export function SessionStatus({ 
  showDetails = false, 
  className = '',
  onSessionExpiring 
}: SessionStatusProps) {
  const { data: session } = useSession();
  const { getSessionInfo, startMonitoring, stopMonitoring } = useSessionManager();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!session) return;

    const updateSessionInfo = async () => {
      const info = await getSessionInfo();
      setSessionInfo(info);
      
      // Check if we should show expiry warning
      if (info.timeUntilExpiry) {
        const minutesLeft = Math.floor(info.timeUntilExpiry / (1000 * 60));
        const shouldWarn = info.isRemembered ? minutesLeft <= 24 * 60 : minutesLeft <= 5;
        
        if (shouldWarn && !showWarning) {
          setShowWarning(true);
          onSessionExpiring?.();
        } else if (!shouldWarn && showWarning) {
          setShowWarning(false);
        }
      }
    };

    // Initial load
    updateSessionInfo();

    // Start monitoring
    startMonitoring(updateSessionInfo);

    return () => {
      stopMonitoring(updateSessionInfo);
    };
  }, [session, startMonitoring, stopMonitoring, onSessionExpiring, showWarning]);

  if (!session || !sessionInfo?.isValid) {
    return null;
  }

  if (!showDetails && !sessionInfo.isRemembered && !showWarning) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {/* Remember Me Status */}
      {sessionInfo.isRemembered && (
        <div className="flex items-center space-x-2 text-xs">
          <ShieldCheckIcon className="w-4 h-4 text-success-600" />
          <span className="text-success-700 font-medium">
            Session remembered for 30 days
          </span>
        </div>
      )}

      {/* Session Expiry Warning */}
      {showWarning && sessionInfo.timeUntilExpiry && (
        <div className="flex items-center space-x-2 text-xs bg-warning-50 border border-warning-200 rounded-lg p-2 mt-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-warning-600 flex-shrink-0" />
          <div>
            <p className="text-warning-800 font-medium">Session expiring soon</p>
            <p className="text-warning-700">
              {formatTimeUntilExpiry(sessionInfo.timeUntilExpiry)} remaining
            </p>
          </div>
        </div>
      )}

      {/* Detailed Session Info */}
      {showDetails && sessionInfo.expiresAt && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4" />
            <span>
              Session expires: {sessionInfo.expiresAt.toLocaleString()}
            </span>
          </div>
          {sessionInfo.timeUntilExpiry && (
            <div className="mt-1 ml-6">
              Time remaining: {formatTimeUntilExpiry(sessionInfo.timeUntilExpiry)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SessionStatus;