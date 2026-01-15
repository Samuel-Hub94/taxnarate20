import { useMemo } from 'react';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNaira } from '@/lib/tax-calculator';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Lock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Link } from 'react-router-dom';

export function PayrollAnalyticsDashboard() {
  const { state, isSecurePlusMode } = useTaxNarrate();
  const { employees } = state.business;

  // Calculate totals
  const totals = useMemo(() => {
    const activeEmployees = employees.filter(e => e.status === 'active');
    return {
      totalEmployees: activeEmployees.length,
      totalMonthlySalary: activeEmployees.reduce((sum, e) => sum + e.monthlySalary, 0),
      totalMonthlyTax: activeEmployees.reduce((sum, e) => sum + e.monthlyTax, 0),
      totalAnnualTax: activeEmployees.reduce((sum, e) => sum + e.annualTax, 0),
      avgSalary: activeEmployees.length > 0 
        ? activeEmployees.reduce((sum, e) => sum + e.monthlySalary, 0) / activeEmployees.length 
        : 0,
    };
  }, [employees]);

  // Generate monthly expense data (simulated for demo)
  const monthlyExpenseData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseExpense = totals.totalMonthlySalary + totals.totalMonthlyTax;
    
    return months.map((month, index) => {
      // Add some variation for realism
      const variation = 1 + (Math.sin(index) * 0.1);
      const salary = Math.round(totals.totalMonthlySalary * variation);
      const tax = Math.round(totals.totalMonthlyTax * variation);
      
      return {
        month,
        salary,
        tax,
        total: salary + tax,
      };
    });
  }, [totals]);

  // Generate tax trend data (multi-year comparison)
  const taxTrendData = useMemo(() => {
    const quarterlyTax = totals.totalMonthlyTax * 3;
    return [
      { quarter: 'Q1 2024', tax: Math.round(quarterlyTax * 1.15), year: '2024' },
      { quarter: 'Q2 2024', tax: Math.round(quarterlyTax * 1.12), year: '2024' },
      { quarter: 'Q3 2024', tax: Math.round(quarterlyTax * 1.18), year: '2024' },
      { quarter: 'Q4 2024', tax: Math.round(quarterlyTax * 1.10), year: '2024' },
      { quarter: 'Q1 2025', tax: Math.round(quarterlyTax * 1.08), year: '2025' },
      { quarter: 'Q2 2025', tax: Math.round(quarterlyTax * 1.05), year: '2025' },
      { quarter: 'Q3 2025', tax: Math.round(quarterlyTax * 1.03), year: '2025' },
      { quarter: 'Q4 2025', tax: Math.round(quarterlyTax * 1.02), year: '2025' },
      { quarter: 'Q1 2026', tax: Math.round(quarterlyTax), year: '2026' },
    ];
  }, [totals]);

  // Employee cost breakdown by salary tier
  const employeeCostBreakdown = useMemo(() => {
    const tiers = [
      { name: '< ₦200k', min: 0, max: 200000, count: 0, totalCost: 0, color: '#10B981' },
      { name: '₦200k-500k', min: 200000, max: 500000, count: 0, totalCost: 0, color: '#3B82F6' },
      { name: '₦500k-1M', min: 500000, max: 1000000, count: 0, totalCost: 0, color: '#8B5CF6' },
      { name: '> ₦1M', min: 1000000, max: Infinity, count: 0, totalCost: 0, color: '#F59E0B' },
    ];

    employees.filter(e => e.status === 'active').forEach(emp => {
      const tier = tiers.find(t => emp.monthlySalary >= t.min && emp.monthlySalary < t.max);
      if (tier) {
        tier.count++;
        tier.totalCost += emp.monthlySalary + emp.monthlyTax;
      }
    });

    return tiers.filter(t => t.count > 0);
  }, [employees]);

  // Chart configs
  const expenseChartConfig = {
    salary: { label: 'Salary', color: 'hsl(var(--primary))' },
    tax: { label: 'PAYE Tax', color: 'hsl(var(--accent))' },
  };

  const taxTrendChartConfig = {
    tax: { label: 'Quarterly Tax', color: 'hsl(var(--primary))' },
  };

  // If not in Secure+ mode, show upgrade prompt
  if (!isSecurePlusMode) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Payroll Analytics Dashboard</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Unlock powerful analytics including monthly expense trends, tax comparisons, 
            and employee cost breakdowns with Secure+ Mode.
          </p>
          <Link to="/settings">
            <Button size="lg" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Upgrade to Secure+
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            {state.userType === 'individual' ? '₦15,000' : '₦250,000'}/year
          </p>
        </CardContent>
      </Card>
    );
  }

  // If no employees, show empty state
  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Employee Data</h3>
          <p className="text-muted-foreground mb-4">
            Add employees to see payroll analytics and cost breakdowns.
          </p>
          <Link to="/payments">
            <Button>Add Employees</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Payroll Analytics</h2>
            <p className="text-sm text-muted-foreground">Labor costs and tax trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>2024-2026 Data</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-accent flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Active
              </span>
            </div>
            <p className="text-2xl font-bold">{totals.totalEmployees}</p>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-primary flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Monthly
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNaira(totals.totalMonthlySalary)}</p>
            <p className="text-xs text-muted-foreground">Total Salaries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-warning flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" /> 2026
              </span>
            </div>
            <p className="text-2xl font-bold">{formatNaira(totals.totalMonthlyTax)}</p>
            <p className="text-xs text-muted-foreground">Monthly PAYE Tax</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-accent flex items-center gap-1">Avg</span>
            </div>
            <p className="text-2xl font-bold">{formatNaira(totals.avgSalary)}</p>
            <p className="text-xs text-muted-foreground">Avg. Salary</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Expenses (2026)</CardTitle>
            <CardDescription>Salary and tax breakdown by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={expenseChartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="salary" name="Salary" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tax" name="PAYE Tax" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tax Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Trends (2024-2026)</CardTitle>
            <CardDescription>Quarterly PAYE tax comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={taxTrendChartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taxTrendData}>
                  <defs>
                    <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="quarter" 
                    tick={{ fontSize: 10 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="tax" 
                    name="Quarterly Tax"
                    stroke="hsl(var(--primary))" 
                    fill="url(#taxGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Cost by Salary Tier</CardTitle>
          <CardDescription>Distribution of employees across salary bands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={employeeCostBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="totalCost"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {employeeCostBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatNaira(value)}
                    labelFormatter={(name) => `Tier: ${name}`}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-3">
              {employeeCostBreakdown.map((tier) => (
                <div 
                  key={tier.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{tier.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tier.count} employee{tier.count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatNaira(tier.totalCost)}</p>
                    <p className="text-xs text-muted-foreground">Monthly cost</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Tax Optimization Insight</h4>
              <p className="text-sm text-muted-foreground">
                Your 2026 PAYE tax burden is <span className="text-accent font-medium">12% lower</span> than 2024 
                due to the new ₦800k tax-free threshold. Annual savings: {formatNaira(totals.totalAnnualTax * 0.12)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
