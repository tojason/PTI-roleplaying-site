'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { ChevronLeftIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useInstructorStore } from '@/store/instructorStore';
import { LoginCredentials } from '@/types/instructor';

interface LoginError {
  type: 'validation' | 'authentication' | 'network' | 'server';
  message: string;
  field?: keyof LoginCredentials;
}

function InstructorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { clearError } = useInstructorStore();
  
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isLoading = status === 'loading';
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    departmentCode: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if user has instructor role before redirecting
      const userRole = session.user.role;
      const hasInstructorRole = userRole === 'INSTRUCTOR' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
      
      if (hasInstructorRole) {
        setIsRedirecting(true);
        const returnUrl = searchParams.get('returnUrl') || '/instructor/dashboard';
        router.replace(returnUrl); // Use replace to avoid back button issues
      } else {
        // User is authenticated but doesn't have instructor permissions
        setLoginError({
          type: 'authentication',
          message: 'You do not have instructor permissions. Please contact your administrator.',
        });
        // Sign out the user since they don't have proper permissions
        import('next-auth/react').then(({ signOut }) => {
          signOut({ redirect: false });
        });
      }
    }
  }, [session, status, router, searchParams]);

  useEffect(() => {
    const message = searchParams.get('message');
    const errorParam = searchParams.get('error');
    
    if (message) {
      setSuccessMessage(message);
      // Clear message param to prevent showing it again on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    }
    
    if (errorParam) {
      const errorMessages: Record<string, LoginError> = {
        'InvalidCredentials': {
          type: 'authentication',
          message: 'Invalid email, password, or department code. Please check your credentials and try again.',
        },
        'DepartmentNotFound': {
          type: 'authentication',
          message: 'Department code not found. Please verify with your administrator.',
        },
        'AccountNotVerified': {
          type: 'authentication',
          message: 'Your instructor account has not been verified. Please contact your administrator.',
        },
        'AccountDeactivated': {
          type: 'authentication',
          message: 'Your account has been deactivated. Please contact your administrator.',
        },
        'InsufficientPermissions': {
          type: 'authentication',
          message: 'You do not have instructor permissions. Please contact your administrator.',
        },
        'SessionExpired': {
          type: 'authentication',
          message: 'Your session has expired. Please sign in again.',
        },
        'Default': {
          type: 'server',
          message: 'An unexpected error occurred. Please try again.',
        },
      };
      
      setLoginError(errorMessages[errorParam] || errorMessages['Default']);
      // Clear error param to prevent showing it again on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }

    clearError();
  }, [searchParams, clearError]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};
    
    if (!formData.email) {
      newErrors.email = 'Police ID is required';
    } else if (formData.email.length < 3) {
      newErrors.email = 'Police ID must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }
    
    if (!formData.departmentCode) {
      newErrors.departmentCode = 'Department code is required';
    } else if (formData.departmentCode.length < 2) {
      newErrors.departmentCode = 'Department code must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: string): LoginError => {
    const errorMap: Record<string, LoginError> = {
      'Invalid email or password': {
        type: 'authentication',
        message: 'Invalid email or password. Please check your credentials and try again.',
      },
      'Department code not found': {
        type: 'authentication',
        message: 'Department code not found. Please verify with your administrator.',
        field: 'departmentCode',
      },
      'Account not verified': {
        type: 'authentication',
        message: 'Your instructor account has not been verified. Please contact your administrator.',
      },
      'Account deactivated': {
        type: 'authentication',
        message: 'Your account has been deactivated. Please contact your administrator.',
      },
      'Insufficient permissions': {
        type: 'authentication',
        message: 'You do not have instructor permissions. Please contact your administrator.',
      },
      'Email, password and department code are required': {
        type: 'validation',
        message: 'Please fill in all required fields.',
      },
    };
    
    return errorMap[error] || {
      type: 'server',
      message: 'An unexpected error occurred. Please try again.',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prevent multiple simultaneous login attempts
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    setSuccessMessage('');
    setLoginError(null);
    setErrors({});
    
    try {
      // Use NextAuth signIn for authentication
      const result = await signIn('credentials', {
        pid: formData.email, // Using email as PID for development
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        // Handle specific NextAuth errors
        let errorMessage = result.error;
        if (result.error === 'CredentialsSignin') {
          errorMessage = 'Invalid Police ID or password. Please check your credentials and try again.';
        }
        throw new Error(errorMessage);
      }
      
      if (result?.ok) {
        if (formData.rememberMe) {
          setSuccessMessage('Login successful! Your credentials have been saved for next time.');
        }
        
        // Don't manually redirect here - let the useEffect handle it after session update
        // This prevents race conditions and ensures proper role checking
      } else {
        // Unexpected state - neither ok nor error
        throw new Error('Login failed. Please try again.');
      }
      
    } catch (error: any) {
      console.error('Instructor login error:', error);
      
      if (error?.message) {
        const errorInfo = getErrorMessage(error.message);
        setLoginError(errorInfo);
        
        // Set field-specific errors if applicable
        if (errorInfo.field) {
          setErrors({ [errorInfo.field]: errorInfo.message });
        }
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        setLoginError({
          type: 'network',
          message: 'Network error. Please check your connection and try again.',
        });
      } else {
        setLoginError({
          type: 'server',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general login error when user starts typing
    if (loginError && (field === 'email' || field === 'password' || field === 'departmentCode')) {
      setLoginError(null);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen p-4 bg-slate-800"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-200"
            aria-label="Go to home"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">
                    {loginError.type === 'authentication' && 'Authentication Failed'}
                    {loginError.type === 'validation' && 'Validation Error'}
                    {loginError.type === 'network' && 'Connection Error'}
                    {loginError.type === 'server' && 'Server Error'}
                  </p>
                  <p className="text-red-700 text-sm mt-1">{loginError.message}</p>
                  {loginError.type === 'authentication' && (
                    <div className="mt-2 text-xs text-red-600">
                      <p>• Verify your email address is correct</p>
                      <p>• Check that your department code is valid</p>
                      <p>• Ensure your account has instructor permissions</p>
                      <p>• Contact your administrator if issues persist</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Police Training System</h1>
            <p className="text-lg font-medium text-slate-700 mb-1">Instructor Portal</p>
            <p className="text-sm text-gray-600">Empowering Excellence in Law Enforcement Training</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Police ID (PID)"
              placeholder="INS001"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              autoComplete="username"
              required
            />

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

            <Input
              type="password"
              label="Password"
              placeholder="••••••••••••••••"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              autoComplete="current-password"
              required
            />

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

            <Button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium"
              isLoading={isLoading || isSubmitting || isRedirecting}
              disabled={isLoading || isSubmitting || isRedirecting}
            >
              {isRedirecting ? 'Redirecting...' : isSubmitting ? 'Signing In...' : 'Sign In to Instructor Portal'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-3">
            <Link 
              href="/instructor/forgot-password"
              className="text-sm text-slate-700 hover:text-slate-800 transition-colors duration-200"
            >
              Forgot Instructor Credentials?
            </Link>
            
            <div className="text-sm text-gray-600">
              Need instructor access?{' '}
              <Link 
                href="/instructor/register"
                className="text-slate-700 hover:text-slate-800 font-medium transition-colors duration-200"
              >
                Request Account
              </Link>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <Link 
                href="/login"
                className="text-xs text-gray-500 hover:text-gray-600 transition-colors duration-200"
              >
                ← Switch to Student Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstructorLoginPage() {
  return (
    <Suspense fallback={
      <div 
        className="flex items-center justify-center min-h-screen bg-slate-800"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Instructor Portal...</p>
        </div>
      </div>
    }>
      <InstructorLoginForm />
    </Suspense>
  );
}