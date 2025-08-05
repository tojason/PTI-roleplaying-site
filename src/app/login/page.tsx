'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { ChevronLeftIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { LoginFormData } from '@/types';
import { useRememberMe } from '@/hooks/useRememberMe';

interface LoginError {
  type: 'validation' | 'authentication' | 'network' | 'server';
  message: string;
  field?: keyof LoginFormData;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setLoading, isLoading } = useAppStore();
  const { rememberedPid, isRemembered, rememberCredentials, clearRememberedCredentials } = useRememberMe();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  
  const [formData, setFormData] = useState<LoginFormData>({
    pid: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  useEffect(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    
    if (message) {
      setSuccessMessage(message);
    }
    
    if (error) {
      // Handle NextAuth error redirect
      const errorMessages: Record<string, LoginError> = {
        'CredentialsSignin': {
          type: 'authentication',
          message: 'Invalid Police ID or password. Please check your credentials and try again.',
        },
        'CallbackError': {
          type: 'server',
          message: 'Authentication service error. Please try again.',
        },
        'OAuthSignin': {
          type: 'server',
          message: 'Authentication service error. Please try again.',
        },
        'OAuthCallback': {
          type: 'server',
          message: 'Authentication service error. Please try again.',
        },
        'OAuthCreateAccount': {
          type: 'server',
          message: 'Account creation error. Please contact support.',
        },
        'EmailCreateAccount': {
          type: 'server',
          message: 'Account creation error. Please contact support.',
        },
        'Callback': {
          type: 'server',
          message: 'Authentication callback error. Please try again.',
        },
        'OAuthAccountNotLinked': {
          type: 'authentication',
          message: 'Account not linked. Please use your Police ID and password.',
        },
        'EmailSignin': {
          type: 'server',
          message: 'Email sign-in error. Please try again.',
        },
        'CredentialsSignup': {
          type: 'server',
          message: 'Account creation error. Please try again.',
        },
        'SessionRequired': {
          type: 'authentication',
          message: 'Please sign in to continue.',
        },
        'Default': {
          type: 'server',
          message: 'An unexpected error occurred. Please try again.',
        },
      };
      
      setLoginError(errorMessages[error] || errorMessages['Default']);
    }
    
    // Load remembered credentials using the hook
    if (rememberedPid && isRemembered) {
      setFormData(prev => ({
        ...prev,
        pid: rememberedPid,
        rememberMe: true,
      }));
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.pid) {
      newErrors.pid = 'Police ID is required';
    } else if (formData.pid.length < 3) {
      newErrors.pid = 'Police ID must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: string): LoginError => {
    const errorMap: Record<string, LoginError> = {
      'No user found with this Police ID': {
        type: 'authentication',
        message: 'Police ID not found. Please check your ID and try again.',
        field: 'pid',
      },
      'Invalid password': {
        type: 'authentication',
        message: 'Incorrect password. Please check your password and try again.',
        field: 'password',
      },
      'Account is deactivated': {
        type: 'authentication',
        message: 'Your account has been deactivated. Please contact your administrator.',
      },
      'Police ID and password are required': {
        type: 'validation',
        message: 'Please enter both your Police ID and password.',
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
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setLoading(true);
    setSuccessMessage('');
    setLoginError(null);
    setErrors({});
    
    try {
      const result = await signIn('credentials', {
        pid: formData.pid.trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        const errorInfo = getErrorMessage(result.error);
        setLoginError(errorInfo);
        
        // Set field-specific errors if applicable
        if (errorInfo.field) {
          setErrors({ [errorInfo.field]: errorInfo.message });
        }
      } else if (result?.ok) {
        // Get the session to update the store
        const session = await getSession();
        if (session?.user) {
          // Update the Zustand store with NextAuth session data
          const storeUser = {
            id: session.user.id,
            pid: session.user.pid,
            name: session.user.name,
            department: session.user.department || 'Unknown Department',
            experienceLevel: 'rookie' as const, // Default value
            level: 1, // Default value
            streak: 0, // Default value
            totalCorrect: 0, // Default value
            totalTime: '0h', // Default value
            overallAccuracy: 0, // Default value
          };
          
          login(storeUser);
          
          // Handle remember me functionality after successful login
          rememberCredentials(formData.pid, formData.rememberMe);
          
          // Success message for remember me
          if (formData.rememberMe) {
            setSuccessMessage('Login successful! Your Police ID has been remembered for next time.');
          }
        }
        
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
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
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (
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
    if (loginError && (field === 'pid' || field === 'password')) {
      setLoginError(null);
    }
    
    // Handle remember me special logic
    if (field === 'rememberMe') {
      if (!value) {
        // If unchecking remember me, clear stored credentials
        clearRememberedCredentials();
      }
    }
  };

  return (
    <Layout 
      showNavigation={false} 
      showHeader={false}
      className="flex items-center justify-center min-h-screen p-4"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-success-600 flex-shrink-0" />
              <p className="text-success-800 text-sm">{successMessage}</p>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {loginError && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-error-800 text-sm font-medium">
                  {loginError.type === 'authentication' && 'Authentication Failed'}
                  {loginError.type === 'validation' && 'Validation Error'}
                  {loginError.type === 'network' && 'Connection Error'}
                  {loginError.type === 'server' && 'Server Error'}
                </p>
                <p className="text-error-700 text-sm mt-1">{loginError.message}</p>
                {loginError.type === 'authentication' && (
                  <div className="mt-2 text-xs text-error-600">
                    <p>• Make sure your Police ID is correct</p>
                    <p>• Check that Caps Lock is not enabled</p>
                    <p>• Contact your administrator if issues persist</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">🔵</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Police Training</h1>
          <p className="text-gray-600">Sign in to continue your training</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            label="Police ID (PID)"
            placeholder="PD12345"
            value={formData.pid}
            onChange={handleInputChange('pid')}
            error={errors.pid}
            autoComplete="username"
            required
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
              label="Remember my Police ID"
              checked={formData.rememberMe}
              onChange={handleInputChange('rememberMe')}
            />
            {formData.rememberMe && (
              <div className="flex items-center space-x-1 text-xs text-primary-600">
                <ShieldCheckIcon className="w-3 h-3" />
                <span>ID will be saved</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <Link 
            href="/forgot-password"
            className="text-sm text-primary-700 hover:text-primary-800 transition-colors duration-200"
          >
            Forgot password?
          </Link>
          
          <div className="text-sm text-gray-600">
            New user?{' '}
            <Link 
              href="/register"
              className="text-primary-700 hover:text-primary-800 font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    }>
      <LoginForm />
    </Suspense>
  );
}