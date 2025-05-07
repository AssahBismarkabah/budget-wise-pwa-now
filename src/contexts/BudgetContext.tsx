import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  Account, 
  Transaction, 
  Category, 
  Limit, 
  Template, 
  RecurringItem, 
  SavingsGoal, 
  getAll, 
  add, 
  update, 
  remove,
  generateUUID,
  initDB,
  DEFAULT_ACCOUNT_ID
} from '@/services/dbService';
import { toast } from '@/components/ui/use-toast';
import { ExportData, exportData, importData } from '@/services/exportService';

interface BudgetContextType {
  // Accounts
  currentAccount: Account | null;
  accounts: Account[];
  switchAccount: (accountId: string) => void;
  addAccount: (name: string) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'accountId'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'accountId' | 'isDefault'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Limits
  limits: Limit[];
  addLimit: (limit: Omit<Limit, 'id' | 'accountId'>) => Promise<void>;
  updateLimit: (limit: Limit) => Promise<void>;
  deleteLimit: (id: string) => Promise<void>;
  
  // Templates
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id' | 'accountId'>) => Promise<void>;
  updateTemplate: (template: Template) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  applyTemplate: (templateId: string) => Promise<void>;
  
  // Recurring Items
  recurringItems: RecurringItem[];
  addRecurringItem: (item: Omit<RecurringItem, 'id' | 'accountId'>) => Promise<void>;
  updateRecurringItem: (item: RecurringItem) => Promise<void>;
  deleteRecurringItem: (id: string) => Promise<void>;
  
