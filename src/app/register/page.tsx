'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface RegisterFormData {
  pid: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setLoading, isLoading } = useAppStore();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    pid: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const handleInputChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.pid) {
      newErrors.pid = 'Police ID (PID) is required';
    } else if (formData.pid.length < 3) {
      newErrors.pid = 'Police ID must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pid: formData.pid,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful, automatically sign in the user
        const signInResult = await signIn('credentials', {
          pid: formData.pid,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Successful auto-login, redirect to dashboard
          router.push('/dashboard');
        } else {
          // Auto-login failed, redirect to login with message
          router.push('/login?message=Registration successful! Please sign in.');
        }
      } else {
        // Handle registration errors
        if (data.error) {
          if (data.error.includes('PID') || data.error.includes('Police ID')) {
            setErrors({ pid: data.error });
          } else {
            setErrors({ pid: data.error });
          }
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ pid: 'An error occurred during registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link 
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join the Police Training Initiative
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              autoComplete="name"
              required
            />

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


            <PasswordInput
              label="Password"
              placeholder="••••••••••••••••"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              autoComplete="new-password"
              required
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="••••••••••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login"
                className="text-primary-700 hover:text-primary-800 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}