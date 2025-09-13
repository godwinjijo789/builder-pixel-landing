import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Role = "school" | "do";
export type SchoolProfile = {
  name: string;
  schoolId: string;
  district: string;
  address: string;
  doId: string; // Directorate/DO office id
};

type AuthContextType = {
  isAuthenticated: boolean;
  role: Role | null;
  profile: SchoolProfile | null; // only when role === 'school'
  login: (opts: { username: string; password: string; role: Role; doId?: string; schoolId?: string }) => Promise<boolean>;
  logout: () => void;
  saveProfile: (p: SchoolProfile) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);

  useEffect(() => {
    const v = localStorage.getItem("auth.admin");
    const r = localStorage.getItem("auth.role") as Role | null;
    setIsAuthenticated(v === "true");
    setRole(r);
    const profRaw = localStorage.getItem("school.profile");
    if (profRaw) setProfile(JSON.parse(profRaw));
  }, []);

  const login = async ({ username, password, role, doId, schoolId }: { username: string; password: string; role: Role; doId?: string; schoolId?: string; }) => {
    const ok = username.trim().toLowerCase() === "admin" && password === "password";
    if (ok) {
      localStorage.setItem("auth.admin", "true");
      localStorage.setItem("auth.role", role);
      if (role === "do" && doId) localStorage.setItem("do.id", doId);
      setIsAuthenticated(true);
      setRole(role);
      if (role === "school" && schoolId) {
        const prof: SchoolProfile = {
          name: (profile?.name || ""),
          schoolId,
          district: profile?.district || "",
          address: profile?.address || "",
          doId: profile?.doId || localStorage.getItem("do.id") || "",
        };
        localStorage.setItem("school.profile", JSON.stringify(prof));
        setProfile(prof);
        const list: SchoolProfile[] = JSON.parse(localStorage.getItem("schools") || "[]");
        const idx = list.findIndex((s) => s.schoolId === prof.schoolId);
        if (idx >= 0) list[idx] = prof; else list.push(prof);
        localStorage.setItem("schools", JSON.stringify(list));
      }
    }
    return ok;
  };

  const logout = () => {
    localStorage.removeItem("auth.admin");
    localStorage.removeItem("auth.role");
    setIsAuthenticated(false);
    setRole(null);
  };

  const saveProfile = (p: SchoolProfile) => {
    setProfile(p);
    localStorage.setItem("school.profile", JSON.stringify(p));
    // also store in global schools list for DO portal
    const list: SchoolProfile[] = JSON.parse(localStorage.getItem("schools") || "[]");
    const idx = list.findIndex((s) => s.schoolId === p.schoolId);
    if (idx >= 0) list[idx] = p; else list.push(p);
    localStorage.setItem("schools", JSON.stringify(list));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, profile, login, logout, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
