import { InputHTMLAttributes, forwardRef } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="flex items-start">
        <div className="flex items-center h-6">
          <input
            id={checkboxId}
            type="checkbox"
            className="sr-only"
            ref={ref}
            {...props}
          />
          <div 
            className={cn(
              'w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center cursor-pointer',
              'focus-within:ring-4 focus-within:ring-primary-200',
              props.checked
                ? 'bg-primary-600 border-primary-600'
                : 'border-gray-300 bg-white hover:border-primary-400',
              props.disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            onClick={() => {
              if (!props.disabled) {
                const input = checkboxId ? document.getElementById(checkboxId) as HTMLInputElement : null;
                input?.click();
              }
            }}
          >
            {props.checked && (
              <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label 
                htmlFor={checkboxId}
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };