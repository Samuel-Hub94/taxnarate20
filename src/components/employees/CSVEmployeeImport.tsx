import { useState, useRef } from 'react';
import { useTaxNarrate, Employee, DEPARTMENTS, Department } from '@/contexts/TaxNarrateContext';
import { calculatePAYE2026 } from '@/lib/tax-calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { formatNaira } from '@/lib/tax-calculator';

interface ParsedEmployee {
  name: string;
  nin?: string;
  department: Department;
  monthlySalary: number;
  annualRent: number;
  monthlyTax: number;
  annualTax: number;
  isValid: boolean;
  error?: string;
}

export function CSVEmployeeImport() {
  const { addEmployee, isSecurePlusMode } = useTaxNarrate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [parsedEmployees, setParsedEmployees] = useState<ParsedEmployee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = () => {
    const headers = 'Name,NIN,Department,Monthly Salary,Annual Rent';
    const example1 = 'John Doe,12345678901,Engineering,300000,600000';
    const example2 = 'Jane Smith,,Sales,250000,0';
    const csvContent = `${headers}\n${example1}\n${example2}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedEmployee[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    return dataLines.map((line) => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      const name = values[0] || '';
      const nin = values[1] || undefined;
      const departmentRaw = values[2] || 'Other';
      const department = DEPARTMENTS.includes(departmentRaw as Department) 
        ? (departmentRaw as Department) 
        : 'Other';
      const monthlySalary = parseFloat(values[3]) || 0;
      const annualRent = parseFloat(values[4]) || 0;
      
      // Validate
      const errors: string[] = [];
      if (!name) errors.push('Name required');
      if (monthlySalary <= 0) errors.push('Invalid salary');
      if (nin && nin.length !== 11) errors.push('Invalid NIN');
      
      const isValid = errors.length === 0;
      
      // Calculate tax
      const annualIncome = monthlySalary * 12;
      const { tax: annualTax } = calculatePAYE2026(annualIncome, annualRent);
      const monthlyTax = annualTax / 12;
      
      return {
        name,
        nin,
        department,
        monthlySalary,
        annualRent,
        monthlyTax,
        annualTax,
        isValid,
        error: errors.join(', ')
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setParsedEmployees(parsed);
      setIsProcessing(false);
      
      if (parsed.length === 0) {
        toast({
          title: "Empty File",
          description: "No employee data found in the CSV.",
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = () => {
      setIsProcessing(false);
      toast({
        title: "Read Error",
        description: "Failed to read the CSV file.",
        variant: "destructive"
      });
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    const validEmployees = parsedEmployees.filter(e => e.isValid);
    
    validEmployees.forEach((emp, index) => {
      const newEmployee: Employee = {
        id: `EMP-${Date.now()}-${index}`,
        name: emp.name,
        nin: emp.nin,
        department: emp.department,
        monthlySalary: emp.monthlySalary,
        annualRent: emp.annualRent,
        monthlyTax: emp.monthlyTax,
        annualTax: emp.annualTax,
        status: 'active'
      };
      addEmployee(newEmployee);
    });
    
    toast({
      title: "Import Successful",
      description: `${validEmployees.length} employee(s) added to payroll.`
    });
    
    setParsedEmployees([]);
    setDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedEmployees.filter(e => e.isValid).length;
  const invalidCount = parsedEmployees.filter(e => !e.isValid).length;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Employees from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with employee data for bulk import
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Template Download */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">CSV Template</p>
                  <p className="text-xs text-muted-foreground">
                    Download the template with required columns
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Click to upload CSV</p>
              <p className="text-sm text-muted-foreground">
                Columns: Name, NIN (optional), Department, Monthly Salary, Annual Rent
              </p>
            </label>
          </div>
          
          {/* Preview Table */}
          {parsedEmployees.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>{validCount} valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{invalidCount} invalid</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>NIN</TableHead>
                      <TableHead className="text-right">Salary</TableHead>
                      <TableHead className="text-right">Monthly Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedEmployees.map((emp, i) => (
                      <TableRow key={i} className={!emp.isValid ? 'bg-destructive/5' : ''}>
                        <TableCell>
                          {emp.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                          ) : (
                            <span className="text-xs text-destructive">{emp.error}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{emp.name || '-'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {emp.nin || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {emp.monthlySalary > 0 ? formatNaira(emp.monthlySalary) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {emp.monthlyTax > 0 ? formatNaira(emp.monthlyTax) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                setParsedEmployees([]);
                setDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              disabled={validCount === 0 || isProcessing}
              onClick={handleImport}
            >
              Import {validCount} Employee{validCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
