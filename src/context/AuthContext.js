import { createContext, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(() => localStorage.getItem('role'));

    useEffect(() => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [token]);

    useEffect(() => {
        if (role) localStorage.setItem('role', role);
        else localStorage.removeItem('role');
    }, [role]);

    const isAuthenticated = !!token;

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error('Login mislukt');

            const data = await response.json();
            console.log("✅ Ingelogd als:", data.role);

            setToken(data.token);
            setRole(data.role);
            setUser({ email });

            return true;
        } catch (err) {
            console.error('Login error:', err);
            setToken(null);
            setRole(null);
            setUser(null);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
    };

    const value = useMemo(
        () => ({ user, token, role, isAuthenticated, login, logout }),
        [user, token, role, isAuthenticated]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
