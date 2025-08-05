'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeftIcon, 
  XMarkIcon, 
  MicrophoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn, formatTime } from '@/lib/utils';
import { EnhancedVoicePracticeProps, VoiceRecognitionResult, VoiceAccuracyResult } from '@/types';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { speechRecognitionService } from '@/services/speechRecognition';
import { speechAccuracyService } from '@/services/speechAccuracy';
import { useAppStore } from '@/store/useAppStore';

const EnhancedVoicePractice: React.FC<EnhancedVoicePracticeProps> = ({
  scenario,
  isRecording: externalIsRecording,
  recordingTime: externalRecordingTime,
  onStartRecording: externalOnStartRecording,
  onStopRecording: externalOnStopRecording,
  onShowAnswer,
  onSkip,
  showAnswer,
  feedback,
  onVoiceResult,
  onAccuracyScore,
  voiceSettings,
  supportsBrowserSpeech = true,
  onExit,
}) => {
  const { voiceSettings: storeVoiceSettings, updateVoiceSettings, startVoiceSession, finishVoiceSession } = useAppStore();
  const activeVoiceSettings = voiceSettings || storeVoiceSettings;

  // Local state
  const [isListening, setIsListening] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<VoiceRecognitionResult | null>(null);
  const [accuracyResult, setAccuracyResult] = useState<VoiceAccuracyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBrowserCompatibility, setShowBrowserCompatibility] = useState(false);

  // Audio recorder hook
  const audioRecorder = useAudioRecorder({
    maxDuration: activeVoiceSettings.maxRecordingTime,
    autoStop: activeVoiceSettings.autoStop,
    onMaxDurationReached: () => {
      handleStopRecording();
    }
  });

  // Check browser compatibility on mount
  useEffect(() => {
    if (!speechRecognitionService.isAPISupported()) {
      setShowBrowserCompatibility(true);
    }
  }, []);

  // Handle voice recognition result
  const handleVoiceResult = useCallback((result: VoiceRecognitionResult) => {
    setRecognitionResult(result);
    onVoiceResult?.(result);

    // Calculate accuracy if we have a final result
    if (result.isFinal && result.transcript.trim()) {
      const accuracy = speechAccuracyService.calculateAccuracy(
        result.transcript,
        scenario.expectedAnswer,
        {
          category: scenario.category === 'phonetic' ? 'phonetic' : 'codes',
          allowPartialCredit: true,
          strictMode: false
        }
      );

      setAccuracyResult(accuracy);
      onAccuracyScore?.(accuracy);

      // Create voice practice session
      const session = {
        id: `session-${Date.now()}`,
        scenarioId: scenario.id,
        userSpeech: result.transcript,
        accuracy,
        timestamp: new Date(),
        duration: audioRecorder.duration
      };

      finishVoiceSession(accuracy);
    }
  }, [scenario, onVoiceResult, onAccuracyScore, audioRecorder.duration, finishVoiceSession]);

  // Start recording function
  const handleStartRecording = useCallback(async () => {
    setError(null);
    setRecognitionResult(null);
    setAccuracyResult(null);

    // Check browser support
    if (!speechRecognitionService.isAPISupported()) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    // Request microphone permission
    const hasPermission = await speechRecognitionService.requestMicrophonePermission();
    if (!hasPermission) {
      setError('Microphone permission is required for voice practice.');
      return;
    }

    // Start audio recording
    const audioStarted = await audioRecorder.startRecording();
    if (!audioStarted) {
      setError(audioRecorder.error || 'Failed to start audio recording');
      return;
    }

    // Start speech recognition
    setIsListening(true);
    
    try {
      const result = await speechRecognitionService.startListening({
        language: activeVoiceSettings.language,
        continuous: false,
        interimResults: true,
        maxAlternatives: 1
      });

      handleVoiceResult(result);
    } catch (error) {
      console.error('Speech recognition error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Speech recognition failed. Please try again.');
      }
    } finally {
      setIsListening(false);
    }

    // Call external handler if provided
    externalOnStartRecording?.();
  }, [
    activeVoiceSettings,
    audioRecorder,
    externalOnStartRecording,
    handleVoiceResult
  ]);

  // Stop recording function
  const handleStopRecording = useCallback(() => {
    speechRecognitionService.stopListening();
    audioRecorder.stopRecording();
    setIsListening(false);
    externalOnStopRecording?.();
  }, [audioRecorder, externalOnStopRecording]);

  // Determine if we're using external or internal recording state
  const isRecording = externalIsRecording !== undefined ? externalIsRecording : (audioRecorder.isRecording || isListening);
  const recordingTime = externalRecordingTime !== undefined ? externalRecordingTime : audioRecorder.duration;

  // Browser compatibility warning
  if (showBrowserCompatibility && !speechRecognitionService.isAPISupported()) {
    const compatibility = speechRecognitionService.getBrowserCompatibility();
    
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onExit || (() => setShowBrowserCompatibility(false))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Exit practice"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Voice Practice</h1>
          <div className="w-10"></div>
        </div>

        <Card className="bg-warning-50 border-warning-200 mb-6" padding="lg">
          <div className="flex items-center mb-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-warning-600 mr-2" />
            <h3 className="text-lg font-semibold text-warning-900">Browser Compatibility</h3>
          </div>
          <p className="text-warning-800 mb-4">
            Voice recognition is not fully supported in your current browser ({compatibility.engine}).
          </p>
          <ul className="list-disc list-inside text-warning-700 space-y-1">
            {compatibility.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </Card>

        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => setShowBrowserCompatibility(false)}
        >
          Continue with Limited Features
        </Button>
      </div>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
        {/* Header with X to cancel */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleStopRecording}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Voice Practice</h1>
          <div className="w-10"></div>
        </div>

        {/* Scenario (Compressed) */}
        <Card className="bg-primary-50 border-primary-200 mb-6" padding="sm">
          <p className="text-sm text-primary-800 mb-2">{scenario.instruction}</p>
          <div className="bg-white rounded-lg p-3 border border-primary-300">
            <p className="text-lg font-bold text-center text-gray-900">
              {scenario.targetText}
            </p>
          </div>
        </Card>

        {/* Recording Indicator */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <div className="w-4 h-4 bg-error-600 rounded-full"></div>
          </div>
          <p className="text-base font-medium text-gray-700 mb-1">
            {isListening ? 'Listening...' : 'Recording...'}
          </p>
          <p className="text-lg font-bold text-error-600">
            {formatTime(recordingTime)}
          </p>
          
          {/* Volume indicator */}
          {audioRecorder.volume > 0 && (
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-success-500 transition-all duration-100"
                style={{ width: `${Math.min(100, audioRecorder.volume)}%` }}
              />
            </div>
          )}
        </div>

        {/* Real-time recognition display */}
        {recognitionResult && recognitionResult.transcript && (
          <Card className="bg-blue-50 border-blue-200 mb-4" padding="sm">
            <p className="text-sm text-blue-800 mb-1">
              {recognitionResult.isFinal ? 'Final result:' : 'Listening...'}
            </p>
            <p className="text-base font-medium text-blue-900">
              "{recognitionResult.transcript}"
            </p>
          </Card>
        )}

        {/* Stop Recording Button */}
        <Button 
          variant="error" 
          className="w-full mb-4"
          onClick={handleStopRecording}
        >
          Stop Recording
        </Button>

        {/* Skip Option */}
        <button
          onClick={onSkip}
          className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
        >
          Skip
        </button>
      </div>
    );
  }

  // Results/Feedback state
  if (accuracyResult || feedback) {
    const displayFeedback = feedback || accuracyResult;
    
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onExit}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Exit practice"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Voice Practice</h1>
          <div className="w-10"></div>
        </div>

        {/* Scenario */}
        <Card className="bg-primary-50 border-primary-200 mb-6" padding="sm">
          <p className="text-sm text-primary-800 mb-2">{scenario.instruction}</p>
          <div className="bg-white rounded-lg p-3 border border-primary-300">
            <p className="text-lg font-bold text-center text-gray-900">
              {scenario.targetText}
            </p>
          </div>
        </Card>

        {/* User's Speech */}
        {recognitionResult && (
          <Card className="bg-gray-50 border-gray-200 mb-4" padding="sm">
            <p className="text-sm text-gray-600 mb-1">You said:</p>
            <p className="text-base font-medium text-gray-900">
              "{recognitionResult.transcript}"
            </p>
          </Card>
        )}

        {/* Accuracy Score */}
        {displayFeedback && (
          <Card 
            className={cn(
              "mb-6",
              displayFeedback.category === 'excellent' && "bg-success-50 border-success-200",
              displayFeedback.category === 'good' && "bg-success-50 border-success-200",
              displayFeedback.category === 'needs-improvement' && "bg-warning-50 border-warning-200",
              displayFeedback.category === 'poor' && "bg-error-50 border-error-200"
            )} 
            padding="lg"
          >
            <div className="flex items-center mb-3">
              {displayFeedback.category === 'excellent' || displayFeedback.category === 'good' ? (
                <CheckCircleIcon className="w-6 h-6 text-success-600 mr-2" />
              ) : (
                <InformationCircleIcon className="w-6 h-6 text-warning-600 mr-2" />
              )}
              <h3 className={cn(
                "text-lg font-semibold",
                (displayFeedback.category === 'excellent' || displayFeedback.category === 'good') && "text-success-900",
                displayFeedback.category === 'needs-improvement' && "text-warning-900",
                displayFeedback.category === 'poor' && "text-error-900"
              )}>
                Accuracy: {displayFeedback.score}%
              </h3>
            </div>
            
            {/* Suggestions */}
            {displayFeedback.suggestions.length > 0 && (
              <div className="space-y-2">
                {displayFeedback.suggestions.map((suggestion, index) => (
                  <p key={index} className={cn(
                    "text-sm",
                    (displayFeedback.category === 'excellent' || displayFeedback.category === 'good') && "text-success-800",
                    displayFeedback.category === 'needs-improvement' && "text-warning-800",
                    displayFeedback.category === 'poor' && "text-error-800"
                  )}>
                    • {suggestion}
                  </p>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Expected Answer */}
        <Card className="bg-info-50 border-info-200 mb-6" padding="lg">
          <h3 className="text-lg font-semibold text-info-900 mb-3">Expected Answer:</h3>
          <p className="text-base font-medium text-info-800">
            {scenario.expectedAnswer}
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" onClick={handleStartRecording}>
            Practice Again
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              setRecognitionResult(null);
              setAccuracyResult(null);
              setError(null);
              onSkip();
            }}
          >
            Next Scenario
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onExit}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Exit practice"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Voice Practice</h1>
          <div className="w-10"></div>
        </div>

        <Card className="bg-error-50 border-error-200 mb-6" padding="lg">
          <div className="flex items-center mb-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-error-600 mr-2" />
            <h3 className="text-lg font-semibold text-error-900">Error</h3>
          </div>
          <p className="text-error-800">{error}</p>
        </Card>

        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => {
              setError(null);
              handleStartRecording();
            }}
          >
            Try Again
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={onShowAnswer}
          >
            Show Answer Instead
          </Button>
        </div>
      </div>
    );
  }

  // Default state (Ready to Record)
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onExit}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Exit practice"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Voice Practice</h1>
        <div className="w-10"></div>
      </div>

      {/* Browser support indicator */}
      {speechRecognitionService.isAPISupported() && (
        <Card className="bg-success-50 border-success-200 mb-4" padding="sm">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-success-600 mr-2" />
            <p className="text-sm text-success-800">Voice recognition ready</p>
          </div>
        </Card>
      )}

      {/* Scenario Card */}
      <Card className="bg-primary-50 border-primary-200 mb-8" padding="lg">
        <h3 className="text-lg font-semibold text-primary-900 mb-3">Scenario</h3>
        <p className="text-base text-primary-800 mb-4">{scenario.instruction}</p>
        <div className="bg-white rounded-lg p-4 border border-primary-300">
          <p className="text-xl font-bold text-center text-gray-900">
            {scenario.targetText}
          </p>
        </div>
      </Card>

      {/* Microphone Interface */}
      <div className="flex flex-col items-center mb-8">
        <button
          onClick={handleStartRecording}
          disabled={!speechRecognitionService.isAPISupported()}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-colors duration-200 cursor-pointer focus:ring-4 focus:outline-none",
            speechRecognitionService.isAPISupported() 
              ? "bg-primary-100 hover:bg-primary-200 focus:ring-primary-200" 
              : "bg-gray-100 cursor-not-allowed",
            !speechRecognitionService.isAPISupported() && "opacity-50"
          )}
          aria-label="Start recording"
        >
          <MicrophoneIcon className={cn(
            "w-12 h-12",
            speechRecognitionService.isAPISupported() ? "text-primary-700" : "text-gray-400"
          )} />
        </button>
        <p className="text-base font-medium text-gray-700">
          {speechRecognitionService.isAPISupported() ? 'Tap to Record' : 'Voice not supported'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full" 
          onClick={handleStartRecording}
          disabled={!speechRecognitionService.isAPISupported()}
        >
          Start Recording
        </Button>

        <button
          onClick={onShowAnswer}
          className="w-full text-primary-700 hover:text-primary-800 font-medium py-2 transition-colors duration-200"
        >
          Need help? Show me the answer
        </button>
      </div>
    </div>
  );
};

export { EnhancedVoicePractice };