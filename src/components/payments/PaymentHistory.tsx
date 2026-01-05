import { useState } from 'react';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNaira } from '@/lib/tax-calculator';
import { TaxReceipt } from './TaxReceipt';
import { CreditCard, Download, Receipt, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PaymentHistory() {
  const { state, isSecurePlusMode } = useTaxNarrate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<typeof state.payments[0] | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  
  const payments = state.payments;
  
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your payment history will be downloaded shortly.",
    });
    
    // Create CSV content
    const headers = ['Date', 'Description', 'Amount', 'Status', 'Receipt'];
    const rows = filteredPayments.map(p => [
      new Date(p.date).toLocaleDateString(),
      p.description,
      p.amount.toString(),
      p.status,
      p.receiptNumber || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxnarrate-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No Payment History</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your payments will appear here after you make them.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold text-accent">{formatNaira(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Payment</p>
            <p className="text-2xl font-bold">
              {new Date(payments[0].date).toLocaleDateString('en-NG', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      {isSecurePlusMode && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by description or receipt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:border-muted-foreground/30 transition-smooth"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    payment.type === 'tax' ? 'bg-accent/10' : 'bg-primary/10'
                  }`}>
                    <CreditCard className={`h-5 w-5 ${
                      payment.type === 'tax' ? 'text-accent' : 'text-primary'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>
                        {new Date(payment.date).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {payment.receiptNumber && (
                        <span className="font-mono">{payment.receiptNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{formatNaira(payment.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      payment.status === 'paid' 
                        ? 'bg-accent/10 text-accent'
                        : payment.status === 'pending'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  {payment.status === 'paid' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setReceiptOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Receipt Modal */}
      {selectedPayment && (
        <TaxReceipt
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
          payment={selectedPayment}
          userType={state.userType}
        />
      )}
    </div>
  );
}
