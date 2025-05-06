import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border shadow-lg rounded-lg p-4 flex items-center gap-4 animate-fade-in">
      <span className="text-base font-medium">Install this app for a better experience!</span>
      <Button onClick={handleInstallClick} className="bg-budget-blue text-white">Install</Button>
      <Button variant="ghost" onClick={() => setShowPrompt(false)}>Dismiss</Button>
    </div>
  );
};

export default PWAInstallPrompt; 