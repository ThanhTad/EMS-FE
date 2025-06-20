import axios, { AxiosResponse } from "axios";
import {
  // Generic
  ApiResponse,
  Paginated,
  StatusCode,

  // Auth & User
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RequestPasswordResetRequest,
  VerifyOtpRequest,
  ResetPasswordVerificationResponse,
  ResetPasswordWithTokenRequest,
  SentOtpRequest,
  ResendOtpRequest,
  Enable2FARequest,
  Disable2FARequest,
  User,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminResetPasswordRequest,
  AuthUser,

  // Venue & Seating
  Venue,
  SeatMap,
  SeatSection,
  EventSeatStatus,

  // Event & Category
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  Category,
  CategoryRequest,

  // Ticket
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,

  // Purchase & Payment
  TicketPurchase,
  TicketPurchaseDetail,
  InitiatePurchaseRequest,
  PaymentUrlResponse,

  // Other
  Notification,
  UserSettings,
  UpdateUserSettingsRequest,
  EventDiscussion,
  Seat,
  UpdateSeatMapRequest,
  EventSearchParams,
} from "@/types";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Crucial for sending cookies
});

// =========================================
// Interceptors (Optional but recommended)
// =========================================
// You can add interceptors here to handle token refresh automatically
// or for global error handling.

// =========================================
// Authentication
// =========================================

export const loginAPI = (
  creds: LoginRequest
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
  API.post("/api/v1/auth/login", creds);

export const refreshTokenAPI = (): Promise<AuthResponse> =>
  API.post("/api/v1/auth/rf-token").then((res) => res.data.data);

export const registerAPI = (
  payload: RegisterRequest
): Promise<AxiosResponse<ApiResponse<User>>> =>
  API.post("/api/v1/auth/register", payload);

export const logoutAPI = (): Promise<AxiosResponse> =>
  API.post("/api/v1/auth/logout");

export const getCurrentUserAPI = (): Promise<AuthUser> =>
  API.get<ApiResponse<AuthUser>>("/api/v1/auth/me").then(
    (res) => res.data.data
  );

// --- Password Reset ---
export const requestPasswordResetAPI = (
  data: RequestPasswordResetRequest
): Promise<AxiosResponse> => API.post("/api/v1/auth/pass-reset/request", data);

export const verifyPasswordResetOtpAPI = (
  data: VerifyOtpRequest
): Promise<ResetPasswordVerificationResponse> =>
  API.post<ApiResponse<ResetPasswordVerificationResponse>>(
    "/api/v1/auth/pass-reset/verify-otp",
    data
  ).then((res) => res.data.data);

export const resetPasswordAPI = (
  data: ResetPasswordWithTokenRequest
): Promise<AxiosResponse> => API.post("/api/v1/auth/pass-reset/confirm", data);

// --- OTP & 2FA ---
export const verifyEmailOtpAPI = (data: VerifyOtpRequest): Promise<unknown> =>
  API.post("/api/v1/auth/email/verify", data).then((res) => res.data.data);

export const sendOtpToEnable2FAAPI = (data: SentOtpRequest): Promise<void> =>
  API.post<ApiResponse<void>>("/api/v1/auth/2fa/enable/sent-otp", data).then(
    (res) => res.data.data
  );

export const enable2FAAPI = (data: Enable2FARequest): Promise<void> =>
  API.post<ApiResponse<void>>("/api/v1/auth/2fa/enable", data).then(
    (res) => res.data.data
  );

export const sendOtpToDisable2FAAPI = (data: SentOtpRequest): Promise<void> =>
  API.post<ApiResponse<void>>("/api/v1/auth/2fa/disable/sent-otp", data).then(
    (res) => res.data.data
  );

export const disable2FAAPI = (data: Disable2FARequest): Promise<void> =>
  API.post<ApiResponse<void>>("/api/v1/auth/2fa/disable", data).then(
    (res) => res.data.data
  );

export const verify2FAAPI = (data: VerifyOtpRequest): Promise<AuthResponse> =>
  API.post<ApiResponse<AuthResponse>>("/api/v1/auth/2fa/verify", data).then(
    (res) => res.data.data
  );

export const resendOtpAPI = (data: ResendOtpRequest): Promise<void> =>
  API.post<ApiResponse<void>>("/api/v1/auth/otp/resend", data).then(
    (res) => res.data.data
  );

// =========================================
// Users & Profile
// =========================================
export const getUserProfile = (userId: string): Promise<User> =>
  API.get<ApiResponse<User>>(`/api/v1/users/${userId}`).then(
    (res) => res.data.data
  );

export const updateUserProfile = (
  userId: string,
  payload: Partial<User>
): Promise<User> =>
  API.put<ApiResponse<User>>(`/api/v1/users/${userId}/profile`, payload).then(
    (res) => res.data.data
  );

export const uploadAvatar = (file: Blob): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post<ApiResponse<{ url: string }>>(
    "/api/v1/users/me/avatar",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  ).then((res) => res.data.data);
};

