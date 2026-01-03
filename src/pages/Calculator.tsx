import { useState, useEffect } from 'react';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  calculate2026Tax, 
  calculate2025Tax, 
  compareTax,
  calculateCIT,
  formatNaira,
  formatCurrency,
  TaxBreakdown 
} from '@/lib/tax-calculator';
import { 
  Calculator, 
  TrendingDown, 
  TrendingUp,
  CheckCircle2,
  Info,
  Building2,
  User
} from 'lucide-react';

export default function TaxCalculator() {
  const { state, updateIndividual, updateBusiness, dispatch } = useTaxNarrate();
  const isIndividual = state.userType === 'individual';
  
  // Individual inputs
  const [monthlyIncome, setMonthlyIncome] = useState(state.individual.monthlyIncome.toString());
  const [annualRent, setAnnualRent] = useState(state.individual.annualRent.toString());
  
  // Business inputs
  const [annualTurnover, setAnnualTurnover] = useState(state.business.annualTurnover.toString());
  
  // Results
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  const [comparison, setComparison] = useState<{ tax2025: number; tax2026: number; savings: number; savingsPercent: number } | null>(null);
  const [citResult, setCitResult] = useState<{ isExempt: boolean; taxRate: number; taxDue: number } | null>(null);
  
  // Calculate on input change
  useEffect(() => {
    if (isIndividual) {
      const income = parseFloat(monthlyIncome) || 0;
      const rent = parseFloat(annualRent) || 0;
      const annualGross = income * 12;
      
      if (annualGross > 0) {
        const breakdown = calculate2026Tax(annualGross, rent);
        const comp = compareTax(annualGross, rent);
        
        setTaxBreakdown(breakdown);
        setComparison(comp);
        
        // Update state
        updateIndividual({
          monthlyIncome: income,
          annualRent: rent,
          taxDue2026: breakdown.taxDue,
          taxDue2025: comp.tax2025,
          savings: comp.savings,
        });
        
        dispatch({ type: 'UPDATE_COMPLIANCE', payload: { taxCalculated: true } });
      } else {
        setTaxBreakdown(null);
        setComparison(null);
      }
    } else {
      const turnover = parseFloat(annualTurnover) || 0;
      
      if (turnover > 0) {
        const cit = calculateCIT(turnover);
        setCitResult(cit);
        
        updateBusiness({
          annualTurnover: turnover,
          isExempt: cit.isExempt,
          citDue: cit.taxDue,
        });
        
        dispatch({ type: 'UPDATE_COMPLIANCE', payload: { taxCalculated: true } });
      } else {
        setCitResult(null);
      }
    }
  }, [monthlyIncome, annualRent, annualTurnover, isIndividual]);
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Tax Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            Calculate your tax under Nigeria's 2026 Tax Law
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                {isIndividual ? (
                  <User className="h-5 w-5 text-primary" />
                ) : (
                  <Building2 className="h-5 w-5 text-primary" />
                )}
                <div>
                  <CardTitle>
                    {isIndividual ? 'Personal Income Details' : 'Business Details'}
                  </CardTitle>
                  <CardDescription>
                    {isIndividual 
                      ? 'Enter your monthly income and rent'
                      : 'Enter your annual business turnover'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isIndividual ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Gross Income</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        placeholder="0"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Annual: {formatNaira((parseFloat(monthlyIncome) || 0) * 12)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="annualRent">
                      Annual Rent Paid
                      <span className="text-xs text-muted-foreground ml-2">(Optional, for rent relief)</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        id="annualRent"
                        type="number"
                        placeholder="0"
                        value={annualRent}
                        onChange={(e) => setAnnualRent(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rent Relief: 20% of rent, max ₦500,000
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="annualTurnover">Annual Business Turnover</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                    <Input
                      id="annualTurnover"
                      type="number"
                      placeholder="0"
                      value={annualTurnover}
                      onChange={(e) => setAnnualTurnover(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Businesses with turnover ≤ ₦100M are CIT exempt
                  </p>
                </div>
              )}
              
              {/* Info Box */}
              <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  {isIndividual ? (
                    <>
                      <strong>2026 PAYE:</strong> ₦800,000 tax-free threshold with progressive rates from 15% to 25%.
                      Deductions include 8% pension, 2.5% NHF, and rent relief.
                    </>
                  ) : (
                    <>
                      <strong>2026 CIT:</strong> 30% Company Income Tax applies to businesses with turnover above ₦100 million.
                      Small businesses are exempt.
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Results Section */}
          <div className="space-y-4">
            {/* Tax Summary */}
            {isIndividual && taxBreakdown && (
              <Card className="border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-accent" />
                    Your 2026 Tax
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-1">Annual Tax Due</p>
                    <p className="text-4xl font-bold text-primary">{formatNaira(taxBreakdown.taxDue)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monthly: {formatNaira(taxBreakdown.taxDue / 12)}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Income</span>
                      <span>{formatNaira(taxBreakdown.grossIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pension (8%)</span>
                      <span className="text-destructive">-{formatNaira(taxBreakdown.pensionDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NHF (2.5%)</span>
                      <span className="text-destructive">-{formatNaira(taxBreakdown.nhfDeduction)}</span>
                    </div>
                    {taxBreakdown.rentRelief > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rent Relief</span>
                        <span className="text-destructive">-{formatNaira(taxBreakdown.rentRelief)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Taxable Income</span>
                      <span>{formatNaira(taxBreakdown.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between text-accent">
                      <span>Effective Tax Rate</span>
                      <span>{taxBreakdown.effectiveRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Business CIT Result */}
            {!isIndividual && citResult && (
              <Card className={citResult.isExempt ? 'border-accent/20' : 'border-warning/20'}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Company Income Tax
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {citResult.isExempt ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
                      <p className="text-lg font-semibold text-accent">CIT Exempt</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Turnover ≤ ₦100M qualifies for exemption
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-1">Annual CIT Due</p>
                      <p className="text-4xl font-bold text-primary">{formatNaira(citResult.taxDue)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tax Rate: {citResult.taxRate}%
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Turnover</span>
                      <span>{formatNaira(parseFloat(annualTurnover) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exemption Threshold</span>
                      <span>₦100,000,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Comparison Card */}
            {isIndividual && comparison && comparison.savings !== 0 && (
              <Card className={comparison.savings > 0 ? 'border-accent/20 bg-accent/5' : 'border-destructive/20 bg-destructive/5'}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      comparison.savings > 0 ? 'bg-accent/10' : 'bg-destructive/10'
                    }`}>
                      {comparison.savings > 0 ? (
                        <TrendingDown className="h-6 w-6 text-accent" />
                      ) : (
                        <TrendingUp className="h-6 w-6 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Compared to 2025 Law</p>
                      <p className={`text-xl font-bold ${comparison.savings > 0 ? 'text-accent' : 'text-destructive'}`}>
                        {comparison.savings > 0 ? 'You Save' : 'You Pay More'} {formatNaira(Math.abs(comparison.savings))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2025 Tax: {formatNaira(comparison.tax2025)} → 2026 Tax: {formatNaira(comparison.tax2026)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Tax Bands Breakdown */}
            {isIndividual && taxBreakdown && taxBreakdown.bands.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tax Bands Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {taxBreakdown.bands.map((band, index) => (
                      <div key={index} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{band.range}</p>
                          <p className="text-xs text-muted-foreground">
                            {band.rate}% on {formatNaira(band.taxableAmount)}
                          </p>
                        </div>
                        <span className="font-medium">{formatNaira(band.taxAmount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Demo Disclaimer */}
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
          ⚠️ This is a demonstration calculator for educational purposes. 
          Actual tax calculations should be verified with a qualified tax professional.
        </div>
      </div>
    </MainLayout>
  );
}
