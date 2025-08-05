'use client';

import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Card } from './Card';
import { Button } from './Button';
import { speechRecognitionService } from '@/services/speechRecognition';

export interface BrowserCompatibilityCheckerProps {
  onDismiss?: () => void;
  showOnlyIfUnsupported?: boolean;
  className?: string;
}

export const BrowserCompatibilityChecker: React.FC<BrowserCompatibilityCheckerProps> = ({
  onDismiss,
  showOnlyIfUnsupported = true,
  className = ''
}) => {
  const [compatibility, setCompatibility] = useState<{
    supported: boolean;
    engine: string;
    recommendations: string[];
  } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Get browser compatibility info
    const compatInfo = speechRecognitionService.getBrowserCompatibility();
    setCompatibility(compatInfo);

    // Check microphone permission status
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          setPermissionStatus(permissionStatus.state as any);
          
          permissionStatus.onchange = () => {
            setPermissionStatus(permissionStatus.state as any);
          };
        })
        .catch(() => {
          setPermissionStatus('unknown');
        });
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
    } catch (error) {
      setPermissionStatus('denied');
    }
  };

  // Don't show if dismissed or if we should only show for unsupported and it's supported
  if (isDismissed || !compatibility || (showOnlyIfUnsupported && compatibility.supported && permissionStatus !== 'denied')) {
    return null;
  }

  const getStatusIcon = () => {
    if (compatibility.supported && permissionStatus === 'granted') {
      return <CheckCircleIcon className="w-6 h-6 text-success-600" />;
    } else if (!compatibility.supported || permissionStatus === 'denied') {
      return <ExclamationTriangleIcon className="w-6 h-6 text-error-600" />;
    } else {
      return <InformationCircleIcon className="w-6 h-6 text-warning-600" />;
    }
  };

  const getStatusColor = () => {
    if (compatibility.supported && permissionStatus === 'granted') {
      return 'success';
    } else if (!compatibility.supported || permissionStatus === 'denied') {
      return 'error';
    } else {
      return 'warning';
    }
  };

  const statusColor = getStatusColor();

  return (
    <Card 
      className={`
        ${statusColor === 'success' ? 'bg-success-50 border-success-200' : ''}
        ${statusColor === 'warning' ? 'bg-warning-50 border-warning-200' : ''}
        ${statusColor === 'error' ? 'bg-error-50 border-error-200' : ''}
        ${className}
      `}
      padding="lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            {getStatusIcon()}
            <h3 className={`
              ml-2 text-lg font-semibold
              ${statusColor === 'success' ? 'text-success-900' : ''}
              ${statusColor === 'warning' ? 'text-warning-900' : ''}
              ${statusColor === 'error' ? 'text-error-900' : ''}
            `}>
              Voice Recognition Status
            </h3>
          </div>

          <div className="space-y-3">
            {/* Browser Support */}
            <div>
              <p className={`
                text-sm font-medium mb-1
                ${statusColor === 'success' ? 'text-success-800' : ''}
                ${statusColor === 'warning' ? 'text-warning-800' : ''}
                ${statusColor === 'error' ? 'text-error-800' : ''}
              `}>
                Browser: {compatibility.engine}
              </p>
              <p className={`
                text-sm
                ${statusColor === 'success' ? 'text-success-700' : ''}
                ${statusColor === 'warning' ? 'text-warning-700' : ''}
                ${statusColor === 'error' ? 'text-error-700' : ''}
              `}>
                {compatibility.supported ? '✓ Speech recognition supported' : '✗ Speech recognition not supported'}
              </p>
            </div>

            {/* Microphone Permission */}
            <div>
              <p className={`
                text-sm font-medium mb-1
                ${statusColor === 'success' ? 'text-success-800' : ''}
                ${statusColor === 'warning' ? 'text-warning-800' : ''}
                ${statusColor === 'error' ? 'text-error-800' : ''}
              `}>
                Microphone Permission
              </p>
              <p className={`
                text-sm
                ${statusColor === 'success' ? 'text-success-700' : ''}
                ${statusColor === 'warning' ? 'text-warning-700' : ''}
                ${statusColor === 'error' ? 'text-error-700' : ''}
              `}>
                {permissionStatus === 'granted' && '✓ Permission granted'}
                {permissionStatus === 'denied' && '✗ Permission denied'}
                {permissionStatus === 'prompt' && '? Permission required'}
                {permissionStatus === 'unknown' && '? Status unknown'}
              </p>
            </div>

            {/* Recommendations */}
            {compatibility.recommendations.length > 0 && (
              <div>
                <p className={`
                  text-sm font-medium mb-2
                  ${statusColor === 'success' ? 'text-success-800' : ''}
                  ${statusColor === 'warning' ? 'text-warning-800' : ''}
                  ${statusColor === 'error' ? 'text-error-800' : ''}
                `}>
                  Recommendations:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {compatibility.recommendations.map((rec, index) => (
                    <li key={index} className={`
                      text-sm
                      ${statusColor === 'success' ? 'text-success-700' : ''}
                      ${statusColor === 'warning' ? 'text-warning-700' : ''}
                      ${statusColor === 'error' ? 'text-error-700' : ''}
                    `}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {permissionStatus === 'prompt' || permissionStatus === 'denied' ? (
                <Button
                  size="sm"
                  onClick={requestMicrophonePermission}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {permissionStatus === 'denied' ? 'Retry Permission' : 'Allow Microphone'}
                </Button>
              ) : null}
              
              {onDismiss && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="ml-4 p-1 rounded-full hover:bg-black hover:bg-opacity-5 transition-colors duration-200"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
    </Card>
  );
};

export default BrowserCompatibilityChecker;