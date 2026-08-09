"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
}

const DEFAULT_USER: User = {
  id: "usr_101",
  name: "Alex Mercer",
  email: "alex.mercer@edumaster.ai",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  joinedDate: "Jan 2024",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("edumaster_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(DEFAULT_USER);
        localStorage.setItem("edumaster_user", JSON.stringify(DEFAULT_USER));
      }
    } catch {
      setUser(DEFAULT_USER);
    }
    setIsLoaded(true);
  }, []);

  const login = (email: string, name?: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name || email.split("@")[0].replace(".", " ") || "Student Learner",
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      joinedDate: "Aug 2026",
    };
    setUser(newUser);
    localStorage.setItem("edumaster_user", JSON.stringify(newUser));
  };

  const signup = (name: string, email: string) => {
    login(email, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("edumaster_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signup,
      }}
    >
      {isLoaded ? children : <div className="min-h-screen bg-[#060913]" />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
