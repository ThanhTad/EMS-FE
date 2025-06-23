// lib/session.ts
import { cookies } from "next/headers";
import { AuthUser } from "@/types";

// Đặt tên cookie của bạn ở một nơi để dễ dàng thay đổi
const AUTH_TOKEN_COOKIE_NAME = "ems_auth_token";

export async function getAndVerifyServerSideUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    // Gọi một endpoint trên backend của bạn, gửi token qua header
    // Endpoint này sẽ xác thực chữ ký của token và trả về thông tin người dùng
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // cache: 'no-store' để đảm bảo dữ liệu luôn mới nhất
        cache: "no-store",
      }
    );

    if (!response.ok) {
      // Nếu API trả về lỗi (e.g., 401 Unauthorized), token không hợp lệ
      return null;
    }

    const apiResponse = await response.json();
    return apiResponse.data as AuthUser;
  } catch (error) {
    console.error("Error verifying user on server side:", error);
    return null;
  }
}
