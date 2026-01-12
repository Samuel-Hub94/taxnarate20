import { useState } from 'react';
import { useTaxNarrate, Employee } from '@/contexts/TaxNarrateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatNaira } from '@/lib/tax-calculator';
import { Users, Plus, Pencil, Trash2, User } from 'lucide-react';
import { EmployeeForm } from './EmployeeForm';
import { CSVEmployeeImport } from './CSVEmployeeImport';
import { useToast } from '@/hooks/use-toast';

interface EmployeeListProps {
  onPayPayroll: () => void;
}

export function EmployeeList({ onPayPayroll }: EmployeeListProps) {
  const { state, removeEmployee, isSecurePlusMode } = useTaxNarrate();
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const employees = state.business.employees;
  const activeEmployees = employees.filter(e => e.status === 'active');
  const totalMonthlyTax = activeEmployees.reduce((sum, e) => sum + e.monthlyTax, 0);
  const totalAnnualTax = activeEmployees.reduce((sum, e) => sum + e.annualTax, 0);
  
  const maxEmployees = isSecurePlusMode ? Infinity : 50;
  const canAddMore = employees.length < maxEmployees;
  
  const handleDeleteEmployee = (id: string) => {
    removeEmployee(id);
    toast({
      title: "Employee Removed",
      description: "Employee has been removed from payroll.",
    });
  };
  
  const handleEmployeeAdded = () => {
    setAddDialogOpen(false);
    setEditingEmployee(null);
    toast({
      title: editingEmployee ? "Employee Updated" : "Employee Added",
      description: editingEmployee 
        ? "Employee details have been updated."
        : "New employee has been added to payroll.",
    });
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <CardTitle>Employees ({activeEmployees.length})</CardTitle>
                <CardDescription>Manage your payroll</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CSVEmployeeImport />
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2" disabled={!canAddMore}>
                    <Plus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Employee</DialogTitle>
                  <DialogDescription>
                    Add a new employee to your payroll
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm 
                  onSuccess={handleEmployeeAdded}
                  onCancel={() => setAddDialogOpen(false)}
                />
              </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No employees added yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add employees to manage their PAYE tax
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div 
                  key={employee.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-muted-foreground/30 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Salary: {formatNaira(employee.monthlySalary)}/mo</span>
                        <span>Tax: {formatNaira(employee.monthlyTax)}/mo</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={employee.status === 'active' ? 'status-paid' : 'status-failed'}>
                      {employee.status}
                    </span>
                    <Dialog 
                      open={editingEmployee?.id === employee.id} 
                      onOpenChange={(open) => !open && setEditingEmployee(null)}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setEditingEmployee(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit Employee</DialogTitle>
                          <DialogDescription>
                            Update employee details
                          </DialogDescription>
                        </DialogHeader>
                        <EmployeeForm 
                          employee={employee}
                          onSuccess={handleEmployeeAdded}
                          onCancel={() => setEditingEmployee(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payroll Summary */}
      {activeEmployees.length > 0 && (
        <Card className="border-accent/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Monthly PAYE</p>
                <p className="text-2xl font-bold text-accent">{formatNaira(totalMonthlyTax)}</p>
                <p className="text-xs text-muted-foreground">
                  Annual: {formatNaira(totalAnnualTax)}
                </p>
              </div>
              <Button size="lg" className="gap-2" onClick={onPayPayroll}>
                Pay All Employee Taxes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isSecurePlusMode && employees.length >= 45 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold">Need More Employees?</h3>
                <p className="text-sm text-muted-foreground">
                  Secure mode supports up to 50 employees. Upgrade for unlimited.
                </p>
              </div>
              <Button variant="outline" size="sm">Upgrade to Secure+</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
