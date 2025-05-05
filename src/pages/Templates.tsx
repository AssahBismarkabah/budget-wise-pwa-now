
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
import { formatCurrency } from '@/lib/formatters';
import { Plus, X, Edit, ArrowRight } from 'lucide-react';

const Templates = () => {
  const { templates, categories, addTemplate, updateTemplate, deleteTemplate, applyTemplate } = useBudget();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  
  const handleOpenDialog = (template?: typeof templates[0]) => {
    if (template) {
      setName(template.name);
      setAmount(template.amount.toString());
      setCategoryId(template.categoryId);
      setType(template.type);
      setEditId(template.id);
    } else {
      setName('');
      setAmount('');
      setCategoryId('');
      setType('expense');
      setEditId(null);
    }
    
    setDialogOpen(true);
  };
  
  const handleSave = () => {
    if (!name || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || !categoryId) {
      alert('Bitte füllen Sie alle Felder korrekt aus.');
      return;
    }
    
    if (editId) {
      const template = templates.find(t => t.id === editId);
      if (template) {
        updateTemplate({
          ...template,
          name,
          amount: Number(amount),
          categoryId,
          type,
        });
      }
    } else {
      addTemplate({
        name,
        amount: Number(amount),
        categoryId,
        type,
      });
    }
    
    setDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteTemplate(deleteId);
      setDeleteId(null);
    }
  };
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Vorlagen</h1>
        
        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-muted-foreground">Noch keine Vorlagen vorhanden</p>
            <Button 
              onClick={() => handleOpenDialog()}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Vorlage erstellen
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-4 border-b">
              <h3 className="font-medium">Alle Vorlagen</h3>
            </div>
            
            <div className="divide-y">
              {templates.map((template) => {
                const category = categories.find(c => c.id === template.categoryId);
                
                return (
                  <div key={template.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => applyTemplate(template.id)}
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span>Anwenden</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(template)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteId(template.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category?.name || 'Unknown Category'}
                    </div>
                    <div className={`mt-2 font-medium ${template.type === 'income' ? 'text-budget-green' : 'text-budget-red'}`}>
                      {template.type === 'income' ? '+' : '-'} {formatCurrency(template.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Add Template Button */}
        <div className="fixed right-6 bottom-20">
          <Button 
            onClick={() => handleOpenDialog()}
            className="rounded-full h-12 w-12 bg-budget-blue hover:bg-budget-blue/90 shadow-md"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Template Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <h3 className="text-lg font-medium mb-4">
              {editId ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
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
              <AlertDialogTitle>Vorlage löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie diese Vorlage löschen möchten?
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

export default Templates;
