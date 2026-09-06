import React from 'react';
import { ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate }) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-8">
          <button
            id="brand-home-btn"
            onClick={() => onNavigate('home')}
            className="group flex items-center space-x-3 text-left transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006BFF] text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                  ForgeMind
                </span>
                <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase sm:inline-block border border-slate-200">
                  De-Tutorializer
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 md:block">
                Prove you can use it
              </p>
            </div>
          </button>

          {/* Simple Navigation Links */}
          <nav className="flex items-center space-x-1 pl-6 border-l border-slate-200">
            <button
              id="nav-prove-btn"
              onClick={() => onNavigate('prove')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                currentTab === 'prove' || currentTab === 'challenge' || currentTab === 'concept-preview'
                  ? 'bg-blue-50 text-[#006BFF] ring-1 ring-[#006BFF]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Prove
            </button>
            <button
              id="nav-evidence-btn"
              onClick={() => onNavigate('evidence')}
              className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                currentTab === 'evidence'
                  ? 'bg-blue-50 text-[#006BFF] ring-1 ring-[#006BFF]/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4 opacity-80" />
              <span>My Evidence</span>
            </button>
          </nav>
        </div>

        {/* Secondary Action: Add Study Material & Quick Links */}
        <div className="flex items-center space-x-3">
          <button
            id="header-add-material-btn"
            onClick={() => onNavigate('material')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm active:scale-[0.98] ${
              currentTab === 'material'
                ? 'bg-[#006BFF] text-white shadow-blue-500/20'
                : 'bg-[#0F172A] text-white hover:bg-slate-800'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Add Study Material</span>
          </button>
        </div>
      </div>
    </header>
  );
};
