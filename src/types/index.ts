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
  email?: string; // thêm
  username?: string;
  id?: string; // Optional, used for updates
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
  user: User;
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

export interface MapObject {
  label: string;
  svgPath: string; // Sử dụng svgPath cho mọi hình dạng
  style?: Record<string, string | number>; // Cho phép tùy chỉnh style
}

export interface SeatCoordinates {
  x: number;
  y: number;
}

// Cấu trúc cho layoutData của sơ đồ tổng thể
export interface SeatMapLayoutData {
  viewBox: string; // Ví dụ: "0 0 1200 800"
  backgroundImageUrl?: string;
  stage?: MapObject;
  entrances?: MapObject[];
  // Có thể thêm các đối tượng tĩnh khác ở đây
  otherObjects?: MapObject[];
}

// Cấu trúc cho layoutData của một section
export interface SectionLayoutData {
  svgPath: string;
  style: {
    default: { fill: string; stroke?: string; strokeWidth?: number };
    hover?: { fill: string };
    selected?: { stroke: string; strokeWidth?: number };
  };
  labelPosition?: { x: number; y: number };
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
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  venue?: Venue;
  layoutData?: SeatMapLayoutData;
}

export interface SeatSection {
  id: string;
  seatMapId: string;
  name: string;
  capacity: number;
  layoutData?: SectionLayoutData;
  seats: Seat[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// export interface Seat {
//   id: string;
//   sectionId: string;
//   rowLabel: string;
//   seatNumber: string;
//   seatType: string;
//   coordinates?: SeatCoordinates; // jsonb
//   createdAt: ISODateString;
//   updatedAt: ISODateString;
// }

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
  GENERAL_ADMISSION = "GENERAL_ADMISSION",
  ZONED_ADMISSION = "ZONED_ADMISSION",
  RESERVED_SEATING = "RESERVED_SEATING",
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
  AVAILABLE = "AVAILABLE",
  HELD = "HELD",
  SOLD = "SOLD",
  RESERVED = "RESERVED",
}

/** Represents a specific seat's status for a specific event */
export interface EventSeatStatus {
  id: string;
  eventId: string;
  seatId: string;
  status: EventSeatStatusEnum;
  ticketPurchaseId?: string;
  ticketId?: string;
  priceAtPurchase?: number;
  heldUntil?: ISODateString;
  seat: Seat;
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
  id: string;
  eventTitle: string;
  eventImageUrl: string; // <-- Thêm trường này
  eventId: string;
  customerName: string;
  purchaseDate: string; // Giữ là string để dễ parse
  totalPrice: number;
  status: string;
  currency: string;
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

// Lớp con cho thông tin sự kiện liên quan
export interface NotificationRelatedEvent {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string;
}

export interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: ISODateString;
  relatedEvent: NotificationRelatedEvent | null;
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
  layoutData?: SeatMapLayoutData;
  sections?: UpdateSectionRequest[];
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
  sections: SeatSection[];
};
// // Props cho component SeatMapDesigner
// export interface SeatMapDesignerProps {
//   isEditMode: boolean;
//   initialData?: SeatMapDetails | null;
//   onSave: (payload: SeatMapPayload) => Promise<void>;
// }

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

/**
 * Thông tin chi tiết của một Ghế (Seat) trong sơ đồ.
 */
export interface SeatDetail {
  id: string;
  rowLabel: string;
  seatNumber: string;
  seatType: string;
  coordinates?: { x: number; y: number };
}

/**
 * Thông tin chi tiết của một Khu vực/Zone (SeatSection) và danh sách ghế của nó.
 */
export interface SectionDetail {
  id: string;
  name: string;
  capacity: number;
  layoutData?: { x: number; y: number }[]; // Mảng tọa độ để vẽ đa giác
  seats: SeatDetail[];
}

/**
 * Cấu trúc dữ liệu đầy đủ của một Sơ đồ chỗ ngồi (SeatMap) được trả về từ API.
 */
export interface SeatMapDetail {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  sections: SectionDetail[];
}

/**
 * Trạng thái của một ghế cụ thể cho một sự kiện cụ thể.
 */
export interface EventSeatStatus {
  id: string;
  eventId: string;
  seatId: string;
  status: EventSeatStatusEnum;
  ticketPurchaseId?: string;
  heldUntil?: string; // ISO Date String
}

// =========================================
// DTOs cho ZONED_ADMISSION - Chọn theo khu vực
// =========================================

/**
 * Thông tin một loại vé được đơn giản hóa, dùng trong ngữ cảnh của một khu vực.
 */
export interface ZonedTicketDTO {
  id: string;
  name: string;
  description?: string;
  price: number;
  availableQuantity?: number;
  maxPerPurchase?: number;
}

/**
 * Cấu trúc dữ liệu của một Khu vực/Zone (SeatSection) và danh sách các loại vé có trong đó.
 */
export interface ZoneWithTicketsDTO {
  sectionId: string;
  sectionName: string;
  tickets: ZonedTicketDTO[];
}

// ======================================
// File: src/types/index.ts
// ======================================

// --- Generic API & Base Types (Không đổi) ---
// ... (ApiResponse, ApiErrorResponse, BaseEntity, etc.)

// --- Generic Layout & Coordinate Types ---
export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  shape: "rect" | "circle" | "polygon";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: Point[];
  label?: string;
  style?: React.CSSProperties;
}

