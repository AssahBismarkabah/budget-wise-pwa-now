import { useState, ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X,
  Home,
  BarChart,
  Target,
  PieChart,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/contexts/BudgetContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import Logo from './Logo';
import { useTranslation } from 'react-i18next';
import FeedbackForm from './FeedbackForm';
import Spinner from './ui/Spinner';
import ProfileDialog from './ProfileDialog';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const { currentAccount, accounts, switchAccount, isLoading } = useBudget();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize dark mode from localStorage if available
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Toggle dark mode and save to localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={48} />
          <h2 className="text-xl font-medium text-muted-foreground">{t('loading') || 'Loading...'}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-card dark:bg-gray-800 text-primary-foreground dark:text-white border-b border-border dark:border-gray-700 sticky top-0 z-10 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(true)}
                className="text-primary hover:bg-accent dark:text-white dark:hover:bg-gray-700 mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Logo showText={true} size="small" />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-primary-foreground dark:text-white hover:bg-accent dark:hover:bg-gray-700"
                title={isDarkMode ? t('light_mode') : t('dark_mode')}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setProfileDialogOpen(true)}>
                <Avatar className="h-8 w-8 bg-primary">
                  {currentAccount?.profileImage ? (
                    <img src={currentAccount.profileImage} alt="Profile" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback>{currentAccount?.initials || 'MK'}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      <div 
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-64 bg-card dark:bg-gray-800 shadow-xl transform transition-transform overflow-y-auto animate-slide-in",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-border dark:border-gray-700 bg-background dark:bg-gray-900">
          <Logo showText={true} size="small" />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="dark:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Dark Mode Toggle in Sidebar */}
        <div className="p-4 border-b border-border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium dark:text-white">{isDarkMode ? t('dark_mode') : t('light_mode')}</span>
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode} 
              aria-label="Toggle dark mode"
            />
          </div>
        </div>
        
        {/* Account Section */}
        <div className="p-4 border-b border-border dark:border-gray-700">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('accounts')}</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2 hover:bg-accent dark:text-white dark:hover:bg-gray-700">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>{currentAccount?.initials || 'MK'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{currentAccount?.name || 'Mein Konto'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 dark:bg-gray-800">
              <DialogTitle>Menu</DialogTitle>
              <div className="p-4">
                <h3 className="font-medium mb-4 dark:text-white">{t('accounts')}</h3>
                <div className="space-y-2">
                  {accounts.map(account => (
                    <Button
                      key={account.id}
                      variant={account.id === currentAccount?.id ? "default" : "outline"}
                      className="w-full flex items-center justify-start gap-2"
                      onClick={() => {
                        switchAccount(account.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <Avatar className="h-6 w-6 bg-primary">
                        <AvatarFallback>{account.initials}</AvatarFallback>
                      </Avatar>
                      <span>{account.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Navigation */}
        <div className="p-4 space-y-2 border-b border-border dark:border-gray-700">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors",
              location.pathname === '/' && "bg-accent font-medium text-primary"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>{t('overview')}</span>
          </Link>
          
          <Link 
            to="/limits" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors",
              location.pathname === '/limits' && "bg-accent font-medium text-primary"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart className="h-5 w-5" />
            <span>{t('limits')}</span>
          </Link>
          
          <Link 
            to="/savings-goals" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors",
              location.pathname === '/savings-goals' && "bg-accent font-medium text-primary"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Target className="h-5 w-5" />
            <span>{t('savings_goals')}</span>
          </Link>
          
          <Link 
            to="/statistics" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors",
              location.pathname === '/statistics' && "bg-accent font-medium text-primary"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <PieChart className="h-5 w-5" />
            <span>{t('statistics')}</span>
          </Link>
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-border dark:border-gray-700">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('categories')}</h3>
          <div className="space-y-2">
            <Link 
              to="/categories/income" 
              className={cn(
                "block p-2 rounded-md hover:bg-accent transition-colors",
                location.pathname === '/categories/income' && "bg-accent font-medium text-primary"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {t('income_categories')}
            </Link>
            <Link 
              to="/categories/expense" 
              className={cn(
                "block p-2 rounded-md hover:bg-accent transition-colors",
                location.pathname === '/categories/expense' && "bg-accent font-medium text-primary"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {t('expense_categories')}
            </Link>
          </div>
        </div>

        {/* Tools */}
        <div className="p-4 border-b border-border dark:border-gray-700">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('tools')}</h3>
          <div className="space-y-2">
            <Link 
              to="/templates" 
              className={cn(
                "block p-2 rounded-md hover:bg-accent transition-colors",
                location.pathname === '/templates' && "bg-accent font-medium text-primary"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {t('templates')}
            </Link>
            <Link 
              to="/recurring" 
              className={cn(
                "block p-2 rounded-md hover:bg-accent transition-colors",
                location.pathname === '/recurring' && "bg-accent font-medium text-primary"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {t('recurring_items')}
            </Link>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('settings')}</h3>
          <div className="space-y-2">
            <Link 
              to="/settings" 
              className={cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors",
                location.pathname === '/settings' && "bg-accent font-medium text-primary"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>{t('settings')}</span>
            </Link>
            <Separator className="my-2" />
            <div className="text-xs text-center text-muted-foreground pt-2">
              <p>© 2025 Deutschland im Plus</p>
              <p className="mt-1">{t('version')}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <FeedbackForm />
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 animate-fade-in">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around py-2 z-10 transition-colors duration-300">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center p-2 transition-colors",
            location.pathname === '/' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">{t('overview')}</span>
        </Link>
        
        <Link 
          to="/limits" 
          className={cn(
            "flex flex-col items-center p-2 transition-colors",
            location.pathname === '/limits' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <BarChart className="h-6 w-6" />
          <span className="text-xs mt-1">{t('limits')}</span>
        </Link>
        
        <Link 
          to="/savings-goals" 
          className={cn(
            "flex flex-col items-center p-2 transition-colors",
            location.pathname === '/savings-goals' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Target className="h-6 w-6" />
          <span className="text-xs mt-1">{t('savings_goals')}</span>
        </Link>
        
        <Link 
          to="/statistics" 
          className={cn(
            "flex flex-col items-center p-2 transition-colors",
            location.pathname === '/statistics' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <PieChart className="h-6 w-6" />
          <span className="text-xs mt-1">{t('statistics')}</span>
        </Link>
      </nav>

      <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </div>
  );
};

export default Layout;
