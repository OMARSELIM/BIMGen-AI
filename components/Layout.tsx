import React from 'react';
import { AppView } from '../types';
import { FileText, GitCompare, Settings, Hexagon } from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col items-center lg:items-stretch transition-all duration-300 shadow-xl z-20">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700">
          <Hexagon className="text-bim-500 w-8 h-8" strokeWidth={2.5} />
          <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight">BIMGen AI</span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
          <button
            onClick={() => setView(AppView.GENERATOR)}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              currentView === AppView.GENERATOR
                ? 'bg-bim-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-6 h-6 shrink-0" />
            <span className="hidden lg:block ml-3 font-medium">Generator</span>
          </button>

          <button
            onClick={() => setView(AppView.COMPARATOR)}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              currentView === AppView.COMPARATOR
                ? 'bg-bim-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <GitCompare className="w-6 h-6 shrink-0" />
            <span className="hidden lg:block ml-3 font-medium">Compliance Check</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center text-slate-400 p-2">
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block ml-3 text-sm">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-slate-800">
            {currentView === AppView.GENERATOR ? 'Create New Execution Plan' : 'Compare & Validate BEP'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
