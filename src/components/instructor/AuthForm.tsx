'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface AuthFormProps {
  mode: 'login' | 'register';
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (data: any) => void;
  className?: string;
}

export function AuthForm({ 
  mode, 
  isLoading = false, 
  error, 
  onSubmit, 
  className = '' 
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    departmentCode: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.departmentCode) {
      newErrors.departmentCode = 'Department code is required';
    } else if (formData.departmentCode.length < 2) {
      newErrors.departmentCode = 'Department code must be at least 2 characters';
    }

    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (formData.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      departmentCode: formData.departmentCode.trim().toUpperCase(),
      ...(mode === 'register' && { confirmPassword: formData.confirmPassword }),
      ...(mode === 'login' && { rememberMe: formData.rememberMe }),
    });
  };

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 text-sm font-medium">
                {mode === 'login' ? 'Authentication Failed' : 'Registration Error'}
              </p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <Input
          type="email"
          label="Email Address"
          placeholder="instructor@department.gov"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          autoComplete="email"
          required
        />

        {/* Department Code Input */}
        <Input
          type="text"
          label="Department Code"
          placeholder="DEPT001"
          value={formData.departmentCode}
          onChange={handleInputChange('departmentCode')}
          error={errors.departmentCode}
          autoComplete="organization"
          required
          style={{ textTransform: 'uppercase' }}
        />

        {/* Password Input */}
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••••••••••"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Confirm Password Input (Register mode only) */}
        {mode === 'register' && (
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="••••••••••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        {/* Remember Me (Login mode only) */}
        {mode === 'login' && (
          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={formData.rememberMe}
              onChange={handleInputChange('rememberMe')}
            />
            {formData.rememberMe && (
              <div className="flex items-center space-x-1 text-xs text-slate-600">
                <ShieldCheckIcon className="w-3 h-3" />
                <span>Credentials will be saved</span>
              </div>
            )}
          </div>
        )}

        {/* Password Requirements (Register mode only) */}
        {mode === 'register' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span>At least 8 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  /(?=.*[a-z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span>One lowercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  /(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span>One uppercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  /(?=.*\d)/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span>One number</span>
              </li>
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading 
            ? (mode === 'login' ? 'Signing In...' : 'Creating Account...')
            : (mode === 'login' ? 'Sign In to Instructor Portal' : 'Create Instructor Account')
          }
        </Button>
      </form>
    </div>
  );
}

// Additional utility components for reuse

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressIndicator({ currentStep, totalSteps, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep 
              ? 'bg-slate-800 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {step}
          </div>
          {step < totalSteps && (
            <div className={`w-8 h-0.5 mx-2 ${
              step < currentStep ? 'bg-slate-800' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface InfoBannerProps {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoBanner({ type, title, children, className = '' }: InfoBannerProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[type]} ${className}`}>
      <div className="flex items-start space-x-3">
        <div>
          <p className="font-medium mb-1">{title}</p>
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}