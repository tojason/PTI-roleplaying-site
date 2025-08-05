'use client';

import { getSession } from 'next-auth/react';

export interface SessionInfo {
  isValid: boolean;
  isRemembered: boolean;
  expiresAt: Date | null;
  timeUntilExpiry: number | null; // milliseconds
}

/**
 * Enhanced session utilities for handling remember me functionality
 */
export class SessionManager {
  private static instance: SessionManager;
  private checkInterval: NodeJS.Timeout | null = null;
  private callbacks: Set<(info: SessionInfo) => void> = new Set();

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Get current session information including remember me status
   */
  async getSessionInfo(): Promise<SessionInfo> {
    try {
      const session = await getSession();
      
      if (!session) {
        return {
          isValid: false,
          isRemembered: false,
          expiresAt: null,
          timeUntilExpiry: null,
        };
      }

      // Check if user has remember me preference
      const rememberMeData = this.getRememberMeData();
      const isRemembered = !!rememberMeData;

      // Calculate expiry time
      // NextAuth tokens have an exp claim, but we need to handle it carefully
      const now = Date.now();
      const expiresAt = new Date(now + (isRemembered ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000));
      const timeUntilExpiry = expiresAt.getTime() - now;

      return {
        isValid: true,
        isRemembered,
        expiresAt,
        timeUntilExpiry,
      };
    } catch (error) {
      console.error('Error getting session info:', error);
      return {
        isValid: false,
        isRemembered: false,
        expiresAt: null,
        timeUntilExpiry: null,
      };
    }
  }

  /**
   * Start monitoring session expiry
   */
  startSessionMonitoring(callback: (info: SessionInfo) => void) {
    this.callbacks.add(callback);

    if (!this.checkInterval) {
      this.checkInterval = setInterval(async () => {
        const info = await this.getSessionInfo();
        this.callbacks.forEach(cb => cb(info));
        
        // Auto-cleanup expired sessions
        if (!info.isValid || (info.timeUntilExpiry && info.timeUntilExpiry < 0)) {
          this.cleanup();
        }
      }, 60000); // Check every minute
    }
  }

  /**
   * Stop monitoring session expiry
   */
  stopSessionMonitoring(callback?: (info: SessionInfo) => void) {
    if (callback) {
      this.callbacks.delete(callback);
    } else {
      this.callbacks.clear();
    }

    if (this.callbacks.size === 0 && this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get remember me data from localStorage
   */
  private getRememberMeData() {
    try {
      const stored = localStorage.getItem('pti_remember_me');
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        const duration = 30 * 24 * 60 * 60 * 1000;
        
        if (data.timestamp + duration > now && data.rememberMe) {
          return data;
        } else {
          localStorage.removeItem('pti_remember_me');
        }
      }
    } catch (error) {
      console.error('Error getting remember me data:', error);
      localStorage.removeItem('pti_remember_me');
    }
    return null;
  }

  /**
   * Show session expiry warning
   */
  showExpiryWarning(minutesLeft: number): boolean {
    // Show warning when less than 5 minutes left for non-remembered sessions
    // or less than 24 hours for remembered sessions
    const rememberMeData = this.getRememberMeData();
    const threshold = rememberMeData ? 24 * 60 : 5; // minutes
    
    return minutesLeft <= threshold;
  }

  /**
   * Cleanup session-related data
   */
  private cleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.callbacks.clear();
  }

  /**
   * Extend session (for remember me users)
   */
  async extendSession(): Promise<boolean> {
    try {
      const session = await getSession();
      if (!session) return false;

      // This would typically involve calling an API to refresh the token
      // For now, we'll just update the remember me timestamp
      const rememberMeData = this.getRememberMeData();
      if (rememberMeData) {
        const updatedData = {
          ...rememberMeData,
          timestamp: Date.now(),
        };
        localStorage.setItem('pti_remember_me', JSON.stringify(updatedData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }
}

/**
 * Hook for using session manager in React components
 */
export function useSessionManager() {
  const manager = SessionManager.getInstance();
  
  return {
    getSessionInfo: () => manager.getSessionInfo(),
    startMonitoring: (callback: (info: SessionInfo) => void) => 
      manager.startSessionMonitoring(callback),
    stopMonitoring: (callback?: (info: SessionInfo) => void) => 
      manager.stopSessionMonitoring(callback),
    extendSession: () => manager.extendSession(),
  };
}

/**
 * Utility to format time until expiry
 */
export function formatTimeUntilExpiry(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Less than a minute';
  }
}