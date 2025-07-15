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
  UpdateSeatMapRequest,
  EventSearchParams,
  CreateVenueRequest,
  UpdateVenueRequest,
  ZoneWithTicketsDTO,
  SeatMapDetail,
  PaymentDetails,
  TicketPurchaseConfirmation,
  EventTicketingDetails,
  TicketHoldRequest,
  HoldResponse,
  DialogflowRequest,
  DialogflowResponse,
} from "@/types";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
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

export const getCurrentUserAPI = (): Promise<User> =>
  API.get<ApiResponse<User>>("/api/v1/auth/me").then((res) => res.data.data);

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
  API.put<ApiResponse<User>>(`/api/v1/users/${userId}`, payload).then(
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
  keyword?: string;
  sort?: string;
}): Promise<Paginated<Venue>> =>
  API.get<ApiResponse<Paginated<Venue>>>("/api/v1/venues", { params }).then(
    (res) => res.data.data
  );

export const getVenueById = (id: string): Promise<Venue> =>
  API.get<ApiResponse<Venue>>(`/api/v1/venues/${id}`).then(
    (res) => res.data.data
  );

export const createVenue = (data: CreateVenueRequest): Promise<Venue> =>
  API.post<ApiResponse<Venue>>("/api/v1/venues", data).then(
    (res) => res.data.data
  );

