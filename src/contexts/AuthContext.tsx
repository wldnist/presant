'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole } from '@/types';

interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cek apakah user sudah login sebelumnya (dari localStorage)
    const savedUser = localStorage.getItem('presant_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('presant_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    // Logic bypass - untuk sementara langsung set user tanpa validasi backend
    // Default role adalah 'USER', bisa diubah sesuai kebutuhan
    const mockUser: User = {
      id: '1',
      username: username,
      name: username, // Gunakan username sebagai name
      role: 'USER', // Default role, bisa diubah berdasarkan validasi dari backend
    };

    setUser(mockUser);
    localStorage.setItem('presant_user', JSON.stringify(mockUser));
  };

  const logout = (): void => {
    setIsLoading(true);
    setUser(null);
    localStorage.removeItem('presant_user');
    // Set loading false setelah delay kecil untuk memastikan redirect terjadi
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
