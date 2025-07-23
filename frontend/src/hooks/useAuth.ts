// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  level?: number;
  xp?: number;
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
    timezone: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token or session
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // TODO: Validate token with backend and get user data
          // For now, we'll check if there's a stored user profile
          const storedUser = localStorage.getItem('userProfile');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userProfile');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/auth/login', { email, password });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: '1',
        name: email.split('@')[0], // Use email prefix as name for now
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem('authToken', 'temporary-token');
      localStorage.setItem('userProfile', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/auth/register', { name, email, password });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: '1',
        name,
        email,
        level: 1,
        xp: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(newUser);
      localStorage.setItem('authToken', 'temporary-token');
      localStorage.setItem('userProfile', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };
};