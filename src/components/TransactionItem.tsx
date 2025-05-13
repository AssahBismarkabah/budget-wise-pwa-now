import { formatCurrency } from '@/lib/formatters';
import { useBudget } from '@/contexts/BudgetContext';
import { Transaction } from '@/services/dbService';
import { cn } from '@/lib/utils';
import { X, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import TransactionForm from './TransactionForm';
import { useTranslation } from 'react-i18next';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const { categories, deleteTransaction } = useBudget();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const category = categories.find(cat => cat.id === transaction.category);
  
  const formattedDate = new Date(transaction.date).toLocaleDateString(
    { de: 'de-DE', en: 'en-US' }[language],
    {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    }
  );

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card shadow-sm mb-2 last:mb-0">
      <div className="flex-1">
        <div className="font-bold text-base text-foreground">
          {transaction.title || category?.name || (transaction.type === 'income' ? t('new_income') : t('new_expense'))}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{category?.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <span className={cn(
          'font-bold text-lg tabular-nums',
          transaction.type === 'income' ? 'text-budget-green' : 'text-budget-red'
        )}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <TransactionForm 
              type={transaction.type}
              onSave={() => setEditDialogOpen(false)}
              onCancel={() => setEditDialogOpen(false)}
              editTransaction={transaction}
            />
          </DialogContent>
        </Dialog>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(true)} className="h-8 w-8 hover:bg-muted">
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_confirmation')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteTransaction(transaction.id)}
                className="bg-budget-red hover:bg-budget-red/90"
              >
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TransactionItem;
