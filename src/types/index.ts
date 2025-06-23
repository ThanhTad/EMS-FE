// =========================================
// Type Aliases & Generic Utilities
// =========================================

/** ISO 8601 date-time string with timezone */
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
  updatedAt?: ISODateString;
}

/** Standardized status code from status_codes table */
export interface StatusCode {
  id: number;
  entityType: string; // e.g., "EVENT", "TICKET", "USER"
  status: string;
  description?: string;
}

// =========================================
// User & Authentication
// =========================================

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
}

export interface User extends BaseEntity {
  id: string; // Override BaseEntity for clarity
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: ISODateString;
  statusId?: number;
  status?: StatusCode; // Populated from backend
  createdAt: ISODateString;
}

export type AuthUser = Omit<User, "status"> | null;

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
  statusId: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}>;

// =========================================
// Authentication Flows (Largely unchanged, but ensure consistency)
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
  accessTokenExpiresIn?: number;
  twoFactorEnabled?: boolean;
  challengeToken?: string;
  user?: User;
}

// ... Các types khác của Auth Flow (ResetOtpResponse, RefreshTokenRequest, etc.) giữ nguyên ...
// (Phần này không có thay đổi lớn từ DB, nên tôi sẽ giữ nguyên để tiết kiệm không gian)
export interface ResetOtpResponse {
  message: string;
  resetToken: string;
}
export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface RequestPasswordResetRequest {
  email: string;
}
export interface ResetPasswordWithTokenRequest {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ResetPasswordVerificationResponse {
  resetToken: string;
  message: string;
  expiresAt: number;
}
export enum OtpType {
  TWO_FACTOR_AUTH_LOGIN = "2FA",
  PASSWORD_RESET = "PWD_RESET",
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  ENABLE_2FA_VERIFICATION = "ENABLE_2FA_VERIFICATION",
  DISABLE_2FA_VERIFICATION = "DISABLE_2FA_VERIFICATION",
}
export interface VerifyOtpRequest {
  identifier?: string;
  otp: string;
  otpType: OtpType;
  challengeToken?: string;
}
export interface SentOtpRequest {
  username: string;
  otpType: OtpType;
}
export interface ResendOtpRequest {
  identifier: string;
  otpType: OtpType;
  challengeToken?: string;
}
export interface Enable2FARequest {
  username: string;
  otp: string;
}
export interface Enable2FAResponse {
  secretKey: string;
  otpAuthUrl: string;
  qrCodeDataUrl?: string;
  recoveryCodes?: string[];
}
export interface Disable2FARequest {
  username?: string;
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
  fetchUser: () => Promise<void>;
}

// =========================================
// Venue & Seating (NEW)
// =========================================

export interface SeatCoordinates {
  x: number;
  y: number;
}

export interface Venue {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SeatMap {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  venue?: Venue; // Populated from backend
}

export interface SeatSection {
  id: string;
  seatMapId: string;
  name: string;
  capacity: number;
  layoutData?: Record<string, unknown>; // jsonb
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Seat {
  id: string;
  sectionId: string;
  rowLabel: string;
  seatNumber: string;
  seatType?: string;
  coordinates?: SeatCoordinates; // jsonb
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  city: string;
  country: string;
}

export type UpdateVenueRequest = Partial<CreateVenueRequest>;

// =========================================
// Category
// =========================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: ISODateString;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

// =========================================
// Event
// =========================================

export enum TicketSelectionModeEnum {
  GENERAL_ADMISSION = "GENERAL_ADMISSION", // Vé phổ thông, không chọn chỗ
  SEATED = "SEATED", // Sự kiện có sơ đồ chỗ ngồi
}

export interface Event {
  id: string;
  title: string;
  slug?: string; // NEW
  description?: string;
  startDate: ISODateString;
  endDate: ISODateString;
  isPublic: boolean;
  coverImageUrl?: string;
  ticketSelectionMode: TicketSelectionModeEnum; // NEW

  // Relationships
  creatorId?: string;
  venueId?: string; // NEW
  seatMapId?: string; // NEW
  statusId?: number;

  // Populated data from backend
  creator?: Pick<User, "id" | "username" | "fullName" | "avatarUrl">;
  venue?: Venue; // NEW
  categories?: Category[];
  status?: StatusCode;
  tickets?: Ticket[]; // Can be populated

