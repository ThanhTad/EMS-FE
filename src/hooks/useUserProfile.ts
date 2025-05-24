// hooks/useUserProfile.ts

import { useState, useEffect } from "react";
import { User, UserProfileUpdateRequest } from "@/types";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for fetching and updating user profile data
 */
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserProfile(user.id)
        .then((data) => setProfile(data))
        .catch((err: unknown) => {
          setError(
            err instanceof Error ? err.message : "Không thể tải profile"
          );
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  /**
   * Cập nhật profile (PUT /users/{id})
   * @param userId UUID user
   * @param payload Thông tin cập nhật (có thể chỉ gồm 1 trường)
   */
  const saveProfile = async (
    userId: string,
    payload: Partial<UserProfileUpdateRequest>
  ) => {
    if (!userId) throw new Error("Không có userId");
    const updated = await updateUserProfile(userId, payload);
    setProfile(updated);
    return updated;
  };

  return {
    profile,
    loading,
    error,
    saveProfile,
  };
}
