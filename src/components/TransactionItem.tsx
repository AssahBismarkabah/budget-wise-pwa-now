
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

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const { categories, deleteTransaction } = useBudget();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const category = categories.find(cat => cat.id === transaction.category);
  
  const formattedDate = new Date(transaction.date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between p-3 border-b last:border-0">
      <div className="flex-1">
        <div className="font-medium">
          {transaction.title || category?.name || (transaction.type === 'income' ? 'Einnahme' : 'Ausgabe')}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{category?.name}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={cn(
          'font-medium',
          transaction.type === 'income' ? 'text-budget-green' : 'text-budget-red'
        )}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
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
          <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(true)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Transaktion löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie diese Transaktion löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteTransaction(transaction.id)}
                className="bg-budget-red hover:bg-budget-red/90"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TransactionItem;
