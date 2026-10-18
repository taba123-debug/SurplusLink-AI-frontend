import { toMinorUnits } from '@/lib/money';
import type { LotExtraction, ProductCategory, RequirementExtraction, UnitType } from '@/types';

/**
 * Deterministic, example-aware natural language parser for Buyer Requirements.
 */
export function extractBuyerRequirement(text: string): RequirementExtraction {
  const normalized = text.toLowerCase().trim();
  const missing_fields: string[] = [];

  // 1. Detect Category
  let category: ProductCategory = 'BISCUITS';
  if (normalized.includes('rusk') || normalized.includes('cake rusk')) {
    category = 'RUSKS';
  } else if (normalized.includes('cookie') || normalized.includes('chocolate chip')) {
    category = 'COOKIES';
  } else if (normalized.includes('cracker') || normalized.includes('sesame') || normalized.includes('wafer')) {
    category = 'CRACKERS';
  } else if (normalized.includes('bread')) {
    category = 'PACKAGED_BREAD';
  } else if (normalized.includes('biscuit')) {
    category = 'BISCUITS';
  } else {
    // If not found, flag missing
    missing_fields.push('category');
  }

  // 2. Detect Quantity (e.g. "150 packs", "100 boxes", "need 200", "quantity 50")
  let quantity = 0;
  const qtyRegex = /(?:need|want|for|buy|purchase|quantity|approx|around)?\s*(\d{1,5})\s*(?:packs?|boxes?|cartons?|cases?|units?|pieces?|pkts?)?/i;
  const numberMatches = normalized.match(/\b(\d{1,5})\b/g);

  // Look specifically for quantity pattern
  const explicitQty = normalized.match(/(\d{1,4})\s*(?:packs?|boxes?|cartons?|cases?|units?|pkts?)/i);
  if (explicitQty && explicitQty[1]) {
    quantity = parseInt(explicitQty[1], 10);
  } else if (numberMatches && numberMatches.length > 0) {
    // First non-budget number under 5000 is likely quantity
    const potential = numberMatches.map(Number).find((n) => n > 5 && n <= 2000 && n !== 20000 && n !== 15000);
    quantity = potential || 100;
  } else {
    missing_fields.push('required_quantity');
  }

  // 3. Detect Budget (e.g. "under Rs. 20,000", "Rs 20000", "20k", "budget 15,000")
  let budgetPkr = 0;
  const budgetMatch = normalized.match(/(?:rs\.?|rupees|budget|under|max|pk|pkr)?\s*(\d{1,3}(?:,\d{3})+|\d{4,7})\b/i);
  const kMatch = normalized.match(/(\d{1,3})\s*k\b/i);

  if (budgetMatch && budgetMatch[1]) {
    budgetPkr = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
  } else if (kMatch && kMatch[1]) {
    budgetPkr = parseInt(kMatch[1], 10) * 1000;
  } else {
    // Default reasonable estimate based on quantity
    budgetPkr = quantity > 0 ? quantity * 130 : 20000;
  }

  // 4. Detect Shelf Life (e.g. "30 days", "at least 45 days", "30+ days", "expiry > 30")
  let shelfLifeDays = 30;
  const shelfLifeMatch = normalized.match(/(\d{1,3})\s*(?:\+|-)?\s*days?/i);
  if (shelfLifeMatch && shelfLifeMatch[1]) {
    shelfLifeDays = parseInt(shelfLifeMatch[1], 10);
  }

  // 5. Detect City & Area
  let city = 'Lahore';
  let preferred_area: string | null = null;

  if (normalized.includes('karachi')) city = 'Karachi';
  else if (normalized.includes('islamabad')) city = 'Islamabad';
  else if (normalized.includes('rawalpindi')) city = 'Rawalpindi';
  else if (normalized.includes('faisalabad')) city = 'Faisalabad';

  const areas = ['johar town', 'gulberg', 'model town', 'dha', 'township', 'badami bagh', 'kot lakhpat'];
  for (const area of areas) {
    if (normalized.includes(area)) {
      preferred_area = area.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  const needs_review = missing_fields.length > 0 || quantity === 0 || budgetPkr === 0;

  return {
    category,
    required_quantity: quantity || 100,
    max_total_budget_minor: toMinorUnits(budgetPkr || 15000),
    min_remaining_shelf_life_days: shelfLifeDays,
    city,
    preferred_area,
    needs_review,
    missing_fields,
  };
}

/**
 * Deterministic natural language parser for Seller Surplus Inventory.
 */
export function extractSellerLotDescription(text: string): LotExtraction {
  const normalized = text.toLowerCase().trim();
  const missing_fields: string[] = [];

  // Category
  let category: ProductCategory = 'BISCUITS';
  if (normalized.includes('rusk')) category = 'RUSKS';
  else if (normalized.includes('cookie')) category = 'COOKIES';
  else if (normalized.includes('cracker')) category = 'CRACKERS';
  else if (normalized.includes('bread')) category = 'PACKAGED_BREAD';

  // Title generator
  let title = 'Surplus Sealed Bakery Stock';
  if (category === 'BISCUITS') title = 'Surplus Sealed Tea Biscuits Batch';
  else if (category === 'RUSKS') title = 'Crispy Double-Baked Tea Rusks Batch';
  else if (category === 'COOKIES') title = 'Baked Butter Cookies Surplus Stock';
  else if (category === 'CRACKERS') title = 'Savory Crisp Crackers Wholesale Batch';

  // Quantity
  let total_quantity = 200;
  const qtyMatch = normalized.match(/(\d{1,5})\s*(?:packs?|boxes?|cartons?|cases?|units?|pouches?)/i);
  if (qtyMatch && qtyMatch[1]) {
    total_quantity = parseInt(qtyMatch[1], 10);
  }

  // Unit type
  let unit_type: UnitType = 'packs';
  if (normalized.includes('box')) unit_type = 'boxes';
  else if (normalized.includes('carton')) unit_type = 'cartons';
  else if (normalized.includes('case')) unit_type = 'cases';

  // Price & Reserve
  let asking_unit_price: number | null = null;
  let reserve_unit_price: number | null = null;

  const priceMatches = normalized.match(/(?:rs\.?|pkr)?\s*(\d{2,4})\s*(?:each|per unit|per pack|\/pack|\/unit)?/gi);
  if (priceMatches && priceMatches.length > 0) {
    const numbers = priceMatches
      .map((s) => {
        const m = s.match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => n > 20 && n < 2000);

    if (numbers.length >= 2) {
      asking_unit_price = Math.max(...numbers);
      reserve_unit_price = Math.min(...numbers);
    } else if (numbers.length === 1) {
      asking_unit_price = Math.round(numbers[0] * 1.1);
      reserve_unit_price = numbers[0];
    }
  }

  if (!asking_unit_price) {
    asking_unit_price = 115;
    reserve_unit_price = 100;
  }

  // Expiry / shelf life
  let expiry_days = 45;
  const expiryMatch = normalized.match(/(\d{1,3})\s*days?/i);
  if (expiryMatch && expiryMatch[1]) {
    expiry_days = parseInt(expiryMatch[1], 10);
  }

  // City & Region
  let city = 'Lahore';
  let pickup_region = 'Gulberg Industrial Area';
  if (normalized.includes('township')) pickup_region = 'Township Industrial Zone';
  else if (normalized.includes('quaid')) pickup_region = 'Quaid-e-Azam Industrial Estate';
  else if (normalized.includes('johar')) pickup_region = 'Johar Town Industrial Sector';
  else if (normalized.includes('gulberg')) pickup_region = 'Gulberg Industrial Area';

  return {
    title,
    category,
    total_quantity,
    unit_type,
    asking_unit_price_minor: asking_unit_price ? toMinorUnits(asking_unit_price) : null,
    reserve_unit_price_minor: reserve_unit_price ? toMinorUnits(reserve_unit_price) : null,
    min_purchase_quantity: Math.min(25, Math.round(total_quantity * 0.15)),
    packaging_type: 'Airtight food-grade sealed master packaging',
    expiry_days_from_now: expiry_days,
    storage_requirements: 'Dry ambient storage (18°C–24°C), protected from humidity',
    city,
    pickup_region,
    needs_review: false,
    missing_fields,
  };
}
