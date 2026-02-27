import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

const iconMap = {
    students: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    placed: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    percentage: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
    ),
    salary: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
};

const colorSets = [
    { bg: 'from-primary-500/20 to-primary-600/10', icon: 'text-primary-400', border: 'border-primary-500/20' },
    { bg: 'from-emerald-500/20 to-emerald-600/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    { bg: 'from-accent-400/20 to-accent-500/10', icon: 'text-accent-400', border: 'border-accent-400/20' },
    { bg: 'from-amber-500/20 to-amber-600/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
    { bg: 'from-rose-500/20 to-rose-600/10', icon: 'text-rose-400', border: 'border-rose-500/20' },
    { bg: 'from-violet-500/20 to-violet-600/10', icon: 'text-violet-400', border: 'border-violet-500/20' },
];

export default function KpiCard({ title, value, icon = 'students', index = 0, prefix = '', suffix = '', decimals = 0 }) {
    const colors = colorSets[index % colorSets.length];
    const iconSvg = iconMap[icon] || iconMap.students;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`stat-card ${colors.border} group cursor-default`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} 
          flex items-center justify-center ${colors.icon} 
          group-hover:scale-110 transition-transform duration-300`}>
                    {iconSvg}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">
                <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
            </h3>
            <p className="text-sm text-slate-400">{title}</p>
        </motion.div>
    );
}
