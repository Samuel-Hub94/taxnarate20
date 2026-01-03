import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatNaira } from '@/lib/tax-calculator';
import { 
  Calculator, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  ChevronUp,
  Building2,
  Users,
  FileText,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { state, isLiteMode, isSecureMode, isSecurePlusMode } = useTaxNarrate();
  
  // Calculate compliance score
  const complianceItems = [
    { done: state.compliance.taxCalculated, label: 'Tax calculated' },
    { done: state.compliance.ninVerified, label: 'NIN verified' },
    { done: state.compliance.tinVerified, label: 'TIN verified' },
    { done: state.compliance.paymentMethodAdded, label: 'Payment method added' },
    { done: state.compliance.autoPayEnabled, label: 'Auto-pay enabled' },
  ];
  const completedItems = complianceItems.filter(item => item.done).length;
  const complianceScore = Math.round((completedItems / complianceItems.length) * 100);
  
  const isIndividual = state.userType === 'individual';
  
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {isIndividual ? 'Personal Tax Dashboard' : 'Business Tax Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Nigeria 2026 Tax Law Compliance
            </p>
          </div>
          
          {state.currentMode !== 'secure_plus' && (
            <Button className="gap-2">
              <ChevronUp className="h-4 w-4" />
              Upgrade to {state.currentMode === 'lite' ? 'Secure' : 'Secure+'}
            </Button>
          )}
        </div>
        
        {/* Compliance Banner */}
        <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold">2026 Law Readiness Status</h3>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl font-bold text-accent">{complianceScore}%</span>
                  <Progress value={complianceScore} className="flex-1 h-2" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {complianceItems.map((item, i) => (
                    <span 
                      key={i}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        item.done 
                          ? 'bg-accent/10 text-accent' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.done ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="shrink-0">
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">2026 Tax Due</p>
                  <p className="text-2xl font-bold">
                    {formatNaira(isIndividual ? state.individual.taxDue2026 : state.business.citDue)}
                  </p>
                  <p className="text-xs text-muted-foreground">Annual</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid (2026)</p>
                  <p className="text-2xl font-bold">
                    {formatNaira(state.taxAutoPay.totalPaid)}
                  </p>
                  <p className="text-xs text-accent">
                    {state.individual.taxDue2026 > 0 
                      ? `${Math.round((state.taxAutoPay.totalPaid / state.individual.taxDue2026) * 100)}% Paid`
                      : '0% Paid'
                    }
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">2026 Savings</p>
                  <p className="text-2xl font-bold text-accent">
                    {formatNaira(state.individual.savings)}
                  </p>
                  <p className="text-xs text-muted-foreground">vs 2025 Law</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tax Calculator */}
          <Card className="card-interactive">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Tax Calculator</CardTitle>
                  <CardDescription className="text-xs">Calculate your 2026 PAYE</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Calculate your tax under the new 2026 law with ₦800k tax-free threshold.
              </p>
              <Link to="/calculator">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  Calculate Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Tax Payment */}
          <Card className={`card-interactive ${isLiteMode ? 'feature-locked' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">Tax Payment</CardTitle>
                  <CardDescription className="text-xs">Pay your taxes easily</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Pay your PAYE tax in full, quarterly, or monthly installments.
              </p>
              {isLiteMode ? (
                <Button size="sm" className="w-full gap-2">
                  Upgrade to Secure
                </Button>
              ) : (
                <Link to="/payments">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    Make Payment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
          
          {/* Narration Assistant */}
          <Card className={`card-interactive ${isLiteMode ? 'feature-locked' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-base">Narration Assistant</CardTitle>
                  <CardDescription className="text-xs">Understand tax implications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Learn about transaction narrations and their tax implications.
              </p>
              {isLiteMode ? (
                <Button size="sm" className="w-full gap-2">
                  Upgrade to Secure
                </Button>
              ) : (
                <Link to="/narration">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Business-specific section */}
        {!isIndividual && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Business Tax Obligations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CIT Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Company Income Tax (CIT)</CardTitle>
                    </div>
                    {state.business.isExempt ? (
                      <span className="status-paid">Exempt</span>
                    ) : (
                      <span className="status-pending">Due</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Turnover</span>
                      <span className="font-medium">{formatNaira(state.business.annualTurnover)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax Rate</span>
                      <span className="font-medium">{state.business.isExempt ? '0%' : '30%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax Due (2026)</span>
                      <span className="font-medium">{formatNaira(state.business.citDue)}</span>
                    </div>
                  </div>
                  {!isLiteMode && !state.business.isExempt && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">Pay Now</Button>
                      <Button size="sm" variant="outline">Auto-Pay</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Employee PAYE Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-accent" />
                      <CardTitle className="text-base">Employee PAYE Tax</CardTitle>
                    </div>
                    <span className="status-pending">Due</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Employees</span>
                      <span className="font-medium">{state.business.employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Payroll Tax</span>
                      <span className="font-medium">
                        {formatNaira(state.business.employees.reduce((sum, e) => sum + e.monthlyTax, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Month Status</span>
                      <span className="text-warning">Due Feb 10, 2026</span>
                    </div>
                  </div>
                  {!isLiteMode && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">Manage Employees</Button>
                      <Button size="sm" className="flex-1">Pay Payroll Tax</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {/* Lite Mode Upgrade Prompt */}
        {isLiteMode && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Unlock Full Features</h3>
                  <p className="text-muted-foreground text-sm">
                    Upgrade to Secure Mode to verify your identity, make tax payments, 
                    and stay fully compliant with the 2026 law.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">NIN/TIN Verification</span>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Tax Payment</span>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">PDF Summaries</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {isIndividual ? '₦5,000' : '₦50,000'}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">/year</div>
                  <Button size="lg" className="gap-2">
                    <ChevronUp className="h-4 w-4" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
