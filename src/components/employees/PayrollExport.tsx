import { useState } from 'react';
import { useTaxNarrate, Employee } from '@/contexts/TaxNarrateContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { formatNaira } from '@/lib/tax-calculator';
import { useToast } from '@/hooks/use-toast';

export function PayrollExport() {
  const { state } = useTaxNarrate();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const employees = state.business.employees;

  const generateCSV = () => {
    const headers = [
      'Name',
      'NIN',
      'Monthly Salary (₦)',
      'Annual Rent (₦)',
      'Monthly Tax (₦)',
      'Annual Tax (₦)',
      'Status'
    ];

    const rows = employees.map((emp) => [
      emp.name,
      emp.nin || 'N/A',
      emp.monthlySalary.toString(),
      emp.annualRent.toString(),
      emp.monthlyTax.toFixed(2),
      emp.annualTax.toFixed(2),
      emp.status
    ]);

    // Summary row
    const totalMonthlyTax = employees.reduce((sum, e) => sum + e.monthlyTax, 0);
    const totalAnnualTax = employees.reduce((sum, e) => sum + e.annualTax, 0);
    const totalSalary = employees.reduce((sum, e) => sum + e.monthlySalary, 0);
    
    rows.push([]);
    rows.push(['SUMMARY', '', '', '', '', '', '']);
    rows.push(['Total Employees', employees.length.toString(), '', '', '', '', '']);
    rows.push(['Total Monthly Salary', '', totalSalary.toFixed(2), '', '', '', '']);
    rows.push(['Total Monthly Tax', '', '', '', totalMonthlyTax.toFixed(2), '', '']);
    rows.push(['Total Annual Tax', '', '', '', '', totalAnnualTax.toFixed(2), '']);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  const generatePDFContent = () => {
    const totalMonthlyTax = employees.reduce((sum, e) => sum + e.monthlyTax, 0);
    const totalAnnualTax = employees.reduce((sum, e) => sum + e.annualTax, 0);
    const totalSalary = employees.reduce((sum, e) => sum + e.monthlySalary, 0);
    const activeCount = employees.filter(e => e.status === 'active').length;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Create HTML content for PDF-like document
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Payroll Tax Report - ${dateStr}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #0A2463; }
    .header { text-align: center; border-bottom: 2px solid #0A2463; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #0A2463; }
    .header p { margin: 5px 0; color: #666; }
    .demo-banner { background: #FEF3C7; padding: 10px; text-align: center; margin-bottom: 20px; border-radius: 5px; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .summary-card { flex: 1; padding: 15px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; }
    .summary-card h3 { margin: 0; font-size: 14px; color: #64748B; }
    .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #0A2463; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #0A2463; color: white; padding: 12px 8px; text-align: left; font-size: 12px; }
    td { padding: 10px 8px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
    tr:hover { background: #F8FAFC; }
    .status-active { color: #10B981; font-weight: 600; }
    .status-inactive { color: #EF4444; font-weight: 600; }
    .totals { background: #F1F5F9; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #64748B; font-size: 11px; border-top: 1px solid #E2E8F0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="demo-banner">⚠️ DEMO DOCUMENT - This is a simulated payroll report for demonstration purposes only.</div>
  
  <div class="header">
    <h1>TaxNarrate</h1>
    <p>Payroll Tax Report</p>
    <p>Generated: ${dateStr}</p>
    ${state.business.companyName ? `<p>${state.business.companyName}</p>` : ''}
  </div>

  <div class="summary" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
    <div class="summary-card">
      <h3>Total Employees</h3>
      <p>${employees.length}</p>
    </div>
    <div class="summary-card">
      <h3>Active</h3>
      <p>${activeCount}</p>
    </div>
    <div class="summary-card">
      <h3>Monthly Tax</h3>
      <p>${formatNaira(totalMonthlyTax)}</p>
    </div>
    <div class="summary-card">
      <h3>Annual Tax</h3>
      <p>${formatNaira(totalAnnualTax)}</p>
    </div>
  </div>

  <h2>Employee Details</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>NIN</th>
        <th>Monthly Salary</th>
        <th>Annual Rent</th>
        <th>Monthly Tax</th>
        <th>Annual Tax</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${employees.map(emp => `
        <tr>
          <td>${emp.name}</td>
          <td>${emp.nin || 'N/A'}</td>
          <td>${formatNaira(emp.monthlySalary)}</td>
          <td>${formatNaira(emp.annualRent)}</td>
          <td>${formatNaira(emp.monthlyTax)}</td>
          <td>${formatNaira(emp.annualTax)}</td>
          <td class="status-${emp.status}">${emp.status.toUpperCase()}</td>
        </tr>
      `).join('')}
      <tr class="totals">
        <td colspan="2">TOTAL</td>
        <td>${formatNaira(totalSalary)}</td>
        <td>-</td>
        <td>${formatNaira(totalMonthlyTax)}</td>
        <td>${formatNaira(totalAnnualTax)}</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>This document was generated by TaxNarrate - Nigeria 2026 Tax Compliance Platform</p>
    <p>For official tax records, please use government-issued documents only.</p>
  </div>
</body>
</html>
    `;

    return htmlContent;
  };

  const handleExportCSV = async () => {
    if (employees.length === 0) {
      toast({
        title: "No Data",
        description: "Add employees to export payroll data.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExporting(false);
    toast({
      title: "Export Complete",
      description: "Payroll data exported to CSV successfully.",
    });
  };

  const handleExportPDF = async () => {
    if (employees.length === 0) {
      toast({
        title: "No Data",
        description: "Add employees to export payroll report.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const htmlContent = generatePDFContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }

    setExporting(false);
    toast({
      title: "Report Generated",
      description: "Payroll report ready for printing/saving as PDF.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
