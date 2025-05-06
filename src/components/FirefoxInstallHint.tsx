import React, { useEffect, useState } from 'react';

const FirefoxInstallHint = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isFirefox = /firefox/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isFirefox && !isStandalone) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border shadow-lg rounded-lg p-4 flex items-center gap-4 animate-fade-in">
      <span className="text-base font-medium">
        To install this app in Firefox, use your browser menu: <b>Add to Home Screen</b> (mobile) or <b>Install</b> (desktop).
      </span>
      <button className="ml-2 text-muted-foreground" onClick={() => setShow(false)}>Dismiss</button>
    </div>
  );
};

export default FirefoxInstallHint; 