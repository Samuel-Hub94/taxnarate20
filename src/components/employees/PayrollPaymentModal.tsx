import { useState } from 'react';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatNaira } from '@/lib/tax-calculator';
import { AlertCircle, CheckCircle2, Clock, CreditCard, Download, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayrollPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollPaymentModal({ open, onOpenChange }: PayrollPaymentModalProps) {
  const { state, addPayment } = useTaxNarrate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  
  const employees = state.business.employees.filter(e => e.status === 'active');
  const totalTax = employees.reduce((sum, e) => sum + e.monthlyTax, 0);
  const currentMonth = new Date().toLocaleString('en-NG', { month: 'long', year: 'numeric' });
  
  const handlePayment = async () => {
    if (!confirmed) return;
    
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const receipt = `NRS-PAYE-${Date.now().toString(36).toUpperCase()}`;
    setReceiptNumber(receipt);
    
    const payment = {
      id: `PAY-${Date.now()}`,
      type: 'tax' as const,
      amount: totalTax,
      date: new Date().toISOString(),
      status: 'paid' as const,
      receiptNumber: receipt,
      description: `Payroll PAYE - ${currentMonth} (${employees.length} employees)`,
    };
    
    addPayment(payment);
    setProcessing(false);
    setPaymentComplete(true);
    
    toast({
      title: "Payroll Tax Payment Successful!",
      description: `${employees.length} employee receipts generated.`,
    });
  };
  
  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setConfirmed(false);
      setPaymentComplete(false);
      setReceiptNumber('');
    }, 200);
  };
  
  if (paymentComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <div className="text-center py-4">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="text-xl mb-2">Payment Successful!</DialogTitle>
            <DialogDescription>
              Payroll tax for {currentMonth} has been paid
            </DialogDescription>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Period</span>
              <span>{currentMonth}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-semibold">{formatNaira(totalTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Employees</span>
              <span>{employees.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receipt</span>
              <span className="font-mono text-xs">{receiptNumber}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Employee Receipts Generated:</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {employees.slice(0, 5).map((emp, i) => (
                <div key={emp.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                  <span>{emp.name}</span>
                  <span className="font-mono text-muted-foreground">{receiptNumber}-{(i + 1).toString().padStart(2, '0')}</span>
                </div>
              ))}
              {employees.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  + {employees.length - 5} more receipts
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download All Receipts
            </Button>
            <Button className="flex-1" onClick={handleClose}>
              Done
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            ⚠️ DEMO RECEIPTS - NOT OFFICIAL
          </p>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pay Employee PAYE Tax
          </DialogTitle>
          <DialogDescription>
            Bulk payment for {currentMonth}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
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
            <p className="text-sm font-medium">Employee Breakdown:</p>
            <div className="max-h-40 overflow-y-auto space-y-1 p-3 rounded-lg border">
              {employees.map((emp) => (
                <div key={emp.id} className="flex justify-between text-sm">
                  <span>{emp.name}</span>
                  <span className="font-medium">{formatNaira(emp.monthlyTax)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">{formatNaira(totalTax)}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{employees.length} employees</p>
              <p>Due: 10th of month</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="confirm" 
              checked={confirmed}
              onCheckedChange={(c) => setConfirmed(c as boolean)}
            />
            <Label htmlFor="confirm" className="text-sm leading-tight cursor-pointer">
              I confirm these amounts are correct and authorize payment to NRS
            </Label>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1 gap-2"
              disabled={!confirmed || processing}
              onClick={handlePayment}
            >
              {processing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay {formatNaira(totalTax)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
