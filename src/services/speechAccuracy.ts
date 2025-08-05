'use client';

import { VoiceAccuracyResult } from '@/types';

// Police 10-codes and their variants
const POLICE_CODES = {
  '10-4': ['10-4', '10 4', 'ten four', 'ten-four', '10 four', 'ten 4'],
  '10-8': ['10-8', '10 8', 'ten eight', 'ten-eight', '10 eight', 'ten 8'],
  '10-20': ['10-20', '10 20', 'ten twenty', 'ten-twenty', '10 twenty', 'ten 20'],
  '10-23': ['10-23', '10 23', 'ten twenty three', 'ten-twenty-three', '10 twenty three', 'ten 23'],
  '10-97': ['10-97', '10 97', 'ten ninety seven', 'ten-ninety-seven', '10 ninety seven', 'ten 97'],
  '10-99': ['10-99', '10 99', 'ten ninety nine', 'ten-ninety-nine', '10 ninety nine', 'ten 99']
};

// Phonetic alphabet and common variations
const PHONETIC_ALPHABET = {
  'A': ['alpha', 'alfa'],
  'B': ['bravo', 'beta'],
  'C': ['charlie', 'charley'],
  'D': ['delta'],
  'E': ['echo'],
  'F': ['foxtrot', 'fox trot'],
  'G': ['golf'],
  'H': ['hotel'],
  'I': ['india'],
  'J': ['juliet', 'juliett'],
  'K': ['kilo'],
  'L': ['lima'],
  'M': ['mike'],
  'N': ['november'],
  'O': ['oscar'],
  'P': ['papa'],
  'Q': ['quebec'],
  'R': ['romeo'],
  'S': ['sierra'],
  'T': ['tango'],
  'U': ['uniform'],
  'V': ['victor'],
  'W': ['whiskey', 'whisky'],
  'X': ['x-ray', 'xray'],
  'Y': ['yankee'],
  'Z': ['zulu']
};

export interface SpeechAccuracyOptions {
  caseSensitive?: boolean;
  allowPartialCredit?: boolean;
  strictMode?: boolean; // Requires exact pronunciation
  category?: 'codes' | 'phonetic' | 'radio-protocol';
}

export class SpeechAccuracyService {
  /**
   * Calculate the Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate similarity percentage between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;
    
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return Math.max(0, ((maxLength - distance) / maxLength) * 100);
  }

  /**
   * Normalize speech text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove punctuation except hyphens
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Check if spoken text matches expected 10-code
   */
  private checkPoliceCodeMatch(spokenText: string, expectedCode: string): {
    match: boolean;
    similarity: number;
    variation?: string;
  } {
    const normalizedSpoken = this.normalizeText(spokenText);
    const acceptedVariations = POLICE_CODES[expectedCode as keyof typeof POLICE_CODES] || [expectedCode];
    
    let bestMatch = { match: false, similarity: 0, variation: undefined as string | undefined };
    
    for (const variation of acceptedVariations) {
      const normalizedVariation = this.normalizeText(variation);
      const similarity = this.calculateSimilarity(normalizedSpoken, normalizedVariation);
      
      if (similarity > bestMatch.similarity) {
        bestMatch = {
          match: similarity >= 80, // 80% threshold for police codes
          similarity,
          variation
        };
      }
      
      // Check for exact match
      if (normalizedSpoken === normalizedVariation) {
        return { match: true, similarity: 100, variation };
      }
    }
    
    return bestMatch;
  }

  /**
   * Check if spoken text matches expected phonetic alphabet
   */
  private checkPhoneticMatch(spokenText: string, expectedLetter: string): {
    match: boolean;
    similarity: number;
    variation?: string;
  } {
    const normalizedSpoken = this.normalizeText(spokenText);
    const acceptedVariations = PHONETIC_ALPHABET[expectedLetter.toUpperCase() as keyof typeof PHONETIC_ALPHABET] || [expectedLetter];
    
    let bestMatch = { match: false, similarity: 0, variation: undefined as string | undefined };
    
    for (const variation of acceptedVariations) {
      const normalizedVariation = this.normalizeText(variation);
      const similarity = this.calculateSimilarity(normalizedSpoken, normalizedVariation);
      
      if (similarity > bestMatch.similarity) {
        bestMatch = {
          match: similarity >= 85, // 85% threshold for phonetic alphabet
          similarity,
          variation
        };
      }
      
      // Check for exact match
      if (normalizedSpoken === normalizedVariation) {
        return { match: true, similarity: 100, variation };
      }
    }
    
    return bestMatch;
  }

  /**
   * Parse expected answer into components (words, codes, letters)
   */
  private parseExpectedAnswer(expectedAnswer: string, category?: string): string[] {
    const normalized = this.normalizeText(expectedAnswer);
    
    if (category === 'codes') {
      // Split by common delimiters but keep 10-codes together
      return normalized.split(/\s+(?=10-|\s|$)/).filter(part => part.trim());
    } else if (category === 'phonetic') {
      // Split into individual words for phonetic alphabet
      return normalized.split(/\s+/).filter(part => part.trim());
    } else {
      // General radio protocol - split by words
      return normalized.split(/\s+/).filter(part => part.trim());
    }
  }

