import { useState } from 'react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, formatDate, calculateProgress } from '@/lib/formatters';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
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
import { Progress } from '@/components/ui/progress';
import { X, Edit, Plus, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';

const SavingsGoals = () => {
  const { savingsGoals, transactions, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useBudget();
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  
  // Calculate total savings (sum of all income minus expenses)
  const totalSavings = transactions.reduce((sum, transaction) => {
    if (transaction.type === 'income') {
      return sum + transaction.amount;
    } else {
      return sum - transaction.amount;
    }
  }, 0);
  
  // Calculate savings per goal
  const getSavingsForGoal = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return 0;
    
    // For simplicity, we'll allocate the total savings proportionally to each goal
    // based on its target amount relative to the sum of all target amounts
    const totalTargetAmount = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    if (totalTargetAmount <= 0) return 0;
    
    const proportion = goal.targetAmount / totalTargetAmount;
    return Math.min(totalSavings * proportion, goal.targetAmount);
  };
  
  const handleAddOrUpdateGoal = () => {
    if (!name || !targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0 || !deadline) {
      toast({
        title: t('error'),
        description: t('please_fill_all_fields'),
        variant: 'destructive',
      });
      return;
    }
    
    if (editGoalId) {
      const goalToUpdate = savingsGoals.find(goal => goal.id === editGoalId);
      if (goalToUpdate) {
        updateSavingsGoal({
          ...goalToUpdate,
          name,
          targetAmount: Number(targetAmount),
          deadline,
        });
      }
      setEditGoalId(null);
    } else {
      addSavingsGoal({
        name,
        targetAmount: Number(targetAmount),
        deadline,
      });
    }
    
    setName('');
    setTargetAmount('');
    setDeadline('');
    setNewGoalOpen(false);
  };
  
  const handleEditGoal = (goalId: string) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setDeadline(goal.deadline);
      setEditGoalId(goalId);
      setNewGoalOpen(true);
    }
  };
  
  const handleDeleteConfirm = () => {
    if (deleteGoalId) {
      deleteSavingsGoal(deleteGoalId);
      setDeleteGoalId(null);
    }
  };
  
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('savingsGoals.title')}</h1>
        
        {savingsGoals.length === 0 ? (
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 text-center">
            <p className="text-muted-foreground">{t('savingsGoals.noGoals')}</p>
            <Button 
              onClick={() => setNewGoalOpen(true)}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('savingsGoals.addGoal')}
            </Button>
          </div>
        ) : (
          <>
            {/* Savings Goals List */}
            <div className="space-y-4 mb-6">
              {savingsGoals.map(goal => {
                const currentSavings = getSavingsForGoal(goal.id);
                const progress = calculateProgress(currentSavings, goal.targetAmount);
                
                return (
                  <div key={goal.id} className="bg-card text-card-foreground rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{goal.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditGoal(goal.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteGoalId(goal.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm mb-1">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{t('savingsGoals.deadline')}: {formatDate(goal.deadline)}</span>
                    </div>
                    
                    <div className="flex justify-between mb-1 text-sm mt-2">
                      <span>{t('savingsGoals.saved')}: {formatCurrency(currentSavings)}</span>
                      <span>{t('savingsGoals.target')}: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    
                    <Progress 
                      value={progress}
                      className="h-2 bg-muted text-budget-blue"
                    />
                    
                    <p className="text-sm mt-2">
                      {t('savingsGoals.remaining')} {formatCurrency(goal.targetAmount - currentSavings)} {t('savingsGoals.untilTarget')}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* Add Goal Button */}
        <div className="fixed right-6 bottom-20">
          <Button 
            onClick={() => {
              setName('');
              setTargetAmount('');
              setDeadline('');
              setEditGoalId(null);
              setNewGoalOpen(true);
            }}
            className="rounded-full h-12 w-12 bg-budget-blue hover:bg-budget-blue/90 shadow-md"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Add/Edit Goal Dialog */}
        <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
          <DialogContent>
            <DialogTitle>{editGoalId ? t('savingsGoals.editGoal') : t('savingsGoals.newGoal')}</DialogTitle>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  {t('savingsGoals.name')}
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('savingsGoals.namePlaceholder')}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium mb-1">
                  {t('savingsGoals.targetAmount')} (€)
                </label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium mb-1">
                  {t('savingsGoals.deadline')}
                </label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewGoalOpen(false)}
                >
                  {t('savingsGoals.cancel')}
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddOrUpdateGoal}
                >
                  {editGoalId ? t('savingsGoals.update') : t('savingsGoals.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteGoalId} onOpenChange={() => setDeleteGoalId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('savingsGoals.deleteConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('savingsGoals.deleteConfirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('savingsGoals.deleteConfirmCancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>{t('savingsGoals.deleteConfirmDelete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default SavingsGoals;
