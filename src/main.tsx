import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unexpected error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-6 text-center">
          <div className="max-w-md bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-md space-y-4">
            <h2 className="font-bangla text-2xl font-bold text-slate-900">
              কিছু একটা সমস্যা হয়েছে
            </h2>
            <p className="font-bangla text-sm text-slate-600">
              দয়া করে পেজটি রিফ্রেশ করুন।
            </p>
            <p className="text-xs text-slate-400 break-words">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-bangla font-bold cursor-pointer"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
