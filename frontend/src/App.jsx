import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import DashboardLayout from './layout/DashboardLayout';
import Overview from './pages/Overview';
import DepartmentAnalytics from './pages/DepartmentAnalytics';
import SalaryAnalysis from './pages/SalaryAnalysis';
import CompanyInsights from './pages/CompanyInsights';
import SkillsAnalysis from './pages/SkillsAnalysis';
import ModelInsights from './pages/ModelInsights';
import DataUpload from './pages/DataUpload';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/" /> : children;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Protected Dashboard */}
                    <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route index element={<Overview />} />
                        <Route path="departments" element={<DepartmentAnalytics />} />
                        <Route path="salary" element={<SalaryAnalysis />} />
                        <Route path="companies" element={<CompanyInsights />} />
                        <Route path="skills" element={<SkillsAnalysis />} />
                        <Route path="model-insights" element={<ModelInsights />} />
                        <Route path="upload" element={<DataUpload />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
