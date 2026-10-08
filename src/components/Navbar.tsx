import React from 'react';
import { Mic, BookOpen, BarChart3, Sparkles, Compass } from 'lucide-react';

export type AppTab = 'studio' | 'practice' | 'drills' | 'history';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  savedSessionsCount: number;
  onQuickStart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  savedSessionsCount,
  onQuickStart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e5ded5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Editorial Monogram */}
          <div 
            onClick={() => onSelectTab('studio')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1c1917] flex items-center justify-center text-[#faf8f5] font-serif text-xl font-medium shadow-sm transition-transform group-hover:scale-105">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-tight text-[#1c1917] font-medium leading-none">
                SpeakEasy Lab
              </span>
              <span className="text-[10px] tracking-[0.16em] uppercase text-[#8c7e72] font-semibold mt-1">
                Voice & Presence Studio
              </span>
            </div>
          </div>

          {/* Navigation Links - Editorial Minimalist Style */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('studio')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-full ${
                currentTab === 'studio'
                  ? 'text-[#1c1917] bg-[#f3efe8] font-semibold'
                  : 'text-[#8c7e72] hover:text-[#1c1917] hover:bg-[#f3efe8]/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>The Studio</span>
            </button>

            <button
              onClick={() => onSelectTab('practice')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-full ${
                currentTab === 'practice'
                  ? 'text-[#1c1917] bg-[#f3efe8] font-semibold'
                  : 'text-[#8c7e72] hover:text-[#1c1917] hover:bg-[#f3efe8]/50'
              }`}
            >
              <Mic className="w-4 h-4 text-[#e06c5f]" />
              <span>Practice Booth</span>
            </button>

            <button
              onClick={() => onSelectTab('drills')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-full ${
                currentTab === 'drills'
                  ? 'text-[#1c1917] bg-[#f3efe8] font-semibold'
                  : 'text-[#8c7e72] hover:text-[#1c1917] hover:bg-[#f3efe8]/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Drills & Frameworks</span>
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 rounded-full ${
                currentTab === 'history'
                  ? 'text-[#1c1917] bg-[#f3efe8] font-semibold'
                  : 'text-[#8c7e72] hover:text-[#1c1917] hover:bg-[#f3efe8]/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Session Archive</span>
              {savedSessionsCount > 0 && (
                <span className="text-[11px] px-1.5 py-0.2 bg-[#e5ded5] text-[#1c1917] rounded-full font-sans">
                  {savedSessionsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onQuickStart}
              className="inline-flex items-center gap-2 bg-[#e06c5f] hover:bg-[#cf5e52] text-white text-sm font-medium py-2.5 px-5 rounded-full shadow-sm transition-all hover:shadow active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Record Speech</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#e5ded5]/60 text-xs text-[#8c7e72]">
          <button
            onClick={() => onSelectTab('studio')}
            className={`py-1.5 px-2 flex flex-col items-center gap-1 ${
              currentTab === 'studio' ? 'text-[#1c1917] font-semibold' : ''
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Studio</span>
          </button>
          <button
            onClick={() => onSelectTab('practice')}
            className={`py-1.5 px-2 flex flex-col items-center gap-1 ${
              currentTab === 'practice' ? 'text-[#e06c5f] font-semibold' : ''
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Booth</span>
          </button>
          <button
            onClick={() => onSelectTab('drills')}
            className={`py-1.5 px-2 flex flex-col items-center gap-1 ${
              currentTab === 'drills' ? 'text-[#1c1917] font-semibold' : ''
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Drills</span>
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`py-1.5 px-2 flex flex-col items-center gap-1 ${
              currentTab === 'history' ? 'text-[#1c1917] font-semibold' : ''
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Archive</span>
          </button>
        </div>
      </div>
    </header>
  );
};
