
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBudget } from '@/contexts/BudgetContext';
import { Transaction, TransactionType } from '@/services/dbService';

interface TransactionFormProps {
  type: TransactionType;
  onSave: () => void;
  onCancel: () => void;
  editTransaction?: Transaction;
}

const TransactionForm = ({ type, onSave, onCancel, editTransaction }: TransactionFormProps) => {
  const { categories, addTransaction, updateTransaction } = useBudget();
  
  const [amount, setAmount] = useState(editTransaction?.amount.toString() || '');
  const [categoryId, setCategoryId] = useState(editTransaction?.category || '');
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState(editTransaction?.title || '');
  
  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === type);
  
  useEffect(() => {
    // Set default category if none selected and categories are available
    if (!categoryId && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [categoryId, filteredCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Bitte geben Sie einen gültigen Betrag ein.');
      return;
    }
    
    if (!categoryId) {
      alert('Bitte wählen Sie eine Kategorie.');
      return;
    }
    
    if (editTransaction) {
      updateTransaction({
        ...editTransaction,
        amount: Number(amount),
        category: categoryId,
        date,
        title,
      });
    } else {
      addTransaction({
        type,
        amount: Number(amount),
        category: categoryId,
        date,
        title,
      });
    }
    
    onSave();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          required
        />
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
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Datum
        </label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Beschreibung
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Beschreibung (optional)"
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button 
          type="submit"
          className={type === 'income' ? 'bg-budget-green hover:bg-budget-green/90' : 'bg-budget-red hover:bg-budget-red/90'}
        >
          {editTransaction ? 'Aktualisieren' : 'Speichern'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
