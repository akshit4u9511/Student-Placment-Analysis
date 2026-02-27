import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (username, password) =>
        api.post('/auth/login', new URLSearchParams({ username, password }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
};

// Data
export const dataAPI = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/data/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getDatasets: () => api.get('/data/datasets'),
    getRecords: (datasetId, skip = 0, limit = 100) =>
        api.get(`/data/records/${datasetId}?skip=${skip}&limit=${limit}`),
    deleteDataset: (datasetId) => api.delete(`/data/datasets/${datasetId}`),
};

// Analytics
export const analyticsAPI = {
    getOverview: (datasetId) =>
        api.get(`/analytics/overview${datasetId ? `?dataset_id=${datasetId}` : ''}`),
    getDepartment: (datasetId, batchYear) => {
        const params = new URLSearchParams();
        if (datasetId) params.append('dataset_id', datasetId);
        if (batchYear) params.append('batch_year', batchYear);
        return api.get(`/analytics/department?${params}`);
    },
    getSalary: (datasetId) =>
        api.get(`/analytics/salary${datasetId ? `?dataset_id=${datasetId}` : ''}`),
    getCompanies: (datasetId) =>
        api.get(`/analytics/companies${datasetId ? `?dataset_id=${datasetId}` : ''}`),
    getSkills: (datasetId, department) => {
        const params = new URLSearchParams();
        if (datasetId) params.append('dataset_id', datasetId);
        if (department) params.append('department', department);
        return api.get(`/analytics/skills?${params}`);
    },
    getBatchYears: (datasetId) =>
        api.get(`/analytics/batch-years${datasetId ? `?dataset_id=${datasetId}` : ''}`),
    getDepartments: (datasetId) =>
        api.get(`/analytics/departments${datasetId ? `?dataset_id=${datasetId}` : ''}`),
};

// ML
export const mlAPI = {
    train: (datasetId) =>
        api.post(`/ml/train${datasetId ? `?dataset_id=${datasetId}` : ''}`),
    predictPlacement: (data) => api.post('/ml/predict/placement', data),
    predictSalary: (data) => api.post('/ml/predict/salary', data),
    getModelInfo: () => api.get('/ml/model-info'),
};

// LLM
export const llmAPI = {
    chat: (message, model = 'llama3', datasetId = null) =>
        api.post('/llm/chat', { message, model, dataset_id: datasetId }),
    getModels: () => api.get('/llm/models'),
};

export default api;
