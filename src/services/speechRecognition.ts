'use client';

import { VoiceRecognitionResult } from '@/types';

export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionError {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;
  private isListening: boolean = false;

  constructor() {
    this.isSupported = this.checkSupport();
  }

  /**
   * Check if the browser supports the Web Speech API
   */
  private checkSupport(): boolean {
    if (typeof window === 'undefined') return false;
    
    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    return !!SpeechRecognition;
  }

  /**
   * Get browser support status
   */
  public isAPISupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get detailed browser compatibility info
   */
  public getBrowserCompatibility(): {
    supported: boolean;
    engine: string;
    recommendations: string[];
  } {
    if (typeof window === 'undefined') {
      return {
        supported: false,
        engine: 'server',
        recommendations: ['This feature requires a browser environment']
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    let engine = 'unknown';
    const recommendations: string[] = [];

    if (userAgent.includes('chrome')) {
      engine = 'chrome';
      if (this.isSupported) {
        recommendations.push('Excellent support for voice recognition');
      } else {
        recommendations.push('Update to latest Chrome version');
      }
    } else if (userAgent.includes('safari')) {
      engine = 'safari';
      if (this.isSupported) {
        recommendations.push('Good support, ensure microphone permissions');
      } else {
        recommendations.push('Update to Safari 14.1 or later');
      }
    } else if (userAgent.includes('firefox')) {
      engine = 'firefox';
      recommendations.push('Limited speech recognition support');
      recommendations.push('Consider using Chrome or Safari for best experience');
    } else {
      recommendations.push('For best voice recognition, use Chrome or Safari');
    }

    return {
      supported: this.isSupported,
      engine,
      recommendations
    };
  }

  /**
   * Initialize speech recognition with configuration
   */
  private initializeRecognition(config: SpeechRecognitionConfig = {}): SpeechRecognition {
    if (!this.isSupported) {
      throw new Error('Speech Recognition not supported in this browser');
    }

    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    
    // Configure recognition settings
    recognition.lang = config.language || 'en-US';
    recognition.continuous = config.continuous || false;
    recognition.interimResults = config.interimResults || true;
    recognition.maxAlternatives = config.maxAlternatives || 1;

    return recognition;
  }

  /**
   * Start listening for speech
   */
  public startListening(
    config: SpeechRecognitionConfig = {}
  ): Promise<VoiceRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech Recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.recognition = this.initializeRecognition(config);
      this.isListening = true;

      let finalTranscript = '';
      let interimTranscript = '';

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event) => {
        interimTranscript = '';
        finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // For interim results, resolve with partial data
        if (config.interimResults && interimTranscript) {
          // Don't resolve yet for interim results, just log them
          console.log('Interim:', interimTranscript);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        
        if (finalTranscript || interimTranscript) {
          const result: VoiceRecognitionResult = {
            transcript: finalTranscript || interimTranscript,
            confidence: 0.8, // Web Speech API doesn't always provide confidence
            alternatives: [],
            isFinal: !!finalTranscript
          };
          resolve(result);
        } else {
          reject(new Error('No speech detected'));
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        
        const error: SpeechRecognitionError = {
          error: event.error as any,
          message: this.getErrorMessage(event.error)
        };
        
        reject(error);
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * Stop listening for speech
   */
  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Abort speech recognition
   */
  public abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try speaking clearly.';
      case 'aborted':
        return 'Speech recognition was stopped.';
      case 'audio-capture':
        return 'Microphone could not be accessed. Please check your microphone connection.';
      case 'network':
        return 'Network error occurred. Please check your internet connection.';
      case 'not-allowed':
        return 'Microphone access was denied. Please allow microphone permissions.';
      case 'service-not-allowed':
        return 'Speech recognition service is not allowed on this page.';
      case 'bad-grammar':
        return 'Speech recognition grammar error.';
      case 'language-not-supported':
        return 'The specified language is not supported.';
      default:
        return 'An unknown error occurred during speech recognition.';
    }
  }

  /**
   * Request microphone permissions
   */
  public async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just want to check permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.recognition) {
      this.abort();
      this.recognition = null;
    }
  }
}

// Singleton instance
export const speechRecognitionService = new SpeechRecognitionService();