  seatMap?: SeatMap & { sections: SeatSection[] };

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: ISODateString;
  endDate: ISODateString;
  isPublic: boolean;
  coverImageUrl?: string;
  ticketSelectionMode: TicketSelectionModeEnum;
  creatorId: string;
  venueId: string;
  seatMapId?: string; // Required if mode is 'SEATED'
  statusId: number;
  categoryIds: string[];
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

// =========================================
// Ticket
// =========================================

export interface Ticket {
  id: string;
  eventId: string;
  name: string; // Changed from ticketType
  description?: string;
  price: number;
  saleStartDate?: ISODateString;
  saleEndDate?: ISODateString;
  ticketSelectionMode?: TicketSelectionModeEnum;

  // For GA tickets
  totalQuantity?: number;
  availableQuantity?: number;
  maxPerPurchase?: number;

  // For Seated tickets
  appliesToSectionId?: string; // NEW: links ticket price to a section

  // Relationships
  statusId?: number;
  status?: StatusCode; // Populated from backend

  // Dữ liệu được populate từ backend để hiển thị trên bảng
  event?: Pick<Event, "id" | "title" | "creatorId" | "seatMap">;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateTicketRequest {
  eventId: string;
  name: string;
  price: number;
  description?: string;
  saleStartDate?: ISODateString;
  saleEndDate?: ISODateString;
  totalQuantity?: number; // For GA
  maxPerPurchase?: number; // For GA
  appliesToSectionId?: string; // For Seated
  statusId: number;
}

export type UpdateTicketRequest = Partial<Omit<CreateTicketRequest, "eventId">>;

// =========================================
// Ticket Purchase & QR
// =========================================

export enum EventSeatStatusEnum {
  AVAILABLE = "available",
  HELD = "held",
  SOLD = "sold",
  RESERVED = "reserved",
}

/** Represents a specific seat's status for a specific event */
export interface EventSeatStatus {
  id: string;
  eventId: string;
  seatId: string;
  status: EventSeatStatusEnum;
  ticketPurchaseId?: string;
  ticketId?: string; // The ticket type/price applied to this seat
  priceAtPurchase?: number;
  heldUntil?: ISODateString;
  seat?: Seat; // Populated from backend
}

/** Represents a purchase of General Admission tickets */
export interface PurchasedGaTicket {
  id: string;
  ticketPurchaseId: string;
  ticketId: string;
  quantity: number;
  pricePerTicket: number;
  ticket?: Ticket; // Populated
}

/** Represents the entire purchase order */
export interface TicketPurchase {
  id: string;
  userId: string;
  eventId: string;
  purchaseDate: ISODateString;
  totalPrice: number;
  subtotal?: number;
  serviceFee?: number;
  paymentMethod?: string;
  transactionId?: string;
  currency: string;

  // Relationships
  statusId?: number;
  status?: StatusCode; // Populated
  user?: Pick<User, "id" | "username" | "email">; // Populated
  event?: Pick<Event, "id" | "title" | "startDate" | "coverImageUrl" | "venue">; // Populated

