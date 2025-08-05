'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { QuizCard } from '@/components/ui/QuizCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getQuestionsByCategory } from '@/lib/mockData';
import { shuffleArray, calculatePercentage } from '@/lib/utils';
import { QuizSession, QuizQuestion } from '@/types';
import { TrophyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CodesQuizPage() {
  const router = useRouter();
  const { isAuthenticated, currentQuiz, startQuiz, finishQuiz } = useAppStore();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Initialize quiz
    const quizQuestions = shuffleArray(getQuestionsByCategory('codes')).slice(0, 5);
    setQuestions(quizQuestions);
    
    const newQuiz: QuizSession = {
      id: Date.now().toString(),
      questions: quizQuestions,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      startTime: new Date(),
      category: 'codes',
    };
    
    startQuiz(newQuiz);
  }, [isAuthenticated, router, startQuiz]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (optionId: string) => {
    if (showFeedback) return;

    const newAnswers = {
      ...selectedAnswers,
      [currentQuestion.id]: optionId,
    };
    setSelectedAnswers(newAnswers);
    
    // Show feedback after a brief delay
    setTimeout(() => {
      setShowFeedback(true);
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestionIndex === questions.length - 1) {
      // Quiz completed
      const correctAnswers = questions.filter(q => {
        const selectedOption = selectedAnswers[q.id];
        return q.options.find(o => o.id === selectedOption)?.isCorrect;
      }).length;
      
      const finalScore = calculatePercentage(correctAnswers, questions.length);
      setScore(finalScore);
      
      const completedQuiz: QuizSession = {
        id: currentQuiz?.id || Date.now().toString(),
        questions,
        currentQuestionIndex: questions.length,
        answers: selectedAnswers,
        score: finalScore,
        startTime: currentQuiz?.startTime || new Date(),
        endTime: new Date(),
        category: 'codes',
      };
      
      finishQuiz(completedQuiz);
      setIsCompleted(true);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowFeedback(false);
    setIsCompleted(false);
    setScore(0);
    
    const quizQuestions = shuffleArray(getQuestionsByCategory('codes')).slice(0, 5);
    setQuestions(quizQuestions);
    
    const newQuiz: QuizSession = {
      id: Date.now().toString(),
      questions: quizQuestions,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      startTime: new Date(),
      category: 'codes',
    };
    
    startQuiz(newQuiz);
  };

  const handleExit = () => {
    // Clear current quiz state
    finishQuiz({
      id: currentQuiz?.id || Date.now().toString(),
      questions,
      currentQuestionIndex: questions.length,
      answers: selectedAnswers,
      score: 0,
      startTime: currentQuiz?.startTime || new Date(),
      endTime: new Date(),
      category: 'codes',
    });
    
    // Navigate back to practice page
    router.push('/practice');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (isCompleted) {
    const correctCount = questions.filter(q => {
      const selectedOption = selectedAnswers[q.id];
      return q.options.find(o => o.id === selectedOption)?.isCorrect;
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
                Quiz Completed!
              </h2>
              
              <p className="text-gray-600 mb-6">
                You scored {score}% on your 10-Codes quiz
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {correctCount}/{questions.length}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {score}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
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

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center">
        <QuizCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          progress={progress}
          onAnswerSelect={handleAnswerSelect}
          selectedAnswer={selectedAnswers[currentQuestion.id]}
          showFeedback={showFeedback}
          explanation={currentQuestion.explanation}
          hasAudio={currentQuestion.hasAudio}
          onAudioPlay={() => {
            // Audio playback would be implemented here
            console.log('Playing audio for question:', currentQuestion.id);
          }}
          onExit={handleExit}
        />
        
        {showFeedback && (
          <div className="fixed bottom-4 left-4 right-4">
            <Button onClick={handleNext} className="w-full">
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}