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

export default function SkillsAnalysis() {
    const [skillsData, setSkillsData] = useState({ top_skills: [], heatmap: [] });
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDepartments();
        loadData();
    }, []);

    const loadDepartments = async () => {
        try {
            const res = await analyticsAPI.getDepartments();
            setDepartments(res.data);
        } catch (err) { /* */ }
    };

    const loadData = async (dept) => {
        setLoading(true);
        try {
            const res = await analyticsAPI.getSkills(null, dept || null);
            setSkillsData(res.data);
        } catch (err) { /* */ }
        setLoading(false);
    };

    const handleDeptChange = (dept) => {
        setSelectedDept(dept);
        loadData(dept);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Skills Analysis</h1>
                    <p className="text-slate-400 mt-1">Most in-demand skills and salary correlations</p>
                </div>
                <select value={selectedDept} onChange={(e) => handleDeptChange(e.target.value)}
                    className="input-field w-auto">
                    <option value="">All Departments</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : skillsData.top_skills && skillsData.top_skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 glass-card">
                    <p className="text-lg font-medium text-slate-300 mb-2">No Skills Data Available ⚠️</p>
                    <p className="text-sm text-center max-w-md">
                        The currently selected dataset does not contain a "Skills" column, or the data is empty. <br />
                        <span className="text-primary-400 mt-2 block">Upload a dataset with a "Skills" column to view this analysis.</span>
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Most Common Skills" subtitle="Top skills found in student profiles">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={skillsData.top_skills} layout="vertical" barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                                <YAxis type="category" dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} axisLine={{ stroke: '#334155' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Students" radius={[0, 6, 6, 0]}>
                                    {skillsData.top_skills.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Skills vs Salary Correlation" subtitle="Average salary by skill (heatmap view)">
                        <div className="space-y-2">
                            {skillsData.heatmap.map((item, i) => {
                                const maxSalary = Math.max(...skillsData.heatmap.map(h => h.avg_salary), 1);
                                const intensity = item.avg_salary / maxSalary;
                                return (
                                    <motion.div key={item.skill}
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-3 group"
                                    >
                                        <span className="text-sm text-slate-400 w-28 truncate">{item.skill}</span>
                                        <div className="flex-1 h-8 rounded-lg overflow-hidden bg-dark-700/30">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${intensity * 100}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                                className="h-full rounded-lg flex items-center justify-end px-3"
                                                style={{
                                                    background: `linear-gradient(90deg, rgba(99,102,241,${0.2 + intensity * 0.6}), rgba(34,211,238,${0.3 + intensity * 0.5}))`,
                                                }}
                                            >
                                                <span className="text-xs font-medium text-white">{item.avg_salary} LPA</span>
                                            </motion.div>
                                        </div>
                                        <span className="text-xs text-slate-500 w-16 text-right">{item.count} students</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ChartCard>
                </div>
            )}
        </div>
    );
}
