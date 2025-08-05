'use client';

import { useRouter } from 'next/navigation';
import { 
  ChevronLeftIcon, 
  XMarkIcon, 
  MicrophoneIcon 
} from '@heroicons/react/24/outline';
import { cn, formatTime } from '@/lib/utils';
import { VoicePracticeProps } from '@/types';
import { Button } from './Button';
import { Card, CardContent } from './Card';

const VoicePractice: React.FC<VoicePracticeProps> = ({
  scenario,
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onShowAnswer,
  onSkip,
  showAnswer,
  feedback,
}) => {
  const router = useRouter();
  // Recording state
  if (isRecording) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
        {/* Header with X to cancel */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onStopRecording}
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <div className="w-4 h-4 bg-error-600 rounded-full"></div>
          </div>
          <p className="text-base font-medium text-gray-700 mb-1">Recording...</p>
          <p className="text-lg font-bold text-error-600">
            {formatTime(recordingTime || 0)}
          </p>
        </div>

        {/* Stop Recording Button */}
        <Button 
          variant="error" 
          className="w-full mb-4"
          onClick={onStopRecording}
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

  // Answer revealed state
  if (showAnswer) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back"
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

        {/* Answer */}
        <Card className="bg-success-50 border-success-200 mb-6" padding="lg">
          <h3 className="text-lg font-semibold text-success-900 mb-3">Correct Answer:</h3>
          <p className="text-base font-medium text-success-800">
            {scenario.expectedAnswer}
          </p>
        </Card>

        {/* Practice Button */}
        <Button className="w-full mb-4" onClick={onStartRecording}>
          Practice This
        </Button>

        {/* Next Button */}
        <Button 
          variant="secondary" 
          className="w-full"
        >
          Next Scenario
        </Button>
      </div>
    );
  }

  // Default state (Ready to Record)
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Voice Practice</h1>
        <div className="w-10"></div>
      </div>

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
          onClick={onStartRecording}
          className="w-24 h-24 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center mb-4 transition-colors duration-200 cursor-pointer focus:ring-4 focus:ring-primary-200 focus:outline-none"
          aria-label="Start recording"
        >
          <MicrophoneIcon className="w-12 h-12 text-primary-700" />
        </button>
        <p className="text-base font-medium text-gray-700">Tap to Record</p>
      </div>

      {/* Action Button */}
      <Button className="w-full mb-4" onClick={onStartRecording}>
        Start Recording
      </Button>

      {/* Help Option */}
      <button
        onClick={onShowAnswer}
        className="w-full text-primary-700 hover:text-primary-800 font-medium py-2 transition-colors duration-200"
      >
        Need help? Show me the answer
      </button>
    </div>
  );
};

export { VoicePractice };