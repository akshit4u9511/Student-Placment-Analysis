import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, FileText, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { dataAPI } from '../services/api';

export default function DataUpload() {
    const [datasets, setDatasets] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        loadDatasets();
    }, []);

    const loadDatasets = async () => {
        try {
            const res = await dataAPI.getDatasets();
            setDatasets(res.data);
        } catch (err) { /* */ }
    };

    const handleUpload = async (file) => {
        if (!file || !file.name.endsWith('.csv')) {
            setUploadResult({ error: 'Please select a CSV file' });
            return;
        }
        setUploading(true);
        setUploadResult(null);
        try {
            const res = await dataAPI.upload(file);
            setUploadResult({ success: res.data });
            loadDatasets();
        } catch (err) {
            setUploadResult({ error: err.response?.data?.detail || 'Upload failed' });
        }
        setUploading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this dataset?')) return;
        try {
            await dataAPI.deleteDataset(id);
            loadDatasets();
        } catch (err) {
            alert(err.response?.data?.detail || 'Delete failed');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-slate-100">Upload Data</h1>
                <p className="text-slate-400 mt-1">Upload CSV files to analyze placement data</p>
            </motion.div>

            {/* Upload Area */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-8 border-2 border-dashed transition-colors cursor-pointer
          ${dragActive ? 'border-primary-500 bg-primary-500/5' : 'border-white/10 hover:border-primary-500/30'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
            >
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                        <UploadIcon size={28} className="text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">
                        {uploading ? 'Uploading...' : 'Drop your CSV file here'}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">or click to browse files</p>
                    <p className="text-xs text-slate-500">
                        Required columns: student_name, department, placed, salary, etc.
                    </p>
                    {uploading && (
                        <div className="mt-4 w-48 h-2 mx-auto bg-dark-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full animate-pulse w-3/4" />
                        </div>
                    )}
                </div>
                <input id="file-input" type="file" accept=".csv" className="hidden"
                    onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
            </motion.div>

            {/* Upload Result */}
            {uploadResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`glass-card p-4 flex items-center gap-3
            ${uploadResult.success ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                    {uploadResult.success ? (
                        <>
                            <CheckCircle2 size={20} className="text-emerald-400" />
                            <div>
                                <p className="text-sm text-emerald-400 font-medium">Upload Successful!</p>
                                <p className="text-xs text-slate-400">
                                    {uploadResult.success.records_inserted} records inserted (v{uploadResult.success.version})
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={20} className="text-red-400" />
                            <p className="text-sm text-red-400">{uploadResult.error}</p>
                        </>
                    )}
                </motion.div>
            )}

            {/* Datasets List */}
            <div className="glass-card">
                <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-slate-200">Uploaded Datasets</h3>
                </div>
                {datasets.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <FileText size={32} className="mx-auto mb-3 opacity-40" />
                        <p>No datasets uploaded yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {datasets.map((ds, i) => (
                            <motion.div key={ds.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 flex items-center justify-between hover:bg-dark-700/20 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                        <FileText size={18} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{ds.name}</p>
                                        <p className="text-xs text-slate-500">
                                            v{ds.version} • {ds.record_count} records • {ds.uploaded_at}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(ds.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
