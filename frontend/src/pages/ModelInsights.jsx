import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ChartCard from '../components/ChartCard';
import { mlAPI } from '../services/api';

const COLORS = ['#6366F1', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ModelInsights() {
    const [modelInfo, setModelInfo] = useState(null);
    const [training, setTraining] = useState(false);
    const [loading, setLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);
    const [salaryPrediction, setSalaryPrediction] = useState(null);
    const [formData, setFormData] = useState({
        cgpa: 8.0, backlogs: 0, internships: 1, projects: 2,
        certification_count: 1, aptitude_score: 75, communication_score: 70,
        department: 'CSE', gender: 'Male',
    });

    useEffect(() => {
        loadModelInfo();
    }, []);

    const loadModelInfo = async () => {
        try {
            const res = await mlAPI.getModelInfo();
            setModelInfo(res.data);
        } catch (err) { /* */ }
        setLoading(false);
    };

    const handleTrain = async () => {
        setTraining(true);
        try {
            const res = await mlAPI.train();
            setModelInfo(res.data.model_info);
        } catch (err) {
            alert('Training failed. Make sure you have uploaded a dataset with at least 20 records.');
        }
        setTraining(false);
    };

    const handlePredict = async () => {
        try {
            const [placementRes, salaryRes] = await Promise.all([
                mlAPI.predictPlacement(formData),
                mlAPI.predictSalary(formData),
            ]);
            setPrediction(placementRes.data);
            setSalaryPrediction(salaryRes.data);
        } catch (err) {
            alert('Prediction failed. Train models first.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['cgpa', 'aptitude_score', 'communication_score'].includes(name)
                ? parseFloat(value) || 0
                : ['backlogs', 'internships', 'projects', 'certification_count'].includes(name)
                    ? parseInt(value) || 0
                    : value,
        }));
    };

    const placementMetrics = modelInfo?.placement_model?.metrics || {};
    const salaryMetrics = modelInfo?.salary_model?.metrics || {};
    const featureImportance = modelInfo?.placement_model?.feature_importance || [];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Model Insights</h1>
                    <p className="text-slate-400 mt-1">ML model performance and predictions</p>
                </div>
                <button onClick={handleTrain} disabled={training} className="btn-primary flex items-center gap-2">
                    {training ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Training...
                        </>
                    ) : '🧠 Train Models'}
                </button>
            </motion.div>

            {/* Model Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Placement Model (Logistic Regression)" subtitle="Classification metrics">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { label: 'Accuracy', value: placementMetrics.accuracy, color: 'primary' },
                            { label: 'Precision', value: placementMetrics.precision, color: 'emerald' },
                            { label: 'Recall', value: placementMetrics.recall, color: 'accent' },
                            { label: 'F1 Score', value: placementMetrics.f1_score, color: 'amber' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="p-4 rounded-xl bg-dark-700/30 border border-white/5">
                                <p className="text-sm text-slate-400 mb-1">{label}</p>
                                <p className={`text-2xl font-bold text-${color}-400`}>
                                    {value !== undefined ? (value * 100).toFixed(1) + '%' : 'N/A'}
                                </p>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                <ChartCard title="Salary Model (Random Forest)" subtitle="Regression metrics">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { label: 'MAE', value: salaryMetrics.mae, suffix: ' LPA' },
                            { label: 'RMSE', value: salaryMetrics.rmse, suffix: ' LPA' },
                            { label: 'R² Score', value: salaryMetrics.r2_score, suffix: '' },
                        ].map(({ label, value, suffix }) => (
                            <div key={label} className="p-4 rounded-xl bg-dark-700/30 border border-white/5">
                                <p className="text-sm text-slate-400 mb-1">{label}</p>
                                <p className="text-2xl font-bold text-accent-400">
                                    {value !== undefined ? value.toFixed(3) + suffix : 'N/A'}
                                </p>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* SHAP Feature Importance */}
            {featureImportance.length > 0 && (
                <ChartCard title="Feature Importance (SHAP)" subtitle="Top features influencing placement prediction">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={featureImportance} layout="vertical" barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <YAxis type="category" dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 12 }} width={160} axisLine={{ stroke: '#334155' }} />
                            <Tooltip />
                            <Bar dataKey="importance" name="Importance" radius={[0, 6, 6, 0]}>
                                {featureImportance.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Prediction Form */}
            <ChartCard title="Predict Placement & Salary" subtitle="Enter student details to get predictions">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { name: 'cgpa', label: 'CGPA', type: 'number', step: '0.1' },
                        { name: 'backlogs', label: 'Backlogs', type: 'number' },
                        { name: 'internships', label: 'Internships', type: 'number' },
                        { name: 'projects', label: 'Projects', type: 'number' },
                        { name: 'certification_count', label: 'Certifications', type: 'number' },
                        { name: 'aptitude_score', label: 'Aptitude Score', type: 'number' },
                        { name: 'communication_score', label: 'Communication Score', type: 'number' },
                    ].map(({ name, label, type, step }) => (
                        <div key={name}>
                            <label className="text-xs text-slate-400 mb-1 block">{label}</label>
                            <input
                                type={type} name={name} step={step}
                                value={formData[name]}
                                onChange={handleChange}
                                className="input-field text-sm"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="input-field text-sm">
                            {['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={handlePredict} className="btn-primary">
                    🔮 Predict
                </button>

                {/* Results */}
                {prediction && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-5 rounded-xl border ${prediction.prediction === 'Placed' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <p className="text-sm text-slate-400 mb-1">Prediction</p>
                            <p className={`text-xl font-bold ${prediction.prediction === 'Placed' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {prediction.prediction}
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-primary-500/10 border border-primary-500/20">
                            <p className="text-sm text-slate-400 mb-1">Placement Probability</p>
                            <p className="text-xl font-bold text-primary-400">{prediction.placed_probability}%</p>
                        </div>
                        {salaryPrediction && (
                            <div className="p-5 rounded-xl bg-accent-400/10 border border-accent-400/20">
                                <p className="text-sm text-slate-400 mb-1">Predicted Salary</p>
                                <p className="text-xl font-bold text-accent-400">{salaryPrediction.predicted_salary} LPA</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </ChartCard>
        </div>
    );
}
