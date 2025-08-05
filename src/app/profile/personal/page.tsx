'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { PencilIcon } from '@heroicons/react/24/outline';

export default function PersonalInformationPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    department: string;
    experienceLevel: 'rookie' | 'experienced' | 'veteran';
  }>({
    name: '',
    department: '',
    experienceLevel: 'rookie',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name,
        department: user.department,
        experienceLevel: user.experienceLevel,
      });
    }
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSave = () => {
    // Update user in store
    const updatedUser = {
      ...user,
      ...formData,
    };
    setUser(updatedUser);
    setIsEditing(false);
    
    // In a real app, you would also update the database here
    // await updateUserProfile(updatedUser);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      department: user.department,
      experienceLevel: user.experienceLevel,
    });
    setIsEditing(false);
  };

  const handlePhotoChange = (photoData: string) => {
    // Update user avatar immediately in the store
    const updatedUser = {
      ...user,
      avatar: photoData,
    };
    setUser(updatedUser);
    
    // In a real app, you would also update the database here
    // await updateUserAvatar(photoData);
  };

  return (
    <Layout 
      headerProps={{
        title: 'Personal Information',
        showBack: true,
        onBack: () => router.push('/profile'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Profile Photo Section */}
        <Card padding="lg">
          <CardContent>
            <PhotoUpload
              currentPhoto={user.avatar}
              onPhotoChange={handlePhotoChange}
              size="lg"
            />
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Personal Details</CardTitle>
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                {isEditing ? (
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as 'rookie' | 'experienced' | 'veteran' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="rookie">Rookie</option>
                    <option value="experienced">Experienced</option>
                    <option value="veteran">Veteran</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{user.experienceLevel}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Number
                </label>
                <p className="text-gray-900">{user.pid}</p>
                <p className="text-xs text-gray-500 mt-1">Badge number cannot be changed</p>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}