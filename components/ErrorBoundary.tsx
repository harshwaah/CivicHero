'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in [${this.props.sectionName || 'CivicHero Section'}]:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const sectionTitle = this.props.sectionName || 'This section';

      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="w-full bg-white rounded-[24px] border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col items-center text-center my-4 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-4 shrink-0">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>

          <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            Section Notice
          </span>

          <h3 className="font-sans font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">
            {sectionTitle} is temporarily unavailable
          </h3>

          <p className="font-body text-xs sm:text-sm text-slate-600 max-w-md mt-2 leading-relaxed">
            A temporary display issue occurred while loading this civic component. Other sections and public services remain active and unaffected.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-brand-primary text-white font-sans font-bold text-xs rounded-xl shadow-sm hover:bg-brand-primary-container transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:outline-none"
              aria-label={`Retry loading ${sectionTitle}`}
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry Section</span>
            </button>

            <button
              onClick={this.handleReload}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold text-xs rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
              aria-label="Refresh entire application page"
            >
              <span>Refresh Page</span>
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="w-full mt-6 text-left border-t border-slate-150 pt-4 font-mono text-[11px] text-slate-500">
              <summary className="cursor-pointer text-slate-600 hover:text-slate-800 font-bold select-none">
                Technical diagnostic information
              </summary>
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto text-red-600">
                {this.state.error.toString()}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
