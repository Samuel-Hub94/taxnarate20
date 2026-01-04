import { useState, useEffect } from 'react';
import { useTaxNarrate, Employee } from '@/contexts/TaxNarrateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculatePAYE2026, formatNaira } from '@/lib/tax-calculator';

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const { addEmployee, updateEmployee } = useTaxNarrate();
  
  const [name, setName] = useState(employee?.name || '');
  const [nin, setNin] = useState(employee?.nin || '');
  const [monthlySalary, setMonthlySalary] = useState(employee?.monthlySalary?.toString() || '');
  const [annualRent, setAnnualRent] = useState(employee?.annualRent?.toString() || '');
  
  const salary = parseFloat(monthlySalary) || 0;
  const rent = parseFloat(annualRent) || 0;
  const annualIncome = salary * 12;
  
  const { tax: annualTax } = calculatePAYE2026(annualIncome, rent);
  const monthlyTax = annualTax / 12;
  
  const isValid = name.trim() && salary > 0;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    if (employee) {
      updateEmployee(employee.id, {
        name: name.trim(),
        nin: nin.trim() || undefined,
        monthlySalary: salary,
        annualRent: rent,
        monthlyTax,
        annualTax,
      });
    } else {
      const newEmployee: Employee = {
        id: `EMP-${Date.now()}`,
        name: name.trim(),
        nin: nin.trim() || undefined,
        monthlySalary: salary,
        annualRent: rent,
        monthlyTax,
        annualTax,
        status: 'active',
      };
      addEmployee(newEmployee);
    }
    
    onSuccess();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Employee Name *</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nin">NIN (Optional)</Label>
        <Input 
          id="nin"
          value={nin}
          onChange={(e) => setNin(e.target.value)}
          placeholder="Enter 11-digit NIN"
          maxLength={11}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="salary">Monthly Gross Salary (₦) *</Label>
        <Input 
          id="salary"
          type="number"
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
          placeholder="e.g. 300000"
          min={0}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rent">Annual Rent for Relief (₦)</Label>
        <Input 
          id="rent"
          type="number"
          value={annualRent}
          onChange={(e) => setAnnualRent(e.target.value)}
          placeholder="e.g. 600000"
          min={0}
        />
      </div>
      
      {salary > 0 && (
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h4 className="font-medium text-sm">Calculated Tax (2026 Law)</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Monthly PAYE</p>
              <p className="font-semibold text-primary">{formatNaira(monthlyTax)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Annual PAYE</p>
              <p className="font-semibold text-primary">{formatNaira(annualTax)}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={!isValid}>
          {employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
