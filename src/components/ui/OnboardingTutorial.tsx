'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  targetElement?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Police Training',
    description: 'Master essential law enforcement communication skills with interactive practice sessions designed for real-world scenarios.',
    icon: ShieldCheckIcon,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Your Command Center',
    description: 'Track your progress, view achievements, and see personalized practice recommendations all in one place.',
    icon: ChartBarIcon,
    targetElement: '[data-tutorial="dashboard-overview"]',
    position: 'center'
  },
  {
    id: 'practice-modes',
    title: 'Practice Modes',
    description: 'Choose from 10-codes, phonetic alphabet, or mixed practice. Each mode adapts to your skill level.',
    icon: AcademicCapIcon,
    targetElement: '[data-tutorial="practice-modes"]',
    position: 'top'
  },
  {
    id: 'voice-practice',
    title: 'Voice Recognition Training',
    description: 'Practice radio communication with real-time voice recognition feedback to improve clarity and accuracy.',
    icon: MicrophoneIcon,
    targetElement: '[data-tutorial="voice-practice"]',
    position: 'center'
  },
  {
    id: 'progress-tracking',
    title: 'Track Your Progress',
    description: 'Build streaks, unlock achievements, and monitor your improvement over time.',
    icon: FireIcon,
    targetElement: '[data-tutorial="progress-streak"]',
    position: 'bottom'
  },
  {
    id: 'completion',
    title: 'Ready to Begin!',
    description: 'You\'re all set to start training. Remember: consistent practice makes perfect communication.',
    icon: TrophyIcon,
    position: 'center'
  }
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTutorial({ isOpen, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const IconComponent = step.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-50 flex items-center justify-center"
          >
            <Card className="w-full max-w-md mx-auto bg-white shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-primary-600">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </div>
                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <motion.div
                    className="bg-primary-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  {/* Icon */}
                  <motion.div
                    key={step.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    key={`title-${step.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-gray-900 mb-2"
                  >
                    {step.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    key={`desc-${step.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 leading-relaxed"
                  >
                    {step.description}
                  </motion.p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {currentStep > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePrevious}
                        className="flex items-center"
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSkip}
                    >
                      Skip Tutorial
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex items-center"
                    >
                      {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                      {currentStep < tutorialSteps.length - 1 && (
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                  {tutorialSteps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep 
                          ? 'bg-primary-600' 
                          : index < currentStep 
                            ? 'bg-primary-300' 
                            : 'bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setCurrentStep(index)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Highlight Overlay for Targeted Elements */}
          {step.targetElement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-40"
              style={{
                background: 'radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), transparent 120px, rgba(0,0,0,0.3) 200px)'
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to manage tutorial state
export function useOnboardingTutorial() {
  const { user, userSettings, updateNotificationSettings } = useAppStore();
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCheckedState, setHasCheckedState] = useState(false);

  useEffect(() => {
    console.log('🎯 Tutorial Hook Effect:', { 
      user: user ? user.id : null, 
      userSettings: userSettings ? 'exists' : 'null',
      notifications: userSettings?.notifications,
      tutorialCompleted: userSettings?.notifications?.tutorialCompleted,
      tutorialSkipped: userSettings?.notifications?.tutorialSkipped,
      hasCheckedState
    });

    // Only proceed if prerequisites are met
    if (!user || !userSettings || !userSettings.notifications) {
      console.log('🎯 Tutorial Blocked - Missing prerequisites');
      return;
    }

    const { tutorialCompleted, tutorialSkipped } = userSettings.notifications;
    
    // 🛡️ FAILSAFE: Validate state consistency
    if (tutorialCompleted === undefined && tutorialSkipped === undefined && !hasCheckedState) {
      console.warn('🛡️ Tutorial state is undefined - initializing with defaults');
      updateNotificationSettings({ 
        tutorialCompleted: false, 
        tutorialSkipped: false 
      });
      setHasCheckedState(true);
      return;
    }

    // 🛡️ FAILSAFE: Handle conflicting states
    if (tutorialCompleted && tutorialSkipped) {
      console.warn('🛡️ Tutorial has conflicting states - resetting to completed');
      updateNotificationSettings({ 
        tutorialCompleted: true, 
        tutorialSkipped: false 
      });
      return;
    }

    console.log('🎯 Tutorial Check:', { tutorialCompleted, tutorialSkipped });
    
    // Show tutorial for new users who haven't completed or skipped it
    if (!tutorialCompleted && !tutorialSkipped) {
      console.log('🎯 Tutorial Will Show in 1 second');
      // Small delay to let dashboard load
      const timer = setTimeout(() => {
        console.log('🎯 Tutorial Showing Now');
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('🎯 Tutorial Blocked - Already completed or skipped');
    }
    
    setHasCheckedState(true);
  }, [user, userSettings, hasCheckedState, updateNotificationSettings]);

  const handleComplete = () => {
    console.log('🎯 Tutorial Complete Called');
    setShowTutorial(false);
    // Mark tutorial as completed in user settings
    updateNotificationSettings({ tutorialCompleted: true });
    console.log('🎯 Tutorial Marked as Completed');
  };

  const handleSkip = () => {
    console.log('🎯 Tutorial Skip Called');
    setShowTutorial(false);
    // Mark tutorial as skipped but not completed
    updateNotificationSettings({ tutorialSkipped: true });
    console.log('🎯 Tutorial Marked as Skipped');
  };

  return {
    showTutorial,
    handleComplete,
    handleSkip,
    startTutorial: () => setShowTutorial(true)
  };
}