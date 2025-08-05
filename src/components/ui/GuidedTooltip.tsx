'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
  action?: () => void;
}

interface GuidedTooltipProps {
  steps: TooltipStep[];
  isActive: boolean;
  currentStepIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

function calculateTooltipPosition(
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  position: string,
  windowSize: { width: number; height: number }
) {
  const margin = 12; // Distance from target element
  const screenPadding = 16; // Minimum distance from screen edge

  let x = 0;
  let y = 0;

  switch (position) {
    case 'top':
      x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      y = targetRect.top - tooltipRect.height - margin;
      break;
    case 'bottom':
      x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      y = targetRect.bottom + margin;
      break;
    case 'left':
      x = targetRect.left - tooltipRect.width - margin;
      y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      break;
    case 'right':
      x = targetRect.right + margin;
      y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      break;
    case 'center':
    default:
      x = (windowSize.width / 2) - (tooltipRect.width / 2);
      y = (windowSize.height / 2) - (tooltipRect.height / 2);
      break;
  }

  // Keep tooltip within screen bounds
  x = Math.max(screenPadding, Math.min(x, windowSize.width - tooltipRect.width - screenPadding));
  y = Math.max(screenPadding, Math.min(y, windowSize.height - tooltipRect.height - screenPadding));

  return { x, y };
}

function getArrowPosition(position: string) {
  switch (position) {
    case 'top':
      return 'bottom'; // Arrow points down when tooltip is above
    case 'bottom':
      return 'top'; // Arrow points up when tooltip is below
    case 'left':
      return 'right'; // Arrow points right when tooltip is to the left
    case 'right':
      return 'left'; // Arrow points left when tooltip is to the right
    default:
      return null;
  }
}

export function GuidedTooltip({
  steps,
  isActive,
  currentStepIndex,
  onNext,
  onPrevious,
  onComplete,
  onSkip
}: GuidedTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    if (!isActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    const updatePositions = () => {
      const targetElement = document.querySelector(currentStep.targetSelector);
      
      if (!targetElement || !tooltipRef.current) {
        // If no target element, position in center
        const windowSize = { width: window.innerWidth, height: window.innerHeight };
        const tooltipRect = tooltipRef.current?.getBoundingClientRect() || { width: 320, height: 200 };
        
        setTooltipPosition({
          x: (windowSize.width / 2) - (tooltipRect.width / 2),
          y: (windowSize.height / 2) - (tooltipRect.height / 2)
        });
        setHighlightPosition({ x: 0, y: 0, width: 0, height: 0 });
        setIsVisible(true);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowSize = { width: window.innerWidth, height: window.innerHeight };

      // Calculate tooltip position
      const position = calculateTooltipPosition(targetRect, tooltipRect, currentStep.position, windowSize);
      setTooltipPosition(position);

      // Calculate highlight position with padding
      const padding = currentStep.highlightPadding || 8;
      setHighlightPosition({
        x: targetRect.left - padding,
        y: targetRect.top - padding,
        width: targetRect.width + (padding * 2),
        height: targetRect.height + (padding * 2)
      });

      setIsVisible(true);

      // Scroll target into view if needed
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    };

    // Small delay to let DOM settle
    const timer = setTimeout(updatePositions, 100);

    // Update positions on window resize
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [isActive, currentStep, currentStepIndex]);

  if (!isActive || !currentStep) return null;

  const arrowDirection = getArrowPosition(currentStep.position);

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dark overlay with cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              background: highlightPosition.width > 0 
                ? `
                  conic-gradient(from 0deg, 
                    rgba(0,0,0,0.6) 0deg, 
                    rgba(0,0,0,0.6) 360deg
                  ),
                  radial-gradient(
                    ellipse ${highlightPosition.width}px ${highlightPosition.height}px at 
                    ${highlightPosition.x + highlightPosition.width/2}px 
                    ${highlightPosition.y + highlightPosition.height/2}px,
                    transparent 50%,
                    rgba(0,0,0,0.6) 51%
                  )
                `
                : 'rgba(0,0,0,0.6)'
            }}
          />

          {/* Highlight ring around target element */}
          {highlightPosition.width > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed z-50 pointer-events-none border-2 border-primary-400 rounded-lg shadow-lg"
              style={{
                left: highlightPosition.x,
                top: highlightPosition.y,
                width: highlightPosition.width,
                height: highlightPosition.height,
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)'
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50 pointer-events-auto"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              maxWidth: '320px'
            }}
          >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 relative">
              {/* Arrow */}
              {arrowDirection && (
                <div
                  className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
                    arrowDirection === 'top' ? '-top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0' :
                    arrowDirection === 'bottom' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0' :
                    arrowDirection === 'left' ? '-left-1.5 top-1/2 -translate-y-1/2 border-t-0 border-r-0' :
                    arrowDirection === 'right' ? '-right-1.5 top-1/2 -translate-y-1/2 border-b-0 border-l-0' :
                    ''
                  }`}
                />
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-primary-600">
                  Step {currentStepIndex + 1} of {steps.length}
                </div>
                <button
                  onClick={onSkip}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStep.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div>
                  {!isFirstStep && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onPrevious}
                      className="flex items-center text-xs"
                    >
                      <ArrowLeftIcon className="w-3 h-3 mr-1" />
                      Back
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSkip}
                    className="text-xs"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={isLastStep ? onComplete : onNext}
                    size="sm"
                    className="flex items-center text-xs"
                  >
                    {isLastStep ? 'Finish' : 'Next'}
                    {!isLastStep && <ArrowRightIcon className="w-3 h-3 ml-1" />}
                  </Button>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center mt-3 space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentStepIndex 
                        ? 'bg-primary-600' 
                        : index < currentStepIndex 
                          ? 'bg-primary-300' 
                          : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}