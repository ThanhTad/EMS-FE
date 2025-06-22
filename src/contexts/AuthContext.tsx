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
  AuthUser, // Sử dụng AuthUser để nhất quán với type của state
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserRole,
  ApiResponse,
  User,
} from "@/types";
import {
  loginAPI,
  registerAPI,
  refreshTokenAPI,
  logoutAPI,
  // FIX 1: Sử dụng đúng tên hàm đã định nghĩa trong api.ts
  getCurrentUserAPI,
} from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Nhất quán sử dụng AuthUser cho state
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUser = useCallback(async () => {
    // Chỉ fetch nếu chưa có user hoặc đang trong quá trình loading ban đầu
    if (!user || isLoading) {
      try {
        const currentUser = await getCurrentUserAPI(); // Sử dụng API đã import

        // IMPROVEMENT 3: So sánh an toàn và hiệu quả hơn
        // Nếu id người dùng mới khác với id người dùng cũ, hoặc user cũ là null, thì cập nhật
        if (currentUser?.id !== user?.id) {
          setUser(currentUser ?? null);
        }
      } catch (error) {
        // Nếu có lỗi (thường là 401), đảm bảo user là null
        if (error instanceof Error && user !== null) {
          setUser(null);
        }
      } finally {
        // Luôn tắt loading sau khi fetch xong, dù thành công hay thất bại
        if (isLoading) {
          setIsLoading(false);
        }
      }
    }
  }, [user, isLoading]);

  useEffect(() => {
    // Lần đầu tải component, fetch user để kiểm tra session đăng nhập
    fetchUser();

    // Cleanup function để xóa timeout khi component unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchUser]); // fetchUser là một dependency ổn định nhờ useCallback

  const scheduleRefresh = (expiresIn: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    // Refresh trước khi token hết hạn 60 giây để đảm bảo an toàn
    const refreshTime = Math.max(0, expiresIn - 60) * 1000;
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        await refreshToken();
      }, refreshTime);
    }
  };

  const isAuthenticated = !!user;

  const login = async (
    creds: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await loginAPI(creds);
    const authData = response.data.data;

    // Chỉ set user và schedule refresh nếu đăng nhập thành công và không cần 2FA
    if (authData.user && !authData.twoFactorEnabled) {
      setUser(authData.user);
      if (authData.accessTokenExpiresIn) {
        scheduleRefresh(authData.accessTokenExpiresIn);
      }
    }
    // Trả về toàn bộ response để component có thể xử lý các trường hợp khác (như 2FA)
    return response.data;
  };

  const register = async (
    payload: RegisterRequest
  ): Promise<ApiResponse<User>> => {
    // Chỉ cần gọi API, không cần tự động đăng nhập sau khi đăng ký
    const response = await registerAPI(payload);
    return response.data;
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const res = await refreshTokenAPI();
      if (res.accessTokenExpiresIn) {
        scheduleRefresh(res.accessTokenExpiresIn);
      }
      // Sau khi refresh token, fetch lại thông tin user để cập nhật (ví dụ role thay đổi)
      await fetchUser();
    } catch (error) {
      // Nếu refresh token thất bại, coi như session đã hết hạn -> logout
      console.error("Failed to refresh token, logging out.", error);
      await logout();
    }
  };

  const logout = async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    try {
      await logoutAPI();
    } catch (error) {
      console.error(
        "Logout API failed, but clearing client state anyway.",
        error
      );
    } finally {
      setUser(null);
    }
  };

  const hasRole = (roleToCheck: UserRole): boolean => {
    if (!user || !user.role) {
      return false;
    }
    // FIX 2: Phải so sánh bằng (===) vì role là một string, không phải array
    return user.role === roleToCheck;
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
