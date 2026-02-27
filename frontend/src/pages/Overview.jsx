import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import KpiCard from '../components/KpiCard';
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
                        <span style={{ color: p.color }}>●</span> {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Overview() {
    const [overview, setOverview] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [salaryTrend, setSalaryTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [overviewRes, deptRes, compRes, salaryRes] = await Promise.all([
                analyticsAPI.getOverview(),
                analyticsAPI.getDepartment(),
                analyticsAPI.getCompanies(),
                analyticsAPI.getSalary(),
            ]);
            setOverview(overviewRes.data);
            setDepartments(deptRes.data);
            setCompanies(compRes.data.slice(0, 8));
            setSalaryTrend(salaryRes.data.trend || []);
        } catch (err) {
            console.log('Load data - upload a dataset first');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!overview || overview.total_students === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2">No Data Yet</h2>
                <p className="text-slate-400 mb-6">Upload a CSV dataset to get started with placement analytics.</p>
                <a href="/upload" className="btn-primary inline-block">Upload Dataset</a>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-slate-100">Dashboard Overview</h1>
                <p className="text-slate-400 mt-1">Real-time placement analytics and insights</p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard title="Total Students" value={overview.total_students} icon="students" index={0} />
                <KpiCard title="Total Placed" value={overview.total_placed} icon="placed" index={1} />
                <KpiCard title="Placement %" value={overview.placement_percentage} icon="percentage" index={2} suffix="%" decimals={1} />
                <KpiCard title="Highest Package" value={overview.highest_package} icon="salary" index={3} suffix=" LPA" decimals={1} />
                <KpiCard title="Average Package" value={overview.average_package} icon="salary" index={4} suffix=" LPA" decimals={2} />
                <KpiCard title="Median Package" value={overview.median_package} icon="salary" index={5} suffix=" LPA" decimals={2} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Placement */}
                <ChartCard title="Placement by Department" subtitle="Placement percentage across departments">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departments} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="placement_percentage" name="Placement %" radius={[6, 6, 0, 0]}>
                                {departments.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Top Companies Pie */}
                <ChartCard title="Top Hiring Companies" subtitle="Distribution of offers by company">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={companies}
                                dataKey="offers"
                                nameKey="company"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                innerRadius={60}
                                paddingAngle={3}
                                strokeWidth={0}
                            >
                                {companies.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                        {companies.map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                {c.company}
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* Salary Trend */}
            {salaryTrend.length > 0 && (
                <ChartCard title="Salary Trend Over Years" subtitle="Average salary progression across batch years">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salaryTrend}>
                            <defs>
                                <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="average_salary" name="Avg Salary (LPA)" stroke="#6366F1" fill="url(#salaryGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}
        </div>
    );
}
