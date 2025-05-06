import { useState } from 'react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Settings = () => {
  const { resetApp, addAccount } = useBudget();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  
  const handleResetConfirm = async () => {
    try {
      await resetApp();
      setResetDialogOpen(false);
    } catch (error) {
      console.error('Failed to reset app:', error);
    }
  };
  
  const handleAddAccount = async () => {
    if (!accountName.trim()) {
      toast({
        title: t('error'),
        description: t('please_enter'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await addAccount(accountName);
      setAccountName('');
      setNewAccountOpen(false);
    } catch (error) {
      console.error('Failed to add account:', error);
    }
  };
  
  const handleFeedbackSubmit = () => {
    toast({
      title: t('feedback_sent'),
      description: t('feedback_sent'),
    });
  };
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
        
        {/* Account Management */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">{t('accounts')}</h2>
          <Button onClick={() => setNewAccountOpen(true)}>{t('new_account')}</Button>
        </div>
        
        {/* App Settings */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">{t('app_settings')}</h2>
          
          {/* Language Selector */}
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              <Label className="text-base">{t('language')}</Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {language === 'de' ? t('german') : t('english')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => i18n.changeLanguage('de')}>
                  {t('german')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                  {t('english')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Offline Mode */}
          <div className="flex items-center justify-between py-2 border-b">
            <Label htmlFor="offline-mode" className="text-base">{t('offline_mode')}</Label>
            <Switch 
              id="offline-mode" 
              checked={offlineMode} 
              onCheckedChange={setOfflineMode} 
            />
          </div>
          
          {/* App Reset */}
          <div className="py-4">
            <Button 
              variant="destructive" 
              onClick={() => setResetDialogOpen(true)}
            >
              {t('reset_app')}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {t('reset_warning')}
            </p>
          </div>
        </div>
        
        {/* Feedback Section */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">{t('feedback')}</h2>
          <div className="space-y-4">
            <p className="text-sm">
              {t('feedback_desc')}
            </p>
            <textarea 
              className="w-full border rounded-md p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-budget-blue"
              placeholder={t('your_feedback')}
            />
            <Button onClick={handleFeedbackSubmit}>{t('send_feedback')}</Button>
          </div>
        </div>
        
        {/* About Section */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">{t('about')}</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">{t('app_by')}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {t('version')}
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <a href="#">{t('imprint')}</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#">{t('privacy')}</a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Reset Confirmation Dialog */}
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('reset_app')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('reset_warning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetConfirm}
                className="bg-budget-red hover:bg-budget-red/90"
              >
                {t('reset')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* New Account Dialog */}
        <Dialog open={newAccountOpen} onOpenChange={setNewAccountOpen}>
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <h3 className="text-lg font-medium mb-4">{t('new_account')}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium mb-1">
                  {t('account_name')}
                </label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={t('account_placeholder')}
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewAccountOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddAccount}
                >
                  {t('create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Settings;
