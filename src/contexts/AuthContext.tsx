"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthContextType,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserRole,
  ApiResponse,
} from "@/types";
import {
  loginAPI,
  registerAPI,
  refreshTokenAPI,
  logoutAPI,
  getCurrentUserInfo,
} from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khi mount, fetch user info từ API (đã có cookie)
  useEffect(() => {
    async function fetchUser() {
      try {
        const me = await getCurrentUserInfo();
        setUser(me.user);
      } catch {
        setUser(null);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, []);

  const isAuthenticated = !!user;

  const login = async (
    creds: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const res = await loginAPI(creds);
    // Sau khi BE set cookie, lấy user từ response
    setUser(res.data.data.user);
    return res.data;
  };

  const register = async (
    payload: RegisterRequest
  ): Promise<ApiResponse<User>> => {
    const res = await registerAPI(payload);
    return res.data;
  };

  const refreshToken = async (): Promise<void> => {
    await refreshTokenAPI();
    // BE sẽ set lại cookie accessToken, bạn có thể fetch lại user nếu muốn
    try {
      const me = await getCurrentUserInfo();
      setUser(me.user);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    await logoutAPI();
    setUser(null);
  };

  const hasRole = (roleToCheck: UserRole): boolean => {
    if (!user || !user.role) {
      return false;
    }
    return user.role.includes(roleToCheck);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        refreshToken,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
