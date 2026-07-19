import type { MoveClassification } from '@/types';

const CLASSIFICATION_THRESHOLDS = {
  brilliant: 0,
  great: 0.2,
  best: 0.5,
  excellent: 1.0,
  good: 2.0,
  inaccuracy: 4.0,
  mistake: 9.0,
  blunder: Infinity,
};

/**
 * Classify a move based on evaluation drop (in centipawns)
 * @param evalBefore - Evaluation before the move (from current player's perspective, positive = good)
 * @param evalAfter - Evaluation after the move (from current player's perspective, positive = good)
 */
export function classifyMove(evalBefore: number, evalAfter: number): MoveClassification {
  // Convert to loss in centipawns
  const loss = evalBefore - evalAfter;

  if (loss < 0) return 'brilliant'; // Actually gained advantage
  if (loss < CLASSIFICATION_THRESHOLDS.great * 100) return 'great';
  if (loss < CLASSIFICATION_THRESHOLDS.best * 100) return 'best';
  if (loss < CLASSIFICATION_THRESHOLDS.excellent * 100) return 'excellent';
  if (loss < CLASSIFICATION_THRESHOLDS.good * 100) return 'good';
  if (loss < CLASSIFICATION_THRESHOLDS.inaccuracy * 100) return 'inaccuracy';
  if (loss < CLASSIFICATION_THRESHOLDS.mistake * 100) return 'mistake';
  return 'blunder';
}

export function formatEvaluation(score: number): string {
  if (Math.abs(score) >= 90000) {
    const mateIn = score > 0 ? Math.round(100000 - score) : Math.round(-100000 - score);
    return `M${mateIn}`;
  }
  return (score / 100).toFixed(2);
}

export function evaluationToPercentage(score: number): number {
  // Convert centipawns to a 0-100 scale (50 = equal)
  // Using a sigmoid-like function for natural scaling
  const normalized = score / 400;
  const percentage = 50 + 50 * (2 / (1 + Math.exp(-0.003 * score)) - 1);
  return Math.max(0, Math.min(100, percentage));
}

export const CLASSIFICATION_COLORS: Record<string, string> = {
  brilliant: '#1baca6',
  great: '#5c8bb5',
  best: '#95bb4a',
  excellent: '#96bc4b',
  good: '#81b64c',
  inaccuracy: '#f0c14c',
  mistake: '#e6912c',
  blunder: '#e34f4f',
};
