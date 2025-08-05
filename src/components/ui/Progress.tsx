import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value, 
    variant = 'default',
    size = 'md',
    showLabel = false,
    animated = false,
    ...props 
  }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    
    const containerStyles = 'w-full bg-gray-200 rounded-full overflow-hidden';
    
    const sizes = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };
    
    const variants = {
      default: 'bg-gradient-to-r from-primary-600 to-primary-700',
      success: 'bg-gradient-to-r from-success-500 to-success-600',
      warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
      error: 'bg-gradient-to-r from-error-500 to-error-600',
    };
    
    const fillStyles = cn(
      'h-full transition-all duration-300 ease-out rounded-full',
      variants[variant],
      animated && 'animate-pulse'
    );
    
    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-gray-900">{clampedValue}%</span>
          </div>
        )}
        <div
          className={cn(containerStyles, sizes[size], className)}
          ref={ref}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          {...props}
        >
          <div
            className={fillStyles}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ 
    value, 
    size = 80, 
    strokeWidth = 8, 
    variant = 'default',
    showLabel = true,
    className,
    ...props 
  }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
    
    const colors = {
      default: '#1e40af', // primary-700
      success: '#10b981', // success-500
      warning: '#f59e0b', // warning-500
      error: '#ef4444',   // error-500
    };
    
    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          ref={ref}
          {...props}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors[variant]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-900">
              {clampedValue}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress };
export type { ProgressProps, CircularProgressProps };