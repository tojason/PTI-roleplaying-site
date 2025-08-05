import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border rounded-lg transition-all duration-200 min-h-touch',
            'focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none',
            'placeholder-gray-500 text-gray-900 bg-white',
            error 
              ? 'border-error-300 focus:border-error-500 focus:ring-error-200' 
              : 'border-gray-300',
            props.disabled && 'bg-gray-50 cursor-not-allowed',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-help` : undefined
          }
          {...props}
        />
        {error && (
          <p 
            id={`${inputId}-error`}
            className="mt-2 text-sm text-error-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p 
            id={`${inputId}-help`}
            className="mt-2 text-sm text-gray-600"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };