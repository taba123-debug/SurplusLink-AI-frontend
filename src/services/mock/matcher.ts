import { getDaysRemaining } from '@/lib/dates';
import { toMinorUnits } from '@/lib/money';
import type { BuyerRequirement, Lot, MatchResult } from '@/types';

/**
 * Computes compatibility and ranking between a buyer requirement and inventory lots.
 */
export function matchLotsToRequirement(
  requirement: BuyerRequirement,
  lots: Lot[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const lot of lots) {
    if (lot.status !== 'ACTIVE' && lot.status !== 'PARTIALLY_SOLD') {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. Category Compatibility (Primary filter)
    if (lot.category === requirement.category) {
      score += 40;
      reasons.push(`Exact product category match (${lot.category})`);
    } else {
      // Different category yields 0 score for tight B2B matching
      continue;
    }

    // 2. Quantity Compatibility
    let quantityMatch: 'EXACT' | 'SURPLUS_AVAILABLE' | 'PARTIAL' = 'PARTIAL';
    if (lot.availableQuantity >= requirement.requiredQuantity) {
      score += 25;
      quantityMatch = 'SURPLUS_AVAILABLE';
      reasons.push(
        `Sufficient stock: ${lot.availableQuantity} ${lot.unitType} available (requested ${requirement.requiredQuantity})`
      );
    } else if (lot.availableQuantity >= requirement.requiredQuantity * 0.6) {
      score += 15;
      quantityMatch = 'PARTIAL';
      reasons.push(`Partial batch available: ${lot.availableQuantity} of ${requirement.requiredQuantity} ${lot.unitType}`);
    } else {
      reasons.push(`Only ${lot.availableQuantity} ${lot.unitType} available`);
    }

    // Check minimum order quantity constraint
    if (lot.minPurchaseQuantity > requirement.requiredQuantity) {
      score -= 20;
      reasons.push(`Warning: Minimum order quantity (${lot.minPurchaseQuantity}) exceeds requested quantity`);
    }

    // 3. Shelf-Life Compatibility
    const remainingDays = getDaysRemaining(lot.expiryDate);
    if (remainingDays >= requirement.minRemainingShelfLifeDays) {
      score += 20;
      reasons.push(
        `Shelf-life verified: ${remainingDays} days remaining (meets ${requirement.minRemainingShelfLifeDays}+ days requirement)`
      );
    } else {
      score -= 15;
      reasons.push(`Notice: Shelf-life (${remainingDays} days) is less than target ${requirement.minRemainingShelfLifeDays} days`);
    }

    // 4. Budget Compatibility
    // Never expose private reserve price to calculation seen by buyer!
    const effectiveUnitPriceMinor = lot.askingUnitPriceMinor ?? toMinorUnits(110);
    const estimatedTotalMinor = effectiveUnitPriceMinor * Math.min(requirement.requiredQuantity, lot.availableQuantity);

    let budgetCompatibility: 'UNDER_BUDGET' | 'WITHIN_BUDGET' | 'OVER_BUDGET' = 'WITHIN_BUDGET';
    if (estimatedTotalMinor <= requirement.maxTotalBudgetMinor * 0.85) {
      score += 15;
      budgetCompatibility = 'UNDER_BUDGET';
      reasons.push('Comfortably below maximum allocated budget');
    } else if (estimatedTotalMinor <= requirement.maxTotalBudgetMinor) {
      score += 10;
      budgetCompatibility = 'WITHIN_BUDGET';
      reasons.push('Fits within specified budget');
    } else {
      budgetCompatibility = 'OVER_BUDGET';
      reasons.push('Estimated total exceeds current budget threshold');
    }

    // 5. City and Area Proximity
    if (lot.city.toLowerCase() === requirement.city.toLowerCase()) {
      score += 10;
      reasons.push(`Located in ${lot.city} (${lot.pickupRegion})`);
    }
    if (
      requirement.preferredArea &&
      lot.pickupRegion.toLowerCase().includes(requirement.preferredArea.toLowerCase())
    ) {
      score += 5;
      reasons.push(`Matches preferred area: ${requirement.preferredArea}`);
    }

    // Normalize score to 0 - 100 range
    const finalScore = Math.max(10, Math.min(99, score));

    results.push({
      lot,
      compatibilityScore: finalScore,
      matchReasons: reasons,
      budgetCompatibility,
      estimatedTotalMinor,
      quantityMatch,
      shelfLifeCompatibilityDays: remainingDays,
    });
  }

  // Sort by highest compatibility score
  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
