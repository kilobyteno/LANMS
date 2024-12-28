import React, {createContext, useContext, useState, useEffect} from 'react';
import {authApi} from '../lib/api/auth';
import {clearTokens, getAccessToken, getRefreshToken} from '@/lib/api/client';
import {User, userApi} from '@/lib/api/user';

interface AuthContextType {
    user: User | null;
    login: typeof authApi.login;
    logout: typeof authApi.logout;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken() && !!getRefreshToken());

    const fetchCurrentUser = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        try {
            const response = await userApi.getUser();
            setUser(response.data.data);
        } catch (error) {
            setUser(null);
            console.error('Failed to fetch current user:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, [isAuthenticated]);

    const handleLogin = async (...args: Parameters<typeof authApi.login>) => {
        try {
            const response = await authApi.login(...args);
            setIsAuthenticated(true);
            await fetchCurrentUser();
            return response;
        } catch (error) {
            setIsAuthenticated(false);
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            clearTokens();
        }
    };

    const contextValue = {
        user,
        login: handleLogin,
        logout: handleLogout,
        loading,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
