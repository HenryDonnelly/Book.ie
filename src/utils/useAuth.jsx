import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
    const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);

    useEffect(() => {
        if (token && !user && userId) {
            axios.get(`https://bookie.laravel.cloud/api/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then((response) => {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            })
            .catch((error) => {
                setUser(null);
                localStorage.removeItem('user');
            });
        }
    }, [token, user, userId]);

    const register = (userData) => {
        return axios.post('https://bookie.laravel.cloud/api/register', userData)
            .then((res) => {
                const token = res.data.data.token;
                const user = res.data.data;
                const userId = user.id;
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('userId', userId);
                    setToken(token);
                    setUser(user);
                    setUserId(userId);
                }
            })
            .catch((err) => {
                alert('Registration failed');
            });
    };

    const login = (email, password) => {
        return axios.post('https://bookie.laravel.cloud/api/login', { email, password })
            .then((res) => {
                const token = res.data.data.token;
                const user = res.data.data;
                const userId = user.id;
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('userId', userId);
                    setToken(token);
                    setUser(user);
                    setUserId(userId);
                }
            })
            .catch((err) => {
                alert('Login failed');
            });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
        setUserId(null);
    };

    const value = {
        token,
        user,
        userId,
        register,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};