// =========================================
// Venues (NEW)
// =========================================
export const getVenues = (params: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Paginated<Venue>> =>
  API.get<ApiResponse<Paginated<Venue>>>("/api/v1/venues", { params }).then(
    (res) => res.data.data
  );

export const getVenueById = (id: string): Promise<Venue> =>
  API.get<ApiResponse<Venue>>(`/api/v1/venues/${id}`).then(
    (res) => res.data.data
  );

export const createVenue = (
  data: Omit<Venue, "id" | "createdAt" | "updatedAt">
): Promise<Venue> =>
  API.post<ApiResponse<Venue>>("/api/v1/venues", data).then(
    (res) => res.data.data
  );

export const updateVenue = (
  id: string,
  data: Partial<Omit<Venue, "id" | "createdAt" | "updatedAt">>
): Promise<Venue> =>
  API.put<ApiResponse<Venue>>(`/api/v1/venues/${id}`, data).then(
    (res) => res.data.data
  );

export const deleteVenue = (id: string): Promise<void> =>
  API.delete(`/api/v1/venues/${id}`);

// =========================================
// Seat Maps & Sections (NEW)
// =========================================
export const getSeatMapsByVenue = (
  venueId: string,
  params: { page?: number; size?: number }
): Promise<Paginated<SeatMap>> =>
  API.get<ApiResponse<Paginated<SeatMap>>>(
    `/api/v1/venues/${venueId}/seat-maps`,
    { params }
  ).then((res) => res.data.data);

export const getSeatMapDetails = (
  id: string
): Promise<SeatMap & { sections: (SeatSection & { seats: Seat[] })[] }> =>
  API.get<
    ApiResponse<SeatMap & { sections: (SeatSection & { seats: Seat[] })[] }>
  >(`/api/v1/seat-maps/${id}/details`).then((res) => res.data.data);

export const createSeatMap = (
  data: Omit<SeatMap, "id" | "createdAt" | "updatedAt">
): Promise<SeatMap> =>
  API.post<ApiResponse<SeatMap>>("/api/v1/seat-maps", data).then(
    (res) => res.data.data
  );

export const updateSeatMap = (
  id: string,
  data: UpdateSeatMapRequest
): Promise<SeatMap> => // 'data' can be complex, containing sections and seats
  API.put<ApiResponse<SeatMap>>(`/api/v1/seat-maps/${id}`, data).then(
    (res) => res.data.data
  );

export const deleteSeatMap = (id: string): Promise<void> =>
  API.delete(`/api/v1/seat-maps/${id}`);

// =========================================
// Events
// =========================================
export const getEvents = (
  params: EventSearchParams
): Promise<Paginated<Event>> =>
  API.get<ApiResponse<Paginated<Event>>>("/api/v1/events", { params }).then(
    (res) => res.data.data
  );

export const getEventBySlug = (slug: string): Promise<Event> =>
  API.get<ApiResponse<Event>>(`/api/v1/events/slug/${slug}`).then(
    (res) => res.data.data
  );

export const getEventById = (
  eventId: string
): Promise<Event> => // Keep for internal use/deep linking
  API.get<ApiResponse<Event>>(`/api/v1/events/${eventId}`).then(
    (res) => res.data.data
  );

export const searchEvents = (
  params: EventSearchParams
): Promise<Paginated<Event>> =>
  API.get<ApiResponse<Paginated<Event>>>("/api/v1/events/search", {
    params,
  }).then((res) => res.data.data);

// --- Event Seating ---
export const getEventSeatStatuses = (
  eventId: string
): Promise<EventSeatStatus[]> =>
  API.get<ApiResponse<EventSeatStatus[]>>(
    `/api/v1/events/${eventId}/seat-status`
  ).then((res) => res.data.data);

// =========================================
// Categories
// =========================================
export const getCategories = (params?: {
  page?: number;
  size?: number;
}): Promise<Paginated<Category>> =>
  API.get<ApiResponse<Paginated<Category>>>("/api/v1/categories", {
    params: { size: 1000, ...params },
  }).then((res) => res.data.data);

export const getCategoryById = (id: string): Promise<Category> =>
  API.get<ApiResponse<Category>>(`/api/v1/categories/${id}`).then(
    (res) => res.data.data
  );

// =========================================
// Tickets
// =========================================
export const getTicketsByEventId = (
  eventId: string,
  params?: { page?: number; size?: number }
): Promise<Paginated<Ticket>> =>
  API.get<ApiResponse<Paginated<Ticket>>>(`/api/v1/events/${eventId}/tickets`, {
    params,
  }).then((res) => res.data.data);

// =========================================
// Ticket Purchase & Payment
// =========================================
export const initiateTicketPurchase = (
  payload: InitiatePurchaseRequest
): Promise<PaymentUrlResponse> =>
  API.post<ApiResponse<PaymentUrlResponse>>(
    "/api/v1/purchases/initiate",
    payload
  ).then((res) => res.data.data);

export const getPurchaseByTransactionId = (
  transactionId: string
): Promise<TicketPurchase> =>
  API.get<ApiResponse<TicketPurchase>>(
    `/api/v1/purchases/transaction/${transactionId}`
  ).then((res) => res.data.data);

export const getPurchaseById = (purchaseId: string): Promise<TicketPurchase> =>
  API.get<ApiResponse<TicketPurchase>>(`/api/v1/purchases/${purchaseId}`).then(
    (res) => res.data.data
  );

export const getUserPurchases = (
  userId: string,
  params: { page: number; size: number }
): Promise<Paginated<TicketPurchase>> =>
  API.get<ApiResponse<Paginated<TicketPurchase>>>(
    `/api/v1/users/${userId}/purchases`,
    { params }
  ).then((res) => res.data.data);

export const getUserPurchaseDetails = (
  userId: string,
  params: { page: number; size: number }
): Promise<Paginated<TicketPurchaseDetail>> =>
  API.get<ApiResponse<Paginated<TicketPurchaseDetail>>>(
    `/api/v1/users/${userId}/purchases/details`,
    { params }
  ).then((res) => res.data.data);

// --- QR Codes ---
export const getQrCodeForPurchase = (purchaseId: string): Promise<Blob> =>
  API.get(`/api/v1/qr-codes/purchase/${purchaseId}`, {
    responseType: "blob",
  }).then((res) => res.data);

// NOTE: You might need more granular QR code fetching, e.g., for a specific seat or GA ticket item.
// export const getQrCodeForSeat = (eventSeatId: string): Promise<Blob> => ...
// export const getQrCodeForGaTicket = (purchasedGaTicketId: string): Promise<Blob> => ...

// =========================================
// Event Discussions (NEW)
// =========================================
export const getDiscussionsByEvent = (
  eventId: string,
  params: { page?: number; size?: number }
): Promise<Paginated<EventDiscussion>> =>
  API.get<ApiResponse<Paginated<EventDiscussion>>>(
    `/api/v1/events/${eventId}/discussions`,
    { params }
  ).then((res) => res.data.data);

export const createDiscussion = (data: {
  eventId: string;
  content: string;
  parentCommentId?: string;
}): Promise<EventDiscussion> =>
  API.post<ApiResponse<EventDiscussion>>("/api/v1/discussions", data).then(
    (res) => res.data.data
  );

export const deleteDiscussion = (id: string): Promise<void> =>
  API.delete(`/api/v1/discussions/${id}`);

// =========================================
// Notifications & Settings
// =========================================
export const getUnreadNotifications = (
  page = 0,
  size = 10
): Promise<Paginated<Notification>> =>
  API.get<ApiResponse<Paginated<Notification>>>(
    "/api/v1/notifications/unread",
    { params: { page, size } }
  ).then((res) => res.data.data);

export const markNotificationsRead = (ids: string[]): Promise<void> =>
  API.post("/api/v1/notifications/mark-read", { ids });

export const getUserSettings = (): Promise<UserSettings> =>
  API.get<ApiResponse<UserSettings>>("/api/v1/users/me/settings").then(
    (res) => res.data.data
  );

export const updateUserSettings = (
  payload: UpdateUserSettingsRequest
): Promise<UserSettings> =>
  API.patch<ApiResponse<UserSettings>>(
    "/api/v1/users/me/settings",
    payload
  ).then((res) => res.data.data);

// =========================================
// ADMIN Endpoints
// =========================================

// --- Admin: Users ---
export const adminGetUsers = (params: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Paginated<User>> =>
  API.get<ApiResponse<Paginated<User>>>("/api/v1/admin/users", { params }).then(
    (res) => res.data.data
  );

export const adminSearchUsers = (params: {
  keyword: string;
  page: number;
  size: number;
  sort?: string;
}): Promise<Paginated<User>> =>
  API.get<ApiResponse<Paginated<User>>>("/api/v1/admin/users/search", {
    params,
  }).then((res) => res.data.data);

export const adminCreateUser = (data: AdminCreateUserRequest): Promise<User> =>
  API.post<ApiResponse<User>>("/api/v1/admin/users", data).then(
    (res) => res.data.data
  );

export const adminUpdateUser = (
  id: string,
  data: AdminUpdateUserRequest
): Promise<User> =>
  API.patch<ApiResponse<User>>(`/api/v1/admin/users/${id}`, data).then(
    (res) => res.data.data
  );

export const adminDeleteUser = (id: string): Promise<void> =>
  API.delete(`/api/v1/admin/users/${id}`);

export const adminResetUserPassword = (
  userId: string,
  payload: AdminResetPasswordRequest
): Promise<void> =>
  API.patch(`/api/v1/admin/users/${userId}/reset-password`, payload);

// --- Admin: Events ---
export const adminCreateEvent = (data: CreateEventRequest): Promise<Event> =>
  API.post<ApiResponse<Event>>("/api/v1/admin/events", data).then(
    (res) => res.data.data
  );

export const adminUpdateEvent = (
  id: string,
  data: UpdateEventRequest
): Promise<Event> =>
  API.put<ApiResponse<Event>>(`/api/v1/admin/events/${id}`, data).then(
    (res) => res.data.data
  );

export const adminDeleteEvent = (id: string): Promise<void> =>
  API.delete(`/api/v1/admin/events/${id}`);

// --- Admin: Categories ---
export const adminCreateCategory = (data: CategoryRequest): Promise<Category> =>
  API.post<ApiResponse<Category>>("/api/v1/admin/categories", data).then(
    (res) => res.data.data
  );

export const adminUpdateCategory = (
  id: string,
  data: Partial<Category>
): Promise<Category> =>
  API.put<ApiResponse<Category>>(`/api/v1/admin/categories/${id}`, data).then(
    (res) => res.data.data
  );

export const adminDeleteCategory = (id: string): Promise<void> =>
  API.delete(`/api/v1/admin/categories/${id}`);

// --- Admin: Tickets ---
export const adminGetTicketsByEvent = (
  eventId: string,
  params?: { page?: number; size?: number }
): Promise<Paginated<Ticket>> =>
  API.get<ApiResponse<Paginated<Ticket>>>(
    `/api/v1/admin/events/${eventId}/tickets`,
    { params }
  ).then((res) => res.data.data);

export const adminCreateTicket = (data: CreateTicketRequest): Promise<Ticket> =>
  API.post<ApiResponse<Ticket>>("/api/v1/admin/tickets", data).then(
    (res) => res.data.data
  );

export const adminUpdateTicket = (
  id: string,
  data: UpdateTicketRequest
): Promise<Ticket> =>
  API.put<ApiResponse<Ticket>>(`/api/v1/admin/tickets/${id}`, data).then(
    (res) => res.data.data
  );

export const adminDeleteTicket = (id: string): Promise<void> =>
  API.delete(`/api/v1/admin/tickets/${id}`);

// --- Admin: Statuses ---
export const getAllStatuses = (): Promise<StatusCode[]> =>
  API.get<ApiResponse<StatusCode[]>>("/api/v1/status-codes").then(
    (res) => res.data.data
  );

// <<< THÊM HÀM NÀY
/** Lấy danh sách đơn hàng đã được rút gọn cho trang "Vé của tôi" */
export const getTicketPurchaseDetailsByUser = (
  userId: string,
  params: { page: number; size: number }
): Promise<Paginated<TicketPurchaseDetail>> =>
  API.get<ApiResponse<Paginated<TicketPurchaseDetail>>>(
    `/api/v1/users/${userId}/purchases/details`,
    { params }
  ).then((res) => res.data.data);

// --- QR Codes ---

// <<< THÊM 2 HÀM NÀY
/** Lấy QR code dưới dạng hình ảnh (Blob) để hiển thị trên web */
export const getQrCodeByPurchaseId = (purchaseId: string): Promise<Blob> =>
  API.get(`/api/v1/qr-codes/purchase/${purchaseId}`, {
    responseType: "blob",
  }).then((res) => res.data);

/** Tải file QR code về máy người dùng */
export const downloadQrCode = async (purchaseId: string): Promise<void> => {
  const response = await API.get(
    `/api/v1/qr-codes/purchase/${purchaseId}/download`,
    {
      responseType: "blob",
    }
  );

  const contentDisposition = response.headers["content-disposition"];
  let filename = `qr-code-${purchaseId}.png`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (filenameMatch?.[1]) {
      filename = filenameMatch[1];
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
