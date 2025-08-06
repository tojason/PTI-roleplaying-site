'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  UserCircleIcon, 
  PencilIcon, 
  ShieldCheckIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  rank: string;
  badgeNumber: string;
  pid: string;
  yearsOfExperience: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user?: any;
}

export default function InstructorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    rank: '',
    badgeNumber: '',
    pid: '',
    yearsOfExperience: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  // Initialize form data from session
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        department: session.user.department || '',
        rank: session.user.rank || '',
        badgeNumber: session.user.badgeNumber || '',
        pid: session.user.pid || '',
        yearsOfExperience: session.user.yearsOfExperience?.toString() || '',
        address: session.user.address || '',
        city: session.user.city || '',
        state: session.user.state || '',
        zipCode: session.user.zipCode || '',
        emergencyContact: session.user.emergencyContact || '',
        emergencyPhone: session.user.emergencyPhone || '',
      });
    }
  }, [session]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data: ProfileUpdateResponse = await response.json();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        
        // Refresh session to get updated data
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to session data
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        department: session.user.department || '',
        rank: session.user.rank || '',
        badgeNumber: session.user.badgeNumber || '',
        pid: session.user.pid || '',
        yearsOfExperience: session.user.yearsOfExperience?.toString() || '',
        address: session.user.address || '',
        city: session.user.city || '',
        state: session.user.state || '',
        zipCode: session.user.zipCode || '',
        emergencyContact: session.user.emergencyContact || '',
        emergencyPhone: session.user.emergencyPhone || '',
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  if (status === 'loading') {
    return (
      <ClientSafeInstructorLayout>
        <div className="p-4 sm:p-6 lg:ml-80">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
              <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClientSafeInstructorLayout>
    );
  }

  return (
    <ClientSafeInstructorLayout>
      <div className="p-4 sm:p-6 lg:ml-80">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {!isEditing ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      icon={<PencilIcon className="w-4 h-4" />}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isLoading}
                        icon={<CheckCircleIcon className="w-4 h-4" />}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Alert Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-success-50 border-success-200 text-success-800'
                  : 'bg-error-50 border-error-200 text-error-800'
              }`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                )}
                {message.text}
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <UserCircleIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="(555) 123-4567"
                />
                
                <Input
                  label="Police Identification (PID)"
                  value={formData.pid}
                  onChange={(e) => handleInputChange('pid', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your PID"
                />
              </div>
            </motion.div>

            {/* Department Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <BuildingOffice2Icon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Department Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your department"
                />
                
                <Input
                  label="Rank"
                  value={formData.rank}
                  onChange={(e) => handleInputChange('rank', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your rank"
                />
                
                <Input
                  label="Badge Number"
                  value={formData.badgeNumber}
                  onChange={(e) => handleInputChange('badgeNumber', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter badge number"
                />
                
                <Input
                  label="Years of Experience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Years"
                  min="0"
                  max="50"
                />
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <MapPinIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                    placeholder="City"
                  />
                  
                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!isEditing}
                    placeholder="State"
                    maxLength={2}
                  />
                  
                  <Input
                    label="ZIP Code"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    disabled={!isEditing}
                    placeholder="12345"
                    maxLength={10}
                  />
                </div>
              </div>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <PhoneIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Emergency Contact Name"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Contact name"
                />
                
                <Input
                  label="Emergency Contact Phone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="(555) 123-4567"
                />
              </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/instructor/change-password')}
                    icon={<KeyIcon className="w-4 h-4" />}
                  >
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Account Status</h3>
                    <p className="text-sm text-gray-600">Your account is active and verified</p>
                  </div>
                  <div className="flex items-center text-success-600">
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/instructor/dashboard')}
            >
              ← Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    </ClientSafeInstructorLayout>
  );
}