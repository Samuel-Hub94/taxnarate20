import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatNaira } from '@/lib/tax-calculator';
import { 
  Brain, 
  Volume2,
  Lock,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';

interface NarrationType {
  id: string;
  icon: string;
  title: string;
  explanation: string;
  taxImplications: string[];
  riskLevel: RiskLevel;
  riskDescription: string;
}

const narrationTypes: NarrationType[] = [
  {
    id: 'salary',
    icon: '💼',
    title: 'Salary / Wages',
    explanation: 'Regular employment income paid by an employer. This is treated as taxable income under PAYE regulations.',
    taxImplications: [
      'PAYE tax applies (progressive rates)',
      'Employer must withhold and remit',
      'Monthly tax deductions required',
    ],
    riskLevel: 'low',
    riskDescription: 'Common and compliant if accurate',
  },
  {
    id: 'business',
    icon: '💰',
    title: 'Business Income',
    explanation: 'Income from business activities or self-employment. Subject to Company Income Tax or self-employment tax.',
    taxImplications: [
      'CIT applies (30% for companies)',
      'Self-assessment required',
      'Must maintain proper records',
      'Quarterly filings may be needed',
    ],
    riskLevel: 'medium',
    riskDescription: 'Depends on documentation/frequency',
  },
  {
    id: 'gift',
    icon: '🎁',
    title: 'Family Support / Gift',
    explanation: 'Financial assistance from family members with no expectation of repayment. Generally not taxable.',
    taxImplications: [
      'Usually no tax if genuine gift',
      'Large amounts may need documentation',
      'Maintain records of donor',
    ],
    riskLevel: 'low',
    riskDescription: 'Common and compliant if accurate',
  },
  {
    id: 'loan',
    icon: '💳',
    title: 'Loan',
    explanation: 'Borrowed funds that must be repaid. Not taxable income since it creates a repayment obligation.',
    taxImplications: [
      'No tax on loan principal received',
      'Interest paid may be deductible',
      'Must maintain loan agreement',
      'Proof of repayment may be needed',
    ],
    riskLevel: 'low',
    riskDescription: 'Common and compliant if documented',
  },
  {
    id: 'reimbursement',
    icon: '🧾',
    title: 'Reimbursement',
    explanation: 'Repayment of expenses paid on behalf of another party (employer, client). Not taxable if properly documented.',
    taxImplications: [
      'No tax if genuine reimbursement',
      'Must have receipts/proof of expense',
      'Amount should match actual expense',
    ],
    riskLevel: 'low',
    riskDescription: 'Common and compliant if accurate',
  },
  {
    id: 'allowance',
    icon: '🎯',
    title: 'Allowance / Bonus',
    explanation: 'Additional compensation from employer beyond regular salary. May be taxable depending on type and amount.',
    taxImplications: [
      'Usually taxable as employment income',
      'PAYE withholding applies',
      'Some allowances may be exempt',
      'Employer should provide breakdown',
    ],
    riskLevel: 'medium',
    riskDescription: 'Depends on documentation/type',
  },
  {
    id: 'miscellaneous',
    icon: '📝',
    title: 'Miscellaneous',
    explanation: 'General category for transactions not fitting other categories. Requires additional clarification.',
    taxImplications: [
      'Tax treatment depends on true nature',
      'May attract scrutiny without details',
      'Proper documentation essential',
      'Consider using specific category',
    ],
    riskLevel: 'high',
    riskDescription: 'Likely to attract scrutiny if unclear',
  },
];

const riskColors: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-accent/10', text: 'text-accent', label: '🟢 Low Risk' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', label: '🟠 Medium Risk' },
  high: { bg: 'bg-destructive/10', text: 'text-destructive', label: '🔴 High Risk' },
};

export default function Narration() {
  const { state, isLiteMode, isSecurePlusMode } = useTaxNarrate();
  const [amount, setAmount] = useState('');
  const [selectedNarration, setSelectedNarration] = useState<NarrationType | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  
  if (isLiteMode) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Narration Assistant</h1>
            <p className="text-muted-foreground mt-1">Understand transaction tax implications</p>
          </div>
          
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Upgrade Required</h2>
              <p className="text-muted-foreground mb-6">
                The Narration Assistant is available in Secure Mode and above.
                Learn about transaction narrations and their tax implications.
              </p>
              <Link to="/settings">
                <Button size="lg" className="gap-2">
                  <ChevronUp className="h-4 w-4" />
                  Upgrade to Secure
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  const handleSelectNarration = (narration: NarrationType) => {
    setSelectedNarration(narration);
    setConfirmDialogOpen(true);
    setConsent(false);
  };
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Narration Assistant</h1>
          <p className="text-muted-foreground mt-1">
            Understand transaction narrations and their tax implications
          </p>
        </div>
        
        {/* Amount Input */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>Enter the amount and select a narration type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="amount">Transaction Amount</Label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Risk Level Key */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-medium">Risk Levels:</span>
              {Object.entries(riskColors).map(([level, config]) => (
                <span key={level} className={`px-2 py-1 rounded ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Narration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {narrationTypes.map((narration) => {
            const risk = riskColors[narration.riskLevel];
            
            return (
              <Card 
                key={narration.id}
                className="card-interactive"
                onClick={() => handleSelectNarration(narration)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{narration.icon}</span>
                      <CardTitle className="text-base">{narration.title}</CardTitle>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${risk.bg} ${risk.text}`}>
                      {risk.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{narration.explanation}</p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">Tax Implications:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {narration.taxImplications.slice(0, 2).map((imp, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-primary mt-0.5">•</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">{narration.riskDescription}</span>
                    <Button size="sm" variant="outline">Select</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Voice Explanation - Secure+ Only */}
        {!isSecurePlusMode && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Volume2 className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">Upgrade for Voice Explanations</h3>
                  <p className="text-sm text-muted-foreground">
                    Listen in Pidgin, Yoruba, Hausa, and Igbo with Secure+
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
        
        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Confirm Narration Selection
              </DialogTitle>
              <DialogDescription>
                Please review and confirm your selection
              </DialogDescription>
            </DialogHeader>
            
            {selectedNarration && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-2">
                      <span className="text-xl">{selectedNarration.icon}</span>
                      {selectedNarration.title}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${riskColors[selectedNarration.riskLevel].bg} ${riskColors[selectedNarration.riskLevel].text}`}>
                      {riskColors[selectedNarration.riskLevel].label}
                    </span>
                  </div>
                  {amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">{formatNaira(parseFloat(amount))}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-warning" />
                    Important Disclaimer
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• You are responsible for the narration you select</li>
                    <li>• TaxNarrate provides educational information only, not legal or tax advice</li>
                    <li>• Any tax liabilities, penalties, or legal consequences remain your sole responsibility</li>
                    <li>• Consult a qualified tax professional for specific advice</li>
                  </ul>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="narration-consent" 
                    checked={consent}
                    onCheckedChange={(c) => setConsent(c as boolean)}
                  />
                  <Label htmlFor="narration-consent" className="text-sm leading-tight cursor-pointer">
                    I understand and accept responsibility for this narration selection
                  </Label>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 gap-2"
                disabled={!consent}
                onClick={() => {
                  setConfirmDialogOpen(false);
                  // Here you would log the selection
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Selection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Educational Disclaimer */}
        <div className="text-center text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
          ⚠️ This module provides educational information only. 
          TaxNarrate does not provide tax, legal, or financial advice.
          Consult a qualified professional for your specific situation.
        </div>
      </div>
    </MainLayout>
  );
}
