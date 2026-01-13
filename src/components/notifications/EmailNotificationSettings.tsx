import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Bell, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'taxnarrate_email_notifications';

interface EmailNotificationSettings {
  email: string;
  paymentReminders: boolean;
  reminderDays: number;
  complianceAlerts: boolean;
  payrollReminders: boolean;
  productUpdates: boolean;
  weeklyDigest: boolean;
}

const defaultSettings: EmailNotificationSettings = {
  email: '',
  paymentReminders: true,
  reminderDays: 7,
  complianceAlerts: true,
  payrollReminders: true,
  productUpdates: false,
  weeklyDigest: false,
};

export function EmailNotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<EmailNotificationSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof EmailNotificationSettings>(
    key: K,
    value: EmailNotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings.email || !settings.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
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
      title: "Settings Saved",
      description: "Your email notification preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Manage your email notification preferences</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="notification-email">Notification Email</Label>
          <Input
            id="notification-email"
            type="email"
            placeholder="your@email.com"
            value={settings.email}
            onChange={(e) => updateSetting('email', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            All notifications will be sent to this email address
          </p>
        </div>

        <Separator />

        {/* Payment Reminders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <Label>Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before tax payments are due
                </p>
              </div>
            </div>
            <Switch
              checked={settings.paymentReminders}
              onCheckedChange={(checked) => updateSetting('paymentReminders', checked)}
            />
          </div>
          
          {settings.paymentReminders && (
            <div className="ml-8 space-y-2">
              <Label htmlFor="reminder-days">Remind me</Label>
              <Select
                value={settings.reminderDays.toString()}
                onValueChange={(value) => updateSetting('reminderDays', parseInt(value))}
              >
                <SelectTrigger id="reminder-days" className="w-full max-w-[200px]">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="7">7 days before</SelectItem>
                  <SelectItem value="14">14 days before</SelectItem>
                  <SelectItem value="30">30 days before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Compliance Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <Label>Compliance Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Important updates about your tax compliance status
              </p>
            </div>
          </div>
          <Switch
            checked={settings.complianceAlerts}
            onCheckedChange={(checked) => updateSetting('complianceAlerts', checked)}
          />
        </div>

        <Separator />

        {/* Payroll Reminders */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <Label>Payroll Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Monthly reminders to process employee PAYE
              </p>
            </div>
          </div>
          <Switch
            checked={settings.payrollReminders}
            onCheckedChange={(checked) => updateSetting('payrollReminders', checked)}
          />
        </div>

        <Separator />

        {/* Product Updates */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label>Product Updates</Label>
              <p className="text-sm text-muted-foreground">
                News about new features and improvements
              </p>
            </div>
          </div>
          <Switch
            checked={settings.productUpdates}
            onCheckedChange={(checked) => updateSetting('productUpdates', checked)}
          />
        </div>

        <Separator />

        {/* Weekly Digest */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                A summary of your tax activity every week
              </p>
            </div>
          </div>
          <Switch
            checked={settings.weeklyDigest}
            onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        )}

        {/* Demo Notice */}
        <p className="text-xs text-muted-foreground p-3 bg-warning/10 rounded-lg">
          ⚠️ DEMO MODE: Email notifications are simulated. No actual emails will be sent.
        </p>
      </CardContent>
    </Card>
  );
}
