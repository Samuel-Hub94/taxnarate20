import { useState, useEffect } from 'react';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, AlertCircle, CheckCircle2, CalendarDays, Zap } from 'lucide-react';
import { formatNaira } from '@/lib/tax-calculator';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'taxnarrate_scheduled_payroll';

interface ScheduledPayrollSettings {
  enabled: boolean;
  frequency: 'monthly' | 'quarterly';
  dayOfMonth: number;
  autoRetry: boolean;
  notifyBeforePayment: boolean;
  notifyDaysBefore: number;
  lastRun?: string;
  nextRun?: string;
}

const defaultSettings: ScheduledPayrollSettings = {
  enabled: false,
  frequency: 'monthly',
  dayOfMonth: 25,
  autoRetry: true,
  notifyBeforePayment: true,
  notifyDaysBefore: 3,
};

export function ScheduledPayroll() {
  const { state, isSecurePlusMode } = useTaxNarrate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ScheduledPayrollSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const employees = state.business.employees.filter(e => e.status === 'active');
  const totalMonthlyTax = employees.reduce((sum, e) => sum + e.monthlyTax, 0);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Calculate next run date
        const today = new Date();
        const nextRun = new Date(today.getFullYear(), today.getMonth(), parsed.dayOfMonth);
        if (nextRun <= today) {
          nextRun.setMonth(nextRun.getMonth() + (parsed.frequency === 'quarterly' ? 3 : 1));
        }
        parsed.nextRun = nextRun.toISOString().split('T')[0];
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to load scheduled payroll settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof ScheduledPayrollSettings>(
    key: K,
    value: ScheduledPayrollSettings[K]
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      // Recalculate next run when schedule changes
      if (key === 'dayOfMonth' || key === 'frequency') {
        const today = new Date();
        const day = key === 'dayOfMonth' ? (value as number) : prev.dayOfMonth;
        const nextRun = new Date(today.getFullYear(), today.getMonth(), day);
        if (nextRun <= today) {
          const freq = key === 'frequency' ? (value as string) : prev.frequency;
          nextRun.setMonth(nextRun.getMonth() + (freq === 'quarterly' ? 3 : 1));
        }
        updated.nextRun = nextRun.toISOString().split('T')[0];
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!isSecurePlusMode) {
      toast({
        title: "Secure+ Required",
        description: "Scheduled payroll is a Secure+ feature. Upgrade to enable.",
        variant: "destructive",
      });
      return;
    }

    if (employees.length === 0) {
      toast({
        title: "No Employees",
        description: "Add employees before scheduling payroll.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setHasChanges(false);
    setSaving(false);
    
    toast({
      title: settings.enabled ? "Payroll Scheduled" : "Schedule Disabled",
      description: settings.enabled 
        ? `Payroll will be processed automatically on day ${settings.dayOfMonth} of each ${settings.frequency === 'monthly' ? 'month' : 'quarter'}.`
        : "Automatic payroll processing has been disabled.",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className={!isSecurePlusMode ? 'opacity-75' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-accent" />
            <div>
              <CardTitle className="flex items-center gap-2">
                Scheduled Payroll
                {!isSecurePlusMode && (
                  <Badge variant="outline" className="text-xs">Secure+</Badge>
                )}
              </CardTitle>
              <CardDescription>Automate your employee tax payments</CardDescription>
            </div>
          </div>
          {settings.enabled && isSecurePlusMode && (
            <Badge className="bg-success text-success-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSecurePlusMode ? (
          <div className="text-center py-6 space-y-3">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">Upgrade to Secure+</p>
              <p className="text-sm text-muted-foreground">
                Scheduled payroll is available on the Secure+ plan
              </p>
            </div>
            <Button variant="outline" size="sm">Upgrade Now</Button>
          </div>
        ) : (
          <>
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <Label className="text-base font-medium">Enable Auto-Pay</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically process payroll on schedule
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSetting('enabled', checked)}
              />
            </div>

            {settings.enabled && (
              <>
                {/* Schedule Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={settings.frequency}
                      onValueChange={(value: 'monthly' | 'quarterly') => updateSetting('frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Day of Month</Label>
                    <Select
                      value={settings.dayOfMonth.toString()}
                      onValueChange={(value) => updateSetting('dayOfMonth', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 5, 10, 15, 20, 25, 28].map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day === 28 ? '28th (Last)' : `${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Next Payment Info */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Next Scheduled Payment</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{formatDate(settings.nextRun)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employees:</span>
                      <span className="font-medium">{employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-accent">{formatNaira(totalMonthlyTax)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <Label>Auto-Retry on Failure</Label>
                        <p className="text-sm text-muted-foreground">
                          Retry payment if initial attempt fails
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.autoRetry}
                      onCheckedChange={(checked) => updateSetting('autoRetry', checked)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <Label>Pre-Payment Notification</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified before auto-payment
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifyBeforePayment}
                        onCheckedChange={(checked) => updateSetting('notifyBeforePayment', checked)}
                      />
                    </div>

                    {settings.notifyBeforePayment && (
                      <div className="ml-8 space-y-2">
                        <Label>Notify me</Label>
                        <Select
                          value={settings.notifyDaysBefore.toString()}
                          onValueChange={(value) => updateSetting('notifyDaysBefore', parseInt(value))}
                        >
                          <SelectTrigger className="w-full max-w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day before</SelectItem>
                            <SelectItem value="3">3 days before</SelectItem>
                            <SelectItem value="7">7 days before</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            {hasChanges && (
              <div className="pt-4">
                <Button onClick={handleSave} className="w-full" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Schedule Settings'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Demo Notice */}
        <p className="text-xs text-muted-foreground p-3 bg-warning/10 rounded-lg">
          ⚠️ DEMO MODE: Scheduled payments are simulated. No actual transactions will occur.
        </p>
      </CardContent>
    </Card>
  );
}
