import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { TransactionType } from '@/services/dbService';
import { X, Plus, Tag } from 'lucide-react';

const getCategoryLabel = (t, name) => {
  // Try translation key first
  const key = `category_${name.toLowerCase()}`;
  const translated = t(key);
  // If translation exists, use it; otherwise, use the name as-is
  return translated !== key ? translated : name;
};

const Categories = () => {
  const { type } = useParams<{ type: string }>();
  const { categories, addCategory, deleteCategory } = useBudget();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  
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
        <div className="flex items-center mb-6">
          <Tag className="h-6 w-6 mr-2 text-budget-blue" />
          <h1 className="text-2xl font-bold">
            {categoryType === 'income' ? t('income_categories') : t('expense_categories')}
          </h1>
        </div>
        
        {/* Categories List */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md mb-6 overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">{t('no_categories')}</p>
              <Button 
                onClick={() => setNewDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('add_category')}
              </Button>
            </div>
          ) : (
            <>
              <div className="p-4 border-b bg-gradient-to-r from-budget-blue/10 to-transparent">
                <h3 className="font-medium">{t('all_categories')}</h3>
              </div>
              
              <ul className="divide-y">
                {filteredCategories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${categoryType === 'income' ? 'bg-budget-green' : 'bg-budget-red'}`}></div>
                      <span>{getCategoryLabel(t, category.name)}</span>
                    </div>
                    {!category.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteId(category.id)}
                        className="text-gray-500 hover:text-budget-red hover:bg-budget-red/10"
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
            className="rounded-full h-12 w-12 bg-budget-blue hover:bg-budget-blue/90 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Add Category Dialog */}
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogTitle>Edit Category</DialogTitle>
            <h3 className="text-lg font-medium mb-4">
              {categoryType === 'income' ? t('new_income') : t('new_expense')} {t('category')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  {t('category')}
                </label>
                <Input
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder={t('category')}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddCategory}
                >
                  {t('add_category')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete')} {t('category')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_confirmation')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>{t('delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Categories;