export interface StageLayout {
  svgPath: string;
  label?: string;
  style?: {
    fill?: string;
    stroke?: string;
  };
}

export interface SeatMapLayout {
  viewBox?: string;
  backgroundImageUrl?: string;
  stage?: StageLayout;
  // Cho phép các thuộc tính khác không xác định trước
  [key: string]: unknown;
}

export interface SectionLayout {
  svgPath: string; // <-- Dùng svgPath
  labelPosition?: { x: number; y: number };
  style?: { fill?: string; stroke?: string };
}

// --- Common Ticketing DTOs ---
export interface TicketType {
  ticketId: string;
  name: string;
  price: number;
  description?: string;
  availableQuantity?: number;
  maxPerPurchase?: number;
  isOnSale: boolean;
}

// --- DTO for GENERAL_ADMISSION mode ---
export interface GeneralAdmissionData {
  availableTickets: Ticket[];
  totalCapacity: number;
  availableCapacity: number;
}

// --- DTOs for ZONED_ADMISSION mode ---
export interface Zone {
  zoneId: string;
  name: string;
  capacity: number;
  availableCapacity: number;
  availableTickets: Ticket[];
  status: "AVAILABLE" | "SOLD_OUT" | "COMING_SOON";
  layoutData?: SectionLayout;
}

export interface ZonedAdmissionData {
  seatMapId: string;
  seatMapName: string;
  zones: Zone[];
  layoutData?: SeatMapLayout;
}

// --- DTOs for RESERVED_SEATING mode ---
export interface Seat {
  seatId: string;
  rowLabel: string;
  seatNumber: string;
  seatType: string;
  status: "available" | "held" | "sold" | "unavailable";
  price?: number;
  ticketTypeName?: string;
  ticketId?: string;
  coordinates?: Point;
}

export interface Section {
  sectionId: string;
  name: string;
  capacity: number;
  availableCapacity: number;
  seats: Seat[];
  availableTickets: Ticket[];
  layoutData?: SectionLayout;
}

export interface ReservedSeatingData {
  seatMapId: string;
  seatMapName: string;
  sections: Section[];
  layoutData?: SeatMapLayout;
}

// --- Main Combined API Response DTO ---
export interface EventCreator {
  id: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface EventVenue {
  venueId: string;
  name: string;
  address?: string;
  city?: string;
}

export interface EventTicketingDetails {
  eventId: string;
  eventTitle: string;
  slug: string;
  eventDescription?: string;
  coverImageUrl?: string;
  eventStartDate: string;
  eventEndDate: string;
  isPublic: boolean;
  creator?: EventCreator;
  venue?: EventVenue;
  ticketSelectionMode: TicketSelectionModeEnum;
  ticketingData:
    | GeneralAdmissionData
    | ZonedAdmissionData
    | ReservedSeatingData;
}

// --- Hold & Checkout DTOs ---
export interface GaItemDTO {
  ticketId: string;
  quantity: number;
}

export interface TicketHoldRequest {
  selectionMode: TicketSelectionModeEnum;
  gaItems: GaItemDTO[];
  seatIds: string[];
}

export interface HoldResponse {
  holdId: string;
  expiresAt: string;
}

export interface FinalizePurchaseRequestDTO {
  // 1. Dữ liệu để xác định phiên giao dịch
  holdId: string;

  // 2. Dữ liệu về cách thanh toán (chứa DTO kia bên trong)
  paymentDetails: PaymentDetails;
}

export interface TicketPurchaseConfirmation {
  purchaseId: string;
  message: string;
  purchaseDate: string;
}

// =========================================
// Chatbot Types
// =========================================

export type MessageSender = "user" | "bot";

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
}

// Request từ FE -> BFF/API
export interface DialogflowRequest {
  text: string;
  sessionId: string;
}

// Response từ BFF/API -> FE
export interface DialogflowResponse {
  fulfillmentText: string;
}

export type DialogflowParameterValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: DialogflowParameterValue }
  | DialogflowParameterValue[];

// Cấu trúc request webhook mà BE nhận (để tham khảo)
export interface DialogflowWebhookRequest {
  queryResult: {
    queryText: string;
    intent: {
      displayName: string;
    };
    parameters: { [key: string]: DialogflowParameterValue };
  };
  session: string;
}

// Cấu trúc response webhook mà BE trả về (để tham khảo)
export interface DialogflowWebhookResponse {
  fulfillmentText: string;
}

