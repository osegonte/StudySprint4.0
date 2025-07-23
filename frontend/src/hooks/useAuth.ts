// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock user data - replace with real auth
    setUser({
      id: '1',
      name: 'Study User',
      email: 'user@studysprint.com',
      level: 12,
      xp: 2450
    });
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - replace with real auth
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'Study User',
        email,
        level: 12,
        xp: 2450
      });
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
