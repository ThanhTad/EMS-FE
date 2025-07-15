import { Event as EventType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import {
  Calendar,
  Tag,
  User,
  MapPin,
  Ticket as TicketIcon,
  Armchair,
  Users,
  Info,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  event: EventType;
}

// Helper component để hiển thị một dòng thông tin chi tiết
const DetailItem = ({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) => (
  <div className="flex items-start">
    <span className="mr-4 mt-1 flex-shrink-0 text-muted-foreground">
      {icon}
    </span>
    <div>
      <p className="font-semibold text-sm">{label}</p>
      {value && <p className="text-sm text-muted-foreground">{value}</p>}
      {children}
    </div>
  </div>
);

/**
 * Component hiển thị thông tin chi tiết của một sự kiện ở chế độ chỉ đọc.
 * Lý tưởng để sử dụng trong trang duyệt sự kiện của Admin.
 */
export default function EventDetailView({ event }: Props) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* CỘT BÊN TRÁI: NỘI DUNG CHÍNH */}
      <div className="space-y-6 lg:col-span-2">
        {event.coverImageUrl && (
          <div className="overflow-hidden rounded-lg relative aspect-video">
            <Image
              src={event.coverImageUrl}
              alt={`Ảnh bìa của ${event.title}`}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Mô tả sự kiện */}
        <Card>
          <CardHeader>
            <CardTitle>Mô tả sự kiện</CardTitle>
          </CardHeader>
          <CardContent>
            {/* CẢNH BÁO: Luôn đảm bảo rằng HTML từ backend đã được làm sạch (sanitized) */}
            {/* để tránh các cuộc tấn công XSS. */}
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: event.description || "<p>Không có mô tả.</p>",
              }}
            />
          </CardContent>
        </Card>

        {/* Thông tin vé */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Các loại vé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.tickets && event.tickets.length > 0 ? (
              event.tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-md border p-4">
                  <div className="flex justify-between">
                    <p className="font-bold">{ticket.name}</p>
                    <p className="font-semibold text-primary">
                      {formatPrice(ticket.price)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticket.description}
                  </p>
                  {/* Hiển thị thông tin bổ sung tùy loại vé */}
                  {event.ticketSelectionMode === "GENERAL_ADMISSION" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Số lượng: {ticket.availableQuantity} /{" "}
                      {ticket.totalQuantity}
                    </p>
                  )}
                  {event.ticketSelectionMode !== "GENERAL_ADMISSION" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Áp dụng cho khu vực:{" "}
                      {event.seatMap?.sections?.find(
                        (s) => s.id === ticket.appliesToSectionId
                      )?.name || "N/A"}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có vé nào được tạo cho sự kiện này.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CỘT BÊN PHẢI: THÔNG TIN TÓM TẮT */}
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tổng quan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <DetailItem
              icon={<Info className="h-5 w-5" />}
              label="Trạng thái hiện tại"
            >
              <Badge variant="secondary">{event.status?.status || "N/A"}</Badge>
            </DetailItem>

            <DetailItem
              icon={<User className="h-5 w-5" />}
              label="Nhà tổ chức"
              value={event.creator?.fullName || "Không xác định"}
            />
            <DetailItem
              icon={<MapPin className="h-5 w-5" />}
              label="Địa điểm"
              value={event.venue?.name}
            />
            <DetailItem
              icon={<Calendar className="h-5 w-5" />}
              label="Thời gian diễn ra"
              value={`${format(new Date(event.startDate), "HH:mm dd/MM/yyyy", {
                locale: vi,
              })} - ${format(new Date(event.endDate), "HH:mm dd/MM/yyyy", {
                locale: vi,
              })}`}
            />
            <DetailItem icon={<Tag className="h-5 w-5" />} label="Danh mục">
              <div className="flex flex-wrap gap-2">
                {event.categories?.map((cat) => (
                  <Badge key={cat.id} variant="outline">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </DetailItem>
            <DetailItem
              icon={
                event.ticketSelectionMode === "GENERAL_ADMISSION" ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <Armchair className="h-5 w-5" />
                )
              }
              label="Chế độ vé"
              value={event.ticketSelectionMode}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
