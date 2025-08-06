'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  ChevronLeftIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { RegisterData, InstructorRole } from '@/types/instructor';

interface RegisterError {
  type: 'validation' | 'server' | 'network';
  message: string;
  field?: keyof RegisterData;
}

const DEPARTMENT_CODES = [
  'METRO01', 'STATE02', 'COUNTY03', 'CITY04', 'SHERIFF05'
];

const SPECIALIZATIONS = [
  'Traffic Enforcement',
  'Criminal Investigation',
  'K-9 Unit',
  'SWAT/Tactical',
  'Community Policing',
  'Cyber Crime',
  'Narcotics',
  'Internal Affairs',
  'Training & Education',
  'Emergency Response'
];

function InstructorRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [registerError, setRegisterError] = useState<RegisterError | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    departmentCode: '',
    role: InstructorRole.INSTRUCTOR,
    badgeNumber: '',
    yearsOfExperience: 0,
    specializations: [],
    supervisorEmail: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData | 'terms', string>>>({});

  useEffect(() => {
    const message = searchParams.get('message');
    const errorParam = searchParams.get('error');
    
    if (message) {
      setSuccessMessage(message);
    }
    
    if (errorParam) {
      setRegisterError({
        type: 'server',
        message: errorParam,
      });
    }
  }, [searchParams]);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof RegisterData | 'terms', string>> = {};
    
    if (step === 1) {
      // Department Verification
      if (!formData.departmentCode) {
        newErrors.departmentCode = 'Department code is required';
      }
      
      if (!formData.badgeNumber) {
        newErrors.badgeNumber = 'Badge number is required';
      } else if (formData.badgeNumber.length < 3) {
        newErrors.badgeNumber = 'Badge number must be at least 3 characters';
      }
      
      if (!formData.supervisorEmail) {
        newErrors.supervisorEmail = 'Supervisor email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supervisorEmail)) {
        newErrors.supervisorEmail = 'Please enter a valid supervisor email address';
      }
    }
    
    if (step === 2) {
      // Account Creation
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      } else if (formData.firstName.length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      } else if (formData.lastName.length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      }
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (formData.yearsOfExperience != null && (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50)) {
        newErrors.yearsOfExperience = 'Years of experience must be between 0 and 50';
      }
    }
    
    if (step === 3) {
      // Terms and Conditions
      if (!acceptedTerms) {
        newErrors.terms = 'You must accept the terms and conditions to continue';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3) || !acceptedTerms) return;
    
    setIsSubmitting(true);
    setRegisterError(null);
    setSuccessMessage('');
    
    try {
      // Mock registration for development
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // For development, always succeed
      console.log('Mock registration data:', {
        ...formData,
        departmentCode: formData.departmentCode?.trim().toUpperCase(),
        email: formData.email?.trim().toLowerCase(),
        supervisorEmail: formData.supervisorEmail?.trim().toLowerCase(),
      });

      setSuccessMessage('Registration submitted successfully! Please check your email for verification instructions.');
      
      // Redirect to login with success message after delay
      setTimeout(() => {
        router.push('/instructor/login?message=Registration submitted! Please verify your email and wait for account approval.');
      }, 3000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      setRegisterError({
        type: 'server',
        message: 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSpecializationChange = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations?.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...(prev.specializations || []), specialization]
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Department Verification</h2>
              <p className="text-sm text-gray-600">Verify your law enforcement credentials</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Code *
              </label>
              <select
                value={formData.departmentCode}
                onChange={handleInputChange('departmentCode')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                required
              >
                <option value="">Select your department</option>
                {DEPARTMENT_CODES.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              {errors.departmentCode && (
                <p className="mt-1 text-sm text-red-600">{errors.departmentCode}</p>
              )}
            </div>

            <Input
              type="text"
              label="Badge Number *"
              placeholder="B12345"
              value={formData.badgeNumber}
              onChange={handleInputChange('badgeNumber')}
              error={errors.badgeNumber}
              required
            />

            <Input
              type="email"
              label="Supervisor Email *"
              placeholder="supervisor@department.gov"
              value={formData.supervisorEmail}
              onChange={handleInputChange('supervisorEmail')}
              error={errors.supervisorEmail}
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Verification Process</p>
                  <p>Your credentials will be verified with your department and supervisor before account activation.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Details</h2>
              <p className="text-sm text-gray-600">Create your instructor account</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="First Name *"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                error={errors.firstName}
                required
              />

              <Input
                type="text"
                label="Last Name *"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              type="email"
              label="Email Address *"
              placeholder="instructor@department.gov"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              required
            />

            <Input
              type="password"
              label="Password *"
              placeholder="••••••••••••••••"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              required
            />

            <Input
              type="password"
              label="Confirm Password *"
              placeholder="••••••••••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              required
            />

            <Input
              type="number"
              label="Years of Experience"
              placeholder="5"
              value={formData.yearsOfExperience?.toString() || ''}
              onChange={handleInputChange('yearsOfExperience')}
              error={errors.yearsOfExperience}
              min="0"
              max="50"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Areas of Specialization (optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map(spec => (
                  <label key={spec} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.specializations?.includes(spec) || false}
                      onChange={() => handleSpecializationChange(spec)}
                      className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-gray-700">{spec}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Review & Submit</h2>
              <p className="text-sm text-gray-600">Confirm your information and agree to terms</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">Account Summary</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                <p><span className="font-medium">Email:</span> {formData.email}</p>
                <p><span className="font-medium">Department:</span> {formData.departmentCode}</p>
                <p><span className="font-medium">Badge:</span> {formData.badgeNumber}</p>
                <p><span className="font-medium">Experience:</span> {formData.yearsOfExperience} years</p>
                {formData.specializations && formData.specializations.length > 0 && (
                  <p><span className="font-medium">Specializations:</span> {formData.specializations.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Account Approval Process</p>
                  <p>After submission, your account will require:</p>
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>Email verification</li>
                    <li>Department credential verification</li>
                    <li>Supervisor approval</li>
                    <li>Administrator activation</li>
                  </ul>
                  <p className="mt-2">You will receive email notifications at each step.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-3 rounded-lg border-2 border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: undefined }));
                    }
                  }}
                  className="mt-1 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-slate-700 hover:text-slate-800 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-slate-700 hover:text-slate-800 underline">
                    Privacy Policy
                  </Link>, and I certify that all information provided is accurate and truthful.
                  <span className="text-red-500 ml-1">*</span>
                  {!acceptedTerms && (
                    <span className="block text-xs text-amber-600 mt-1 font-medium">
                      ⚠️ You must accept the terms to submit your registration
                    </span>
                  )}
                </span>
              </label>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (successMessage) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen p-4 bg-slate-800"
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Registration Submitted!</h1>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <Button
              onClick={() => router.push('/instructor/login')}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center min-h-screen p-4 bg-slate-800"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.push('/instructor/login')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-200"
            aria-label="Back to login"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Error Message */}
          {registerError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Registration Error</p>
                  <p className="text-red-700 text-sm mt-1">{registerError.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Request Instructor Access</h1>
            <p className="text-sm text-gray-600">Join the Police Training System as an instructor</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-slate-800' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-slate-800 hover:bg-slate-900 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !acceptedTerms}
                  className={`${!acceptedTerms ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900'} text-white`}
                  title={!acceptedTerms ? 'Please accept the terms and conditions' : ''}
                >
                  {isSubmitting ? 'Submitting...' : !acceptedTerms ? 'Accept Terms to Submit' : 'Submit Registration'}
                </Button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/instructor/login"
              className="text-slate-700 hover:text-slate-800 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstructorRegisterPage() {
  return (
    <Suspense fallback={
      <div 
        className="flex items-center justify-center min-h-screen bg-slate-800"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Registration...</p>
        </div>
      </div>
    }>
      <InstructorRegisterForm />
    </Suspense>
  );
}