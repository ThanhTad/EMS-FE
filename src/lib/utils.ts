import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CartEventInfo, CartItem, GaItemDTO, TicketHoldRequest } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//Ham dinh dang ngay gio
export function formatDateTime(dateString: string | Date): {
  date: string;
  time: string | null;
} {
  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    const formattedDate = format(date, "dd/mm/yyyy", { locale: vi });
    // Kiem tra co thong tin gio phut giay khong? (khong phai 00:00:00)
    const hasTime =
      date.getHours() != 0 || date.getMinutes() != 0 || date.getSeconds() != 0;
    const formattedTime = hasTime
      ? format(date, "HH:mm", { locale: vi })
      : null;
    return { date: formattedDate, time: formattedTime };
  } catch (e) {
    console.error("Error formatting date", e);
    return { date: "N/A", time: null };
  }
}

//Ham dinh dang tien te
export function formatPrice(price: number | "Free" | string): string {
  if (price == "Free" || price === 0 || price === "0") {
    return "Miễn Phí";
  }
  if (typeof price === "number") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }
  //Thu doi String sang Number
  try {
    const numberPrice = parseFloat(price as string);
    if (!isNaN(numberPrice)) {
      if (numberPrice === 0) return "Miễn Phí";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(numberPrice);
    }
  } catch (e) {
    console.error(e);
  }

  return "N/A";
}

export async function toBlob(
  imageSrc: string,
  area: { width: number; height: number; x: number; y: number }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = area.width;
      canvas.height = area.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(
        img,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        area.width,
        area.height
      );
      canvas.toBlob((blob) => {
        if (!blob) reject("Canvas is empty");
        else resolve(blob);
      }, "image/png");
    };
    img.onerror = reject;
  });
}
// utils/format-date.ts
type ISODateString = string;

export function formatISODate(
  isoDateString: ISODateString | undefined,
  formatString: string = "PPP" // Mặc định format đẹp: "Oct 29, 2023"
): string {
  if (!isoDateString) {
    return "N/A";
  }
  try {
    const date = parseISO(isoDateString);
    return format(date, formatString, { locale: vi }); // Thêm locale nếu cần
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error formatting date:", error.message);
    }
    console.error("Invalid date format:", isoDateString);
    return "Invalid Date";
  }
}

export function createHoldRequestDTO(
  items: Record<string, CartItem>,
  eventInfo: CartEventInfo
): TicketHoldRequest {
  // Validation đầu vào
  if (!items || Object.keys(items).length === 0) {
    throw new Error("Cart is empty");
  }

  if (!eventInfo?.ticketSelectionMode) {
    throw new Error("Event info or ticket selection mode is missing");
  }

  // Chuyển đổi object items thành một mảng để dễ xử lý
  const cartItemsArray = Object.values(items);

  // Sử dụng reduce để xử lý hiệu quả hơn
  const { gaItems, seatIds } = cartItemsArray.reduce<{
    gaItems: GaItemDTO[];
    seatIds: string[];
  }>(
    (acc, item) => {
      if (item.type === "GA") {
        // Validation cho GA items
        if (!item.ticket?.id || item.quantity <= 0) {
          throw new Error(`Invalid GA ticket item: ${JSON.stringify(item)}`);
        }

        acc.gaItems.push({
          ticketId: item.ticket.id,
          quantity: item.quantity,
        });
      } else if (item.type === "SEATED") {
        // Validation cho SEATED items
        if (!item.seat?.seatId) {
          throw new Error(
            `Invalid seated ticket item: ${JSON.stringify(item)}`
          );
        }

        acc.seatIds.push(item.seat.seatId);
      } else {
        // Log warning cho unknown types nhưng không throw error
        console.warn(`Unknown cart: ${item}`);
      }

      return acc;
    },
    { gaItems: [], seatIds: [] }
  );

  // Validation kết quả
  if (gaItems.length === 0 && seatIds.length === 0) {
    throw new Error("No valid items found in cart");
  }

  // Tạo đối tượng DTO cuối cùng
  const holdRequest: TicketHoldRequest = {
    selectionMode: eventInfo.ticketSelectionMode,
    gaItems,
    seatIds,
  };

  return holdRequest;
}
