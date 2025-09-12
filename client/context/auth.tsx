import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem("auth.admin");
    setIsAuthenticated(v === "true");
  }, []);

  const login = async (username: string, password: string) => {
    const ok = username.trim().toLowerCase() === "admin" && password === "password";
    if (ok) {
      localStorage.setItem("auth.admin", "true");
      setIsAuthenticated(true);
    }
    return ok;
  };

  const logout = () => {
    localStorage.removeItem("auth.admin");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
