
import { useState } from 'react';
import Layout from '@/components/Layout';
import { useBudget } from '@/contexts/BudgetContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { resetApp, addAccount } = useBudget();
  
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
        title: 'Fehler',
        description: 'Bitte geben Sie einen Namen für das Konto ein.',
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
      title: 'Feedback gesendet',
      description: 'Vielen Dank für Ihr Feedback!',
    });
  };
  
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
        
        {/* Account Management */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Konten</h2>
          <Button onClick={() => setNewAccountOpen(true)}>Neues Konto</Button>
        </div>
        
        {/* App Settings */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">App-Einstellungen</h2>
          
          {/* Offline Mode */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="offline-mode" className="text-base">Offline Modus</Label>
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
              App zurücksetzen
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Diese Aktion löscht alle Ihre Daten und setzt die App zurück. Dies kann nicht rückgängig gemacht werden.
            </p>
          </div>
        </div>
        
        {/* Feedback Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Feedback</h2>
          <div className="space-y-4">
            <p className="text-sm">
              Wir freuen uns über Ihr Feedback! Helfen Sie uns, die App zu verbessern.
            </p>
            <textarea 
              className="w-full border rounded-md p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-budget-blue"
              placeholder="Ihr Feedback..."
            />
            <Button onClick={handleFeedbackSubmit}>Feedback senden</Button>
          </div>
        </div>
        
        {/* About Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Über uns</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">My Budget - Expenses under control</span> wird von Deutschland im Plus entwickelt.
            </p>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <a href="#">Impressum</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#">Datenschutz</a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Reset Confirmation Dialog */}
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>App zurücksetzen</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion löscht alle Ihre Daten und setzt die App auf die Werkseinstellungen zurück. 
                Dies kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetConfirm}
                className="bg-budget-red hover:bg-budget-red/90"
              >
                Zurücksetzen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* New Account Dialog */}
        <Dialog open={newAccountOpen} onOpenChange={setNewAccountOpen}>
          <DialogContent>
            <h3 className="text-lg font-medium mb-4">Neues Konto</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium mb-1">
                  Kontoname
                </label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="z.B. Privatkonto, Gemeinschaftskonto, etc."
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewAccountOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddAccount}
                >
                  Erstellen
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