  // Details of the purchase (NEW)
  purchasedGaTickets?: PurchasedGaTicket[];
  purchasedSeats?: EventSeatStatus[];
}

/**
 * DTO (Data Transfer Object) được đơn giản hóa cho trang "Vé của tôi"
 * Giúp trang tải nhanh hơn bằng cách chỉ lấy các thông tin cần thiết.
 */
export interface TicketPurchaseDetail {
  id: string; // ID của đơn hàng (purchase id)
  eventId: string;
  eventTitle: string;
  eventCoverImageUrl?: string;
  eventStartDate: ISODateString;
  eventVenueName: string; // Tên địa điểm
  eventCity: string; // Thành phố
  purchaseDate: ISODateString;
  totalPrice: number;
  currency: string; // Loại tiền tệ, ví dụ 'VND'
  status: string; // Trạng thái dưới dạng chuỗi, ví dụ: "COMPLETED", "PENDING"
  itemCount: number; // Tổng số vé trong đơn hàng (GA + Seated)
}

export interface TicketQrCode {
  id: string;
  eventSeatId?: string; // For seated tickets
  purchasedGaTicketId?: string; // For GA tickets
  uniqueIdentifier: string;
  qrCodeData: string;
  generatedAt: ISODateString;
  checkInAt?: ISODateString;
}

// =========================================
// Payment & Cart
// =========================================

/** Item in the shopping cart / purchase request */
export interface PurchaseItem {
  ticketId: string; // The ID of the ticket type (e.g., "GA Early Bird", "VIP Section A")
  quantity?: number; // For GA tickets
  seatIds?: string[]; // For Seated tickets
}

export interface InitiatePurchaseRequest {
  eventId: string;
  items: PurchaseItem[];
}

export interface PaymentUrlResponse {
  paymentUrl: string;
  purchaseId: string; // The ID of the newly created TicketPurchase record
}

// =omed=======================================
// Other Features
// =========================================

export interface EventDiscussion {
  id: string;
  eventId: string;
  userId?: string;
  content: string;
  parentCommentId?: string;
  statusId?: number;
  createdAt: ISODateString;
  user?: Pick<User, "id" | "username" | "avatarUrl">; // Populated
  replies?: EventDiscussion[]; // Populated
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: ISODateString;
  additionalGuests: number;
  statusId?: number;
  status?: StatusCode;
  user?: Pick<User, "id" | "username">;
}

export interface Notification {
  id: string;
  userId: string;
  content: string;
  relatedEvent?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  type?: string;
  read: boolean;
  createdAt: ISODateString;
}

export type ThemeOption = "light" | "dark" | "system";

export interface UserSettings {
  userId: string;
  theme: ThemeOption;
  receiveEventReminders: boolean;
  receiveNewEventNotifications: boolean;
  receivePromotionalEmails: boolean;
  syncWithGoogleCalendar: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type UpdateUserSettingsRequest = Partial<
  Omit<UserSettings, "userId" | "createdAt" | "updatedAt">
>;

// ... Keep other request types like AdminResetPasswordRequest if they are still valid ...
export interface AdminResetPasswordRequest {
  newPassword: string;
}

// types.ts (Thêm vào cuối file)

export interface UpdateSeatMapSectionRequest {
  id?: string; // id is present for updating existing section
  name: string;
  layout: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    color: string;
  };
  seats: SeatData[];
  capacity: number;
}

export interface UpdateSeatMapRequest {
  name?: string;
  description?: string;
  sections?: UpdateSeatMapSectionRequest[];
}

export interface EventSearchParams {
  keyword?: string;
  categoryIds?: string[];
  creatorId?: string; // Giữ lại để phòng trường hợp BE thêm vào
  statusId?: number;
  start?: string;
  end?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

// types.ts (Thêm các kiểu này vào file types của bạn)

// Dữ liệu đầu vào và đầu ra cho designer
export interface SeatMapSectionData {
  id?: string; // Có id nếu là update, không có nếu là new
  name: string;
  // Dữ liệu layout để vẽ trên canvas
  layout: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    color: string;
  };
  // Các ghế thuộc về section này
  seats: SeatData[];
}

export interface SeatData {
  id?: string; // Có id nếu là update, không có nếu là new
  rowLabel: string;
  seatNumber: string;
  // Dữ liệu vị trí để vẽ
  coordinates: {
    x: number;
    y: number;
  };
  seatType: string; // e.g., 'standard', 'vip'
}

// Dữ liệu mà designer sẽ nhận vào (initialData) và trả ra (onSave)
export interface SeatMapPayload {
  name: string;
  description?: string;
  sections: SeatMapSectionData[];
}

// Kiểu dữ liệu chi tiết đầy đủ của một SeatMap từ API
export type SeatMapDetails = SeatMap & {
  sections: (SeatSection & { seats: Seat[] })[];
};

// Props cho component SeatMapDesigner
export interface SeatMapDesignerProps {
  isEditMode: boolean;
  initialData?: SeatMapDetails | null;
  onSave: (payload: SeatMapPayload) => Promise<void>;
}

export interface CreateSeatRequest {
  rowLabel: string;
  seatNumber: string;
  seatType?: string;
  // Tọa độ có thể được tạo tự động hoặc do người dùng định nghĩa
  coordinates?: { x: number; y: number };
}

/**
 * Dữ liệu cần thiết để tạo một khu vực (section) mới trong sơ đồ.
 */
export interface CreateSeatSectionRequest {
  // `id` sẽ được tạo bởi backend, nên không có ở đây.
  name: string;
  capacity: number; // Thường được tính từ số lượng ghế.
  layoutData?: Record<string, unknown>; // Dữ liệu JSONB cho layout nếu có

  // Tùy chọn: Gửi chi tiết các ghế thuộc section này ngay lúc tạo
  // Cách này phù hợp nếu trình thiết kế của bạn tạo ra toàn bộ cấu trúc 1 lần.
  seats?: CreateSeatRequest[];
}

/**
 * Payload hoàn chỉnh để gửi lên API khi tạo một Sơ đồ chỗ ngồi (Seat Map) mới.
 * Đây là type chính bạn cần.
 */
export interface CreateSeatMapRequest {
  // `id` sẽ được tạo bởi backend.
  venueId: string; // ID của địa điểm chứa sơ đồ này.
  name: string;
  description?: string;

  // Một mảng chứa thông tin của các khu vực (sections) mới cần tạo.
  sections: CreateSeatSectionRequest[];
}
