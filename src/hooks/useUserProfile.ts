//src/hooks/useUserProfile.ts
import { getCurrentUserAPI, updateUserProfile } from "@/lib/api";
import { AuthUser, UserProfileUpdateRequest } from "@/types";
import useSWR from "swr";

// Hàm fetcher để SWR sử dụng, chỉ cần định nghĩa một lần
const userProfileFetcher = () => getCurrentUserAPI();

export const useUserProfile = () => {
  // SWR sẽ tự động fetch, cache, và revalidate dữ liệu
  const {
    data: profile,
    error,
    isLoading,
    mutate,
  } = useSWR<AuthUser>("user-profile", userProfileFetcher);

  /**
   * Hàm để lưu các thay đổi của hồ sơ.
   * Chỉ nhận một payload an toàn với các trường được phép thay đổi.
   * @param payload - Dữ liệu cần cập nhật (fullName, phone)
   */
  const saveProfile = async (payload: UserProfileUpdateRequest) => {
    if (!profile?.id) {
      throw new Error("User not authenticated or profile not loaded.");
    }

    // Gọi API chỉ với các trường được phép cập nhật
    const updatedUser = await updateUserProfile(profile.id, payload);

    // Sau khi API thành công, ra lệnh cho SWR cập nhật cache.
    // SWR sẽ tự động re-fetch để đảm bảo dữ liệu là mới nhất.
    await mutate();

    return updatedUser;
  };

  /**
   * Hàm để chủ động yêu cầu SWR fetch lại dữ liệu hồ sơ.
   * Hữu ích sau khi upload avatar.
   */
  const refetch = async () => {
    await mutate();
  };

  return {
    profile,
    loading: isLoading,
    error: error, // Trả về object lỗi đầy đủ
    saveProfile,
    refetch,
  };
};
