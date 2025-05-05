import { useState } from 'react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, calculateProgress } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { X, Edit, Plus } from 'lucide-react';

const Limits = () => {
  const { limits, categories, transactions, addLimit, updateLimit, deleteLimit } = useBudget();
  const [newLimitOpen, setNewLimitOpen] = useState(false);
  const [editLimitId, setEditLimitId] = useState<string | null>(null);
  const [deleteLimitId, setDeleteLimitId] = useState<string | null>(null);
  
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  
  // Get only expense categories
  const expenseCategories = categories.filter(category => category.type === 'expense');
  
  // Get current month spending by category
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).toISOString().split('T')[0];
  
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).toISOString().split('T')[0];
  
  const getSpendingForCategory = (categoryId: string) => {
    return transactions
      .filter(
        transaction => 
          transaction.type === 'expense' && 
          transaction.category === categoryId &&
          transaction.date >= firstDayOfMonth &&
          transaction.date <= lastDayOfMonth
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };
  
  const handleAddOrUpdateLimit = () => {
    if (!categoryId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Bitte füllen Sie alle Felder korrekt aus.');
      return;
    }
    
    if (editLimitId) {
      const limitToUpdate = limits.find(limit => limit.id === editLimitId);
      if (limitToUpdate) {
        updateLimit({
          ...limitToUpdate,
          categoryId,
          amount: Number(amount),
        });
      }
      setEditLimitId(null);
    } else {
      addLimit({
        categoryId,
        amount: Number(amount),
      });
    }
    
    setCategoryId('');
    setAmount('');
    setNewLimitOpen(false);
  };
  
  const handleEditLimit = (limitId: string) => {
    const limit = limits.find(l => l.id === limitId);
    if (limit) {
      setCategoryId(limit.categoryId);
      setAmount(limit.amount.toString());
      setEditLimitId(limitId);
      setNewLimitOpen(true);
    }
  };
  
  const handleDeleteConfirm = () => {
    if (deleteLimitId) {
      deleteLimit(deleteLimitId);
      setDeleteLimitId(null);
    }
  };
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Limits</h1>
        
        {limits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-muted-foreground">Bisher wurden noch keine Limits angelegt</p>
            <Button 
              onClick={() => setNewLimitOpen(true)}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Limit hinzufügen
            </Button>
          </div>
        ) : (
          <>
            {/* Limits List */}
            <div className="space-y-4 mb-6">
              {limits.map(limit => {
                const category = categories.find(c => c.id === limit.categoryId);
                const spending = getSpendingForCategory(limit.categoryId);
                const progress = calculateProgress(spending, limit.amount);
                const isExceeded = spending > limit.amount;
                
                return (
                  <div key={limit.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{category?.name || 'Unknown Category'}</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditLimit(limit.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteLimitId(limit.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Ausgaben: {formatCurrency(spending)}</span>
                      <span>Limit: {formatCurrency(limit.amount)}</span>
                    </div>
                    
                    <Progress 
                      value={progress}
                      className={cn(
                        isExceeded ? "bg-budget-red/20" : "bg-gray-100", 
                        "h-2",
                        isExceeded ? "text-budget-red" : "text-budget-blue"
                      )}
                    />
                    
                    {isExceeded && (
                      <p className="text-budget-red text-sm mt-2">
                        Limit um {formatCurrency(spending - limit.amount)} überschritten
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* Add Limit Button */}
        <div className="fixed right-6 bottom-20">
          <Button 
            onClick={() => {
              setCategoryId('');
              setAmount('');
              setEditLimitId(null);
              setNewLimitOpen(true);
            }}
            className="rounded-full h-12 w-12 bg-budget-blue hover:bg-budget-blue/90 shadow-md"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Add/Edit Limit Dialog */}
        <Dialog open={newLimitOpen} onOpenChange={setNewLimitOpen}>
          <DialogContent>
            <h3 className="text-lg font-medium mb-4">
              {editLimitId ? 'Limit bearbeiten' : 'Neues Limit'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Kategorie
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Limit (€)
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg"
                  required
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewLimitOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddOrUpdateLimit}
                >
                  {editLimitId ? 'Aktualisieren' : 'Speichern'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteLimitId} onOpenChange={() => setDeleteLimitId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limit löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Limit löschen möchten?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Limits;
