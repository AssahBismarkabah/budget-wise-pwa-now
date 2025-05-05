
import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X,
  Home,
  BarChart,
  Target,
  PieChart,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/contexts/BudgetContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentAccount, accounts, switchAccount, isLoading } = useBudget();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Lädt...</h2>
          <p className="text-muted-foreground">My Budget wird geladen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-budget-blue text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(true)}
          className="text-white hover:bg-budget-blue/80"
        >
          <Menu />
        </Button>
        <h1 className="text-lg font-medium">My Budget</h1>
        <div className="w-8"></div>
      </header>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-20 bg-black/50 transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      <div 
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-64 bg-white shadow-xl transform transition-transform overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="font-medium">Menu</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Account Section */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Konto</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-start gap-2">
                <Avatar className="h-8 w-8 bg-budget-blue text-white">
                  <AvatarFallback>{currentAccount?.initials || 'MK'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{currentAccount?.name || 'Mein Konto'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0">
              <div className="p-4">
                <h3 className="font-medium mb-4">Konten</h3>
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
                      <Avatar className="h-6 w-6 bg-budget-blue text-white">
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
        <div className="p-4 space-y-2 border-b">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors",
              location.pathname === '/' && "bg-gray-100 font-medium"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Übersicht</span>
          </Link>
          
          <Link 
            to="/limits" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors",
              location.pathname === '/limits' && "bg-gray-100 font-medium"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart className="h-5 w-5" />
            <span>Limits</span>
          </Link>
          
          <Link 
            to="/savings-goals" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors",
              location.pathname === '/savings-goals' && "bg-gray-100 font-medium"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Target className="h-5 w-5" />
            <span>Sparziele</span>
          </Link>
          
          <Link 
            to="/statistics" 
            className={cn(
              "flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors",
              location.pathname === '/statistics' && "bg-gray-100 font-medium"
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <PieChart className="h-5 w-5" />
            <span>Statistik</span>
          </Link>
        </div>

        {/* Categories */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Kategorien</h3>
          <div className="space-y-2">
            <Link 
              to="/categories/income" 
              className={cn(
                "block p-2 rounded-md hover:bg-gray-100 transition-colors",
                location.pathname === '/categories/income' && "bg-gray-100 font-medium"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              Einnahmen Kategorien
            </Link>
            <Link 
              to="/categories/expense" 
              className={cn(
                "block p-2 rounded-md hover:bg-gray-100 transition-colors",
                location.pathname === '/categories/expense' && "bg-gray-100 font-medium"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              Ausgaben Kategorien
            </Link>
          </div>
        </div>

        {/* Tools */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Tools</h3>
          <div className="space-y-2">
            <Link 
              to="/templates" 
              className={cn(
                "block p-2 rounded-md hover:bg-gray-100 transition-colors",
                location.pathname === '/templates' && "bg-gray-100 font-medium"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              Vorlagen
            </Link>
            <Link 
              to="/recurring" 
              className={cn(
                "block p-2 rounded-md hover:bg-gray-100 transition-colors",
                location.pathname === '/recurring' && "bg-gray-100 font-medium"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              Wiederkehrende Posten
            </Link>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Einstellungen</h3>
          <div className="space-y-2">
            <Link 
              to="/settings" 
              className={cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors",
                location.pathname === '/settings' && "bg-gray-100 font-medium"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>Einstellungen</span>
            </Link>
            <Separator className="my-2" />
            <div className="text-xs text-center text-muted-foreground pt-2">
              <p>© 2025 Deutschland im Plus</p>
              <p className="mt-1">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around py-2 z-10">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center p-2",
            location.pathname === '/' ? "text-budget-blue" : "text-gray-500"
          )}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Übersicht</span>
        </Link>
        
        <Link 
          to="/limits" 
          className={cn(
            "flex flex-col items-center p-2",
            location.pathname === '/limits' ? "text-budget-blue" : "text-gray-500"
          )}
        >
          <BarChart className="h-6 w-6" />
          <span className="text-xs mt-1">Limits</span>
        </Link>
        
        <Link 
          to="/savings-goals" 
          className={cn(
            "flex flex-col items-center p-2",
            location.pathname === '/savings-goals' ? "text-budget-blue" : "text-gray-500"
          )}
        >
          <Target className="h-6 w-6" />
          <span className="text-xs mt-1">Sparziele</span>
        </Link>
        
        <Link 
          to="/statistics" 
          className={cn(
            "flex flex-col items-center p-2",
            location.pathname === '/statistics' ? "text-budget-blue" : "text-gray-500"
          )}
        >
          <PieChart className="h-6 w-6" />
          <span className="text-xs mt-1">Statistik</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
