
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, getMonthName } from '@/lib/formatters';
import { BarChart, PieChart, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Statistics = () => {
  const { transactions, categories } = useBudget();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  
  // Colors for charts
  const COLORS = {
    income: '#34C759',
    expense: '#FF3B30',
    balance: '#FFCC00',
  };
  
  const PIE_COLORS = [
    '#1E90FF', '#34C759', '#FF3B30', '#FFCC00', '#FF9500', '#5856D6', '#AF52DE', 
    '#FF2D55', '#5AC8FA', '#007AFF', '#4CD964', '#FF3B30', '#FFCC00'
  ];
  
  useEffect(() => {
    prepareChartData();
    prepareCategoryData();
  }, [transactions, period, year, month]);
  
  const prepareChartData = () => {
    if (period === 'monthly') {
      // Filter transactions for the selected year
      const yearTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year;
      });
      
      // Group by month
      const monthlyData = Array(12).fill(0).map((_, index) => {
        const monthTransactions = yearTransactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === index;
        });
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = income - expense;
        
        return {
          name: getMonthName(index),
          income,
          expense,
          balance,
        };
      });
      
      setChartData(monthlyData);
    } else {
      // Yearly statistics (last 5 years)
      const currentYear = new Date().getFullYear();
      const yearlyData = [];
      
      for (let y = currentYear - 4; y <= currentYear; y++) {
        const yearTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === y;
        });
        
        const income = yearTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = yearTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = income - expense;
        
        yearlyData.push({
          name: y.toString(),
          income,
          expense,
          balance,
        });
      }
      
      setChartData(yearlyData);
    }
  };
  
  const prepareCategoryData = () => {
    // Filter transactions based on period
    let filteredTransactions;
    
    if (period === 'monthly') {
      filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });
    } else {
      filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year;
      });
    }
    
    // Count transactions by category
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const expensesData = expenseCategories.map(category => {
      const categoryTransactions = filteredTransactions.filter(t => 
        t.type === 'expense' && t.category === category.id
      );
      
      const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        value: amount,
      };
    }).filter(item => item.value > 0);
    
    setCategoryData(expensesData);
  };
  
  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = chartData.reduce((sum, item) => sum + item.expense, 0);
  const totalBalance = totalIncome - totalExpense;
  
  // Calculate averages
  const monthCount = period === 'monthly' ? 12 : 1;
  const avgIncome = totalIncome / monthCount;
  const avgExpense = totalExpense / monthCount;
  
  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? (totalBalance / totalIncome) * 100 : 0;
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Statistik</h1>
        
        {/* Period Selector */}
        <div className="flex gap-4 mb-6 items-center">
          <div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}
              className="border rounded p-2"
            >
              <option value="monthly">Monatlich</option>
              <option value="yearly">Jährlich</option>
            </select>
          </div>
          
          <div>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded p-2"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 4 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          {period === 'monthly' && (
            <div>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="border rounded p-2"
              >
                {Array.from({ length: 12 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-muted-foreground mb-1">Einnahmen</h3>
            <p className="text-xl font-medium text-budget-green">{formatCurrency(totalIncome)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ø {formatCurrency(avgIncome)} / {period === 'monthly' ? 'Monat' : 'Jahr'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-muted-foreground mb-1">Ausgaben</h3>
            <p className="text-xl font-medium text-budget-red">{formatCurrency(totalExpense)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ø {formatCurrency(avgExpense)} / {period === 'monthly' ? 'Monat' : 'Jahr'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-muted-foreground mb-1">Balance</h3>
            <p className={`text-xl font-medium ${totalBalance >= 0 ? 'text-budget-green' : 'text-budget-red'}`}>
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Sparrate: {savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {period === 'monthly' ? 'Monatsübersicht ' + year : 'Jahresübersicht'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="income" name="Einnahmen" fill={COLORS.income} />
                <Bar dataKey="expense" name="Ausgaben" fill={COLORS.expense} />
                <Bar dataKey="balance" name="Saldo" fill={COLORS.balance} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Pie Chart for Category Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">
            Ausgabenverteilung {period === 'monthly' ? `(${getMonthName(month)} ${year})` : `(${year})`}
          </h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Keine Daten vorhanden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
