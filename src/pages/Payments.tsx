import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatNaira, calculateMonthlyInstallment, calculateQuarterlyInstallment } from '@/lib/tax-calculator';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { PayrollPaymentModal } from '@/components/employees/PayrollPaymentModal';
import { PaymentHistory } from '@/components/payments/PaymentHistory';
import { 
  CreditCard, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ChevronUp,
  Lock,
  Shield,
  Building2,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentPlan = 'monthly' | 'quarterly' | 'annual';

export default function Payments() {
  const { state, isLiteMode, isSecurePlusMode, addPayment, dispatch } = useTaxNarrate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>('monthly');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [autoPayDialogOpen, setAutoPayDialogOpen] = useState(false);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [activeTab, setActiveTab] = useState('pay');
  
  const isIndividual = state.userType === 'individual';
  const isBusiness = state.userType === 'business';
  const annualTax = isIndividual ? state.individual.taxDue2026 : state.business.citDue;
  const monthlyAmount = calculateMonthlyInstallment(annualTax);
  const quarterlyAmount = calculateQuarterlyInstallment(annualTax);
  
  const paymentPlans = [
    { 
      value: 'monthly' as PaymentPlan, 
      label: 'Monthly', 
      amount: monthlyAmount, 
      frequency: '× 12',
      description: 'Pays with your salary'
    },
    { 
      value: 'quarterly' as PaymentPlan, 
      label: 'Quarterly', 
      amount: quarterlyAmount, 
      frequency: '× 4',
      description: 'Pay every 3 months'
    },
    { 
      value: 'annual' as PaymentPlan, 
      label: 'Annual', 
      amount: annualTax, 
      frequency: '× 1',
      description: 'One-time payment'
    },
  ];
  
  const selectedPlanData = paymentPlans.find(p => p.value === selectedPlan)!;
  
  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const payment = {
      id: `PAY-${Date.now()}`,
      type: 'tax' as const,
      amount: selectedPlanData.amount,
      date: new Date().toISOString(),
      status: 'paid' as const,
      receiptNumber: `NRS-2026-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      description: `2026 ${isIndividual ? 'PAYE' : 'CIT'} - ${selectedPlanData.label} Installment`,
    };
    
    addPayment(payment);
    dispatch({ 
      type: 'UPDATE_TAX_AUTO_PAY', 
      payload: { totalPaid: state.taxAutoPay.totalPaid + selectedPlanData.amount } 
    });
    
    setProcessing(false);
    setPaymentDialogOpen(false);
    
    toast({
      title: "Payment Successful!",
      description: `Receipt: ${payment.receiptNumber}`,
    });
  };
  
  const handleEnableAutoPay = async () => {
    if (!consent) return;
    
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    dispatch({
      type: 'UPDATE_TAX_AUTO_PAY',
      payload: {
        enabled: true,
        plan: selectedPlan,
        authorized: true,
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    });
    
    setProcessing(false);
    setAutoPayDialogOpen(false);
    
    toast({
      title: "Auto-Pay Enabled!",
      description: `${selectedPlanData.label} payments will be processed automatically.`,
    });
  };
  
  if (isLiteMode) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tax Payments</h1>
            <p className="text-muted-foreground mt-1">Pay your taxes easily</p>
          </div>
          
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Upgrade Required</h2>
              <p className="text-muted-foreground mb-6">
                Tax payment features are available in Secure Mode and above.
                Upgrade to pay your taxes and maintain compliance.
              </p>
              <div className="flex flex-col items-center gap-4">
                <div className="text-3xl font-bold text-primary">
                  {isIndividual ? '₦5,000' : '₦50,000'}
                  <span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
                <Link to="/settings">
                  <Button size="lg" className="gap-2">
                    <ChevronUp className="h-4 w-4" />
                    Upgrade to Secure
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tax Payments</h1>
            <p className="text-muted-foreground mt-1">
              {isIndividual ? 'Pay your PAYE tax' : 'Manage company and payroll taxes'}
            </p>
          </div>
        </div>
        
        {/* Tabs for Business */}
        {isBusiness ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pay" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Pay Tax
              </TabsTrigger>
              <TabsTrigger value="employees" className="gap-2">
                <Users className="h-4 w-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="cit" className="gap-2">
                <Building2 className="h-4 w-4" />
                CIT
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pay" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CIT Quick Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Company Tax (CIT)</p>
                          <p className="text-xs text-muted-foreground">
                            {state.business.isExempt ? 'Exempt (≤₦100M)' : '30% of turnover'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatNaira(state.business.citDue)}</p>
                        <span className={state.business.isExempt ? 'status-paid' : 'status-pending'}>
                          {state.business.isExempt ? 'Exempt' : 'Due'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payroll Quick Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Payroll Tax (PAYE)</p>
                          <p className="text-xs text-muted-foreground">
                            {state.business.employees.length} employees
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {formatNaira(state.business.employees.reduce((sum, e) => sum + e.monthlyTax, 0))}
                        </p>
                        <span className="status-pending">Monthly</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Payment actions */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 gap-2" 
                  disabled={state.business.isExempt && state.business.citDue === 0}
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <CreditCard className="h-4 w-4" />
                  Pay Company Tax
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  disabled={state.business.employees.length === 0}
                  onClick={() => setPayrollModalOpen(true)}
                >
                  <Users className="h-4 w-4" />
                  Pay Payroll Tax
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="employees" className="mt-4">
              <EmployeeList onPayPayroll={() => setPayrollModalOpen(true)} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <PaymentHistory />
            </TabsContent>
            
            <TabsContent value="cit" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Income Tax (CIT)</CardTitle>
                  <CardDescription>2026 Tax Year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Turnover</p>
                      <p className="text-xl font-bold">{formatNaira(state.business.annualTurnover)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tax Rate</p>
                      <p className="text-xl font-bold">{state.business.isExempt ? '0%' : '30%'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tax Due</p>
                      <p className="text-xl font-bold text-primary">{formatNaira(state.business.citDue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <span className={state.business.isExempt ? 'status-paid' : 'status-pending'}>
                        {state.business.isExempt ? 'Exempt' : 'Payment Required'}
                      </span>
                    </div>
                  </div>
                  
                  {!state.business.isExempt && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <p className="font-medium">Payment Options</p>
                        <RadioGroup value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as PaymentPlan)}>
                          {paymentPlans.map((plan) => (
                            <div 
                              key={plan.value}
                              className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer ${
                                selectedPlan === plan.value ? 'border-primary bg-primary/5' : ''
                              }`}
                              onClick={() => setSelectedPlan(plan.value)}
                            >
                              <RadioGroupItem value={plan.value} id={`cit-${plan.value}`} />
                              <div className="flex-1">
                                <Label htmlFor={`cit-${plan.value}`} className="cursor-pointer">{plan.label}</Label>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatNaira(plan.amount)}</p>
                                <p className="text-xs text-muted-foreground">{plan.frequency}</p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <Button className="w-full gap-2" onClick={() => setPaymentDialogOpen(true)}>
                        <CreditCard className="h-4 w-4" />
                        Pay {formatNaira(selectedPlanData.amount)}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Individual view
          <>
            {annualTax === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Tax Calculated</h2>
                  <p className="text-muted-foreground mb-4">
                    Please use the Tax Calculator first to determine your tax liability.
                  </p>
                  <Button asChild>
                    <a href="/calculator">Go to Calculator</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Plan Selection */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Choose Payment Plan</CardTitle>
                      <CardDescription>Select how you want to pay your 2026 tax</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as PaymentPlan)}>
                        <div className="space-y-3">
                          {paymentPlans.map((plan) => (
                            <div 
                              key={plan.value}
                              className={`relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-smooth ${
                                selectedPlan === plan.value 
                                  ? 'border-primary bg-primary/5' 
                                  : 'hover:border-muted-foreground/30'
                              }`}
                              onClick={() => setSelectedPlan(plan.value)}
                            >
                              <RadioGroupItem value={plan.value} id={plan.value} />
                              <div className="flex-1">
                                <Label htmlFor={plan.value} className="text-base font-medium cursor-pointer">
                                  {plan.label}
                                </Label>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatNaira(plan.amount)}</p>
                                <p className="text-xs text-muted-foreground">{plan.frequency}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                  
                  {/* Auto-Pay Section */}
                  {isSecurePlusMode && (
                    <Card className="border-accent/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-accent" />
                            <div>
                              <CardTitle>Tax Auto-Pay</CardTitle>
                              <CardDescription>Never miss a tax deadline</CardDescription>
                            </div>
                          </div>
                          {state.taxAutoPay.enabled ? (
                            <span className="status-paid">Active</span>
                          ) : (
                            <span className="status-pending">Inactive</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {state.taxAutoPay.enabled ? (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Plan</span>
                              <span className="font-medium capitalize">{state.taxAutoPay.plan}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Next Payment</span>
                              <span className="font-medium">
                                {state.taxAutoPay.nextPayment 
                                  ? new Date(state.taxAutoPay.nextPayment).toLocaleDateString('en-NG', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })
                                  : 'Not scheduled'
                                }
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => dispatch({ type: 'UPDATE_TAX_AUTO_PAY', payload: { enabled: false } })}
                            >
                              Disable Auto-Pay
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground mb-4">
                              Enable automatic {selectedPlan} tax payments to stay compliant and avoid penalties.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                                ✓ Never miss deadlines
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                                ✓ Avoid 10% penalties
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                                ✓ Auto receipts
                              </span>
                            </div>
                            <Dialog open={autoPayDialogOpen} onOpenChange={setAutoPayDialogOpen}>
                              <DialogTrigger asChild>
                                <Button className="w-full gap-2">
                                  <Zap className="h-4 w-4" />
                                  Enable Auto-Pay
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Enable Tax Auto-Pay</DialogTitle>
                                  <DialogDescription>
                                    Automatically pay your taxes to avoid penalties
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Plan</span>
                                      <span className="font-medium capitalize">{selectedPlan}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Amount</span>
                                      <span className="font-medium">{formatNaira(selectedPlanData.amount)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="p-4 rounded-lg border space-y-2">
                                    <h4 className="font-medium flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-primary" />
                                      Authorization & Consent
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      By enabling auto-pay, you authorize TaxNarrate to charge your payment 
                                      method on scheduled dates for tax payments to Nigeria Revenue Service.
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-start space-x-2">
                                    <Checkbox 
                                      id="consent" 
                                      checked={consent}
                                      onCheckedChange={(c) => setConsent(c as boolean)}
                                    />
                                    <Label htmlFor="consent" className="text-sm leading-tight cursor-pointer">
                                      I authorize automatic tax payments and understand charges will be 
                                      processed on scheduled dates
                                    </Label>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => setAutoPayDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    className="flex-1 gap-2"
                                    disabled={!consent || processing}
                                    onClick={handleEnableAutoPay}
                                  >
                                    {processing ? (
                                      <>Processing...</>
                                    ) : (
                                      <>
                                        <Zap className="h-4 w-4" />
                                        Enable Auto-Pay
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {!isSecurePlusMode && (
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Zap className="h-8 w-8 text-primary" />
                          <div className="flex-1">
                            <h3 className="font-semibold">Upgrade for Auto-Pay</h3>
                            <p className="text-sm text-muted-foreground">
                              Never miss a tax deadline with automatic payments
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-1">
                            <ChevronUp className="h-4 w-4" />
                            Secure+
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Payment Summary */}
                <div>
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax Year</span>
                          <span>2026</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Tax</span>
                          <span>{formatNaira(annualTax)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Plan</span>
                          <span className="capitalize">{selectedPlan}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Amount to Pay</span>
                          <span className="text-primary">{formatNaira(selectedPlanData.amount)}</span>
                        </div>
                      </div>
                      
                      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2" size="lg">
                            <CreditCard className="h-4 w-4" />
                            Pay {formatNaira(selectedPlanData.amount)}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Payment</DialogTitle>
                            <DialogDescription>
                              You are about to make a tax payment
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-sm">
                              <p className="font-medium text-foreground flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-warning" />
                                DEMO MODE
                              </p>
                              <p className="text-muted-foreground mt-1">
                                This is a simulated payment. No actual money will be charged.
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Description</span>
                                <span>2026 PAYE - {selectedPlanData.label}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-semibold">{formatNaira(selectedPlanData.amount)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setPaymentDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="flex-1 gap-2"
                              disabled={processing}
                              onClick={handlePayment}
                            >
                              {processing ? (
                                <>
                                  <Clock className="h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Confirm Payment
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <p className="text-xs text-center text-muted-foreground">
                        Secure payment via NRS Gateway (Demo)
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Payment History for individuals */}
            {state.payments.length > 0 && isSecurePlusMode && (
              <PaymentHistory />
            )}
          </>
        )}
        
        {/* Payroll Payment Modal */}
        <PayrollPaymentModal 
          open={payrollModalOpen} 
          onOpenChange={setPayrollModalOpen} 
        />
      </div>
    </MainLayout>
  );
}
