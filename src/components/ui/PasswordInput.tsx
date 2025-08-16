import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative">
          <input
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200 min-h-touch',
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded transition-colors duration-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1} // Prevent tab focus to maintain form flow
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
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

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
export type { PasswordInputProps };