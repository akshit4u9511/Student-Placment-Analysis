import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard, BarChart3, DollarSign, Building2, Zap,
    Brain, Upload, Settings, LogOut, ChevronLeft, ChevronRight,
    GraduationCap
} from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Overview' },
    { path: '/departments', icon: BarChart3, label: 'Departments' },
    { path: '/salary', icon: DollarSign, label: 'Salary Analysis' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/skills', icon: Zap, label: 'Skills' },
    { path: '/model-insights', icon: Brain, label: 'Model Insights' },
    { path: '/upload', icon: Upload, label: 'Upload Data' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 
      ${collapsed ? 'w-20' : 'w-64'} bg-dark-800/90 backdrop-blur-xl border-r border-white/5 flex flex-col`}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 
          flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={22} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-sm font-bold gradient-text truncate">Smart Placement</h1>
                        <p className="text-[10px] text-slate-500">Analytics Dashboard</p>
                    </div>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
                        }
                    >
                        <Icon size={20} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User & Collapse */}
            <div className="px-3 py-4 border-t border-white/5 space-y-2">
                {!collapsed && user && (
                    <div className="px-4 py-2">
                        <p className="text-sm font-medium text-slate-200 truncate">{user.full_name || user.username}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                )}
                <button onClick={handleLogout}
                    className={`sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}>
                    <LogOut size={20} />
                    {!collapsed && <span className="text-sm">Logout</span>}
                </button>
                <button onClick={() => setCollapsed(!collapsed)}
                    className={`sidebar-link w-full text-slate-500 hover:text-slate-300 ${collapsed ? 'justify-center px-2' : ''}`}>
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!collapsed && <span className="text-sm">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
