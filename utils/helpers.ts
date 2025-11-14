// Utility helper functions

import { MaterialType } from '@prisma/client';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Calculate estimated print time based on material and volume
 * This is a mock implementation
 */
export function estimatePrintTime(
  material: MaterialType,
  volume: number = 100
): number {
  const baseTime = {
    PLA: 60,
    ABS: 75,
    PETG: 70,
    TPU: 90,
    NYLON: 80,
    RESIN: 45,
    WOOD_FILLED: 85,
    METAL_FILLED: 95,
  };

  const timePerUnit = baseTime[material] || 60;
  return Math.round(timePerUnit * (volume / 100));
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 200): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Parse JSON safely
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
