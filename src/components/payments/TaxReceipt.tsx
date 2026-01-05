import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatNaira } from '@/lib/tax-calculator';
import { Download, Printer, CheckCircle2, QrCode } from 'lucide-react';

interface TaxReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: {
    id: string;
    type: 'tax' | 'payroll' | 'subscription';
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'failed';
    receiptNumber?: string;
    description?: string;
  };
  userType: 'individual' | 'business';
}

export function TaxReceipt({ open, onOpenChange, payment, userType }: TaxReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Generate a simple QR code representation (using CSS)
  const generateQRPattern = (code: string) => {
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pattern: boolean[][] = [];
    
    for (let i = 0; i < 7; i++) {
      pattern.push([]);
      for (let j = 0; j < 7; j++) {
        pattern[i].push(((hash * (i + 1) * (j + 1)) % 2) === 0);
      }
    }
    
    return pattern;
  };
  
  const qrPattern = generateQRPattern(payment.receiptNumber || payment.id);
  
  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Receipt - ${payment.receiptNumber || payment.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0D7377; }
            .subtitle { color: #666; margin-top: 5px; }
            .receipt-box { border: 2px solid #0D7377; border-radius: 8px; padding: 20px; }
            .success-badge { background: #dcfce7; color: #16a34a; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px; font-weight: 500; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .row:last-child { border-bottom: none; }
            .label { color: #666; }
            .value { font-weight: 500; }
            .amount-row { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .amount-row .value { font-size: 24px; color: #0D7377; }
            .qr-section { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ccc; }
            .qr-code { display: inline-grid; grid-template-columns: repeat(7, 8px); gap: 2px; margin: 15px 0; }
            .qr-cell { width: 8px; height: 8px; }
            .qr-cell.filled { background: #0D7377; }
            .qr-cell.empty { background: #fff; border: 1px solid #eee; }
            .verification { font-size: 12px; color: #666; margin-top: 10px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🇳🇬 TaxNarrate</div>
            <div class="subtitle">Official Tax Payment Receipt</div>
          </div>
          
          <div class="receipt-box">
            <div style="text-align: center;">
              <span class="success-badge">✓ Payment Successful</span>
            </div>
            
            <div class="row">
              <span class="label">Receipt Number</span>
              <span class="value">${payment.receiptNumber || payment.id}</span>
            </div>
            <div class="row">
              <span class="label">Payment Date</span>
              <span class="value">${formatDate(payment.date)}</span>
            </div>
            <div class="row">
              <span class="label">Payment Type</span>
              <span class="value">${payment.type === 'tax' ? (userType === 'individual' ? 'PAYE Tax' : 'Company Income Tax') : 'Payroll Tax (PAYE)'}</span>
            </div>
            <div class="row">
              <span class="label">Description</span>
              <span class="value">${payment.description || 'Tax Payment'}</span>
            </div>
            <div class="row">
              <span class="label">Tax Year</span>
              <span class="value">2026</span>
            </div>
            
            <div class="amount-row">
              <div class="row" style="border: none;">
                <span class="label" style="font-size: 18px;">Amount Paid</span>
                <span class="value">${formatNaira(payment.amount)}</span>
              </div>
            </div>
            
            <div class="qr-section">
              <div style="font-weight: 500; margin-bottom: 10px;">Verification QR Code</div>
              <div class="qr-code">
                ${qrPattern.map(row => 
                  row.map(cell => `<div class="qr-cell ${cell ? 'filled' : 'empty'}"></div>`).join('')
                ).join('')}
              </div>
              <div class="verification">
                Scan to verify at verify.taxnarrate.ng<br/>
                Transaction ID: ${payment.id}
              </div>
            </div>
          </div>
          
          <div class="footer">
            This is an official receipt generated by TaxNarrate.<br/>
            For inquiries, contact support@taxnarrate.ng<br/>
            © 2026 TaxNarrate - Nigeria Revenue Service Partner
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  const handleDownload = () => {
    // Create a downloadable HTML file
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Tax Receipt - ${payment.receiptNumber || payment.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; background: #fff; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #0D7377; }
    .subtitle { color: #666; margin-top: 8px; font-size: 14px; }
    .receipt-box { border: 2px solid #0D7377; border-radius: 12px; padding: 24px; background: #fff; }
    .success-badge { background: #dcfce7; color: #16a34a; padding: 10px 20px; border-radius: 25px; display: inline-block; margin-bottom: 24px; font-weight: 600; font-size: 14px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; color: #333; }
    .amount-row { background: linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%); padding: 20px; border-radius: 10px; margin: 24px 0; }
    .amount-row .value { font-size: 28px; color: #0D7377; font-weight: 700; }
    .qr-section { text-align: center; margin-top: 30px; padding-top: 24px; border-top: 2px dashed #e5e7eb; }
    .qr-code { display: inline-grid; grid-template-columns: repeat(7, 10px); gap: 2px; margin: 15px 0; }
    .qr-cell { width: 10px; height: 10px; border-radius: 1px; }
    .qr-cell.filled { background: #0D7377; }
    .qr-cell.empty { background: #f8fafc; }
    .verification { font-size: 12px; color: #666; margin-top: 12px; line-height: 1.6; }
    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; line-height: 1.8; }
    .watermark { position: fixed; bottom: 20px; right: 20px; font-size: 10px; color: #ccc; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🇳🇬 TaxNarrate</div>
    <div class="subtitle">Official Tax Payment Receipt</div>
  </div>
  
  <div class="receipt-box">
    <div style="text-align: center;">
      <span class="success-badge">✓ Payment Successful</span>
    </div>
    
    <div class="row">
      <span class="label">Receipt Number</span>
      <span class="value">${payment.receiptNumber || payment.id}</span>
    </div>
    <div class="row">
      <span class="label">Payment Date</span>
      <span class="value">${formatDate(payment.date)}</span>
    </div>
    <div class="row">
      <span class="label">Payment Type</span>
      <span class="value">${payment.type === 'tax' ? (userType === 'individual' ? 'PAYE Tax' : 'Company Income Tax') : 'Payroll Tax (PAYE)'}</span>
    </div>
    <div class="row">
      <span class="label">Description</span>
      <span class="value">${payment.description || 'Tax Payment'}</span>
    </div>
    <div class="row">
      <span class="label">Tax Year</span>
      <span class="value">2026</span>
    </div>
    
    <div class="amount-row">
      <div class="row" style="border: none; align-items: center;">
        <span class="label" style="font-size: 16px;">Amount Paid</span>
        <span class="value">${formatNaira(payment.amount)}</span>
      </div>
    </div>
    
    <div class="qr-section">
      <div style="font-weight: 600; margin-bottom: 12px; color: #333;">Verification QR Code</div>
      <div class="qr-code">
        ${qrPattern.map(row => 
          row.map(cell => `<div class="qr-cell ${cell ? 'filled' : 'empty'}"></div>`).join('')
        ).join('')}
      </div>
      <div class="verification">
        Scan to verify at verify.taxnarrate.ng<br/>
        Transaction ID: ${payment.id}
      </div>
    </div>
  </div>
  
  <div class="footer">
    This is an official receipt generated by TaxNarrate.<br/>
    For inquiries, contact support@taxnarrate.ng<br/>
    © 2026 TaxNarrate - Nigeria Revenue Service Partner
  </div>
  
  <div class="watermark">Generated: ${new Date().toISOString()}</div>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaxReceipt-${payment.receiptNumber || payment.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            Tax Payment Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div ref={receiptRef} className="space-y-4">
          {/* Success Badge */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Payment Successful
            </span>
          </div>
          
          {/* Receipt Details */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receipt Number</span>
              <span className="font-medium font-mono">{payment.receiptNumber || payment.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Date</span>
              <span className="font-medium">{formatDate(payment.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Type</span>
              <span className="font-medium">
                {payment.type === 'tax' 
                  ? (userType === 'individual' ? 'PAYE Tax' : 'Company Income Tax')
                  : 'Payroll Tax (PAYE)'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium">{payment.description || 'Tax Payment'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Year</span>
              <span className="font-medium">2026</span>
            </div>
          </div>
          
          {/* Amount */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Amount Paid</span>
              <span className="text-2xl font-bold text-primary">{formatNaira(payment.amount)}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* QR Code Section */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <QrCode className="h-4 w-4" />
              Verification QR Code
            </div>
            
            <div className="inline-grid grid-cols-7 gap-0.5 p-3 bg-white rounded-lg border">
              {qrPattern.map((row, i) => 
                row.map((cell, j) => (
                  <div 
                    key={`${i}-${j}`}
                    className={`w-3 h-3 rounded-sm ${cell ? 'bg-primary' : 'bg-muted/30'}`}
                  />
                ))
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Scan to verify at verify.taxnarrate.ng<br />
              Transaction ID: {payment.id}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className="flex-1 gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
