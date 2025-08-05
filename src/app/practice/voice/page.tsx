'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { EnhancedVoicePractice } from '@/components/ui/EnhancedVoicePractice';
import { BrowserCompatibilityChecker } from '@/components/ui/BrowserCompatibilityChecker';
import { voiceScenarios } from '@/lib/mockData';
import { VoiceScenario, VoiceRecognitionResult, VoiceAccuracyResult } from '@/types';
import { speechRecognitionService } from '@/services/speechRecognition';

export default function VoicePracticePage() {
  const router = useRouter();
  const { isAuthenticated, voiceSettings, startVoiceSession, finishVoiceSession } = useAppStore();
  
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCompatibilityChecker, setShowCompatibilityChecker] = useState(false);
  const [currentVoiceResult, setCurrentVoiceResult] = useState<VoiceRecognitionResult | null>(null);
  const [currentAccuracy, setCurrentAccuracy] = useState<VoiceAccuracyResult | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Check browser compatibility on mount
  useEffect(() => {
    if (!speechRecognitionService.isAPISupported()) {
      setShowCompatibilityChecker(true);
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const currentScenario = voiceScenarios[currentScenarioIndex];

  const handleVoiceResult = (result: VoiceRecognitionResult) => {
    setCurrentVoiceResult(result);
    console.log('Voice recognition result:', result);
  };

  const handleAccuracyScore = (accuracy: VoiceAccuracyResult) => {
    setCurrentAccuracy(accuracy);
    console.log('Accuracy score:', accuracy);
    
    // Create and start voice session if not already started
    const session = {
      id: `session-${Date.now()}`,
      scenarioId: currentScenario.id,
      userSpeech: currentVoiceResult?.transcript || '',
      accuracy,
      timestamp: new Date(),
      duration: 0 // Will be updated by the component
    };
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleSkip = () => {
    // Reset current state
    setCurrentVoiceResult(null);
    setCurrentAccuracy(null);
    setShowAnswer(false);
    
    // Move to next scenario
    if (currentScenarioIndex < voiceScenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
    } else {
      // End of scenarios - return to practice menu
      router.push('/practice');
    }
  };

  const handleNextScenario = () => {
    handleSkip();
  };

  const handleExit = () => {
    // Navigate back to practice page
    router.push('/practice');
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen">
        {/* Browser compatibility checker */}
        {showCompatibilityChecker && (
          <div className="p-4">
            <BrowserCompatibilityChecker
              onDismiss={() => setShowCompatibilityChecker(false)}
              showOnlyIfUnsupported={true}
            />
          </div>
        )}
        
        {/* Main voice practice interface */}
        <div className="min-h-screen flex items-center justify-center">
          <EnhancedVoicePractice
            scenario={currentScenario}
            onShowAnswer={handleShowAnswer}
            onSkip={handleSkip}
            showAnswer={showAnswer}
            feedback={currentAccuracy || undefined}
            onVoiceResult={handleVoiceResult}
            onAccuracyScore={handleAccuracyScore}
            voiceSettings={voiceSettings}
            supportsBrowserSpeech={speechRecognitionService.isAPISupported()}
            onExit={handleExit}
          />
        </div>
      </div>
    </Layout>
  );
}