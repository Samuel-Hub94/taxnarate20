import { useState } from 'react';
import { useTaxNarrate, UserMode } from '@/contexts/TaxNarrateContext';
import { useTheme } from '@/components/theme/ThemeProvider';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ModeBadge } from '@/components/ui/mode-badge';
import { formatNaira } from '@/lib/tax-calculator';
import { 
  Settings as SettingsIcon, 
  CreditCard,
  Bell,
  Shield,
  ChevronUp,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { state, dispatch, setMode } = useTaxNarrate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState<UserMode | null>(null);
  
  const isIndividual = state.userType === 'individual';
  
  const plans: { mode: UserMode; name: string; price: number; features: string[] }[] = [
    {
      mode: 'lite',
      name: 'Lite Mode',
      price: 0,
      features: ['Tax Calculator', 'Basic Estimates', 'No Data Saving'],
    },
    {
      mode: 'secure',
      name: 'Secure Mode',
      price: isIndividual ? 5000 : 50000,
      features: ['NIN/TIN Verification', 'Tax Payments', 'PDF Summaries', 'Narration Assistant'],
    },
    {
      mode: 'secure_plus',
      name: 'Secure+ Mode',
      price: isIndividual ? 15000 : 250000,
      features: ['All Secure Features', 'Auto-Pay', 'Voice Narration', 'Advanced Analytics', 'Multi-Year History'],
    },
  ];
  
  const handleUpgrade = (mode: UserMode) => {
    setSelectedUpgrade(mode);
    setUpgradeDialogOpen(true);
  };
  
  const confirmUpgrade = () => {
    if (selectedUpgrade) {
      setMode(selectedUpgrade);
      setUpgradeDialogOpen(false);
      toast({
        title: "Mode Changed!",
        description: `You are now in ${plans.find(p => p.mode === selectedUpgrade)?.name}`,
      });
    }
  };
  
  const toggleAutoRenewal = (enabled: boolean) => {
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: { autoRenewalEnabled: enabled }
    });
    toast({
      title: enabled ? "Auto-Renewal Enabled" : "Auto-Renewal Disabled",
      description: enabled 
        ? "Your subscription will renew automatically" 
        : "Remember to renew manually before expiry",
    });
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </div>
              </div>
              <ModeBadge />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">
                  {state.currentMode.replace('_', ' ')} Mode
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-medium">
                  {formatNaira(plans.find(p => p.mode === state.currentMode)?.price || 0)}/year
                </span>
              </div>
              {state.subscription.renewalDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renewal Date</span>
                  <span className="font-medium">
                    {new Date(state.subscription.renewalDate).toLocaleDateString('en-NG', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
            
            {state.currentMode !== 'secure_plus' && (
              <Button 
                className="w-full gap-2"
                onClick={() => handleUpgrade(state.currentMode === 'lite' ? 'secure' : 'secure_plus')}
              >
                <ChevronUp className="h-4 w-4" />
                Upgrade to {state.currentMode === 'lite' ? 'Secure' : 'Secure+'}
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Plan Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose the plan that fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div 
                  key={plan.mode}
                  className={`p-4 rounded-lg border ${
                    state.currentMode === plan.mode 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <ModeBadge mode={plan.mode} />
                    {state.currentMode === plan.mode && (
                      <span className="text-xs text-primary font-medium">Current</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold mb-1">{formatNaira(plan.price)}</p>
                  <p className="text-xs text-muted-foreground mb-4">/year</p>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {state.currentMode !== plan.mode && (
                    <Button 
                      variant={plan.mode === 'lite' ? 'outline' : 'default'}
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => handleUpgrade(plan.mode)}
                    >
                      {plans.findIndex(p => p.mode === plan.mode) < plans.findIndex(p => p.mode === state.currentMode)
                        ? 'Downgrade'
                        : 'Upgrade'
                      }
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Subscription Settings */}
        {state.currentMode !== 'lite' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>Control your billing preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-renewal">Auto-Renewal</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically renew your subscription
                  </p>
                </div>
                <Switch
                  id="auto-renewal"
                  checked={state.subscription.autoRenewalEnabled}
                  onCheckedChange={toggleAutoRenewal}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label>Payment Methods</Label>
                <div className="mt-2 space-y-2">
                  {state.subscription.paymentMethods.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No payment methods added</p>
                  ) : (
                    state.subscription.paymentMethods.map((method) => (
                      <div 
                        key={method.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              {method.brand || method.type} •••• {method.last4}
                            </p>
                            {method.isPrimary && (
                              <span className="text-xs text-accent">Primary</span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how TaxNarrate looks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-3 block">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before tax payments are due
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Updates about your compliance status
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Product Updates</Label>
                <p className="text-sm text-muted-foreground">
                  News about new features and improvements
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
        
        {/* Upgrade Dialog */}
        <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUpgrade && plans.findIndex(p => p.mode === selectedUpgrade) > plans.findIndex(p => p.mode === state.currentMode)
                  ? 'Upgrade Your Plan'
                  : 'Change Your Plan'
                }
              </DialogTitle>
              <DialogDescription>
                {selectedUpgrade === 'lite' 
                  ? 'You will lose access to premium features'
                  : 'Unlock more features with this upgrade'
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedUpgrade && (
              <div className="py-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">New Plan</span>
                    <ModeBadge mode={selectedUpgrade} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">
                      {formatNaira(plans.find(p => p.mode === selectedUpgrade)?.price || 0)}/year
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  <p className="font-medium text-foreground mb-2">Features included:</p>
                  <ul className="space-y-1">
                    {plans.find(p => p.mode === selectedUpgrade)?.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="text-xs text-muted-foreground p-3 bg-warning/10 rounded-lg">
                  ⚠️ DEMO MODE: This is a simulated upgrade. No actual payment will be processed.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setUpgradeDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={confirmUpgrade}>
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
