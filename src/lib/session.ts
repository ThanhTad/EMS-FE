// lib/session.ts
import { cookies } from "next/headers";
import { ApiResponse, AuthUser } from "@/types";
import axios from "axios";

// Đặt tên cookie của bạn ở một nơi để dễ dàng thay đổi
const AUTH_TOKEN_COOKIE_NAME = "accessToken";

export async function getAndVerifyServerSideUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    // Gọi một endpoint trên backend của bạn, gửi token qua header
    // Endpoint này sẽ xác thực chữ ký của token và trả về thông tin người dùng
    const response = await axios.get<ApiResponse<AuthUser>>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
      {
        headers: {
          Cookie: `${AUTH_TOKEN_COOKIE_NAME}=${token}`,
        },
      }
    );

    return response.data.data; // Giả sử API trả về { data: { user: AuthUser } }
  } catch (error) {
    console.error("Error verifying user on server side:", error);
    return null;
  }
}
