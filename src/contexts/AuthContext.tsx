//app/src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
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
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const me = await getCurrentUserInfo();
      if (JSON.stringify(me.user) !== JSON.stringify(user)) {
        setUser(me.user ?? null);
      }
    } catch {
      if (user !== null) setUser(null);
    }
    if (isLoading) setIsLoading(false);
  }, [user, isLoading]);

  useEffect(() => {
    fetchUser();
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchUser]); // Đưa fetchUser vào dependency array

  // Đặt lịch tự động refresh token
  const scheduleRefresh = (expiresIn: number) => {
    // Xóa timeout cũ nếu có
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    // expiresIn là số giây, refresh trước khi hết hạn 30s
    const refreshTime = Math.max(0, expiresIn - 30) * 1000;
    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, refreshTime);
  };
  const isAuthenticated = !!user;

  const login = async (
    creds: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const res = await loginAPI(creds);
    // Sau khi BE set cookie, lấy user từ response
    if (!res.data.data.user?.twoFactorEnabled) {
      setUser(res.data.data.user ?? null);
      // Đặt lịch refresh nếu có expiresIn
      if (res.data.data.accessTokenExpiresIn) {
        scheduleRefresh(res.data.data.accessTokenExpiresIn);
      }
    }
    return res.data;
  };

  const register = async (
    payload: RegisterRequest
  ): Promise<ApiResponse<User>> => {
    const res = await registerAPI(payload);
    return res.data;
  };

  const refreshToken = async (): Promise<void> => {
    const res = await refreshTokenAPI();
    // Đặt lại lịch refresh nếu có accessTokenExpiresIn
    if (res.accessTokenExpiresIn) {
      scheduleRefresh(res.accessTokenExpiresIn);
    }
    await fetchUser();
  };

  const logout = async () => {
    await logoutAPI();
    setUser(null);
    // Clear timeout khi logout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
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
        fetchUser,
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
