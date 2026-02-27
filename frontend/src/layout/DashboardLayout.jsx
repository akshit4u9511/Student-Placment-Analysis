import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AiPanel from '../components/AiPanel';

export default function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [aiPanelOpen, setAiPanelOpen] = useState(false);

    return (
        <div className="min-h-screen bg-dark-900">
            <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Topbar onAiPanelToggle={() => setAiPanelOpen(!aiPanelOpen)} />

                <main className="p-6 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>

            {/* AI Panel */}
            <AiPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />

            {/* Floating AI Button */}
            {!aiPanelOpen && (
                <button
                    onClick={() => setAiPanelOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
            bg-gradient-to-r from-primary-500 to-accent-400 
            text-white shadow-lg shadow-primary-500/25
            flex items-center justify-center
            hover:shadow-xl hover:shadow-primary-500/40 hover:scale-110
            transition-all duration-300 animate-float"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </button>
            )}
        </div>
    );
}
