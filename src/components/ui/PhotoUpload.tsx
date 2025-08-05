'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { validateImageFile, fileToBase64 } from '@/lib/imageUtils';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoData: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PhotoUpload({ 
  currentPhoto, 
  onPhotoChange, 
  size = 'md', 
  className = '' 
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };


  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      setIsUploading(false);
      return;
    }

    try {
      // Convert file to base64 with optimization
      const base64 = await fileToBase64(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        format: 'jpeg'
      });
      
      setPreview(base64);
      setIsUploading(false);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleConfirmPhoto = () => {
    if (preview) {
      onPhotoChange(preview);
      setPreview(null);
    }
  };

  const handleCancelPhoto = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangePhoto = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const displayPhoto = preview || currentPhoto;

  return (
    <div className={`text-center ${className}`}>
      {/* Photo Display */}
      <div className={`${sizeClasses[size]} bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden relative`}>
        {displayPhoto ? (
          <img 
            src={displayPhoto} 
            alt="Profile photo" 
            className="w-full h-full object-cover"
          />
        ) : (
          <UserCircleIcon className={`${iconSizes[size]} text-primary-600`} />
        )}
        
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Photo Preview Actions */}
      {preview && !isUploading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 mb-3">New photo selected. Save changes?</p>
          <div className="flex space-x-2 justify-center">
            <Button size="sm" onClick={handleConfirmPhoto}>
              Save Photo
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelPhoto}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Change Photo Button */}
      {!preview && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleChangePhoto}
          disabled={isUploading}
          className="flex items-center justify-center"
        >
          <CameraIcon className="w-4 h-4 mr-1" />
          {isUploading ? 'Processing...' : 'Change Photo'}
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}