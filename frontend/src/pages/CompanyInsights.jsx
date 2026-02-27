import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { analyticsAPI } from '../services/api';

const COLORS = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-sm font-medium text-slate-200">{payload[0].name}</p>
                <p className="text-sm text-slate-400">Offers: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function CompanyInsights() {
    const [companies, setCompanies] = useState([]);
    const [sortField, setSortField] = useState('offers');
    const [sortDir, setSortDir] = useState('desc');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await analyticsAPI.getCompanies();
            setCompanies(res.data);
        } catch (err) { /* */ }
        setLoading(false);
    };

    const sorted = [...companies].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return (a[sortField] - b[sortField]) * dir;
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ field }) => (
        <span className="ml-1 text-xs">
            {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-slate-100">Company Insights</h1>
                <p className="text-slate-400 mt-1">Hiring patterns and company-wise analysis</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Top Hiring Companies" subtitle="Distribution of job offers">
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={companies.slice(0, 10)}
                                dataKey="offers"
                                nameKey="company"
                                cx="50%"
                                cy="50%"
                                outerRadius={130}
                                innerRadius={70}
                                paddingAngle={2}
                                strokeWidth={0}
                            >
                                {companies.slice(0, 10).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {companies.slice(0, 10).map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                {c.company}
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Company Stats Cards */}
                <div className="space-y-4">
                    <ChartCard title="Quick Stats">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-dark-700/30 border border-white/5">
                                <p className="text-2xl font-bold text-primary-400">{companies.length}</p>
                                <p className="text-sm text-slate-400">Companies Visited</p>
                            </div>
                            <div className="p-4 rounded-xl bg-dark-700/30 border border-white/5">
                                <p className="text-2xl font-bold text-emerald-400">
                                    {companies.reduce((s, c) => s + c.offers, 0)}
                                </p>
                                <p className="text-sm text-slate-400">Total Offers</p>
                            </div>
                            <div className="p-4 rounded-xl bg-dark-700/30 border border-white/5">
                                <p className="text-2xl font-bold text-accent-400">
                                    {companies.length ? Math.max(...companies.map(c => c.max_salary)).toFixed(1) : 0} LPA
                                </p>
                                <p className="text-sm text-slate-400">Highest Package</p>
                            </div>
                            <div className="p-4 rounded-xl bg-dark-700/30 border border-white/5">
                                <p className="text-2xl font-bold text-amber-400">
                                    {companies.length ? (companies.reduce((s, c) => s + c.average_salary, 0) / companies.length).toFixed(1) : 0} LPA
                                </p>
                                <p className="text-sm text-slate-400">Avg Across Companies</p>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>

            {/* Company Table */}
            <ChartCard title="All Companies" subtitle="Sort by any column">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Company</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-slate-200"
                                    onClick={() => handleSort('offers')}>
                                    Offers <SortIcon field="offers" />
                                </th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-slate-200"
                                    onClick={() => handleSort('average_salary')}>
                                    Avg Salary <SortIcon field="average_salary" />
                                </th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-slate-200"
                                    onClick={() => handleSort('max_salary')}>
                                    Max Salary <SortIcon field="max_salary" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((c, i) => (
                                <motion.tr key={c.company}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-white/5 hover:bg-dark-700/30 transition-colors"
                                >
                                    <td className="py-3 px-4 text-slate-500">{i + 1}</td>
                                    <td className="py-3 px-4 text-slate-200 font-medium">{c.company}</td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-400">
                                            {c.offers}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right text-accent-400">{c.average_salary} LPA</td>
                                    <td className="py-3 px-4 text-right text-emerald-400">{c.max_salary} LPA</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>
        </div>
    );
}
