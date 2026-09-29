import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export const InstallPWABanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Check if user dismissed prompt recently
    const dismissed = localStorage.getItem('mandal_pwa_prompt_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 86400000) {
      // Don't show again for 24 hours if explicitly dismissed
      return;
    }

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (iosDevice) {
      setIsIOS(true);
      setShowPrompt(true);
      return;
    }

    // Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed the PWA');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('mandal_pwa_prompt_dismissed', String(Date.now()));
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 md:bottom-5 left-4 right-4 max-w-md mx-auto z-50 animate-slideUp">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-500 overflow-hidden">
        {/* Header gradient banner */}
        <div className="festive-gradient p-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md shrink-0 overflow-hidden border border-amber-200">
              <img src="/logo.png" alt="Mandal Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm tracking-tight leading-tight truncate">
                Install Ganesh Mandal App
              </h3>
              <p className="text-[11px] text-amber-100 font-medium truncate">
                Add to your home screen for 1-tap access!
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors shrink-0"
            title="Close prompt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt content & action */}
        <div className="p-3.5 bg-amber-50/90 flex items-center justify-between gap-3">
          {isIOS ? (
            <div className="text-xs text-stone-700 font-medium space-y-1">
              <p className="flex items-center gap-1 font-bold text-stone-900">
                <Share className="w-4 h-4 text-amber-600" />
                To install on iPhone / iPad:
              </p>
              <p className="text-[11px] text-stone-600">
                Tap the <span className="font-bold text-amber-800">Share ⎋</span> icon in Safari menu and select <span className="font-bold text-amber-800">'Add to Home Screen' ➕</span>.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-stone-600 font-medium">
                Get quick offline access to payments & expenses on your phone.
              </p>
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-600/30 transition-all shrink-0 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Install</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
