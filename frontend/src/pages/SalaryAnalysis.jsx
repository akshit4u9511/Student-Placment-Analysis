import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell, AreaChart, Area
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { analyticsAPI } from '../services/api';

const COLORS = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-sm text-slate-400">
                        <span style={{ color: p.color }}>●</span> {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function SalaryAnalysis() {
    const [salaryData, setSalaryData] = useState({ distribution: [], trend: [], by_department: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await analyticsAPI.getSalary();
            setSalaryData(res.data);
        } catch (err) { /* */ }
        setLoading(false);
    };

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
                <h1 className="text-2xl font-bold text-slate-100">Salary Analysis</h1>
                <p className="text-slate-400 mt-1">Comprehensive salary distribution and trends</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution Histogram */}
                <ChartCard title="Salary Distribution" subtitle="Number of students in each salary range">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salaryData.distribution} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} fill="#6366F1">
                                {salaryData.distribution.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Salary Trend */}
                <ChartCard title="Placement Trend Over Years" subtitle="Average salary and placement count by year">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salaryData.trend}>
                            <defs>
                                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="average_salary" name="Avg Salary (LPA)" stroke="#22D3EE" fill="url(#trendGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Box Plot Approximation - Department Salary Comparison */}
            <ChartCard title="Salary Comparison by Department" subtitle="Min, Q1, Median, Q3, Max salary across departments">
                <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={salaryData.by_department} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="min" name="Min" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="median" name="Median" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="max" name="Max" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Table */}
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Department</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium">Min</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium">Q1</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium">Median</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium">Q3</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium">Max</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium">Avg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaryData.by_department.map((d, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-dark-700/30 transition-colors">
                                    <td className="py-3 px-4 text-slate-200 font-medium">{d.department}</td>
                                    <td className="py-3 px-4 text-right text-red-400">{d.min} LPA</td>
                                    <td className="py-3 px-4 text-right text-slate-300">{d.q1} LPA</td>
                                    <td className="py-3 px-4 text-right text-primary-400">{d.median} LPA</td>
                                    <td className="py-3 px-4 text-right text-slate-300">{d.q3} LPA</td>
                                    <td className="py-3 px-4 text-right text-emerald-400">{d.max} LPA</td>
                                    <td className="py-3 px-4 text-right text-accent-400 font-medium">{d.average} LPA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>
        </div>
    );
}
