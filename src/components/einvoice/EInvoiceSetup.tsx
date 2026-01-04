import { useState } from 'react';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, QrCode, CheckCircle2, AlertCircle, Lock, ChevronUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EInvoiceSetup() {
  const { state, isSecurePlusMode } = useTaxNarrate();
  const { toast } = useToast();
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [consent, setConsent] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  
  // Form fields
  const [businessAddress, setBusinessAddress] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  
  const handleSetup = async () => {
    if (!consent) return;
    
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    setStep(3);
    setIsSetup(true);
    
    toast({
      title: "E-Invoicing Enabled!",
      description: "Your business is now set up for e-invoicing.",
    });
  };
  
  const handleClose = () => {
    setSetupDialogOpen(false);
    setTimeout(() => {
      if (!isSetup) {
        setStep(1);
        setConsent(false);
        setBusinessAddress('');
        setCacNumber('');
      }
    }, 200);
  };
  
  if (!isSecurePlusMode) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">E-Invoicing (2026 Requirement)</h3>
              <p className="text-sm text-muted-foreground">
                E-invoicing with QR codes is mandatory from Jan 1, 2026. Upgrade to set up.
              </p>
            </div>
            <Button className="gap-2">
              <ChevronUp className="h-4 w-4" />
              Upgrade to Secure+
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>E-Invoicing Setup</CardTitle>
              <CardDescription>2026 Compliance Requirement</CardDescription>
            </div>
          </div>
          {isSetup ? (
            <span className="status-paid">Enabled</span>
          ) : (
            <span className="status-pending">Setup Required</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isSetup ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">E-Invoicing Active</p>
                <p className="text-sm text-muted-foreground">
                  Your invoices now include NRS-compliant QR codes
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">Active</p>
              </div>
              <div>
                <p className="text-muted-foreground">Compliance</p>
                <p className="font-medium text-accent">100%</p>
              </div>
              <div>
                <p className="text-muted-foreground">QR Code Format</p>
                <p className="font-medium">NRS Standard</p>
              </div>
              <div>
                <p className="text-muted-foreground">Invoices Issued</p>
                <p className="font-medium">0</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full gap-2">
              <QrCode className="h-4 w-4" />
              Generate Sample Invoice
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Setup Required by Jan 1, 2026</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All businesses must issue e-invoices with QR codes starting 2026.
                    Non-compliance may result in penalties.
                  </p>
                </div>
              </div>
            </div>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Automatic QR code generation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                NRS-compliant invoice format
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Real-time verification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Seamless integration with payments
              </li>
            </ul>
            
            <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Setup E-Invoicing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>E-Invoicing Setup</DialogTitle>
                  <DialogDescription>
                    Step {step} of 3
                  </DialogDescription>
                </DialogHeader>
                
                {step === 1 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Input 
                        id="address"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Enter registered business address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cac">CAC Registration Number</Label>
                      <Input 
                        id="cac"
                        value={cacNumber}
                        onChange={(e) => setCacNumber(e.target.value)}
                        placeholder="e.g. RC123456"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1"
                        disabled={!businessAddress.trim() || !cacNumber.trim()}
                        onClick={() => setStep(2)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business</span>
                        <span>{state.business.companyName || 'Your Business'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TIN</span>
                        <span>{state.business.tin || 'Not Set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address</span>
                        <span className="text-right">{businessAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CAC Number</span>
                        <span>{cacNumber}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border space-y-2">
                      <h4 className="font-medium text-sm">E-Invoicing Terms</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• All invoices will include NRS QR codes</li>
                        <li>• Invoice data shared with Nigeria Revenue Service</li>
                        <li>• You are responsible for invoice accuracy</li>
                        <li>• Demo mode: QR codes are simulated</li>
                      </ul>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="einvoice-consent" 
                        checked={consent}
                        onCheckedChange={(c) => setConsent(c as boolean)}
                      />
                      <Label htmlFor="einvoice-consent" className="text-sm leading-tight cursor-pointer">
                        I agree to enable e-invoicing and share invoice data with NRS
                      </Label>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button 
                        className="flex-1"
                        disabled={!consent || processing}
                        onClick={handleSetup}
                      >
                        {processing ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin mr-2" />
                            Setting up...
                          </>
                        ) : (
                          'Enable E-Invoicing'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-4 py-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">E-Invoicing Enabled!</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your business is now compliant with 2026 e-invoicing requirements.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50">
                      <QrCode className="h-24 w-24 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Sample QR Code (Demo)
                      </p>
                    </div>
                    
                    <Button className="w-full" onClick={handleClose}>
                      Done
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
