import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playTapSound } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    playTapSound();
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuide(true);
      }
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="ফোনে অ্যাপ হিসেবে ইনস্টল করুন"
        className="tile-3d inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-700 font-bangla text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">ইনস্টল অ্যাপ</span>
        <span className="sm:hidden">Install</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Install Rihan Book App"
        >
          <div className="bg-white border-2 border-emerald-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bangla text-xl font-bold text-slate-900">
                  মোবাইলে অ্যাপ হিসেবে ইনস্টল করুন
                </h3>
                <p className="font-cartoon text-xs text-slate-500">
                  Install Rihan Book on Home Screen
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 font-bangla text-sm text-slate-800 space-y-2">
                <p className="font-bold text-amber-900">iPhone / iPad (Safari):</p>
                <p>১. নিচের <strong>Share (⬆️)</strong> আইকনে ট্যাপ করুন।</p>
                <p>২. নিচে স্ক্রল করে <strong>Add to Home Screen</strong> সিলেক্ট করুন।</p>
                <p>৩. উপরে <strong>Add</strong> চাপুন — রিহানের ছবি সহ অ্যাপ সেভ হয়ে যাবে!</p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 font-bangla text-sm text-slate-800 space-y-2">
                <p className="font-bold text-emerald-900">Android (Chrome ব্রাউজার):</p>
                <p>
                  ১. GitHub Pages লিংক বা অ্যাপ লিংকটি সরাসরি ফোনের <strong>Chrome</strong> ব্রাউজারে খুলুন।
                </p>
                <p>
                  ২. উপরের ডানদিকের <strong>⋮ (Three Dots)</strong> মেনুতে ট্যাপ করুন।
                </p>
                <p>
                  ৩. <strong>&quot;Add to Home screen&quot;</strong> বা <strong>&quot;Install app&quot;</strong>-এ ট্যাপ করুন — সাথে সাথে মোবাইলে APK-এর মতো ফুলস্ক্রিন অ্যাপ ইনস্টল হয়ে যাবে এবং অফলাইনেও চলবে!
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="tile-3d w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bangla font-bold cursor-pointer"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-2xl bg-amber-500 px-3.5 py-2 font-bangla text-xs font-bold text-white shadow-lg">
      <WifiOff className="w-3.5 h-3.5" />
      <span>অফলাইন মোড — সেভ করা অডিও ও পড়া চালু আছে</span>
    </div>
  );
};
