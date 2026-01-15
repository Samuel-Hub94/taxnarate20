import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, Calendar, CreditCard, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface PushNotificationSettings {
  enabled: boolean;
  taxDeadlines: boolean;
  paymentSuccess: boolean;
  paymentFailed: boolean;
  complianceAlerts: boolean;
  payrollReminders: boolean;
  systemUpdates: boolean;
}

const defaultSettings: PushNotificationSettings = {
  enabled: false,
  taxDeadlines: true,
  paymentSuccess: true,
  paymentFailed: true,
  complianceAlerts: true,
  payrollReminders: true,
  systemUpdates: false,
};

export function PushNotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PushNotificationSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem('taxnarrate_push_notifications');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
    
    // Check browser notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission as 'granted' | 'denied' | 'default');
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support push notifications",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as 'granted' | 'denied' | 'default');
      
      if (permission === 'granted') {
        updateSetting('enabled', true);
        // Show a demo notification
        new Notification('TaxNarrate Notifications Enabled', {
          body: 'You will now receive real-time alerts for tax deadlines and payments.',
          icon: '/favicon.ico',
        });
        toast({
          title: "Notifications Enabled",
          description: "You'll receive real-time alerts",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const updateSetting = <K extends keyof PushNotificationSettings>(
    key: K,
    value: PushNotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.setItem('taxnarrate_push_notifications', JSON.stringify(settings));
    
    setIsSaving(false);
    setHasChanges(false);
    
    toast({
      title: "Settings Saved",
      description: "Your push notification preferences have been updated",
    });
  };

  const testNotification = (type: string) => {
    if (permissionStatus !== 'granted') {
      toast({
        title: "Enable Notifications First",
        description: "Please enable push notifications to test",
        variant: "destructive",
      });
      return;
    }

    let title = '';
    let body = '';
    
    switch (type) {
      case 'deadline':
        title = '⚠️ Tax Deadline Reminder';
        body = 'Q1 PAYE tax payment is due in 3 days (March 31, 2026)';
        break;
      case 'success':
        title = '✅ Payment Successful';
        body = '₦125,000 PAYE tax payment confirmed. Receipt: TN-2026-001234';
        break;
      case 'failed':
        title = '❌ Payment Failed';
        body = 'Your auto-pay failed. Please update your payment method to avoid penalties.';
        break;
    }

    new Notification(title, {
      body,
      icon: '/favicon.ico',
    });

    toast({
      title: "Test Notification Sent",
      description: "Check your notification center",
    });
  };

  const notificationTypes = [
    {
      id: 'taxDeadlines',
      label: 'Tax Deadline Alerts',
      description: 'Get notified 7, 3, and 1 day before deadlines',
      icon: Calendar,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      id: 'paymentSuccess',
      label: 'Payment Confirmations',
      description: 'Instant alerts when payments are successful',
      icon: CheckCircle2,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      id: 'paymentFailed',
      label: 'Payment Failures',
      description: 'Critical alerts for failed auto-pay attempts',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      id: 'complianceAlerts',
      label: 'Compliance Updates',
      description: 'Stay informed about compliance status changes',
      icon: Info,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'payrollReminders',
      label: 'Payroll Reminders',
      description: 'Monthly payroll tax payment reminders',
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Real-time alerts for critical events</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className={`p-4 rounded-lg ${
          permissionStatus === 'granted' 
            ? 'bg-accent/10 border border-accent/20' 
            : permissionStatus === 'denied'
            ? 'bg-destructive/10 border border-destructive/20'
            : 'bg-muted/50 border border-muted'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                permissionStatus === 'granted' 
                  ? 'bg-accent/20' 
                  : permissionStatus === 'denied'
                  ? 'bg-destructive/20'
                  : 'bg-muted'
              }`}>
                <Bell className={`h-5 w-5 ${
                  permissionStatus === 'granted' 
                    ? 'text-accent' 
                    : permissionStatus === 'denied'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <p className="font-medium">
                  {permissionStatus === 'granted' 
                    ? 'Notifications Enabled' 
                    : permissionStatus === 'denied'
                    ? 'Notifications Blocked'
                    : 'Enable Push Notifications'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {permissionStatus === 'granted' 
                    ? 'You\'ll receive real-time alerts' 
                    : permissionStatus === 'denied'
                    ? 'Please enable in browser settings'
                    : 'Get instant alerts for tax deadlines and payments'
                  }
                </p>
              </div>
            </div>
            {permissionStatus !== 'granted' && (
              <Button 
                onClick={requestPermission}
                disabled={permissionStatus === 'denied'}
              >
                {permissionStatus === 'denied' ? 'Blocked' : 'Enable'}
              </Button>
            )}
          </div>
        </div>

        {/* Master Toggle */}
        {permissionStatus === 'granted' && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <Label htmlFor="push-master" className="font-medium">Enable All Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all push notifications
              </p>
            </div>
            <Switch
              id="push-master"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>
        )}

        {/* Notification Types */}
        {permissionStatus === 'granted' && settings.enabled && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notification Types</Label>
            {notificationTypes.map((type) => (
              <div 
                key={type.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg ${type.bgColor} flex items-center justify-center`}>
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[type.id as keyof PushNotificationSettings] as boolean}
                  onCheckedChange={(checked) => 
                    updateSetting(type.id as keyof PushNotificationSettings, checked)
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Test Notifications */}
        {permissionStatus === 'granted' && settings.enabled && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Test Notifications</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testNotification('deadline')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Test Deadline
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testNotification('success')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Test Success
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testNotification('failed')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Test Failure
              </Button>
            </div>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        )}

        {/* Demo Notice */}
        <p className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
          📱 DEMO: Push notifications are simulated. In production, these would be delivered via service workers.
        </p>
      </CardContent>
    </Card>
  );
}
