import { useMemo } from 'react';
import { useTaxNarrate, Department, DEPARTMENTS } from '@/contexts/TaxNarrateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNaira } from '@/lib/tax-calculator';
import { Building2, Users, TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RePieChart,
  Pie,
} from 'recharts';

interface DepartmentSummary {
  department: Department;
  employeeCount: number;
  totalMonthlySalary: number;
  totalMonthlyTax: number;
  totalMonthlyCost: number;
  avgSalary: number;
  color: string;
}

const DEPARTMENT_COLORS: Record<Department, string> = {
  'Engineering': '#3B82F6',
  'Sales': '#10B981',
  'Marketing': '#F59E0B',
  'Finance': '#8B5CF6',
  'Human Resources': '#EC4899',
  'Operations': '#6366F1',
  'Customer Support': '#14B8A6',
  'Legal': '#F97316',
  'Executive': '#0EA5E9',
  'Other': '#6B7280',
};

export function DepartmentAnalytics() {
  const { state, isSecurePlusMode } = useTaxNarrate();
  const { employees } = state.business;

  const departmentData = useMemo(() => {
    const activeEmployees = employees.filter(e => e.status === 'active');
    
    const departmentMap = new Map<Department, DepartmentSummary>();
    
    // Initialize departments with employees
    activeEmployees.forEach(emp => {
      const dept = emp.department || 'Other';
      const existing = departmentMap.get(dept);
      
      if (existing) {
        existing.employeeCount++;
        existing.totalMonthlySalary += emp.monthlySalary;
        existing.totalMonthlyTax += emp.monthlyTax;
        existing.totalMonthlyCost += emp.monthlySalary + emp.monthlyTax;
        existing.avgSalary = existing.totalMonthlySalary / existing.employeeCount;
      } else {
        departmentMap.set(dept, {
          department: dept,
          employeeCount: 1,
          totalMonthlySalary: emp.monthlySalary,
          totalMonthlyTax: emp.monthlyTax,
          totalMonthlyCost: emp.monthlySalary + emp.monthlyTax,
          avgSalary: emp.monthlySalary,
          color: DEPARTMENT_COLORS[dept],
        });
      }
    });
    
    return Array.from(departmentMap.values()).sort((a, b) => b.totalMonthlyCost - a.totalMonthlyCost);
  }, [employees]);

  const totals = useMemo(() => {
    return departmentData.reduce(
      (acc, dept) => ({
        totalEmployees: acc.totalEmployees + dept.employeeCount,
        totalSalary: acc.totalSalary + dept.totalMonthlySalary,
        totalTax: acc.totalTax + dept.totalMonthlyTax,
        totalCost: acc.totalCost + dept.totalMonthlyCost,
      }),
      { totalEmployees: 0, totalSalary: 0, totalTax: 0, totalCost: 0 }
    );
  }, [departmentData]);

  if (departmentData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No Department Data</h3>
          <p className="text-sm text-muted-foreground">
            Add employees with department assignments to see analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Summary Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Department Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Cost breakdown by department ({departmentData.length} departments)
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Building2 className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{departmentData.length}</p>
            <p className="text-xs text-muted-foreground">Active Departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{totals.totalEmployees}</p>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <DollarSign className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{formatNaira(totals.totalSalary)}</p>
            <p className="text-xs text-muted-foreground">Monthly Salaries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{formatNaira(totals.totalTax)}</p>
            <p className="text-xs text-muted-foreground">Monthly PAYE Tax</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Cost Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Cost by Department</CardTitle>
            <CardDescription>Total salary + tax per department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="department"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatNaira(value)}
                    labelFormatter={(label) => `${label} Department`}
                  />
                  <Bar dataKey="totalMonthlyCost" radius={[0, 4, 4, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Distribution</CardTitle>
            <CardDescription>Headcount by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="employeeCount"
                    nameKey="department"
                    label={({ department, percent }) => 
                      `${department}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} employee${value > 1 ? 's' : ''}`,
                      name
                    ]}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Tax Summary</CardTitle>
          <CardDescription>Detailed breakdown per department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {departmentData.map((dept) => (
              <div 
                key={dept.department}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:border-muted-foreground/30 transition-smooth gap-3"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${dept.color}20` }}
                  >
                    <Building2 className="h-5 w-5" style={{ color: dept.color }} />
                  </div>
                  <div>
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.employeeCount} employee{dept.employeeCount > 1 ? 's' : ''} • Avg: {formatNaira(dept.avgSalary)}/mo
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 sm:gap-8 text-sm ml-13 sm:ml-0">
                  <div className="text-left sm:text-right">
                    <p className="text-muted-foreground text-xs">Salaries</p>
                    <p className="font-medium">{formatNaira(dept.totalMonthlySalary)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-muted-foreground text-xs">PAYE Tax</p>
                    <p className="font-medium text-primary">{formatNaira(dept.totalMonthlyTax)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-muted-foreground text-xs">Total Cost</p>
                    <p className="font-semibold text-accent">{formatNaira(dept.totalMonthlyCost)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
