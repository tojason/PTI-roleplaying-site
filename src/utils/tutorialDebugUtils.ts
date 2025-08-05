/**
 * Tutorial debugging utilities for localStorage and state management
 */

export interface TutorialState {
  tutorialCompleted?: boolean;
  tutorialSkipped?: boolean;
}

export interface StorageDebugInfo {
  exists: boolean;
  size: number;
  valid: boolean;
  tutorialState: TutorialState | null;
  rawData: string | null;
  error?: string;
}

/**
 * Get detailed information about tutorial state in localStorage
 */
export function getStorageDebugInfo(): StorageDebugInfo {
  try {
    if (typeof window === 'undefined') {
      return {
        exists: false,
        size: 0,
        valid: false,
        tutorialState: null,
        rawData: null,
        error: 'Server-side environment'
      };
    }

    const rawData = localStorage.getItem('police-training-app');
    
    if (!rawData) {
      return {
        exists: false,
        size: 0,
        valid: false,
        tutorialState: null,
        rawData: null
      };
    }

    let parsedData;
    try {
      parsedData = JSON.parse(rawData);
    } catch (parseError) {
      return {
        exists: true,
        size: rawData.length,
        valid: false,
        tutorialState: null,
        rawData,
        error: `JSON parse error: ${parseError}`
      };
    }

    const tutorialState = parsedData?.state?.userSettings?.notifications ? {
      tutorialCompleted: parsedData.state.userSettings.notifications.tutorialCompleted,
      tutorialSkipped: parsedData.state.userSettings.notifications.tutorialSkipped
    } : null;

    return {
      exists: true,
      size: rawData.length,
      valid: true,
      tutorialState,
      rawData
    };
  } catch (error) {
    return {
      exists: false,
      size: 0,
      valid: false,
      tutorialState: null,
      rawData: null,
      error: `Unexpected error: ${error}`
    };
  }
}

/**
 * Clear all tutorial-related browser storage
 */
export function clearTutorialStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    console.log('🧹 Clearing tutorial storage...');
    
    // Clear localStorage
    localStorage.removeItem('police-training-app');
    
    // Clear sessionStorage  
    sessionStorage.clear();
    
    // Clear any tutorial-specific items
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.includes('tutorial') || key.includes('onboarding')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Tutorial storage cleared successfully');
    return true;
  } catch (error) {
    console.error('🧹 Failed to clear tutorial storage:', error);
    return false;
  }
}

/**
 * Manually set tutorial state in localStorage
 */
export function setTutorialState(completed: boolean, skipped: boolean): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    const existingData = localStorage.getItem('police-training-app');
    if (!existingData) {
      console.warn('⚠️ No existing localStorage data to update');
      return false;
    }
    
    const parsedData = JSON.parse(existingData);
    
    if (!parsedData.state?.userSettings?.notifications) {
      console.warn('⚠️ localStorage structure is unexpected');
      return false;
    }
    
    // Update the tutorial state
    parsedData.state.userSettings.notifications.tutorialCompleted = completed;
    parsedData.state.userSettings.notifications.tutorialSkipped = skipped;
    
    // Save back to localStorage
    localStorage.setItem('police-training-app', JSON.stringify(parsedData));
    
    console.log('🏪 Tutorial state updated in localStorage:', { completed, skipped });
    return true;
  } catch (error) {
    console.error('🏪 Failed to set tutorial state:', error);
    return false;
  }
}

/**
 * Log comprehensive tutorial debug information
 */
export function logTutorialDebugInfo(): void {
  console.group('🔍 Tutorial Debug Report');
  
  const storageInfo = getStorageDebugInfo();
  console.log('Storage Info:', storageInfo);
  
  // Check current Zustand state
  if (typeof window !== 'undefined' && (window as any).__TUTORIAL_DEBUG__) {
    console.log('Current App State:', (window as any).__TUTORIAL_DEBUG__);
  }
  
  // Browser info
  console.log('Browser Info:', {
    userAgent: navigator.userAgent,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    cookieEnabled: navigator.cookieEnabled
  });
  
  console.groupEnd();
}

/**
 * Initialize debugging helpers (development only)
 */
export function initTutorialDebug(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return;
  }
  
  // Add global debug helpers
  (window as any).tutorialDebug = {
    getStorageInfo: getStorageDebugInfo,
    clearStorage: clearTutorialStorage,
    setState: setTutorialState,
    logInfo: logTutorialDebugInfo,
    
    // Quick actions
    reset: () => clearTutorialStorage() && window.location.reload(),
    complete: () => setTutorialState(true, false),
    skip: () => setTutorialState(false, true),
    enable: () => setTutorialState(false, false)
  };
  
  console.log('🔧 Tutorial debug helpers available at window.tutorialDebug');
  console.log('Available methods: getStorageInfo, clearStorage, setState, logInfo, reset, complete, skip, enable');
}

/**
 * Validate tutorial state consistency
 */
export function validateTutorialState(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  const storageInfo = getStorageDebugInfo();
  
  if (!storageInfo.exists) {
    issues.push('No localStorage data found');
    recommendations.push('User may be new or storage was cleared');
  } else if (!storageInfo.valid) {
    issues.push('localStorage data is corrupted');
    recommendations.push('Clear storage and restart tutorial');
  } else if (storageInfo.tutorialState) {
    const { tutorialCompleted, tutorialSkipped } = storageInfo.tutorialState;
    
    if (tutorialCompleted && tutorialSkipped) {
      issues.push('Tutorial is both completed AND skipped');
      recommendations.push('Reset tutorial state to resolve conflict');
    }
    
    if (tutorialCompleted === undefined || tutorialSkipped === undefined) {
      issues.push('Tutorial state properties are undefined');
      recommendations.push('Initialize tutorial state with default values');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}