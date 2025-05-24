// =========================================
// Type Aliases & Generic Utilities
// =========================================

/** ISO 8601 date-time string */
export type ISODateString = string;

/** Generic paginated result */
export interface Paginated<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// =========================================
// API Response Structures
// =========================================

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: ISODateString;
}

export interface ApiErrorResponse {
  status: number;
  error?: string;
  message: string;
  path?: string;
  timestamp: ISODateString;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// =========================================
// Base & Status Types
// =========================================

export interface BaseEntity {
  id: string;
  createdAt: ISODateString;
}

/** Standardized status code */
export interface StatusCode {
  id: number;
  entityType: string; // e.g. "EVENT", "TICKET"
  status: string;
  description?: string;
}

// =========================================
// Category
// =========================================

export interface Category {
  id: string;
  createdAt: ISODateString;
  name: string;
  description?: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}
export type CreateCategoryRequest = CategoryRequest;
export type UpdateCategoryRequest = Partial<CategoryRequest>;

// =========================================
// User & Authentication
// =========================================

export enum UserRole {
  USER = "ROLE_USER",
  ADMIN = "ROLE_ADMIN",
  ORGANIZER = "ROLE_ORGANIZER",
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export type AuthUser = User | null;

export interface UserProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AdminCreateUserRequest {
  username: string;
  email: string;
  password?: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
}

export type AdminUpdateUserRequest = Partial<{
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}>;

// =========================================
// Authentication Flows
// =========================================

export interface LoginRequest {
  username: string;
  password: string;
  otp?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface AuthResponse {
  accessTokenExpiresIn: number;
  user: User;
  twoFactorRequired?: boolean;
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

export enum OtpType {
  TWO_FACTOR_AUTH_LOGIN = "2FA",
  PASSWORD_RESET = "PWD_RESET",
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  ENABLE_2FA_VERIFICATION = "ENABLE_2FA_VERIFICATION",
  DISABLE_2FA_CONFIRMATION_OTP = "DISABLE_2FA_CONFIRMATION_OTP",
}

export interface VerifyOtpRequest {
  identifier?: string;
  otp: string;
  otpType: OtpType;
}

export interface SentOtpRequest {
  identifier: string;
  otpType: OtpType;
}

export interface ResendOtpRequest {
  identifier: string;
  otpType: OtpType;
}

export interface Enable2FARequest {
  identifier: string;
}

export interface Enable2FAResponse {
  secretKey: string;
  otpAuthUrl: string;
  qrCodeDataUrl?: string;
  recoveryCodes?: string[];
}

export interface Disable2FARequest {
  identifier?: string;
  otp: string;
}

export interface AuthContextType {
  user: AuthUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (creds: LoginRequest) => Promise<ApiResponse<AuthResponse>>;
  register: (payload: RegisterRequest) => Promise<ApiResponse<User>>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

// =========================================
// Event Types
// =========================================

export interface EventBase {
  title: string;
  description: string;
  startDate: ISODateString;
  endDate: ISODateString;
  location: string;
  address?: string;
  coverImageUrl?: string;
  maxParticipants?: number;
  registrationStartDate?: ISODateString;
  registrationEndDate?: ISODateString;
  isPublic: boolean;
  latitude?: number;
  longitude?: number;
  categoryIds: string[];
}

export type CreateEventRequest = EventBase;
export type UpdateEventRequest = Partial<EventBase>;

export interface Event extends BaseEntity, EventBase {
  imageUrls?: string[];
  currentParticipants: number;
  categories: Category[];
  organizer: Pick<User, "id" | "username" | "fullName" | "avatarUrl">;
  status: StatusCode;
}

export interface EventDetail extends Event {
  tickets: Ticket[];
}

export type EventsPage = Paginated<Event>;

// =========================================
// Ticket Types
// =========================================

export interface TicketBase {
  ticketType: string;
  price: number;
  totalQuantity: number;
  saleStartDate?: ISODateString;
  saleEndDate?: ISODateString;
  description?: string;
  maxPerUser?: number;
  isFree: boolean;
  earlyBirdDiscount?: number;
  statusId: number;
}

export interface CreateTicketRequest extends TicketBase {
  eventId: string;
}
export type UpdateTicketRequest = Partial<TicketBase>;

export interface Ticket extends BaseEntity, TicketBase {
  eventId: string;
  availableQuantity: number;
  status: StatusCode;
}

// =========================================
// Ticket Purchase & QR Verification
// =========================================

export interface PurchaseTicketRequest {
  userId?: string;
  ticketId: string;
  quantity: number;
}

export interface TicketPurchase extends BaseEntity {
  userId: string;
  ticketId: string;
  quantity: number;
  purchaseDate: ISODateString;
  totalPrice: number;
  paymentMethod?: string;
  transactionId?: string;
  status: StatusCode;
  user?: Pick<User, "id" | "username" | "email">;
  ticket?: Ticket & {
    event?: Pick<
      Event,
      "id" | "title" | "startDate" | "location" | "coverImageUrl"
    >;
  };
}

export enum VerificationStatus {
  SUCCESS = "SUCCESS",
  ALREADY_CHECKED_IN = "ALREADY_CHECKED_IN",
  NOT_FOUND = "NOT_FOUND",
  INVALID_FORMAT = "INVALID_FORMAT",
  PURCHASE_INVALID = "PURCHASE_INVALID",
  TAMPERED = "TAMPERED",
  EXPIRED = "EXPIRED",
}

export interface QrCodeVerificationResult {
  status: VerificationStatus;
  message: string;
  ticketPurchase?: TicketPurchase;
}

// =========================================
// Event Participant
// =========================================

export interface CreateEventParticipantRequest {
  eventId: string;
  userId?: string;
  additionalGuests?: number;
}

export interface EventParticipant extends BaseEntity {
  eventId: string;
  userId: string;
  registrationDate: ISODateString;
  additionalGuests: number;
  status: StatusCode;
  event?: Pick<Event, "id" | "title">;
  user?: Pick<User, "id" | "username">;
}

// =========================================
// User Settings & Notifications
// =========================================

export type ThemeOption = "light" | "dark" | "system";

export interface UserSettings {
  receiveEventReminders: boolean;
  receiveNewEventNotifications: boolean;
  receivePromotionalEmails: boolean;
  theme: ThemeOption;
  syncWithGoogleCalendar: boolean;
}

export type UpdateUserSettingsRequest = Partial<UserSettings>;

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  url?: string;
  isRead: boolean;
}

// =========================================
// Payment
// =========================================

export interface PaymentUrlResponse {
  paymentUrl: string;
  purchaseId: string;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
}
