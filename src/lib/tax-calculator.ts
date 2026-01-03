// TaxNarrate - Nigeria 2026 Tax Calculation Engine

export interface TaxBreakdown {
  grossIncome: number;
  pensionDeduction: number;
  nhfDeduction: number;
  rentRelief: number;
  taxableIncome: number;
  taxDue: number;
  effectiveRate: number;
  bands: TaxBand[];
}

export interface TaxBand {
  range: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface TaxComparison {
  tax2025: number;
  tax2026: number;
  savings: number;
  savingsPercent: number;
}

// 2026 PAYE Tax Bands (New Law)
const TAX_BANDS_2026 = [
  { min: 0, max: 800000, rate: 0 },           // Tax-free threshold
  { min: 800000, max: 1600000, rate: 0.15 },  // 15%
  { min: 1600000, max: 3200000, rate: 0.18 }, // 18%
  { min: 3200000, max: 6400000, rate: 0.21 }, // 21%
  { min: 6400000, max: Infinity, rate: 0.25 }, // 25%
];

// 2025 PAYE (CRA System - for comparison)
const CRA_RATE = 0.20; // 20% of gross + 1% of gross
const CRA_FIXED = 200000; // ₦200,000 fixed allowance

/**
 * Calculate 2026 PAYE Tax
 */
export function calculate2026Tax(
  annualGross: number,
  annualRent: number = 0
): TaxBreakdown {
  // Deductions
  const pensionDeduction = annualGross * 0.08; // 8% pension
  const nhfDeduction = (annualGross * 0.25) * 0.025; // 2.5% of basic (assuming basic = 25% of gross)
  
  // Rent Relief: 20% of rent, capped at ₦500,000
  const rentRelief = Math.min(annualRent * 0.20, 500000);
  
  // Taxable income after deductions
  const taxableIncome = Math.max(
    annualGross - pensionDeduction - nhfDeduction - rentRelief,
    0
  );
  
  // Calculate tax using progressive bands
  let remainingIncome = taxableIncome;
  let totalTax = 0;
  const bands: TaxBand[] = [];
  
  for (const band of TAX_BANDS_2026) {
    if (remainingIncome <= 0) break;
    
    const bandWidth = band.max - band.min;
    const taxableInBand = Math.min(remainingIncome, bandWidth);
    const taxInBand = taxableInBand * band.rate;
    
    if (taxableInBand > 0) {
      bands.push({
        range: band.max === Infinity 
          ? `Above ₦${formatCurrency(band.min)}`
          : `₦${formatCurrency(band.min)} - ₦${formatCurrency(band.max)}`,
        rate: band.rate * 100,
        taxableAmount: taxableInBand,
        taxAmount: taxInBand,
      });
    }
    
    totalTax += taxInBand;
    remainingIncome -= taxableInBand;
  }
  
  const effectiveRate = annualGross > 0 ? (totalTax / annualGross) * 100 : 0;
  
  return {
    grossIncome: annualGross,
    pensionDeduction,
    nhfDeduction,
    rentRelief,
    taxableIncome,
    taxDue: totalTax,
    effectiveRate,
    bands,
  };
}

/**
 * Calculate 2025 CRA Tax (for comparison)
 */
export function calculate2025Tax(annualGross: number): number {
  // Consolidated Relief Allowance
  const cra = Math.max(CRA_FIXED + (annualGross * 0.20), annualGross * 0.21);
  const taxableIncome = Math.max(annualGross - cra, 0);
  
  // 2025 Progressive rates (simplified)
  const bands2025 = [
    { max: 300000, rate: 0.07 },
    { max: 600000, rate: 0.11 },
    { max: 1100000, rate: 0.15 },
    { max: 1600000, rate: 0.19 },
    { max: 3200000, rate: 0.21 },
    { max: Infinity, rate: 0.24 },
  ];
  
  let remaining = taxableIncome;
  let prevMax = 0;
  let tax = 0;
  
  for (const band of bands2025) {
    if (remaining <= 0) break;
    const bandWidth = band.max - prevMax;
    const taxable = Math.min(remaining, bandWidth);
    tax += taxable * band.rate;
    remaining -= taxable;
    prevMax = band.max;
  }
  
  return tax;
}

/**
 * Compare 2025 vs 2026 tax
 */
export function compareTax(
  annualGross: number,
  annualRent: number = 0
): TaxComparison {
  const tax2025 = calculate2025Tax(annualGross);
  const result2026 = calculate2026Tax(annualGross, annualRent);
  const savings = tax2025 - result2026.taxDue;
  
  return {
    tax2025,
    tax2026: result2026.taxDue,
    savings,
    savingsPercent: tax2025 > 0 ? (savings / tax2025) * 100 : 0,
  };
}

/**
 * Calculate Company Income Tax (CIT)
 */
export function calculateCIT(annualTurnover: number): {
  isExempt: boolean;
  taxRate: number;
  taxDue: number;
} {
  const EXEMPTION_THRESHOLD = 100000000; // ₦100M
  const CIT_RATE = 0.30; // 30%
  
  if (annualTurnover <= EXEMPTION_THRESHOLD) {
    return {
      isExempt: true,
      taxRate: 0,
      taxDue: 0,
    };
  }
  
  return {
    isExempt: false,
    taxRate: CIT_RATE * 100,
    taxDue: annualTurnover * CIT_RATE,
  };
}

/**
 * Calculate monthly installment
 */
export function calculateMonthlyInstallment(annualTax: number): number {
  return annualTax / 12;
}

/**
 * Calculate quarterly installment
 */
export function calculateQuarterlyInstallment(annualTax: number): number {
  return annualTax / 4;
}

/**
 * Calculate penalty for overdue tax
 */
export function calculatePenalty(
  amount: number,
  daysOverdue: number
): { dailyPenalty: number; totalPenalty: number; totalDue: number } {
  const ANNUAL_RATE = 0.10; // 10% per annum
  const dailyPenalty = (amount * ANNUAL_RATE) / 365;
  const totalPenalty = dailyPenalty * daysOverdue;
  
  return {
    dailyPenalty,
    totalPenalty,
    totalDue: amount + totalPenalty,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format with Naira symbol
 */
export function formatNaira(amount: number): string {
  return `₦${formatCurrency(amount)}`;
}
