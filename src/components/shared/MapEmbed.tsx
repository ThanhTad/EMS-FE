// components/shared/MapEmbed.tsx
"use client";
import { useEffect, useState } from "react";

interface MapEmbedProps {
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function MapEmbed({
  location,
  latitude,
  longitude,
}: MapEmbedProps) {
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra tọa độ hợp lệ
    const hasValidCoords =
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null &&
      !isNaN(latitude) &&
      !isNaN(longitude);

    if (hasValidCoords) {
      // Tính toán vùng hiển thị xung quanh marker
      const bbox = [
        longitude - 0.01, // Tây
        latitude - 0.01, // Nam
        longitude + 0.01, // Đông
        latitude + 0.01, // Bắc
      ].join("%2C");

      const marker = `${latitude}%2C${longitude}`;

      setMapUrl(
        `https://www.openstreetmap.org/export/embed.html?` +
          `bbox=${bbox}&` +
          `marker=${marker}`
      );
    } else if (location) {
      // Fallback: Tìm kiếm bằng địa chỉ
      setMapUrl(
        `https://www.openstreetmap.org/search?query=${encodeURIComponent(
          location
        )}`
      );
    } else {
      setMapUrl(null);
    }
  }, [location, latitude, longitude]);

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
      {mapUrl ? (
        <iframe
          src={mapUrl}
          allowFullScreen
          loading="lazy"
          className="w-full h-full border-0 bg-white dark:bg-gray-800"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ sự kiện"
        ></iframe>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          Không có thông tin vị trí để hiển thị bản đồ
        </div>
      )}
    </div>
  );
}
