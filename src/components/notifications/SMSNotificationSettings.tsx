import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Bell, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'taxnarrate_sms_notifications';

interface SMSNotificationSettings {
  phoneNumber: string;
  countryCode: string;
  paymentReminders: boolean;
  reminderDays: number;
  complianceAlerts: boolean;
  payrollReminders: boolean;
  urgentAlerts: boolean;
}

const defaultSettings: SMSNotificationSettings = {
  phoneNumber: '',
  countryCode: '+234',
  paymentReminders: true,
  reminderDays: 3,
  complianceAlerts: true,
  payrollReminders: false,
  urgentAlerts: true,
};

export function SMSNotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SMSNotificationSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load SMS notification settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof SMSNotificationSettings>(
    key: K,
    value: SMSNotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings.phoneNumber || settings.phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
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
      title: "SMS Settings Saved",
      description: "Your SMS notification preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>SMS Notifications</CardTitle>
            <CardDescription>Get text alerts for important updates</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone Number</Label>
          <div className="flex gap-2">
            <Select
              value={settings.countryCode}
              onValueChange={(value) => updateSetting('countryCode', value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+234">🇳🇬 +234</SelectItem>
                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                <SelectItem value="+44">🇬🇧 +44</SelectItem>
                <SelectItem value="+91">🇮🇳 +91</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="phone-number"
              type="tel"
              placeholder="8012345678"
              value={settings.phoneNumber}
              onChange={(e) => updateSetting('phoneNumber', e.target.value.replace(/\D/g, ''))}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            SMS alerts will be sent to this number
          </p>
        </div>

        <Separator />

        {/* Urgent Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <Label>Urgent Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Critical updates requiring immediate attention
              </p>
            </div>
          </div>
          <Switch
            checked={settings.urgentAlerts}
            onCheckedChange={(checked) => updateSetting('urgentAlerts', checked)}
          />
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
                  SMS before tax payment deadlines
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
              <Label htmlFor="sms-reminder-days">Remind me</Label>
              <Select
                value={settings.reminderDays.toString()}
                onValueChange={(value) => updateSetting('reminderDays', parseInt(value))}
              >
                <SelectTrigger id="sms-reminder-days" className="w-full max-w-[200px]">
                  <SelectValue placeholder="Select days" />
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

        <Separator />

        {/* Compliance Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <Label>Compliance Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Tax compliance status changes
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
                Monthly PAYE processing reminders
              </p>
            </div>
          </div>
          <Switch
            checked={settings.payrollReminders}
            onCheckedChange={(checked) => updateSetting('payrollReminders', checked)}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save SMS Settings'}
            </Button>
          </div>
        )}

        {/* Demo Notice */}
        <p className="text-xs text-muted-foreground p-3 bg-warning/10 rounded-lg">
          ⚠️ DEMO MODE: SMS notifications are simulated. No actual messages will be sent.
        </p>
      </CardContent>
    </Card>
  );
}
