import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await apiFetch('/api/v1/auth/me');
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string) => {
    localStorage.setItem('sokoza_token', token);
    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem('sokoza_token');
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('sokoza_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}