import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

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
