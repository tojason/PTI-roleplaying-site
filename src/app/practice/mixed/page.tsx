'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { QuizCard } from '@/components/ui/QuizCard';
import { VoicePractice } from '@/components/ui/VoicePractice';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getQuestionsByCategory } from '@/lib/mockData';
import { shuffleArray, calculatePercentage } from '@/lib/utils';
import { voiceScenarios } from '@/lib/mockData';
import { QuizSession, QuizQuestion, VoiceScenario } from '@/types';
import { TrophyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MixedPracticeItem {
  id: string;
  type: 'quiz' | 'voice';
  data: QuizQuestion | VoiceScenario;
}

export default function MixedPracticePage() {
  const router = useRouter();
  const { isAuthenticated, currentQuiz, startQuiz, finishQuiz } = useAppStore();
  
  const [practiceItems, setPracticeItems] = useState<MixedPracticeItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [voiceSessionState, setVoiceSessionState] = useState<{
    isRecording: boolean;
    recordingTime: number;
    showAnswer: boolean;
    currentScenario: VoiceScenario | null;
  }>({
    isRecording: false,
    recordingTime: 0,
    showAnswer: false,
    currentScenario: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Create mixed practice session with quiz questions and voice scenarios
    const quizQuestions = shuffleArray(getQuestionsByCategory('mixed')).slice(0, 6);
    const voiceScenariosList = shuffleArray(voiceScenarios).slice(0, 4);
    
    const mixedItems: MixedPracticeItem[] = [
      ...quizQuestions.map(q => ({ id: q.id, type: 'quiz' as const, data: q })),
      ...voiceScenariosList.map(v => ({ id: v.id, type: 'voice' as const, data: v })),
    ];
    
    const shuffledItems = shuffleArray(mixedItems).slice(0, 8); // Total 8 items
    setPracticeItems(shuffledItems);
    
    const newQuiz: QuizSession = {
      id: Date.now().toString(),
      questions: quizQuestions,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      startTime: new Date(),
      category: 'mixed',
    };
    
    startQuiz(newQuiz);
  }, [isAuthenticated, router, startQuiz]);

  const currentItem = practiceItems[currentItemIndex];
  const progress = ((currentItemIndex + 1) / practiceItems.length) * 100;

  const handleQuizAnswerSelect = (optionId: string) => {
    if (showFeedback || currentItem?.type !== 'quiz') return;

    const question = currentItem.data as QuizQuestion;
    const newAnswers = {
      ...selectedAnswers,
      [question.id]: optionId,
    };
    setSelectedAnswers(newAnswers);
    
    // Show feedback after a brief delay
    setTimeout(() => {
      setShowFeedback(true);
    }, 300);
  };

  const handleNext = () => {
    if (currentItemIndex === practiceItems.length - 1) {
      // Mixed practice session completed
      const quizItems = practiceItems.filter(item => item.type === 'quiz');
      const correctAnswers = quizItems.filter(item => {
        const question = item.data as QuizQuestion;
        const selectedOption = selectedAnswers[question.id];
        return question.options.find(o => o.id === selectedOption)?.isCorrect;
      }).length;
      
      const finalScore = calculatePercentage(correctAnswers, quizItems.length);
      setScore(finalScore);
      
      const completedQuiz: QuizSession = {
        id: currentQuiz?.id || Date.now().toString(),
        questions: quizItems.map(item => item.data as QuizQuestion),
        currentQuestionIndex: quizItems.length,
        answers: selectedAnswers,
        score: finalScore,
        startTime: currentQuiz?.startTime || new Date(),
        endTime: new Date(),
        category: 'mixed',
      };
      
      finishQuiz(completedQuiz);
      setIsCompleted(true);
    } else {
      // Move to next item
      setCurrentItemIndex(prev => prev + 1);
      setShowFeedback(false);
      setVoiceSessionState({
        isRecording: false,
        recordingTime: 0,
        showAnswer: false,
        currentScenario: null,
      });
    }
  };

  const handleVoiceStartRecording = () => {
    if (currentItem?.type !== 'voice') return;
    
    setVoiceSessionState(prev => ({
      ...prev,
      isRecording: true,
      recordingTime: 0,
      currentScenario: currentItem.data as VoiceScenario,
    }));
    
    // Simulate recording timer
    const timer = setInterval(() => {
      setVoiceSessionState(prev => {
        if (!prev.isRecording) {
          clearInterval(timer);
          return prev;
        }
        return { ...prev, recordingTime: prev.recordingTime + 1 };
      });
    }, 1000);
  };

  const handleVoiceStopRecording = () => {
    setVoiceSessionState(prev => ({
      ...prev,
      isRecording: false,
    }));
    
    // Show feedback or next button after recording
    setTimeout(() => {
      setShowFeedback(true);
    }, 1000);
  };

  const handleVoiceShowAnswer = () => {
    setVoiceSessionState(prev => ({
      ...prev,
      showAnswer: true,
    }));
  };

  const handleVoiceSkip = () => {
    handleNext();
  };

  const handleRestart = () => {
    setCurrentItemIndex(0);
    setSelectedAnswers({});
    setShowFeedback(false);
    setIsCompleted(false);
    setScore(0);
    setVoiceSessionState({
      isRecording: false,
      recordingTime: 0,
      showAnswer: false,
      currentScenario: null,
    });
    
    const quizQuestions = shuffleArray(getQuestionsByCategory('mixed')).slice(0, 6);
    const voiceScenariosList = shuffleArray(voiceScenarios).slice(0, 4);
    
    const mixedItems: MixedPracticeItem[] = [
      ...quizQuestions.map(q => ({ id: q.id, type: 'quiz' as const, data: q })),
      ...voiceScenariosList.map(v => ({ id: v.id, type: 'voice' as const, data: v })),
    ];
    
    const shuffledItems = shuffleArray(mixedItems).slice(0, 8);
    setPracticeItems(shuffledItems);
    
    const newQuiz: QuizSession = {
      id: Date.now().toString(),
      questions: quizQuestions,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      startTime: new Date(),
      category: 'mixed',
    };
    
    startQuiz(newQuiz);
  };

  const handleExit = () => {
    // Clear current quiz state
    finishQuiz({
      id: currentQuiz?.id || Date.now().toString(),
      questions: practiceItems.filter(item => item.type === 'quiz').map(item => item.data as QuizQuestion),
      currentQuestionIndex: practiceItems.length,
      answers: selectedAnswers,
      score: 0,
      startTime: currentQuiz?.startTime || new Date(),
      endTime: new Date(),
      category: 'mixed',
    });
    
    // Navigate back to practice page
    router.push('/practice');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (practiceItems.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mixed practice...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isCompleted) {
    const quizItems = practiceItems.filter(item => item.type === 'quiz');
    const voiceItems = practiceItems.filter(item => item.type === 'voice');
    const correctCount = quizItems.filter(item => {
      const question = item.data as QuizQuestion;
      const selectedOption = selectedAnswers[question.id];
      return question.options.find(o => o.id === selectedOption)?.isCorrect;
    }).length;

    return (
      <Layout showNavigation={false}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card padding="lg" className="w-full max-w-md text-center">
            <CardContent>
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrophyIcon className="w-10 h-10 text-success-600" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Mixed Practice Completed!
              </h2>
              
              <p className="text-gray-600 mb-6">
                You completed {practiceItems.length} mixed practice items
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {correctCount}/{quizItems.length}
                    </div>
                    <div className="text-sm text-gray-600">Quiz Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-600">
                      {voiceItems.length}
                    </div>
                    <div className="text-sm text-gray-600">Voice Practice</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-2xl font-bold text-primary-600">
                    {score}%
                  </div>
                  <div className="text-sm text-gray-600">Quiz Accuracy</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button onClick={handleRestart} className="w-full">
                  Try Again
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => router.push('/practice')}
                  className="w-full"
                >
                  Back to Practice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!currentItem) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">No practice items available</p>
            <Button onClick={() => router.push('/practice')} className="mt-4">
              Back to Practice
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Render Quiz Item
  if (currentItem.type === 'quiz') {
    const question = currentItem.data as QuizQuestion;
    
    return (
      <Layout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full">
            {/* Progress Indicator */}
            <div className="fixed top-4 left-4 right-4 z-10">
              <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-primary-600">Mixed Practice</span>
                  <span className="text-gray-600">
                    {currentItemIndex + 1}/{practiceItems.length}
                  </span>
                </div>
              </div>
            </div>
            
            <QuizCard
              question={question.question}
              options={question.options}
              currentQuestion={currentItemIndex + 1}
              totalQuestions={practiceItems.length}
              progress={progress}
              onAnswerSelect={handleQuizAnswerSelect}
              selectedAnswer={selectedAnswers[question.id]}
              showFeedback={showFeedback}
              explanation={question.explanation}
              hasAudio={question.hasAudio}
              onAudioPlay={() => {
                console.log('Playing audio for question:', question.id);
              }}
              onExit={handleExit}
            />
            
            {showFeedback && (
              <div className="fixed bottom-4 left-4 right-4">
                <Button onClick={handleNext} className="w-full">
                  {currentItemIndex === practiceItems.length - 1 ? 'Finish Practice' : 'Next Item'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Render Voice Practice Item
  if (currentItem.type === 'voice') {
    const scenario = currentItem.data as VoiceScenario;
    
    return (
      <Layout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full">
            {/* Progress Indicator */}
            <div className="fixed top-4 left-4 right-4 z-10">
              <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-success-600">Voice Practice</span>
                  <span className="text-gray-600">
                    {currentItemIndex + 1}/{practiceItems.length}
                  </span>
                </div>
              </div>
            </div>
            
            <VoicePractice
              scenario={scenario}
              isRecording={voiceSessionState.isRecording}
              recordingTime={voiceSessionState.recordingTime}
              onStartRecording={handleVoiceStartRecording}
              onStopRecording={handleVoiceStopRecording}
              onShowAnswer={handleVoiceShowAnswer}
              onSkip={handleVoiceSkip}
              showAnswer={voiceSessionState.showAnswer}
              feedback={{
                accuracy: 85, // Mock accuracy
                suggestions: ['Try speaking more clearly', 'Remember to use phonetic alphabet'],
              }}
            />
            
            {(showFeedback || voiceSessionState.showAnswer) && !voiceSessionState.isRecording && (
              <div className="fixed bottom-4 left-4 right-4">
                <Button onClick={handleNext} className="w-full">
                  {currentItemIndex === practiceItems.length - 1 ? 'Finish Practice' : 'Next Item'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}