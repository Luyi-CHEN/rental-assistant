import type { ScoreDimension } from '@/types/score'

export function calculateWeightedScore(
  scores: Record<string, number>,
  dimensions: ScoreDimension[]
): number {
  let totalWeight = 0
  let weightedSum = 0

  for (const dim of dimensions) {
    const score = scores[dim.id]
    if (score != null && score > 0) {
      weightedSum += score * dim.weight
      totalWeight += dim.weight
    }
  }

  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 10) / 10
}
