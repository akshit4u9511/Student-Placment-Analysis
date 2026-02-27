import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, Bell, Palette, Info } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();

    return (
        <div className="space-y-6 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
                <p className="text-slate-400 mt-1">Manage your account and preferences</p>
            </motion.div>

            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <User size={20} className="text-primary-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                        <input type="text" value={user?.full_name || ''} readOnly className="input-field" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Username</label>
                        <input type="text" value={user?.username || ''} readOnly className="input-field" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
                        <input type="email" value={user?.email || ''} readOnly className="input-field" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Role</label>
                        <input type="text" value={user?.role || ''} readOnly className="input-field capitalize" />
                    </div>
                </div>
            </motion.div>

            {/* Security */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield size={20} className="text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Security</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">JWT-based authentication with bcrypt password hashing</p>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                        ✓ Session Active
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 text-sm border border-primary-500/20">
                        ✓ Token Valid
                    </div>
                </div>
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Info size={20} className="text-accent-400" />
                    <h3 className="text-lg font-semibold text-slate-200">About</h3>
                </div>
                <div className="text-sm text-slate-400 space-y-2">
                    <p>Smart Placement Analytics Dashboard v1.0.0</p>
                    <p>100% Open Source • No Paid APIs • Runs Locally</p>
                    <p className="text-xs text-slate-500 mt-4">
                        Built with React, FastAPI, SQLite, Scikit-learn, SHAP, and Ollama
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
