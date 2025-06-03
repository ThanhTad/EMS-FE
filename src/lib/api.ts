import axios, { AxiosResponse } from "axios";
import {
  LoginRequest,
  AuthResponse,
  RequestPasswordResetRequest,
  Enable2FARequest,
  Disable2FARequest,
  ResendOtpRequest,
  VerifyOtpRequest,
  RegisterRequest,
  ResetPasswordVerificationResponse,
  ResetPasswordWithTokenRequest,
  Paginated,
  TicketPurchase,
  UpdateUserSettingsRequest,
  UserSettings,
  Notification,
  User,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  Event,
  Category,
  CreateEventRequest,
  UpdateEventRequest,
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  StatusCode,
  SentOtpRequest,
  ApiResponse,
  PurchaseTicketRequest,
  AdminResetPasswordRequest,
  CategoryRequest,
} from "@/types";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Rất quan trọng để browser gửi cookie sang BE!
});

// Authentication
export const loginAPI = (
  creds: LoginRequest
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  return API.post("/api/v1/auth/login", creds);
};

export const refreshTokenAPI = () =>
  API.post<{ data: AuthResponse }>("/api/v1/auth/rf-token").then(
    (res) => res.data.data
  );

export const registerAPI = (
  payload: RegisterRequest
): Promise<AxiosResponse<ApiResponse<User>>> => {
  return API.post("/api/v1/auth/register", payload);
};

export const requestPasswordResetAPI = (data: RequestPasswordResetRequest) =>
  API.post("/api/v1/auth/pass-reset/request", data);

export const verifyPasswordResetOtpAPI = (data: VerifyOtpRequest) =>
  API.post<{ data: ResetPasswordVerificationResponse }>(
    "/api/v1/auth/pass-reset/verify-otp",
    data
  ).then((res) => res.data.data);

export const resetPasswordAPI = (data: ResetPasswordWithTokenRequest) =>
  API.post("/api/v1/auth/pass-reset/confirm", data);

export const logoutAPI = () => API.post("/api/v1/auth/logout");

export const getMeAPI = () =>
  API.get<{ data: ApiResponse<AuthResponse> }>("/api/v1/auth/me").then(
    (res) => res.data.data
  );

export const verifyEmailOtpAPI = (data: VerifyOtpRequest) =>
  API.post("/api/v1/auth/email/verify", data).then((res) => res.data.data);

// Two-Factor Authentication
export const sendOtpToEnable2FAAPI = (data: SentOtpRequest) =>
  API.post<{ data: ApiResponse<void> }>(
    "/api/v1/auth/2fa/enable/sent-otp",
    data
  ).then((res) => res.data.data);

export const enable2FAAPI = (data: Enable2FARequest) =>
  API.post<{ data: ApiResponse<void> }>("/api/v1/auth/2fa/enable", data).then(
    (res) => res.data.data
  );

export const disable2FAAPI = (data: Disable2FARequest) =>
  API.post<{ data: ApiResponse<void> }>("/api/v1/auth/2fa/disable", data).then(
    (res) => res.data.data
  );

export const sendOtpToDisable2FAAPI = (data: SentOtpRequest) =>
  API.post<{ data: ApiResponse<void> }>(
    "/api/v1/auth/2fa/disable/sent-otp",
    data
  ).then((res) => res.data.data);

// Verify 2FA OTP after login (requires Authorization header with temp token)
export const verify2FAAPI = (data: VerifyOtpRequest) =>
  API.post<{ data: ApiResponse<AuthResponse> }>(
    "/api/v1/auth/2fa/verify",
    data
  ).then((res) => res.data.data);

export const resendOtpAPI = (data: ResendOtpRequest) =>
  API.post<{ data: ApiResponse<void> }>("/api/v1/auth/otp/resend", data).then(
    (res) => res.data.data
  );

// User Profile
export async function getUserProfile(userId: string): Promise<User> {
  const res = await API.get<{ data: User }>(`/api/v1/users/${userId}`);
  return res.data.data;
}

export async function updateUserProfile(
  userId: string,
  payload: Partial<User>
): Promise<User> {
  const res = await API.put<{ data: User }>(`/api/v1/users/${userId}`, payload);
  return res.data.data;
}

