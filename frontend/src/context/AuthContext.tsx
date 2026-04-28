import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";
import { Role } from "../types/models";

interface AuthState {
  role: Role | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  loginClient: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>((localStorage.getItem("role") as Role | null) ?? null);

  const setTokens = (accessToken: string, refreshToken: string, nextRole: Role) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", nextRole);
    setRole(nextRole);
  };

  const loginClient = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    setTokens(res.data.data.accessToken, res.data.data.refreshToken, "client");
  };

  const loginAdmin = async (email: string, password: string) => {
    const res = await api.post("/auth/admin/login", { email, password });
    setTokens(res.data.data.accessToken, res.data.data.refreshToken, "admin");
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    setRole(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      isAuthenticated: Boolean(role && localStorage.getItem("accessToken")),
      loginClient,
      loginAdmin,
      logout
    }),
    [role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
