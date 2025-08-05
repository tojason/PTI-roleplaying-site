'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioRecorderState } from '@/types';

export interface UseAudioRecorderOptions {
  maxDuration?: number; // in seconds
  autoStop?: boolean;
  onVolumeChange?: (volume: number) => void;
  onMaxDurationReached?: () => void;
}

export interface UseAudioRecorderReturn extends AudioRecorderState {
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  isSupported: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const {
    maxDuration = 60, // 60 seconds default
    autoStop = true,
    onVolumeChange,
    onMaxDurationReached
  } = options;

  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    volume: 0,
    error: null
  });

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check initial permission status
  useEffect(() => {
    if (!isSupported) return;

    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then(permissionStatus => {
        setPermissionStatus(permissionStatus.state as any);
        
        permissionStatus.onchange = () => {
          setPermissionStatus(permissionStatus.state as any);
        };
      })
      .catch(() => {
        setPermissionStatus('unknown');
      });
  }, [isSupported]);

  // Duration timer
  useEffect(() => {
    if (state.isRecording && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prevState => {
          const newDuration = prevState.duration + 1;
          
          // Check if max duration reached
          if (autoStop && newDuration >= maxDuration) {
            onMaxDurationReached?.();
            return prevState; // stopRecording will be called separately
          }
          
          return { ...prevState, duration: newDuration };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRecording, state.isPaused, maxDuration, autoStop, onMaxDurationReached]);

  // Volume monitoring
  const startVolumeMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (!state.isRecording || state.isPaused) return;

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const volume = Math.min(100, Math.max(0, (rms / 128) * 100));

      setState(prevState => ({ ...prevState, volume }));
      onVolumeChange?.(volume);

      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  }, [state.isRecording, state.isPaused, onVolumeChange]);

  // Start recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setState(prevState => ({ 
        ...prevState, 
        error: 'Audio recording is not supported in this browser' 
      }));
      return false;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      mediaStreamRef.current = stream;
      setPermissionStatus('granted');

      // Setup audio context for volume monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setState(prevState => ({
        ...prevState,
        isRecording: true,
        isPaused: false,
        duration: 0,
        volume: 0,
        error: null
      }));

      // Start volume monitoring
      startVolumeMonitoring();

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      
      let errorMessage = 'Failed to start recording';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access was denied. Please allow microphone permissions and try again.';
          setPermissionStatus('denied');
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is already in use by another application.';
        }
      }

      setState(prevState => ({ ...prevState, error: errorMessage }));
      return false;
    }
  }, [isSupported, startVolumeMonitoring]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prevState => ({
      ...prevState,
      isRecording: false,
      isPaused: false,
      volume: 0
    }));
  }, []);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (state.isRecording && !state.isPaused) {
      setState(prevState => ({ ...prevState, isPaused: true }));
    }
  }, [state.isRecording, state.isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (state.isRecording && state.isPaused) {
      setState(prevState => ({ ...prevState, isPaused: false }));
      startVolumeMonitoring();
    }
  }, [state.isRecording, state.isPaused, startVolumeMonitoring]);

  // Reset recording
  const resetRecording = useCallback(() => {
    stopRecording();
    setState(prevState => ({
      ...prevState,
      duration: 0,
      volume: 0,
      error: null
    }));
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  // Auto-stop when max duration reached
  useEffect(() => {
    if (state.duration >= maxDuration && autoStop && state.isRecording) {
      stopRecording();
    }
  }, [state.duration, maxDuration, autoStop, state.isRecording, stopRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isSupported,
    permissionStatus
  };
}