// Avatar upload
export async function uploadAvatar(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post<{ data: { url: string } }>(
    "/api/v1/users/upload-avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data.data.url;
}

// Ticket Purchases
export async function getTicketPurchasesByUser(
  userId: string,
  params: { page: number; size: number }
): Promise<Paginated<TicketPurchase>> {
  const res = await API.get<{ data: Paginated<TicketPurchase> }>(
    `/api/v1/ticket-purchases/user/${userId}`,
    { params }
  );
  return res.data.data;
}

// Events
export async function getEvents(params: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Paginated<Event>> {
  const res = await API.get<{ data: Paginated<Event> }>("/api/v1/events", {
    params,
  });
  return res.data.data;
}

export async function getEventById(eventId: string): Promise<Event> {
  const res = await API.get<{ data: Event }>(`/api/v1/events/${eventId}`);
  return res.data.data;
}

export async function getEventsByCategoryId(
  categoryId: string,
  params: { page?: number; size?: number; sort?: string }
): Promise<Paginated<Event>> {
  const res = await API.get<{ data: Paginated<Event> }>(
    `/api/v1/events/category/${categoryId}`,
    { params }
  );
  return res.data.data;
}

export async function getEventsByCreatorId(
  creatorId: string,
  params: { page?: number; size?: number; sort?: string }
): Promise<Paginated<Event>> {
  const res = await API.get<{ data: Paginated<Event> }>(
    `/api/v1/events/creator/${creatorId}`,
    { params }
  );
  return res.data.data;
}

export async function getEventsByStatusId(
  statusId: number,
  params: { page?: number; size?: number; sort?: string }
): Promise<Paginated<Event>> {
  const res = await API.get<{ data: Paginated<Event> }>(
    `/api/v1/events/status/${statusId}`,
    { params }
  );
  return res.data.data;
}

export async function getEventsByDateRange(
  params: {
    page?: number;
    size?: number;
    sort?: string;
    start: string;
    end: string;
  },
  page = 0,
  size = 10
): Promise<Paginated<Event>> {
  const res = await API.get<{ data: Paginated<Event> }>(
    "/api/v1/events/date-range",
    { params: { ...params, page, size } }
  );
  return res.data.data;
}

// Categories
export async function getCategories(): Promise<Paginated<Category>> {
  const res = await API.get<{ data: Paginated<Category> }>(
    "/api/v1/categories",
    { params: { size: 1000 } }
  );
  return res.data.data;
}

// User Settings
export async function getUserSettings(): Promise<UserSettings> {
  const res = await API.get<{ data: UserSettings }>(
    "/api/v1/users/me/settings"
  );
  return res.data.data;
}

export async function updateUserSettings(
  payload: UpdateUserSettingsRequest
): Promise<UserSettings> {
  const res = await API.patch<{ data: UserSettings }>(
    "/api/v1/users/me/settings",
    payload
  );
  return res.data.data;
}

// Notifications
export async function getUnreadCount(): Promise<number> {
  const res = await API.get<{ data: number }>(
    "/api/v1/notifications/unread/count"
  );
  return res.data.data;
}

export async function getUnreadNotifications(
  page = 0,
  size = 10
): Promise<Paginated<Notification>> {
  const res = await API.get<{ data: Paginated<Notification> }>(
    "/api/v1/notifications/unread",
    { params: { page, size } }
  );
  return res.data.data;
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  await API.post("/api/v1/notifications/mark-read", { ids });
}

// Admin Endpoints
export async function adminGetUsers(params: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Paginated<User>> {
  const res = await API.get<{ data: Paginated<User> }>("/api/v1/users", {
    params,
  });
  return res.data.data;
}

export async function adminGetUserById(id: string): Promise<User> {
  const res = await API.get<{ data: User }>(`/api/v1/users/${id}`);
  return res.data.data;
}

export async function adminCreateUser(
  data: AdminCreateUserRequest
): Promise<User> {
  const res = await API.post<{ data: User }>("/api/v1/users", data);
  return res.data.data;
}

export async function adminUpdateUser(
  id: string,
  data: AdminUpdateUserRequest
): Promise<User> {
  const res = await API.patch<{ data: User }>(`/api/v1/users/${id}`, data);
  return res.data.data;
}

export async function adminDeleteUser(id: string): Promise<void> {
  await API.delete(`/api/v1/users/${id}`);
}

// Admin Events
export async function adminCreateEvent(
  data: CreateEventRequest
): Promise<Event> {
  const res = await API.post<{ data: Event }>("/api/v1/events", data);
  return res.data.data;
}

export async function getTickets(params: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Paginated<Ticket>> {
  const res = await API.get<{ data: Paginated<Ticket> }>("/api/v1/tickets", {
    params,
  });
  return res.data.data;
}

export async function adminGetTicketsByEventId(
  eventId: string,
  params: { page: number; size: number }
): Promise<Paginated<Ticket>> {
  const res = await API.get<{ data: Paginated<Ticket> }>(
    `/api/v1/tickets/event/${eventId}`,
    { params }
  );
  return res.data.data;
}

export async function adminGetTicketsByStatusId(
  statusId: number,
  params: { page: number; size: number }
): Promise<Paginated<Ticket>> {
  const res = await API.get<{ data: Paginated<Ticket> }>(
    `/api/v1/tickets/status/${statusId}`,
    { params }
  );
  return res.data.data;
}

export async function adminUpdateEvent(
  id: string,
  data: UpdateEventRequest
): Promise<Event> {
  const res = await API.put<{ data: Event }>(`/api/v1/events/${id}`, data);
  return res.data.data;
}

export async function adminDeleteEvent(id: string): Promise<void> {
  await API.delete(`/api/v1/events/${id}`);
}

// Admin Categories
export async function adminCreateCategory(
  data: CategoryRequest
): Promise<CategoryRequest> {
  const res = await API.post<{ data: CategoryRequest }>(
    "/api/v1/categories",
    data
  );
  return res.data.data;
}

export async function adminGetCategoryById(id: string): Promise<Category> {
  const res = await API.get<{ data: Category }>(`/api/v1/categories/${id}`);
  return res.data.data;
}

export async function adminUpdateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category> {
  const res = await API.put<{ data: Category }>(
    `/api/v1/categories/${id}`,
    data
  );
  return res.data.data;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await API.delete(`/api/v1/categories/${id}`);
}

// Admin Tickets
export async function adminCreateTicket(
  data: CreateTicketRequest
): Promise<Ticket> {
  const res = await API.post<{ data: Ticket }>("/api/v1/tickets", data);
  return res.data.data;
}

// Status Codes
export async function getAllStatuses(): Promise<StatusCode[]> {
  const res = await API.get<{ data: StatusCode[] }>("/api/v1/status-codes");
  return res.data.data;
}

export async function adminUpdateTicket(
  id: string,
  data: UpdateTicketRequest
): Promise<Ticket> {
  const res = await API.put<{ data: Ticket }>(`/api/v1/tickets/${id}`, data);
  return res.data.data;
}

export async function adminDeleteTicket(id: string): Promise<void> {
  await API.delete(`/api/v1/tickets/${id}`);
}

export async function adminGetTicketById(id: string): Promise<Ticket> {
  const res = await API.get<{ data: Ticket }>(`/api/v1/tickets/${id}`);
  return res.data.data;
}

export async function getCurrentUserInfo(): Promise<AuthResponse> {
  const res = await API.get<{ data: AuthResponse }>("/api/v1/auth/me");
  return res.data.data;
}

//Special
export interface PaymentResponseDTO {
  paymentUrl: string;
  purchaseId: string;
  paymentMethod: string;
  message: string;
}

export async function initiateTicketPurchase(
  payload: PurchaseTicketRequest
): Promise<PaymentResponseDTO> {
  const res = await API.post<{ data: PaymentResponseDTO }>(
    "/api/v1/ticket-purchase/initiate",
    payload
  );
  return res.data.data;
}

export async function confirmPurchase(
  purchaseId: string
): Promise<PurchaseTicketRequest> {
  // Nếu response là TicketPurchase, sửa lại nếu response khác
  const res = await API.post<{ data: TicketPurchase }>(
    `/api/v1/ticket-purchase/${purchaseId}`,
    { id: purchaseId, statusId: 27 }
  );
  return res.data.data;
}

export async function adminResetUserPassword(
  userId: string,
  payload: AdminResetPasswordRequest
): Promise<void> {
  try {
    const response = await API.patch(
      `/api/v1/users/${userId}/reset-password`,
      payload
    );
    if (response.status !== 200) {
      throw new Error("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Lỗi từ phía máy chủ.");
    }
    throw new Error("Không thể kết nối tới máy chủ.");
  }
}

export async function adminSearchUsers(params: {
  page: number;
  size: number;
  sort?: string;
  keyword: string;
}): Promise<Paginated<User>> {
  const res = await API.get<{ data: Paginated<User> }>("/api/v1/users/search", {
    params,
  });
  return res.data.data;
}

// Tìm kiếm sự kiện (GET)
export async function adminSearchEvents(params: {
  keyword: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<{
  content: Event[];
  totalPages: number;
  totalElements: number;
}> {
  try {
    const res = await API.get("/api/v1/events/search", {
      params,
      withCredentials: true,
    });
    return res.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    throw new Error("Không thể tìm kiếm sự kiện.");
  }
}

export async function searchEvents(params: {
  keyword: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Paginated<Event>> {
  try {
    const res = await API.get("/api/v1/events/search", {
      params,
      withCredentials: true,
    });
    return res.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    throw new Error("Không thể tìm kiếm sự kiện.");
  }
}

export async function adminGetOrganizers(): Promise<User[]> {
  try {
    const res = await API.get("/api/v1/users", {
      params: { size: 1000, role: "ROLE_ORGANIZER" },
      withCredentials: true,
    });
    // Đảm bảo trả về mảng user từ đúng cấu trúc backend trả về
    return res.data.data.content;
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    return [];
  }
}

// Upload user avatar
export async function uploadUserAvatar(
  userId: string,
  blob: Blob
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", blob);

    const res = await API.post(`/api/v1/users/${userId}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return res.data.data;
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    return null;
  }
}