export const updateVenue = (
  id: string,
  data: UpdateVenueRequest
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

export const getZonedTicketsForEvent = (
  eventId: string
): Promise<ZoneWithTicketsDTO[]> =>
  API.get<ApiResponse<ZoneWithTicketsDTO[]>>(
    `/api/v1/events/${eventId}/zoned-tickets`
  ).then((res) => res.data.data);

export const getSeatMapDetails = (seatMapId: string): Promise<SeatMapDetail> =>
  API.get<ApiResponse<SeatMapDetail>>(
    `/api/v1/seat-maps/${seatMapId}/details`
  ).then((res) => res.data.data);

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

export const getTicketsById = (
  eventId: string,
  params?: { page?: number; size?: number }
): Promise<Ticket> =>
  API.get<ApiResponse<Ticket>>(`/api/v1/events/${eventId}`, {
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
export const getUserNotifications = (params: {
  page?: number;
  size?: number;
}): Promise<Paginated<Notification>> =>
  API.get<ApiResponse<Paginated<Notification>>>(
    "/api/v1/notifications", // Endpoint chính: GET /api/v1/notifications
    { params }
  ).then((res) => res.data.data);

export const getUnreadNotificationCount = (): Promise<number> =>
  API.get<ApiResponse<number>>(
    "/api/v1/notifications/unread-count" // Endpoint đếm
  ).then((res) => res.data.data);

export const markNotificationsAsRead = (ids: string[]): Promise<void> =>
  API.post("/api/v1/notifications/mark-as-read", { ids });

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

export const getSectionsForEvent = (eventId: string): Promise<SeatSection[]> =>
  API.get<ApiResponse<SeatSection[]>>(
    `/api/v1/events/${eventId}/sections`
  ).then((res) => res.data.data);

export const adminGetOrganizers = (): Promise<User[]> =>
  API.get<ApiResponse<User[]>>("/api/v1/admin/organizers").then(
    (res) => res.data.data
  );

interface AdminGetEventsParams {
  page?: number;
  size?: number;
  sort?: string;
  organizerId?: string;
}
export const adminGetEvents = (
  params: AdminGetEventsParams
): Promise<Paginated<Event>> =>
  API.get<ApiResponse<Paginated<Event>>>("/api/v1/admin/events", {
    params,
  }).then((res) => res.data.data);

interface AdminGetTicketsParams {
  page?: number;
  size?: number;
  sort?: string;
  eventId?: string;
  statusId?: string;
  organizerId?: string;
}

export const adminGetTickets = (
  params: AdminGetTicketsParams
): Promise<Paginated<Ticket>> =>
  API.get<ApiResponse<Paginated<Ticket>>>("/api/v1/admin/tickets", {
    params,
  }).then((res) => res.data.data);

export const adminGetEventsByStatus = (
  status: string,
  params: { page?: number; size?: number }
): Promise<Paginated<Event>> =>
  API.get<ApiResponse<Paginated<Event>>>(`/api/v1/admin/events`, {
    params: { ...params, status }, // Thêm status vào query params
  }).then((res) => res.data.data);

/**
 * [ADMIN] Duyệt một sự kiện.
 * @param eventId - ID của sự kiện cần duyệt
 * @returns Thông tin sự kiện đã được cập nhật
 */
export const adminApproveEvent = (eventId: string): Promise<Event> =>
  API.patch<ApiResponse<Event>>(`/api/v1/admin/events/${eventId}/approve`).then(
    (res) => res.data.data
  );

/**
 * [ADMIN] Từ chối một sự kiện.
 * @param eventId - ID của sự kiện cần từ chối
 * @param payload - Dữ liệu chứa lý do từ chối { reason: string }
 * @returns Thông tin sự kiện đã được cập nhật
 */
export const adminRejectEvent = (eventId: string): Promise<Event> =>
  API.patch<ApiResponse<Event>>(`/api/v1/admin/events/${eventId}/reject`).then(
    (res) => res.data.data
  );

/**
 * Lấy tất cả thông tin sự kiện và vé trong một lần gọi duy nhất.
 * @param slug - Slug của sự kiện
 * @returns - Dữ liệu chi tiết của sự kiện và vé
 */
export const getEventTicketingBySlug = (
  slug: string
): Promise<EventTicketingDetails> =>
  API.get<ApiResponse<EventTicketingDetails>>(
    `/api/v1/ticketing/events/slug/${slug}`
  ).then((res) => res.data.data);

// --- HOLD & CHECKOUT APIs ---

/**
 * Gửi yêu cầu giữ vé tạm thời.
 * @param eventId - ID của sự kiện
 * @param payload - Dữ liệu yêu cầu giữ vé
 * @returns - ID và thời gian hết hạn của phiên giữ vé
 */
export const holdTicketsAPI = (
  eventId: string,
  payload: TicketHoldRequest
): Promise<HoldResponse> =>
  API.post<ApiResponse<HoldResponse>>(
    `/api/v1/ticketing/events/${eventId}/hold`,
    payload
  ).then((res) => res.data.data);

/**
 * Gửi yêu cầu nhả vé đã giữ.
 * @param holdId - ID của phiên giữ vé
 */
export const releaseTicketsAPI = (holdId: string): Promise<void> =>
  API.post(`/api/v1/ticketing/release?holdId=${holdId}`).then(
    (res) => res.data.data
  );

/**
 * Gửi yêu cầu thanh toán và chốt đơn.
 * @param holdId - ID của phiên giữ vé
 * @param payload - Chi tiết thanh toán
 * @returns - Xác nhận đơn hàng đã mua
 */
export const checkoutAPI = (
  holdId: string,
  payload: PaymentDetails
): Promise<TicketPurchaseConfirmation> =>
  API.post<ApiResponse<TicketPurchaseConfirmation>>(
    `/api/v1/ticketing/checkout?holdId=${holdId}`,
    payload
  ).then((res) => res.data.data);

const apiClient = axios.create({
  // Không cần baseURL vì API Route của Next.js là một đường dẫn tương đối
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Gửi một tin nhắn từ người dùng đến Backend-for-Frontend (BFF) của chúng ta.
 * BFF sẽ chịu trách nhiệm gọi đến Dialogflow một cách an toàn.
 *
 * @param request - Đối tượng chứa text và sessionId của người dùng.
 * @returns Một Promise chứa câu trả lời từ chatbot.
 */
export const sendChatMessageToApi = async (
  request: DialogflowRequest
): Promise<DialogflowResponse> => {
  try {
    // 1. GỌI ĐẾN ENDPOINT BFF MÀ BẠN ĐÃ TẠO
    // Frontend chỉ cần biết đến endpoint này.
    const response = await apiClient.post<DialogflowResponse>(
      "/api/chat/query",
      request
    );

    // 2. TRẢ VỀ DỮ LIỆU ĐÃ ĐƯỢC BFF XỬ LÝ
    // BFF đã làm hết việc khó (gọi Dialogflow, xử lý lỗi),
    // nên chúng ta chỉ cần trả về `data` của nó.
    return response.data;
  } catch (error) {
    console.error("Error sending message via BFF:", error);

    // Xử lý lỗi một cách thân thiện hơn
    if (axios.isAxiosError(error) && error.response) {
      // Nếu BFF trả về một lỗi có cấu trúc, hãy dùng nó
      const errorMessage =
        error.response.data?.error ||
        "An error occurred while connecting to the chat service.";
      throw new Error(errorMessage);
    }

    // Lỗi mạng hoặc lỗi không xác định khác
    throw new Error(
      "Unable to connect to the chat service. Please check your network connection."
    );
  }
};
