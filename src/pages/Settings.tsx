import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Trash2 } from 'lucide-react';
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
import { useAccount } from '@/contexts/AccountContext';
import Spinner from '@/components/ui/Spinner';
import { useFeedbackForm } from '@/services/feedbackService';

const Settings = () => {
  const { resetApp, addAccount, accounts, deleteAccount, exportAccountData, importAccountData } = useBudget();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { logout } = useAccount();
  
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const { submitFeedback, state, ValidationError } = useFeedbackForm();
  
  const handleResetConfirm = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1800)); // 1.8s delay
      await resetApp();
      setResetDialogOpen(false);
    } catch (error) {
      console.error('Failed to reset app:', error);
    }
    setLoading(false);
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

  const handleDeleteAccount = async () => {
    if (deleteAccountId) {
      try {
        await deleteAccount(deleteAccountId);
        setDeleteAccountId(null);
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };
  
  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) {
      toast({
        title: t('error'),
        description: t('please_enter_feedback'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitFeedback(feedbackMessage);
      setFeedbackMessage('');
      toast({
        title: t('feedback_sent'),
        description: t('feedback_sent_description'),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: t('error'),
        description: t('feedback_error'),
        variant: 'destructive',
      });
    }
  };
  
  const handleLogout = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1800)); // 1.8s delay
    logout();
    setLoading(false);
  };

  const handleExport = () => {
    exportAccountData();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importAccountData(file);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Layout>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Spinner size={48} />
        </div>
      )}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
        
        {/* Data Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('data_management')}</h2>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleExport}
                className="w-full"
              >
                {t('export_data')}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('export_data_description')}
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                ref={fileInputRef}
                className="hidden"
                id="import-file"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                {t('import_data')}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('import_data_description')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Account Management */}
        <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">{t('accounts')}</h2>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                <span>{account.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteAccountId(account.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={() => setNewAccountOpen(true)}>{t('new_account')}</Button>
          </div>
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
              className="w-full border rounded-md p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-budget-blue text-foreground bg-background"
              placeholder={t('your_feedback')}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              disabled={state.submitting}
              name="message"
              id="message"
            />
            <ValidationError 
              prefix="Message" 
              field="message"
              errors={state.errors}
              className="text-destructive text-sm"
            />
            <Button 
              onClick={handleFeedbackSubmit}
              disabled={state.submitting}
            >
              {state.submitting ? t('sending') : t('send_feedback')}
            </Button>
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
        
        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('delete_account')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('delete_account_warning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-destructive hover:bg-destructive/90"
              >
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Add this section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">{t('account')}</h2>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            {t('logout')}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
