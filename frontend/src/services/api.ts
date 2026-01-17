import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const checkHealth = async (): Promise<any> => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error("Health check failed", error);
        throw error;
    }
};

export const generateLipSync = async (text: string, imageFile: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('image', imageFile);

    // returns a blob (video file)
    const response = await api.post('/generate-lipsync', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
    });
    return response.data;
};

export default api;
