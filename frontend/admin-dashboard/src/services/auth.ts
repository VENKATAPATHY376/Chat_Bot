import axios from 'axios';

const API_URL = 'https://your-api-url.com'; // Replace with your actual API URL

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    } catch (error) {
        throw new Error('Login failed. Please check your credentials.');
    }
};

export const logout = async () => {
    try {
        await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
        throw new Error('Logout failed. Please try again.');
    }
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const setUserSession = (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearUserSession = () => {
    localStorage.removeItem('user');
};