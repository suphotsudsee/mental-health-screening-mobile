import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

interface AuthContextValue {
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const value = await SecureStore.getItemAsync("isAdmin");
      setIsAdmin(value === "true");
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    // hard-coded login
    if (username === "admin" && password === "00022") {
      setIsAdmin(true);
      await SecureStore.setItemAsync("isAdmin", "true");
      return true;
    }
    return false;
  };

  const logout = async () => {
    setIsAdmin(false);
    await SecureStore.deleteItemAsync("isAdmin");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
