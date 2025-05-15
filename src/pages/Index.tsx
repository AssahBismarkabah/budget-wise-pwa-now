import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Minus, CalendarDays } from 'lucide-react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, getFirstDayOfMonth, getLastDayOfMonth } from '@/lib/formatters';
import TransactionForm from '@/components/TransactionForm';
import TransactionItem from '@/components/TransactionItem';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const WEEK_STORAGE_KEY = 'budget-wise-week';
const CREATION_DATE_KEY = 'budget-wise-account-created';
const getAccountCreationDate = () => {
  let stored = localStorage.getItem(CREATION_DATE_KEY);
  if (!stored) {
    stored = new Date().toISOString();
    localStorage.setItem(CREATION_DATE_KEY, stored);
  }
  return new Date(stored);
};
const getCurrentWeekNumber = () => {
  const created = getAccountCreationDate();
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
};

const PIE_COLORS = ['#34C759', '#B18AFF', '#FFCC00']; // Figma: green, purple, yellow

const Index = () => {
  const { transactions, currentAccount } = useBudget();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [week, setWeek] = useState(getCurrentWeekNumber());

  // Save week to localStorage on change
  useEffect(() => { localStorage.setItem(WEEK_STORAGE_KEY, String(week)); }, [week]);

  // Filter transactions for the current month
  const firstDayOfMonth = getFirstDayOfMonth();
  const lastDayOfMonth = getLastDayOfMonth();
  
  const currentMonthTransactions = transactions.filter(
    (transaction) => transaction.date >= firstDayOfMonth && transaction.date <= lastDayOfMonth
  );

  // Calculate totals
  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  // Sort transactions by date (newest first)
  const sortedTransactions = [...currentMonthTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Top 3 expense categories by amount
  const expenseCategories = useBudget().categories?.filter(c => c.type === 'expense') || [];
  const expenseByCategory = expenseCategories.map(cat => {
    const total = currentMonthTransactions.filter(t => t.category === cat.id && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { ...cat, total };
  }).filter(c => c.total > 0);
  const top3 = [...expenseByCategory].sort((a, b) => b.total - a.total).slice(0, 3);
  const pieData = top3.map((cat, i) => ({ name: cat.name, value: cat.total, color: PIE_COLORS[i] }));

  return (
    <Layout>
      <div className="flex flex-col w-full h-full">
        {/* Balance Section with Black Background */}
        <div className="w-full bg-black p-4 pb-8">
          {/* Balance and Week header */}
          <div className="flex items-center justify-between mb-2 p-1">
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">BALANCE</span>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">WEEK {week}</span>
            </div>
          </div>
  
          {/* Balance Card */}
          <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              {/* Doughnut Chart */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center" style={{ width: 90, height: 90 }}>
                <ResponsiveContainer width={90} height={90}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Balance and Keys */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-4xl font-bold tracking-tight mb-1" style={{ letterSpacing: '-0.03em' }}>{formatCurrency(balance)}</span>
                <div className="flex gap-2 mt-2">
                  {pieData.map((cat, i) => (
                    <span 
                      key={cat.name} 
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" 
                      style={{ background: cat.color + '22', color: cat.color }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
  
          {/* Income/Expense Cards in horizontal layout */}
          <div className="flex gap-4 w-full">
            {/* Income Card */}
            <div className="flex-1 bg-card text-card-foreground rounded-2xl shadow-lg p-4">
              <div className="text-xs text-gray-500 font-medium uppercase mb-1">{t('income_categories')}</div>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
            </div>
            
            {/* Expense Card */}
            <div className="flex-1 bg-card text-card-foreground rounded-2xl shadow-lg p-4">
              <div className="text-xs text-gray-500 font-medium uppercase mb-1">{t('expense_categories')}</div>
              <div className="text-2xl font-bold text-red-500">−{formatCurrency(Math.abs(totalExpense))}</div>
            </div>
          </div>
        </div>
  
        {/* Transaction Section - separate div with white background and curved top */}
        <div 
          className="w-full bg-white rounded-t-3xl flex-1 -mt-6 relative z-10"
        >
          <div className="px-4 pt-6 pb-20">
            <div className="text-xl font-bold mb-4 px-2">{t('transactions')}</div>
            <div className="bg-card text-card-foreground shadow-sm">
              {sortedTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground font-medium">{t('no_transactions')}</p>
                  <p className="text-sm mt-2">{t('add_first_transaction')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {sortedTransactions.map((transaction) => (
                    <TransactionItem 
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  
      {/* Add Transaction Buttons - Fixed position */}
      <div className="fixed right-6 bottom-24 flex flex-col gap-4 z-50">
        <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full h-16 w-16 p-0 flex items-center justify-center">
              <Plus className="h-8 w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add Income</DialogTitle>
            <TransactionForm 
              type="income"
              onSave={() => setIncomeDialogOpen(false)}
              onCancel={() => setIncomeDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full h-16 w-16 p-0 flex items-center justify-center">
              <Minus className="h-8 w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add Expense</DialogTitle>
            <TransactionForm 
              type="expense"
              onSave={() => setExpenseDialogOpen(false)}
              onCancel={() => setExpenseDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Index;
