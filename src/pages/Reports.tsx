import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/tax-calculator';
import { 
  BarChart3, 
  Lock,
  ChevronUp,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Download,
  Mail
} from 'lucide-react';

export default function Reports() {
  const { state, isSecurePlusMode } = useTaxNarrate();
  const isIndividual = state.userType === 'individual';
  
  if (!isSecurePlusMode) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tax Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive tax insights</p>
          </div>
          
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Secure+ Required</h2>
              <p className="text-muted-foreground mb-6">
                Advanced reports and analytics are available exclusively in Secure+ Mode.
                Get detailed insights, payment history, and compliance reports.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Payment History</span>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Tax Analytics</span>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Compliance Reports</span>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">PDF Exports</span>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary">
                  {isIndividual ? '₦15,000' : '₦250,000'}
                  <span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
              </div>
              <Button size="lg" className="gap-2">
                <ChevronUp className="h-4 w-4" />
                Upgrade to Secure+
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  const totalTaxPaid = state.payments
    .filter(p => p.type === 'tax' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const annualTax = isIndividual ? state.individual.taxDue2026 : state.business.citDue;
  const remainingTax = Math.max(annualTax - totalTaxPaid, 0);
  const completionPercent = annualTax > 0 ? Math.round((totalTaxPaid / annualTax) * 100) : 0;
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tax Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Your comprehensive tax insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Report
            </Button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Tax Paid</p>
              <p className="text-2xl font-bold text-accent">{formatNaira(totalTaxPaid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Remaining Tax</p>
              <p className="text-2xl font-bold">{formatNaira(remainingTax)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold text-primary">{completionPercent}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p className="text-2xl font-bold text-accent">{formatNaira(state.individual.savings)}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Analytics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Tax Analytics (2024-2026)</CardTitle>
                <CardDescription>Your tax payment timeline and insights</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">On-Time Payment Rate</p>
                <p className="text-3xl font-bold text-accent">100%</p>
                <p className="text-xs text-muted-foreground">Excellent compliance record</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Penalties Avoided</p>
                <p className="text-3xl font-bold text-accent">{formatNaira(45000)}</p>
                <p className="text-xs text-muted-foreground">By paying on time</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Compliance Streak</p>
                <p className="text-3xl font-bold text-primary">365 days</p>
                <p className="text-xs text-muted-foreground">Continuous compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Payment History</CardTitle>
              </div>
              <Button variant="outline" size="sm">Export CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            {state.payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        payment.type === 'tax' ? 'bg-accent/10' : 'bg-primary/10'
                      }`}>
                        {payment.type === 'tax' ? (
                          <TrendingUp className={`h-5 w-5 ${payment.type === 'tax' ? 'text-accent' : 'text-primary'}`} />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString('en-NG', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {payment.receiptNumber && (
                          <p className="text-xs text-muted-foreground">
                            Receipt: {payment.receiptNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNaira(payment.amount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        payment.status === 'paid' 
                          ? 'bg-accent/10 text-accent' 
                          : payment.status === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tax Optimization Tips */}
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-accent" />
              <CardTitle>Tax Optimization Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium mb-1">Maximize Your Rent Relief</p>
                <p className="text-sm text-muted-foreground">
                  You're using {state.individual.annualRent > 0 ? 
                    `${Math.min(Math.round((state.individual.annualRent * 0.2) / 500000 * 100), 100)}%` : '0%'} 
                  of your rent relief cap. Document your rent payments properly to maximize this deduction.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium mb-1">Pension Contributions Are Optimal</p>
                <p className="text-sm text-muted-foreground">
                  Your 8% pension contribution is reducing your taxable income effectively.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium mb-1">Stay Below the Next Bracket</p>
                <p className="text-sm text-muted-foreground">
                  Monitor your income growth to plan for potential bracket changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