  // Savings Goals
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'accountId'>) => Promise<void>;
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  
  // App Functions
  resetApp: () => Promise<void>;
  isLoading: boolean;
  
  // Export/Import
  exportAccountData: () => void;
  importAccountData: (file: File) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize DB and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        await loadAccounts();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize the application. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    initialize();
  }, []);

  // Load account data whenever the current account changes
  useEffect(() => {
    if (currentAccount) {
      loadAccountData(currentAccount.id);
    }
  }, [currentAccount]);

  // Process recurring items
  useEffect(() => {
    if (currentAccount) {
      processRecurringItems();
    }
  }, [currentAccount, recurringItems]);

  const loadAccounts = async () => {
    try {
      const loadedAccounts = await getAll<Account>('accounts');
      setAccounts(loadedAccounts);
      
      // Select the default account if available
      if (loadedAccounts.length > 0) {
        const defaultAccount = loadedAccounts.find(acc => acc.id === DEFAULT_ACCOUNT_ID) || loadedAccounts[0];
        setCurrentAccount(defaultAccount);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        variant: 'destructive',
      });
    }
  };

  const loadAccountData = async (accountId: string) => {
    try {
      // Load all data related to the selected account
      const [
        accountTransactions,
        accountCategories,
        accountLimits,
        accountTemplates,
        accountRecurringItems,
        accountSavingsGoals,
      ] = await Promise.all([
        getAll<Transaction>('transactions'),
        getAll<Category>('categories'),
        getAll<Limit>('limits'),
        getAll<Template>('templates'),
        getAll<RecurringItem>('recurringItems'),
        getAll<SavingsGoal>('savingsGoals'),
      ]);

      // Filter data for the current account
      setTransactions(accountTransactions.filter(t => t.accountId === accountId));
      setCategories(accountCategories.filter(c => c.accountId === accountId));
      setLimits(accountLimits.filter(l => l.accountId === accountId));
      setTemplates(accountTemplates.filter(t => t.accountId === accountId));
      setRecurringItems(accountRecurringItems.filter(r => r.accountId === accountId));
      setSavingsGoals(accountSavingsGoals.filter(g => g.accountId === accountId));
    } catch (error) {
      console.error('Failed to load account data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load account data',
        variant: 'destructive',
      });
    }
  };

  const processRecurringItems = async () => {
    if (!currentAccount) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayString = today.toISOString().split('T')[0];
    
    // Process each recurring item
    for (const item of recurringItems) {
      try {
        const startDate = new Date(item.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Skip if start date is in the future
        if (startDate > today) continue;
        
        // Determine if we need to add a transaction for today
        let shouldAdd = false;
        
        switch (item.frequency) {
          case 'daily':
            shouldAdd = true;
            break;
          case 'weekly':
            const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            shouldAdd = daysSinceStart % 7 === 0;
            break;
          case 'monthly':
            shouldAdd = startDate.getDate() === today.getDate();
            break;
        }
        
        if (shouldAdd) {
          // Check if we already added this recurring item for today
          const existingTransaction = transactions.find(t => 
            t.title === item.name && 
            t.amount === item.amount && 
            t.type === item.type && 
            t.date.startsWith(todayString)
          );
          
          if (!existingTransaction) {
            // Add a new transaction
            await addTransaction({
              type: item.type,
              amount: item.amount,
              category: item.categoryId,
              date: todayString,
              title: item.name,
            });
            
            toast({
              title: 'Wiederkehrende Posten',
              description: `"${item.name}" wurde automatisch hinzugefügt.`,
            });
          }
        }
      } catch (error) {
        console.error('Error processing recurring item:', error);
      }
    }
  };

  // Account functions
  const switchAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setCurrentAccount(account);
    }
  };

  const addAccount = async (name: string) => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Account name is required',
        variant: 'destructive',
      });
      return;
    }

    // Create initials from name
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newAccount: Account = {
      id: generateUUID(),
      name,
      initials,
    };

    try {
      await add('accounts', newAccount);
      setAccounts([...accounts, newAccount]);
      setCurrentAccount(newAccount);
      toast({
        title: 'Account created',
        description: `Account "${name}" has been created`,
      });
    } catch (error) {
      console.error('Failed to add account:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive',
      });
    }
  };

  const deleteAccount = async (accountId: string) => {
    // Don't allow deleting the last account
    if (accounts.length <= 1) {
      toast({
        title: 'Error',
        description: 'Cannot delete the last account',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Delete all data associated with the account
      const [
        accountTransactions,
        accountCategories,
        accountLimits,
        accountTemplates,
        accountRecurringItems,
        accountSavingsGoals,
      ] = await Promise.all([
        getAll<Transaction>('transactions'),
        getAll<Category>('categories'),
        getAll<Limit>('limits'),
        getAll<Template>('templates'),
        getAll<RecurringItem>('recurringItems'),
        getAll<SavingsGoal>('savingsGoals'),
      ]);

      // Delete all related data
      await Promise.all([
        ...accountTransactions
          .filter(t => t.accountId === accountId)
          .map(t => remove('transactions', t.id)),
        ...accountCategories
          .filter(c => c.accountId === accountId)
          .map(c => remove('categories', c.id)),
        ...accountLimits
          .filter(l => l.accountId === accountId)
          .map(l => remove('limits', l.id)),
        ...accountTemplates
          .filter(t => t.accountId === accountId)
          .map(t => remove('templates', t.id)),
        ...accountRecurringItems
          .filter(r => r.accountId === accountId)
          .map(r => remove('recurringItems', r.id)),
        ...accountSavingsGoals
          .filter(g => g.accountId === accountId)
          .map(g => remove('savingsGoals', g.id)),
      ]);

      // Delete the account itself
      await remove('accounts', accountId);
      
      // Update state
      setAccounts(accounts.filter(a => a.id !== accountId));
      
      // If the deleted account was the current one, switch to another account
      if (currentAccount?.id === accountId) {
        const remainingAccounts = accounts.filter(a => a.id !== accountId);
        if (remainingAccounts.length > 0) {
          setCurrentAccount(remainingAccounts[0]);
        }
      }

      toast({
        title: 'Success',
        description: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  const updateAccount = async (account: Account) => {
    try {
      await update('accounts', account);
      setAccounts(accounts.map(a => (a.id === account.id ? account : a)));
      if (currentAccount?.id === account.id) {
        setCurrentAccount(account);
      }
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      console.error('Failed to update account:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  // Transaction functions
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'accountId'>) => {
    if (!currentAccount) return;

    const transaction: Transaction = {
      id: generateUUID(),
      ...transactionData,
      accountId: currentAccount.id,
    };

    try {
      await add('transactions', transaction);
      setTransactions([...transactions, transaction]);
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      await update('transactions', transaction);
      setTransactions(transactions.map(t => (t.id === transaction.id ? transaction : t)));
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
        variant: 'destructive',
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await remove('transactions', id);
      setTransactions(transactions.filter(t => t.id !== id));
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    }
  };

  // Category functions
  const addCategory = async (categoryData: Omit<Category, 'id' | 'accountId' | 'isDefault'>) => {
    if (!currentAccount) return;

    const category: Category = {
      id: generateUUID(),
      ...categoryData,
      isDefault: false,
      accountId: currentAccount.id,
    };

    try {
      await add('categories', category);
      setCategories([...categories, category]);
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error) {
      console.error('Failed to add category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    // Check if it's a default category
    const category = categories.find(c => c.id === id);
    if (category?.isDefault) {
      toast({
        title: 'Error',
        description: 'Cannot delete default categories',
        variant: 'destructive',
      });
      return;
    }

    try {
      await remove('categories', id);
      setCategories(categories.filter(c => c.id !== id));
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  // Limit functions
  const addLimit = async (limitData: Omit<Limit, 'id' | 'accountId'>) => {
    if (!currentAccount) return;

    const limit: Limit = {
      id: generateUUID(),
      ...limitData,
      accountId: currentAccount.id,
    };

    try {
      await add('limits', limit);
      setLimits([...limits, limit]);
      toast({
        title: 'Success',
        description: 'Limit added successfully',
      });
    } catch (error) {
      console.error('Failed to add limit:', error);
      toast({
        title: 'Error',
        description: 'Failed to add limit',
        variant: 'destructive',
      });
    }
  };

  const updateLimit = async (limit: Limit) => {
    try {
      await update('limits', limit);
      setLimits(limits.map(l => (l.id === limit.id ? limit : l)));
      toast({
        title: 'Success',
        description: 'Limit updated successfully',
      });
    } catch (error) {
      console.error('Failed to update limit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update limit',
        variant: 'destructive',
      });
    }
  };

  const deleteLimit = async (id: string) => {
    try {
      await remove('limits', id);
      setLimits(limits.filter(l => l.id !== id));
      toast({
        title: 'Success',
        description: 'Limit deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete limit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete limit',
        variant: 'destructive',
      });
    }
  };

  // Template functions
  const addTemplate = async (templateData: Omit<Template, 'id' | 'accountId'>) => {
    if (!currentAccount) return;

    const template: Template = {
      id: generateUUID(),
      ...templateData,
      accountId: currentAccount.id,
    };

    try {
      await add('templates', template);
      setTemplates([...templates, template]);
      toast({
        title: 'Success',
        description: 'Template added successfully',
      });
    } catch (error) {
      console.error('Failed to add template:', error);
      toast({
        title: 'Error',
        description: 'Failed to add template',
        variant: 'destructive',
      });
    }
  };

  const updateTemplate = async (template: Template) => {
    try {
      await update('templates', template);
      setTemplates(templates.map(t => (t.id === template.id ? template : t)));
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
    } catch (error) {
      console.error('Failed to update template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update template',
        variant: 'destructive',
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await remove('templates', id);
      setTemplates(templates.filter(t => t.id !== id));
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const applyTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast({
        title: 'Error',
        description: 'Template not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addTransaction({
        type: template.type,
        amount: template.amount,
        category: template.categoryId,
        date: new Date().toISOString().split('T')[0],
        title: template.name,
      });
      toast({
        title: 'Success',
        description: 'Template applied successfully',
      });
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive',
      });
    }
  };

  // Recurring Item functions
  const addRecurringItem = async (itemData: Omit<RecurringItem, 'id' | 'accountId'>) => {
    if (!currentAccount) return;

    const recurringItem: RecurringItem = {
      id: generateUUID(),
      ...itemData,
      accountId: currentAccount.id,
    };

    try {
      await add('recurringItems', recurringItem);
      setRecurringItems([...recurringItems, recurringItem]);
      toast({
        title: 'Success',
        description: 'Recurring item added successfully',
      });
    } catch (error) {
      console.error('Failed to add recurring item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add recurring item',
        variant: 'destructive',
      });
    }
  };

  const updateRecurringItem = async (item: RecurringItem) => {
    try {
      await update('recurringItems', item);
      setRecurringItems(recurringItems.map(r => (r.id === item.id ? item : r)));
      toast({
        title: 'Success',
        description: 'Recurring item updated successfully',
      });
    } catch (error) {
      console.error('Failed to update recurring item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recurring item',
        variant: 'destructive',
      });
    }
  };

  const deleteRecurringItem = async (id: string) => {
    try {
      await remove('recurringItems', id);
      setRecurringItems(recurringItems.filter(r => r.id !== id));
      toast({
        title: 'Success',
        description: 'Recurring item deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete recurring item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recurring item',
        variant: 'destructive',
      });
    }
  };

  // Savings Goal functions
  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'accountId'>) => {
    if (!currentAccount) return;

    const savingsGoal: SavingsGoal = {
      id: generateUUID(),
      ...goalData,
      accountId: currentAccount.id,
    };

    try {
      await add('savingsGoals', savingsGoal);
      setSavingsGoals([...savingsGoals, savingsGoal]);
      toast({
        title: 'Success',
        description: 'Savings goal added successfully',
      });
    } catch (error) {
      console.error('Failed to add savings goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to add savings goal',
        variant: 'destructive',
      });
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    try {
      await update('savingsGoals', goal);
      setSavingsGoals(savingsGoals.map(g => (g.id === goal.id ? goal : g)));
      toast({
        title: 'Success',
        description: 'Savings goal updated successfully',
      });
    } catch (error) {
      console.error('Failed to update savings goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update savings goal',
        variant: 'destructive',
      });
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      await remove('savingsGoals', id);
      setSavingsGoals(savingsGoals.filter(g => g.id !== id));
      toast({
        title: 'Success',
        description: 'Savings goal deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete savings goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete savings goal',
        variant: 'destructive',
      });
    }
  };

  // App reset function
  const resetApp = async () => {
    try {
      await import('@/services/dbService').then(({ resetDatabase }) => {
        return resetDatabase();
      });
      
      // Clear all state
      setCurrentAccount(null);
      setAccounts([]);
      setTransactions([]);
      setCategories([]);
      setLimits([]);
      setTemplates([]);
      setRecurringItems([]);
      setSavingsGoals([]);
      
      // Reload accounts to get the default account
      await loadAccounts();
      
      toast({
        title: 'Success',
        description: 'App reset successfully',
      });
    } catch (error) {
      console.error('Failed to reset app:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset app',
        variant: 'destructive',
      });
    }
  };

  const exportAccountData = () => {
    if (!currentAccount) {
      toast({
        title: 'Error',
        description: 'No account selected',
        variant: 'destructive',
      });
      return;
    }

    const data: ExportData = {
      transactions,
      categories,
      limits,
      templates,
      recurringItems,
      savingsGoals,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      exportData(data);
      toast({
        title: 'Success',
        description: 'Data exported successfully',
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const importAccountData = async (file: File) => {
    if (!currentAccount) {
      toast({
        title: 'Error',
        description: 'No account selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = await importData(file);

      // Import categories first since transactions depend on them
      for (const category of data.categories) {
        await addCategory({
          name: category.name,
          type: category.type,
          color: category.color,
        });
      }

      // Import transactions
      for (const transaction of data.transactions) {
        await addTransaction({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          title: transaction.title,
        });
      }

      // Import limits
      for (const limit of data.limits) {
        await addLimit({
          categoryId: limit.categoryId,
          amount: limit.amount,
          period: limit.period,
        });
      }

      // Import templates
      for (const template of data.templates) {
        await addTemplate({
          name: template.name,
          items: template.items,
        });
      }

      // Import recurring items
      for (const item of data.recurringItems) {
        await addRecurringItem({
          name: item.name,
          amount: item.amount,
          type: item.type,
          categoryId: item.categoryId,
          frequency: item.frequency,
          startDate: item.startDate,
        });
      }

      // Import savings goals
      for (const goal of data.savingsGoals) {
        await addSavingsGoal({
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          targetDate: goal.targetDate,
        });
      }

      // Reload account data
      await loadAccountData(currentAccount.id);

      toast({
        title: 'Success',
        description: 'Data imported successfully',
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      toast({
        title: 'Error',
        description: 'Failed to import data',
        variant: 'destructive',
      });
    }
  };

  const value = {
    currentAccount,
    accounts,
    switchAccount,
    addAccount,
    deleteAccount,
    updateAccount,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    addCategory,
    deleteCategory,
    limits,
    addLimit,
    updateLimit,
    deleteLimit,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    recurringItems,
    addRecurringItem,
    updateRecurringItem,
    deleteRecurringItem,
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    resetApp,
    isLoading,
    exportAccountData,
    importAccountData,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
