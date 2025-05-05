import { useState } from 'react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
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
import { TransactionType } from '@/services/dbService';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Plus, X, Edit, Calendar } from 'lucide-react';

const RecurringItems = () => {
  const { recurringItems, categories, addRecurringItem, updateRecurringItem, deleteRecurringItem } = useBudget();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const handleOpenDialog = (item?: typeof recurringItems[0]) => {
    if (item) {
      setName(item.name);
      setAmount(item.amount.toString());
      setCategoryId(item.categoryId);
      setType(item.type);
      setFrequency(item.frequency);
      setStartDate(item.startDate);
      setEditId(item.id);
    } else {
      setName('');
      setAmount('');
      setCategoryId('');
      setType('expense');
      setFrequency('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEditId(null);
    }
    
    setDialogOpen(true);
  };
  
  const handleSave = () => {
    if (!name || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || !categoryId || !startDate) {
      alert('Bitte füllen Sie alle Felder korrekt aus.');
      return;
    }
    
    if (editId) {
      const item = recurringItems.find(i => i.id === editId);
      if (item) {
        updateRecurringItem({
          ...item,
          name,
          amount: Number(amount),
          categoryId,
          type,
          frequency,
          startDate,
        });
      }
    } else {
      addRecurringItem({
        name,
        amount: Number(amount),
        categoryId,
        type,
        frequency,
        startDate,
      });
    }
    
    setDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteRecurringItem(deleteId);
      setDeleteId(null);
    }
  };
  
  const getNextDueDate = (item: typeof recurringItems[0]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(item.startDate);
    start.setHours(0, 0, 0, 0);
    
    let nextDate = new Date(start);
    
    if (item.frequency === 'daily') {
      // If today is before or same as start date, next date is start date
      if (today <= start) return item.startDate;
      
      // Otherwise, next date is tomorrow
      nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (item.frequency === 'weekly') {
      // If today is before or same as start date, next date is start date
      if (today <= start) return item.startDate;
      
      // Otherwise, find the next occurrence of the same day of week
      const dayDiff = (7 + start.getDay() - today.getDay()) % 7;
      nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + (dayDiff === 0 ? 7 : dayDiff));
    } else if (item.frequency === 'monthly') {
      // Get the day of month from start date
      const dayOfMonth = start.getDate();
      
      // Start with current month/year
      nextDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
      
      // If this date is in the past, move to next month
      if (nextDate < today) {
        nextDate = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
      }
    }
    
    return nextDate.toISOString().split('T')[0];
  };
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Wiederkehrende Posten</h1>
        
        {recurringItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-muted-foreground">Noch keine wiederkehrenden Posten vorhanden</p>
            <Button 
              onClick={() => handleOpenDialog()}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Wiederkehrenden Posten erstellen
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-4 border-b">
              <h3 className="font-medium">Alle wiederkehrenden Posten</h3>
            </div>
            
            <div className="divide-y">
              {recurringItems.map((item) => {
                const category = categories.find(c => c.id === item.categoryId);
                const nextDueDate = getNextDueDate(item);
                
                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Nächste Fälligkeit: {formatDate(nextDueDate)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category?.name || 'Unknown Category'} • 
                      {item.frequency === 'daily' ? ' Täglich' : 
                       item.frequency === 'weekly' ? ' Wöchentlich' : ' Monatlich'}
                    </div>
                    <div className={`mt-2 font-medium ${item.type === 'income' ? 'text-budget-green' : 'text-budget-red'}`}>
                      {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Add Button */}
        <div className="fixed right-6 bottom-20">
          <Button 
            onClick={() => handleOpenDialog()}
            className="rounded-full h-12 w-12 bg-budget-blue hover:bg-budget-blue/90 shadow-md"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <h3 className="text-lg font-medium mb-4">
              {editId ? 'Wiederkehrenden Posten bearbeiten' : 'Neuer wiederkehrender Posten'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Miete, Gehalt, etc."
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  Typ
                </label>
                <Select value={type} onValueChange={(value: TransactionType) => {
                  setType(value);
                  // Reset category when changing type
                  setCategoryId('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Einnahme</SelectItem>
                    <SelectItem value="expense">Ausgabe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Kategorie
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(category => category.type === type)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Betrag (€)
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg"
                />
              </div>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium mb-1">
                  Häufigkeit
                </label>
                <Select value={frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Häufigkeit auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                  Startdatum
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  type="button"
                  onClick={handleSave}
                >
                  {editId ? 'Aktualisieren' : 'Speichern'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Wiederkehrenden Posten löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie diesen wiederkehrenden Posten löschen möchten?
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

export default RecurringItems;
