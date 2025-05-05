
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { TransactionType } from '@/services/dbService';
import { X, Plus } from 'lucide-react';

const Categories = () => {
  const { type } = useParams<{ type: string }>();
  const { categories, addCategory, deleteCategory } = useBudget();
  
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  
  // Ensure valid type
  const categoryType: TransactionType = type === 'income' ? 'income' : 'expense';
  
  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === categoryType);
  
  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    
    addCategory({
      name: categoryName,
      type: categoryType,
    });
    
    setCategoryName('');
    setNewDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      setDeleteId(null);
    }
  };
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {categoryType === 'income' ? 'Einnahmen' : 'Ausgaben'} Kategorien
        </h1>
        
        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Keine Kategorien vorhanden</p>
              <Button 
                onClick={() => setNewDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Kategorie hinzufügen
              </Button>
            </div>
          ) : (
            <>
              <div className="p-4 border-b">
                <h3 className="font-medium">Alle Kategorien</h3>
              </div>
              
              <ul className="divide-y">
                {filteredCategories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between p-4">
                    <span>{category.name}</span>
                    {!category.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteId(category.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        
        {/* Add Category Button */}
        <div className="fixed right-6 bottom-20">
          <Button 
            onClick={() => {
              setCategoryName('');
              setNewDialogOpen(true);
            }}
            className="rounded-full h-12 w-12 bg-budget-blue hover:bg-budget-blue/90 shadow-md"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Add Category Dialog */}
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogContent>
            <h3 className="text-lg font-medium mb-4">
              Neue {categoryType === 'income' ? 'Einnahmen' : 'Ausgaben'}kategorie
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Kategoriename"
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddCategory}
                >
                  Hinzufügen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kategorie löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie diese Kategorie löschen möchten? 
                Transaktionen mit dieser Kategorie bleiben bestehen.
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

export default Categories;
