import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { analyticsAPI } from '../services/api';

const COLORS = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-sm text-slate-400">
                        <span style={{ color: p.color }}>●</span> {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DepartmentAnalytics() {
    const [data, setData] = useState([]);
    const [batchYears, setBatchYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadYears();
        loadData();
    }, []);

    const loadYears = async () => {
        try {
            const res = await analyticsAPI.getBatchYears();
            setBatchYears(res.data);
        } catch (err) { /* */ }
    };

    const loadData = async (year) => {
        setLoading(true);
        try {
            const res = await analyticsAPI.getDepartment(null, year || null);
            setData(res.data);
        } catch (err) { /* */ }
        setLoading(false);
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
        loadData(year);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Department Analytics</h1>
                    <p className="text-slate-400 mt-1">Placement performance across departments</p>
                </div>
                <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="input-field w-auto"
                >
                    <option value="">All Years</option>
                    {batchYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Placement % by Department" subtitle="Percentage of students placed in each department">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={data} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                    <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="placement_percentage" name="Placement %" radius={[6, 6, 0, 0]}>
                                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Average Salary by Department" subtitle="Average salary offered (in LPA)">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={data} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                    <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="average_salary" name="Avg Salary (LPA)" radius={[6, 6, 0, 0]}>
                                        {data.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* Department Table */}
                    <ChartCard title="Department Details" subtitle="Complete breakdown of placement metrics">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Department</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Total</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Placed</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Placement %</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg Salary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((d, i) => (
                                        <motion.tr key={d.department}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-white/5 hover:bg-dark-700/30 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-slate-200 font-medium">{d.department}</td>
                                            <td className="py-3 px-4 text-right text-slate-300">{d.total}</td>
                                            <td className="py-3 px-4 text-right text-emerald-400">{d.placed}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium
                          ${d.placement_percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                                        d.placement_percentage >= 60 ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-red-500/20 text-red-400'}`}>
                                                    {d.placement_percentage}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-accent-400">{d.average_salary} LPA</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ChartCard>
                </>
            )}
        </div>
    );
}
