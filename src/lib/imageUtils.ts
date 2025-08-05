/**
 * Utility functions for image handling and validation
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Validates an image file
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)'
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { isValid: true };
}

/**
 * Converts a file to base64 string with optional image processing
 */
export function fileToBase64(
  file: File, 
  options: ImageProcessingOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // If no processing options are provided, return the original base64
      if (!options.maxWidth && !options.maxHeight && !options.quality) {
        resolve(result);
        return;
      }

      // Process the image using canvas
      processImage(result, options)
        .then(resolve)
        .catch(reject);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Processes an image using canvas for resizing and quality adjustment
 */
function processImage(
  base64: string, 
  options: ImageProcessingOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        const { maxWidth, maxHeight } = options;

        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        const quality = options.quality || 0.8;
        const format = options.format || 'jpeg';
        const mimeType = `image/${format}`;
        
        const processedBase64 = canvas.toDataURL(mimeType, quality);
        resolve(processedBase64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64;
  });
}

/**
 * Gets image dimensions from a base64 string
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64;
  });
}

/**
 * Generates a thumbnail from a base64 image
 */
export function generateThumbnail(
  base64: string, 
  size: number = 150
): Promise<string> {
  return processImage(base64, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  });
}