import { motion } from 'framer-motion';

export default function ChartCard({ title, subtitle, children, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`chart-container ${className}`}
        >
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {children}
        </motion.div>
    );
}
