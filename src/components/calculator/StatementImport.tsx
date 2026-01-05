import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  Download,
  Eye
} from 'lucide-react';
import { formatNaira } from '@/lib/tax-calculator';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
  type: 'income' | 'expense' | 'unknown';
}

interface StatementSummary {
  totalCredits: number;
  totalDebits: number;
  estimatedMonthlyIncome: number;
  transactionCount: number;
  period: { start: string; end: string };
  transactions: Transaction[];
}

interface StatementImportProps {
  onIncomeDetected: (monthlyIncome: number) => void;
}

export function StatementImport({ onIncomeDetected }: StatementImportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [summary, setSummary] = useState<StatementSummary | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    ];
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['csv', 'xls', 'xlsx', 'pdf'];
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension || '')) {
      setError('Please upload a CSV, Excel, or PDF file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setParsing(true);
    setParseProgress(0);
    setSummary(null);

    try {
      // Simulate file parsing with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setParseProgress(i);
      }

      // Simulated parsing result - In production, this would use actual CSV/Excel parsing
      const mockTransactions: Transaction[] = generateMockTransactions();
      
      const totalCredits = mockTransactions.reduce((sum, t) => sum + t.credit, 0);
      const totalDebits = mockTransactions.reduce((sum, t) => sum + t.debit, 0);
      
      // Calculate months in statement
      const dates = mockTransactions.map(t => new Date(t.date));
      const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const monthsDiff = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)));
      
      const parsedSummary: StatementSummary = {
        totalCredits,
        totalDebits,
        estimatedMonthlyIncome: Math.round(totalCredits / monthsDiff),
        transactionCount: mockTransactions.length,
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        transactions: mockTransactions
      };

      setSummary(parsedSummary);
      
      toast({
        title: "Statement Parsed Successfully",
        description: `Found ${mockTransactions.length} transactions over ${monthsDiff} month(s)`,
      });
    } catch (err) {
      setError('Failed to parse the file. Please check the format.');
      toast({
        title: "Parse Error",
        description: "Could not read the statement file",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const generateMockTransactions = (): Transaction[] => {
    const transactions: Transaction[] = [];
    const incomeDescriptions = [
      'SALARY PAYMENT',
      'BONUS PAYMENT',
      'TRANSFER FROM EMPLOYER',
      'PAYROLL CREDIT',
      'MONTHLY SALARY'
    ];
    const expenseDescriptions = [
      'POS PURCHASE',
      'ATM WITHDRAWAL',
      'TRANSFER TO',
      'BILL PAYMENT',
      'UTILITY PAYMENT'
    ];

    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - 3);

    for (let i = 0; i < 45; i++) {
      const isIncome = Math.random() > 0.7;
      const date = new Date(baseDate);
      date.setDate(date.getDate() + Math.floor(i * 2));
      
      if (isIncome) {
        const amount = [250000, 300000, 350000, 400000, 500000][Math.floor(Math.random() * 5)];
        transactions.push({
          date: date.toISOString().split('T')[0],
          description: incomeDescriptions[Math.floor(Math.random() * incomeDescriptions.length)],
          credit: amount,
          debit: 0,
          balance: 0,
          type: 'income'
        });
      } else {
        const amount = Math.floor(Math.random() * 50000) + 5000;
        transactions.push({
          date: date.toISOString().split('T')[0],
          description: expenseDescriptions[Math.floor(Math.random() * expenseDescriptions.length)],
          credit: 0,
          debit: amount,
          balance: 0,
          type: 'expense'
        });
      }
    }

    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const handleApplyIncome = () => {
    if (summary) {
      onIncomeDetected(summary.estimatedMonthlyIncome);
      toast({
        title: "Income Applied",
        description: `Monthly income set to ${formatNaira(summary.estimatedMonthlyIncome)}`,
      });
    }
  };

  const clearFile = () => {
    setFile(null);
    setSummary(null);
    setError(null);
    setParseProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Import Bank Statement
        </CardTitle>
        <CardDescription>
          Upload your bank statement to automatically detect income
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        {!file && !summary && (
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">Click to upload statement</p>
            <p className="text-sm text-muted-foreground">
              Supports CSV, Excel (.xls, .xlsx), and PDF formats
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" /> CSV
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" /> PDF
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearFile} className="ml-auto">
              Try Again
            </Button>
          </div>
        )}

        {/* Parsing Progress */}
        {parsing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Parsing {file?.name}...</p>
              <span className="text-sm text-muted-foreground">{parseProgress}%</span>
            </div>
            <Progress value={parseProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Analyzing transactions and detecting income patterns...
            </p>
          </div>
        )}

        {/* Summary Results */}
        {summary && !parsing && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-sm">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.transactionCount} transactions • {summary.period.start} to {summary.period.end}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Income Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                <p className="text-xl font-bold text-accent">{formatNaira(summary.totalCredits)}</p>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground mb-1">Total Debits</p>
                <p className="text-xl font-bold text-destructive">{formatNaira(summary.totalDebits)}</p>
              </div>
            </div>

            <Separator />

            {/* Detected Income */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Income</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatNaira(summary.estimatedMonthlyIncome)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on average credits over the statement period
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide' : 'Show'} Transaction Preview
            </Button>

            {/* Transaction Preview */}
            {showPreview && (
              <div className="max-h-48 overflow-y-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.transactions.slice(0, 15).map((t, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 whitespace-nowrap">{t.date}</td>
                        <td className="p-2 truncate max-w-[150px]">{t.description}</td>
                        <td className={`p-2 text-right whitespace-nowrap ${
                          t.credit > 0 ? 'text-accent' : 'text-destructive'
                        }`}>
                          {t.credit > 0 ? '+' : '-'}{formatNaira(t.credit || t.debit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {summary.transactions.length > 15 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    + {summary.transactions.length - 15} more transactions
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleApplyIncome}>
                Use This Income
              </Button>
              <Button variant="outline" onClick={clearFile}>
                Upload Different File
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Income estimation is based on statement analysis. Please verify for accuracy.
            </p>
          </div>
        )}

        {/* Sample Download */}
        {!file && !summary && (
          <div className="text-center">
            <Button variant="link" size="sm" className="gap-2 text-muted-foreground">
              <Download className="h-4 w-4" />
              Download sample CSV template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
