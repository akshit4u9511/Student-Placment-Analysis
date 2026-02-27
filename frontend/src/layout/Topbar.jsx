import { Search, Bell, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Topbar({ onAiPanelToggle }) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 
      flex items-center justify-between px-6 gap-4">

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 
            group-focus-within:text-primary-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Ask AI about your data..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-dark-800/50 border border-white/5 rounded-xl
              text-sm text-slate-200 placeholder-slate-500 outline-none
              focus:border-primary-500/30 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <kbd className="px-2 py-0.5 text-[10px] text-slate-500 bg-dark-700 rounded border border-white/10">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                <button className="relative p-2.5 rounded-xl bg-dark-800/50 border border-white/5 
          text-slate-400 hover:text-slate-200 hover:border-white/10 transition-all">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                </button>

                <button
                    onClick={onAiPanelToggle}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-gradient-to-r from-primary-500/20 to-accent-400/20 
            border border-primary-500/20 text-primary-300 
            hover:from-primary-500/30 hover:to-accent-400/30 transition-all group"
                >
                    <Sparkles size={16} className="group-hover:animate-pulse" />
                    <span className="text-sm font-medium">AI Assistant</span>
                </button>
            </div>
        </header>
    );
}