  /**
   * Generate accuracy suggestions based on errors
   */
  private generateSuggestions(
    matches: Array<{ expected: string; actual: string; match: boolean; similarity: number }>,
    category?: string
  ): string[] {
    const suggestions: string[] = [];
    const incorrectMatches = matches.filter(m => !m.match);
    
    if (incorrectMatches.length === 0) {
      suggestions.push('Excellent! Perfect pronunciation.');
      return suggestions;
    }

    // General suggestions based on category
    if (category === 'codes') {
      suggestions.push('For 10-codes, speak clearly and pronounce numbers distinctly.');
      suggestions.push('You can say "ten-four" or "10-4" - both are acceptable.');
    } else if (category === 'phonetic') {
      suggestions.push('Use NATO phonetic alphabet: Alpha, Bravo, Charlie, etc.');
      suggestions.push('Speak each letter clearly with proper phonetic pronunciation.');
    }

    // Specific suggestions based on common errors
    incorrectMatches.forEach(match => {
      if (match.similarity < 50) {
        suggestions.push(`"${match.expected}" was not recognized. Try speaking more clearly.`);
      } else if (match.similarity < 80) {
        suggestions.push(`"${match.expected}" was partially recognized. Check your pronunciation.`);
      }
    });

    // Limit to 3 most helpful suggestions
    return suggestions.slice(0, 3);
  }

  /**
   * Main accuracy calculation function
   */
  public calculateAccuracy(
    spokenText: string,
    expectedAnswer: string,
    options: SpeechAccuracyOptions = {}
  ): VoiceAccuracyResult {
    const {
      caseSensitive = false,
      allowPartialCredit = true,
      strictMode = false,
      category = 'radio-protocol'
    } = options;

    // Normalize inputs
    const normalizedSpoken = caseSensitive ? spokenText : this.normalizeText(spokenText);
    const normalizedExpected = caseSensitive ? expectedAnswer : this.normalizeText(expectedAnswer);

    // Parse expected answer into components
    const expectedComponents = this.parseExpectedAnswer(normalizedExpected, category);
    const spokenComponents = this.normalizeText(normalizedSpoken).split(/\s+/).filter(c => c);

    const matches: Array<{
      expected: string;
      actual: string;
      match: boolean;
      similarity: number;
    }> = [];

    let totalScore = 0;
    let perfectMatches = 0;

    // Compare each expected component
    expectedComponents.forEach((expectedComponent, index) => {
      const actualComponent = spokenComponents[index] || '';
      
      let match: { match: boolean; similarity: number; variation?: string };
      
      if (category === 'codes' && expectedComponent.startsWith('10')) {
        match = this.checkPoliceCodeMatch(actualComponent, expectedComponent);
      } else if (category === 'phonetic' && expectedComponent.length === 1) {
        match = this.checkPhoneticMatch(actualComponent, expectedComponent);
      } else {
        // General text comparison
        const similarity = this.calculateSimilarity(expectedComponent, actualComponent);
        match = {
          match: similarity >= (strictMode ? 95 : 80),
          similarity
        };
      }

      matches.push({
        expected: expectedComponent,
        actual: actualComponent,
        match: match.match,
        similarity: match.similarity
      });

      if (match.match) {
        perfectMatches++;
        totalScore += 100;
      } else if (allowPartialCredit) {
        totalScore += Math.max(0, match.similarity);
      }
    });

    // Calculate overall score
    const averageScore = expectedComponents.length > 0 ? totalScore / expectedComponents.length : 0;
    const finalScore = Math.round(Math.max(0, Math.min(100, averageScore)));

    // Determine category
    let accuracyCategory: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    if (finalScore >= 90) {
      accuracyCategory = 'excellent';
    } else if (finalScore >= 75) {
      accuracyCategory = 'good';
    } else if (finalScore >= 50) {
      accuracyCategory = 'needs-improvement';
    } else {
      accuracyCategory = 'poor';
    }

    // Generate suggestions
    const suggestions = this.generateSuggestions(matches, category);

    return {
      score: finalScore,
      matches,
      suggestions,
      category: accuracyCategory
    };
  }

  /**
   * Quick accuracy check for simple cases
   */
  public quickAccuracyCheck(
    spokenText: string,
    expectedAnswer: string,
    category?: 'codes' | 'phonetic' | 'radio-protocol'
  ): number {
    const result = this.calculateAccuracy(spokenText, expectedAnswer, { category });
    return result.score;
  }

  /**
   * Check if speech recognition result is likely correct
   */
  public isLikelyCorrect(accuracy: VoiceAccuracyResult, threshold: number = 75): boolean {
    return accuracy.score >= threshold;
  }

  /**
   * Get pronunciation guide for police codes
   */
  public getPoliceCodePronunciations(code: string): string[] {
    return POLICE_CODES[code as keyof typeof POLICE_CODES] || [code];
  }

  /**
   * Get pronunciation guide for phonetic alphabet
   */
  public getPhoneticPronunciations(letter: string): string[] {
    return PHONETIC_ALPHABET[letter.toUpperCase() as keyof typeof PHONETIC_ALPHABET] || [letter];
  }
}

// Singleton instance
export const speechAccuracyService = new SpeechAccuracyService();