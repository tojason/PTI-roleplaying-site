'use client';

import { useEffect, useState } from 'react';

export interface RememberMeStorage {
  pid: string;
  timestamp: number;
  rememberMe: boolean;
}

const REMEMBER_ME_KEY = 'pti_remember_me';
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function useRememberMe() {
  const [rememberedPid, setRememberedPid] = useState<string>('');
  const [isRemembered, setIsRemembered] = useState(false);

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_ME_KEY);
      if (stored) {
        const data: RememberMeStorage = JSON.parse(stored);
        const now = Date.now();
        
        // Check if the remembered data is still valid (within 30 days)
        if (data.timestamp + REMEMBER_ME_DURATION > now && data.rememberMe) {
          setRememberedPid(data.pid);
          setIsRemembered(true);
        } else {
          // Clean up expired data
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading remembered credentials:', error);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }, []);

  const rememberCredentials = (pid: string, remember: boolean) => {
    try {
      if (remember) {
        const data: RememberMeStorage = {
          pid: pid.trim(),
          timestamp: Date.now(),
          rememberMe: true,
        };
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(data));
        setRememberedPid(pid);
        setIsRemembered(true);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        setRememberedPid('');
        setIsRemembered(false);
      }
    } catch (error) {
      console.error('Error saving remember me preference:', error);
    }
  };

  const clearRememberedCredentials = () => {
    try {
      localStorage.removeItem(REMEMBER_ME_KEY);
      setRememberedPid('');
      setIsRemembered(false);
    } catch (error) {
      console.error('Error clearing remembered credentials:', error);
    }
  };

  const getRememberedData = (): RememberMeStorage | null => {
    try {
      const stored = localStorage.getItem(REMEMBER_ME_KEY);
      if (stored) {
        const data: RememberMeStorage = JSON.parse(stored);
        const now = Date.now();
        
        if (data.timestamp + REMEMBER_ME_DURATION > now && data.rememberMe) {
          return data;
        } else {
          // Clean up expired data
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
      }
    } catch (error) {
      console.error('Error getting remembered data:', error);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    return null;
  };

  return {
    rememberedPid,
    isRemembered,
    rememberCredentials,
    clearRememberedCredentials,
    getRememberedData,
  };
}