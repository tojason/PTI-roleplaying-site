'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  SpeakerWaveIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { QuizCardProps } from '@/types';
import { Progress } from './Progress';
import { Button } from './Button';

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  options,
  currentQuestion,
  totalQuestions,
  progress,
  onAnswerSelect,
  selectedAnswer,
  showFeedback,
  explanation,
  hasAudio = false,
  onAudioPlay,
  onExit,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(selectedAnswer || null);
  
  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return; // Prevent selection during feedback
    
    setSelectedOption(optionId);
    onAnswerSelect(optionId);
  };

  const getCorrectOption = () => options.find(option => option.isCorrect);
  const isCorrectAnswer = selectedOption && options.find(o => o.id === selectedOption)?.isCorrect;

  if (showFeedback) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
        {/* Feedback Header */}
        <div className="flex items-center justify-center mb-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            isCorrectAnswer ? 'bg-success-100' : 'bg-error-100'
          )}>
            {isCorrectAnswer ? (
              <CheckCircleIcon className="w-8 h-8 text-success-600" />
            ) : (
              <XCircleIcon className="w-8 h-8 text-error-600" />
            )}
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h3 className={cn(
            'text-xl font-semibold mb-2',
            isCorrectAnswer ? 'text-success-800' : 'text-error-800'
          )}>
            {isCorrectAnswer ? 'Correct!' : 'Incorrect'}
          </h3>
          <p className="text-base text-gray-700">{question}</p>
        </div>

        {/* Answer Options with Feedback */}
        <div className="space-y-3 mb-6">
          {options.map((option) => {
            const isSelected = option.id === selectedOption;
            const isCorrect = option.isCorrect;
            
            let optionStyles = 'w-full p-4 border-2 rounded-lg';
            
            if (isCorrect) {
              optionStyles += ' border-success-500 bg-success-50';
            } else if (isSelected && !isCorrect) {
              optionStyles += ' border-error-500 bg-error-50';
            } else {
              optionStyles += ' border-gray-200 bg-gray-50';
            }
            
            return (
              <div key={option.id} className={optionStyles}>
                <div className="flex items-center">
                  {isCorrect && (
                    <CheckCircleIcon className="w-5 h-5 text-success-600 mr-3 flex-shrink-0" />
                  )}
                  {isSelected && !isCorrect && (
                    <XCircleIcon className="w-5 h-5 text-error-600 mr-3 flex-shrink-0" />
                  )}
                  <span className="text-base font-medium text-gray-900">
                    {option.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-primary-900">{explanation}</p>
          </div>
        )}

        {/* Next Button */}
        <Button 
          className="w-full"
          onClick={() => {
            // This would typically be handled by parent component
            // Reset local state for next question
            setSelectedOption(null);
          }}
        >
          {currentQuestion === totalQuestions ? 'Finish' : 'Next'}
        </Button>
      </div>
    );
  }

  // Default quiz state
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mx-4 my-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onExit}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Exit quiz"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>
        <span className="text-sm font-medium text-gray-600">
          Question {currentQuestion}/{totalQuestions}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} animated />
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-8 leading-7">
        {question}
      </h2>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {options.map((option) => {
          const isSelected = option.id === selectedOption;
          
          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={cn(
                'w-full p-4 text-left border-2 rounded-lg transition-all duration-200 focus:ring-4 focus:ring-primary-200 focus:outline-none',
                'min-h-touch',
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-900'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              )}
            >
              <span className="text-base font-medium">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Audio Button */}
      {hasAudio && onAudioPlay && (
        <div className="flex justify-center">
          <button
            onClick={onAudioPlay}
            className="w-12 h-12 bg-primary-100 hover:bg-primary-200 rounded-full flex items-center justify-center transition-colors duration-200"
            aria-label="Play audio"
          >
            <SpeakerWaveIcon className="w-6 h-6 text-primary-700" />
          </button>
        </div>
      )}
    </div>
  );
};

export { QuizCard };