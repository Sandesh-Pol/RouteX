import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user in mock data
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role
    );

    if (!foundUser) {
      // Check if user exists with different credentials
      const userExists = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        if (userExists.role !== role) {
          return { success: false, error: 'Invalid role selected for this account' };
        }
        return { success: false, error: 'Incorrect password' };
      }
      return { success: false, error: 'User not found. Please sign up first.' };
    }

    setUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(foundUser));

    return { success: true };
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create new user (in real app, this would be saved to backend)
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      email,
      password,
      name,
      role,
      phone,
    };

    // Add to mock users (this will be lost on refresh in this demo)
    mockUsers.push(newUser);

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
