import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";

export type UserRole = "student" | "supervisor" | "module_leader" | "system_admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Map backend roles to frontend roles
const mapRole = (role: string): UserRole => {
  switch (role) {
    case "Supervisor": return "supervisor";
    case "ModuleLeader": return "module_leader";
    case "SystemAdmin": return "system_admin";
    default: return "student";
  }
};

// Map frontend roles to backend roles
const mapRoleToBackend = (role: UserRole): string => {
  switch (role) {
    case "supervisor": return "Supervisor";
    case "module_leader": return "ModuleLeader";
    case "system_admin": return "SystemAdmin";
    default: return "Student";
  }
};

const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on startup
  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();

    if (token && savedUser) {
      setSession(token);
      setUser({
        id: savedUser.email,
        name: savedUser.fullName,
        email: savedUser.email,
        role: mapRole(savedUser.role),
        avatarInitials: getInitials(savedUser.fullName),
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      setSession(data.token);
      setUser({
        id: data.email,
        name: data.fullName,
        email: data.email,
        role: mapRole(data.role),
        avatarInitials: getInitials(data.fullName),
      });
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => {
    try {
      await authService.register(
        fullName,
        email,
        password,
        mapRoleToBackend(role)
      );
      // Auto login after signup
      return await login(email, password);
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const logout = async () => {
    authService.logout();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}