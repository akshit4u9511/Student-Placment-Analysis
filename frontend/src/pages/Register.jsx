import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', full_name: '', role: 'student',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-400 
            flex items-center justify-center shadow-lg shadow-primary-500/25">
                        <GraduationCap size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
                    <p className="text-slate-400 mt-2 text-sm">Join the placement analytics dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </motion.div>
                    )}

                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                        <input type="text" name="full_name" value={formData.full_name}
                            onChange={handleChange} placeholder="Enter your full name" required className="input-field" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Username</label>
                        <input type="text" name="username" value={formData.username}
                            onChange={handleChange} placeholder="Choose a username" required className="input-field" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
                        <input type="email" name="email" value={formData.email}
                            onChange={handleChange} placeholder="Enter your email" required className="input-field" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'}
                                name="password" value={formData.password}
                                onChange={handleChange} placeholder="Create a password" required className="input-field pr-12" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                            <option value="student">Student</option>
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : 'Create Account'}
                    </button>

                    <p className="text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
