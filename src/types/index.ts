// ----------------------
// Category DTO
// ----------------------
export interface CategoryDTO {
  id?: string;
  name: string;
  description?: string;
  createdAt?: string; // ISO date
}

// ----------------------
// StatusCode DTO
// ----------------------
export interface StatusCodeDTO {
  id?: number;
  entityType: string;
  status: string;
  description?: string;
}

// ----------------------
// User Response DTO
// ----------------------
export interface UserResponseDTO {
  id: string;
  username: string;
  email?: string;
  role: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

// ----------------------
// Event DTOs
// ----------------------
export interface EventRequestDTO {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  address?: string;
  categoryId?: string;
  creatorId: string;
  maxParticipants?: number;
  registrationStartDate?: string;
  registrationEndDate?: string;
  isPublic?: boolean;
  coverImageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventResponseDTO {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  category: CategoryDTO;
  creator: UserResponseDTO;
  maxParticipants?: number;
  currentParticipants?: number;
  status: StatusCodeDTO;
  createdAt: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  isPublic: boolean;
  coverImageUrl?: string;
  latitude?: number;
  longitude?: number;
}

// ----------------------
// Ticket DTOs
// ----------------------
export interface TicketDTO {
  id?: string;
  eventId: string;
  ticketType: string;
  price: number;
  totalQuantity: number;
  availableQuantity?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  statusId: number;
  maxPerUser?: number;
  description?: string;
  earlyBirdDiscount?: number;
  isFree?: boolean;
}

export interface TicketResponseDTO {
  id: string;
  eventId: string;
  ticketType: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  saleStartDate?: string;
  saleEndDate?: string;
  status: StatusCodeDTO;
  maxPerUser?: number;
  description?: string;
  earlyBirdDiscount?: number;
  isFree?: boolean;
}

// ----------------------
// Ticket Purchase DTOs
// ----------------------
export interface TicketPurchaseDTO {
  userId: string;
  ticketId: string;
  quantity: number;
  statusId: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface TicketPurchaseResponseDTO {
  id: string;
  userId: string;
  ticketId: string;
  quantity: number;
  purchaseDate: string;
  totalPrice: number;
  statusId: number;
  paymentMethod?: string;
  transactionId?: string;
}
export interface Page<T> {
  content: T[]; // danh sách phần tử
  totalElements: number; // tổng số phần tử
  totalPages: number; // tổng số trang
  number: number; // trang hiện tại (bắt đầu từ 0)
  size: number; // kích thước trang
  numberOfElements: number; // số phần tử trong trang hiện tại
  first: boolean; // có phải trang đầu không
  last: boolean; // có phải trang cuối không
  empty: boolean; // có rỗng không
}

// =========================================
// User Types
// =========================================

export interface UserType {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
}

// =========================================
// Authentication Types
// =========================================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  email: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface Enable2FARequest {
  username: string;
}

export interface Disable2FARequest {
  username: string;
  otp: string;
}

export interface SentOtpRequest {
  username: string;
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

export interface ResendOtpRequest {
  username: string;
  otpType: "2FA" | "PWD_RESET";
}

// Kết quả trả về từ login: phải khớp với TokenResponse.java
export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  twoFactorEnabled: boolean;
  user: UserType;
}

// Dạng user lưu trong context
export type AuthUser = UserType & { id: string };

// Context API cho AuthProvider
export interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isLoading: boolean;

  login: (creds: LoginCredentials) => Promise<TokenResponse>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshToken: () => Promise<TokenResponse>;
  logout: () => void;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  twoFactorEnabled: boolean;
  user: UserType;
}

// ------------------------------------
// Event (tối giản cho TicketPurchaseCard)
// ------------------------------------
export interface EventType {
  id: string;
  title: string;
  imageUrl: string;
  startDate: string;
  location: string;
}

// ------------------------------------
// Ticket template
// ------------------------------------
export interface TicketType {
  id: string;
  eventId: string;
  ticketType: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  saleStartDate?: string;
  saleEndDate?: string;
  status: StatusCodeDTO;
  maxPerUser?: number;
  description?: string;
  earlyBirdDiscount?: number;
  isFree?: boolean;
}

// ------------------------------------
// Đơn mua vé của user
// ------------------------------------
export interface TicketPurchaseType {
  id: string;
  userId: string;
  ticketId: string;
  quantity: number;
  purchaseDate: string;
  totalPrice: number;
  statusId: number;
  status: StatusCodeDTO;
  paymentMethod?: string;
  transactionId?: string;

  // Nếu bạn muốn render thêm thông tin event trực tiếp trong card:
  event: EventType;

  // Và để lấy tên/ticketType, bạn có thể embed luôn ticket:
  ticket: TicketType;
}

// =========================================
// User Profile Type
// =========================================
export interface UserProfileType {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserUpdatePayload {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface PaymentResponseDTO {
  paymentUrl: string;
  purchaseId: string;
  paymentMethod: string;
  message: string;
}