// Kiểu dữ liệu nội bộ của cartStore
export type CartEventInfo = {
  id: string;
  title: string;
  slug: string;
  ticketSelectionMode: TicketSelectionModeEnum;
  allowMixingTicketTypes?: boolean;
};

// Item trong giỏ hàng
export type CartItem =
  | { type: "GA"; ticket: Ticket; quantity: number }
  | { type: "SEATED"; seat: Seat; ticket: Ticket };

// DTO gửi lên backend
export interface GaItemDTO {
  ticketId: string;
  quantity: number;
}

export interface HoldDetailsResponseDTO {
  holdId: string;
  eventId: string;
  expiresAt: ISODateString;
  // Bạn có thể thêm các thông tin tóm tắt khác nếu cần
  // Ví dụ: totalPrice, summaryItems...
  request: TicketHoldRequest; // Gửi lại request ban đầu để hiển thị tóm tắt
}

// =========================================
// Purchase & Checkout Types
// =========================================

/**
 * DTO chi tiết cho một đơn hàng, khớp với PurchaseDetailDTO từ backend.
 * Dùng cho trang chi tiết đơn hàng và trang thanh toán thành công.
 */
export interface PurchaseDetailDTO {
  id: string;
  purchaseDate: ISODateString;
  subTotal: number;
  serviceFee: number;
  totalPrice: number;
  currency: string;
  status: string; // e.g., "COMPLETED", "PENDING"
  paymentMethod?: string;
  transactionId?: string;

  // Thông tin người mua và sự kiện (lồng nhau)
  customer: CustomerInfoDTO;
  event: EventInfoDTO;

  // Chi tiết các loại vé trong đơn hàng
  generalAdmissionTickets: PurchasedGATicketDTO[];
  seatedTickets: PurchasedSeatedTicketDTO[];
}

// --- DTOs con cho PurchaseDetailDTO ---

export interface CustomerInfoDTO {
  id: string;
  fullName?: string;
  email: string;
}

export interface EventInfoDTO {
  id: string;
  title: string;
  slug: string;
  startDate: ISODateString;
  // Bạn có thể thêm venue vào đây nếu backend trả về
  // venue?: { name: string };
}

export interface PurchasedGATicketDTO {
  ticketName: string;
  quantity: number;
  pricePerTicket: number;
}

export interface PurchasedSeatedTicketDTO {
  sectionName: string;
  rowLabel: string;
  seatNumber: string;
  ticketName: string;
  priceAtPurchase: number;
}

// Sửa lại PaymentDetails
export interface PaymentDetails {
  paymentMethod: "MOMO" | "VNPAY" | "MOCK_PAYMENT"; // Chỉ hỗ trợ các phương thức này
  paymentToken?: string; // Giữ lại cho tương lai, nhưng không dùng ngay
}

// DTO cho request tạo thanh toán (gửi đến BE)
export interface PaymentCreationRequestDTO {
  holdId: string;
  paymentMethod: "MOMO" | "VNPAY";
}

// DTO cho response từ BE (chứa URL redirect)
export interface PaymentCreationResultDTO {
  paymentUrl: string;
}

// DTO cho request mock
export interface MockFinalizeRequestDTO {
  holdId: string;
}

// DTO để gửi kết quả từ URL về BE để xác thực
export interface VerifyPaymentRequestDTO {
  provider: "momo" | "vnpay";
  params: Record<string, string>; // Tất cả query params từ URL
}

// =========================================
// TYPES FOR SEAT MAP DESIGNER
// =========================================

// Dữ liệu nội bộ của một ghế trong state của designer
export interface DesignerSeatData {
  id: string; // Có thể là UUID thật hoặc ID tạm thời
  rowLabel: string;
  seatNumber: string;
  seatType: string;
  coordinates: { x: number; y: number };
}

// Dữ liệu nội bộ của một section trong state của designer
export interface DesignerSectionData {
  id: string;
  name: string;
  capacity: number;
  layoutData: SectionLayoutData;
  seats: DesignerSeatData[];
}

// Dữ liệu ban đầu và payload onSave
export interface SeatMapDesignerProps {
  isEditMode: boolean;
  initialData: SeatMapDetails; // Dữ liệu từ API
  onSave: (payload: UpdateSeatMapRequest) => Promise<void>;
}

// Cấu hình để tạo ghế hàng loạt
export interface SeatGenerationConfig {
  rows: number;
  cols: number;
  rowLabelType: "alpha" | "numeric";
  startRow: string;
  startCol: number;
  hSpacing: number;
  vSpacing: number;
  seatType: string;
}

export interface UpdateSeatRequest {
  id?: string;
  rowLabel: string;
  seatNumber: string;
  seatType: string;
  coordinates: { x: number; y: number };
}

export interface UpdateSectionRequest {
  id?: string;
  name: string;
  capacity: number; // Thêm capacity vào đây
  layoutData: SectionLayoutData; // Tên là layoutData
  seats: UpdateSeatRequest[];
}
