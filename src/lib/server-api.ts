import { cookies } from "next/headers";
import axios, { AxiosRequestConfig } from "axios";
import { ApiResponse } from "@/types";

// Tạo một instance axios cơ sở
const serverAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/**
 * Một hàm helper để thực hiện các lời gọi API từ Server Components.
 * Nó tự động lấy và đính kèm cookie từ request đến.
 * @param url Đường dẫn API (ví dụ: "/api/v1/auth/me")
 * @param config Cấu hình bổ sung cho Axios
 * @returns Promise chứa dữ liệu từ API
 */
export async function fetchFromServer<T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    // Tự động lấy và ghép chuỗi cookie
    const cookieStore = cookies();
    const cookieHeader = (await cookieStore)
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // Thực hiện lời gọi API với cookie đã đính kèm
    const response = await serverAxios.get<ApiResponse<T>>(url, {
      ...config,
      headers: {
        ...config.headers,
        Cookie: cookieHeader,
      },
    });

    // Trả về phần 'data' của ApiResponse
    return response.data.data;
  } catch (error) {
    // Xử lý lỗi một cách tập trung
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error(`❌ API Error for ${url}:`, errorMessage);
      // Ném lại lỗi để component gọi có thể bắt và xử lý
      throw new Error(errorMessage);
    }
    console.error(`❌ Unknown Error for ${url}:`, error);
    throw new Error("An unknown error occurred while fetching data.");
  }
}
