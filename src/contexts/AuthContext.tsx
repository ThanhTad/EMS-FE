"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  AuthContextType,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserRole,
  ApiResponse,
  User,
} from "@/types";
import { loginAPI, registerAPI, logoutAPI, getCurrentUserAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

// Bỏ refreshToken khỏi AuthContextType nếu cần
type SimpleAuthContextType = Omit<AuthContextType, "refreshToken">;

const AuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  /**
   * Đăng xuất người dùng. Xóa trạng thái client và gọi API logout.
   */
  const logout = useCallback(async () => {
    setUser(null);

    try {
      await logoutAPI(); // Gọi BE xóa cookie HttpOnly
    } catch (error) {
      console.error(
        "Logout API call failed, but client state is cleared.",
        error
      );
    } finally {
      router.replace("/login");
    }
  }, [router]);

  /**
   * Lấy thông tin người dùng từ backend dựa trên token trong cookie.
   * Nếu thành công, người dùng được coi là đã đăng nhập.
   * Nếu thất bại (thường là lỗi 401 do token hết hạn), coi như chưa đăng nhập.
   */
  const fetchUser = useCallback(async () => {
    try {
      const response = await getCurrentUserAPI();
      if (response) {
        setUser(response);
        console.log("User fetched successfully:", response);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to fetch user:", error.message);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);
  // useEffect này chỉ chạy MỘT LẦN khi Provider được mount
  useEffect(() => {
    if (!isInitialized) {
      fetchUser();
    }
  }, [fetchUser, isInitialized]);

  /**
   * Xử lý logic đăng nhập.
   * Sau khi đăng nhập thành công, chỉ cần set user.
   * Không cần lên lịch refresh.
   */
  const login = async (
    creds: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await loginAPI(creds);
      const authData = response.data.data;

      // Nếu đăng nhập thành công và không cần 2FA
      if (authData.user && !authData.twoFactorEnabled) {
        setUser(authData.user);
        console.log("Login successful, user set:", authData.user);
      }

      // Vẫn trả về response đầy đủ để component có thể xử lý 2FA
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /**
   * Xử lý logic đăng ký.
   */
  const register = async (
    payload: RegisterRequest
  ): Promise<ApiResponse<User>> => {
    try {
      const response = await registerAPI(payload);
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  /**
   * Kiểm tra vai trò của người dùng hiện tại.
   */
  const hasRole = (roleToCheck: UserRole): boolean => {
    return user?.role === roleToCheck;
  };

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Tạo đối tượng value, không có refreshToken
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
    fetchUser: refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitialized ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook `useAuth` để cung cấp một cách clean để truy cập context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
