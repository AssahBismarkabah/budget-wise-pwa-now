
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, getFirstDayOfMonth, getLastDayOfMonth } from '@/lib/formatters';
import TransactionForm from '@/components/TransactionForm';
import TransactionItem from '@/components/TransactionItem';
import { cn } from '@/lib/utils';

const Index = () => {
  const { transactions, currentAccount } = useBudget();
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

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

  return (
    <Layout>
      {/* Account Banner */}
      <div className="bg-budget-blue text-white p-6 flex justify-between items-center">
        <h2 className="text-xl font-medium">
          {currentAccount?.name || 'Mein Konto'}
        </h2>
        <div className="text-sm opacity-80">
          {new Date().toLocaleDateString('de-DE', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Budget Summary */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-medium mb-4">Monatsübersicht</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-muted-foreground">Einnahmen</div>
              <div className="text-xl font-medium text-budget-green">
                {formatCurrency(totalIncome)}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-muted-foreground">Ausgaben</div>
              <div className="text-xl font-medium text-budget-red">
                {formatCurrency(totalExpense)}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-muted-foreground">Saldo</div>
            <div className={cn(
              "text-2xl font-medium",
              balance >= 0 ? "text-budget-green" : "text-budget-red"
            )}>
              {formatCurrency(balance)}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium">Transaktionen</h3>
          </div>
          
          {sortedTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Noch keine Transaktionen vorhanden</p>
              <p className="text-sm mt-2">Fügen Sie Ihre ersten Einnahmen oder Ausgaben hinzu</p>
            </div>
          ) : (
            <div className="divide-y">
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

      {/* Add Transaction Buttons */}
      <div className="fixed right-6 bottom-20 flex flex-col gap-3">
        <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="add-income-button">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <h3 className="text-lg font-medium mb-4">Neue Einnahme</h3>
            <TransactionForm 
              type="income"
              onSave={() => setIncomeDialogOpen(false)}
              onCancel={() => setIncomeDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button className="add-expense-button">
              <Minus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <h3 className="text-lg font-medium mb-4">Neue Ausgabe</h3>
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
