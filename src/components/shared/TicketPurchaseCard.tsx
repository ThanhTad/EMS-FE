//app/Components/shared/TicketPurchaseCard
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TicketPurchase } from "@/types";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { CalendarDays, MapPin, Users, QrCode, ServerCrash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// SẼ PHẢI FETCH THÊM ticket & event NẾU CẦN HIỂN THỊ CHI TIẾT

interface EventInfo {
  id: string;
  title: string;
  imageUrl: string;
  startDate: string;
  location: string;
}

interface TicketInfo {
  ticketType: string;
  event: EventInfo;
}

interface Props {
  purchase: TicketPurchase;
}

export default function TicketPurchaseCard({ purchase }: Props) {
  // Nếu chỉ có ticketId, bạn nên fetch thêm thông tin ticket và event
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch ticket info nếu chỉ có ticketId
  useEffect(() => {
    let ignore = false;
    async function fetchTicket() {
      setLoadingTicket(true);
      setTicketError(null);
      try {
        const res = await fetch(`/api/v1/tickets/${purchase.ticketId}`);
        if (!res.ok) throw new Error("Không thể lấy thông tin vé.");
        const ticketData = await res.json();
        // Đảm bảo dữ liệu trả về có event
        if (!ticketData.event) throw new Error("Không có thông tin sự kiện.");
        if (!ignore) setTicket(ticketData as TicketInfo);
      } catch (err: unknown) {
        if (!ignore)
          setTicketError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!ignore) setLoadingTicket(false);
      }
    }
    fetchTicket();
    return () => {
      ignore = true;
    };
  }, [purchase.ticketId]);

  // QR
  const fetchQr = async () => {
    setQrError(null);
    setQrUrl(null);
    setLoadingQr(true);
    try {
      const res = await fetch(`/api/v1/qr-codes/purchase/${purchase.id}`);
      if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setQrUrl(url);
    } catch (err: unknown) {
      setQrError(err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setLoadingQr(false);
    }
  };

  // Clean up QR blob URL when dialog closes
  useEffect(() => {
    if (!dialogOpen && qrUrl) {
      URL.revokeObjectURL(qrUrl);
      setQrUrl(null);
    }
  }, [dialogOpen, qrUrl]);

  // Status badge (giả sử purchase.statusId)
  const statusId = purchase.status.id;
  const badgeVariant = (() => {
    switch (statusId) {
      case 8:
        return "success";
      case 9:
        return "destructive";
      case 10:
        return "secondary";
      case 11:
        return "outline";
      case 13:
        return "default";
      default:
        return "secondary";
    }
  })();

  if (loadingTicket) {
    return <Skeleton className="h-40 w-full rounded-lg dark:bg-gray-700" />;
  }
  if (ticketError) {
    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Lỗi tải vé/sự kiện</AlertTitle>
        <AlertDescription>{ticketError}</AlertDescription>
      </Alert>
    );
  }
  if (!ticket) return null;

  const { title, imageUrl, startDate, location } = ticket.event;
  const { date, time } = formatDateTime(startDate);
  const ticketType = ticket.ticketType;
  const totalPrice = formatPrice(purchase.totalPrice);
  const statusText = String(purchase.status.status).toUpperCase();

  return (
    <Card className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col sm:flex-row gap-4 p-4 md:p-6">
        <div className="w-full sm:w-40 aspect-video sm:aspect-square rounded-md overflow-hidden relative">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>

        <div className="flex-grow space-y-2">
          <div className="flex justify-between items-start">
            <Link
              href={`/events/${ticket.event.id}`}
              className="text-lg font-semibold hover:text-primary line-clamp-1 dark:text-white"
            >
              {title}
            </Link>
            <Badge variant={badgeVariant}>{statusText}</Badge>
          </div>

          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Loại vé:{" "}
            <span className="font-medium dark:text-white">{ticketType}</span>
          </p>

          <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400 gap-2">
            <Users className="h-4 w-4" />
            <span>Số lượng: {purchase.quantity}</span>
          </div>

          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Tổng tiền:{" "}
            <span className="font-medium dark:text-white">{totalPrice}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400 gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              {date}
              {time ? ` – ${time}` : ""}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400 gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>

          {(statusId === 8 || statusId === 13) && (
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) fetchQr();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <QrCode className="mr-2 h-4 w-4" /> Mã QR
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-xs dark:bg-gray-900">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    Mã QR Check-in
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-400">
                    Dùng mã này để quét khi check‑in sự kiện.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 flex justify-center items-center min-h-[200px]">
                  {loadingQr && <Skeleton className="h-40 w-40" />}
                  {qrError && (
                    <Alert variant="destructive">
                      <ServerCrash className="h-4 w-4" />
                      <AlertTitle>Lỗi tải QR</AlertTitle>
                      <AlertDescription>{qrError}</AlertDescription>
                    </Alert>
                  )}
                  {!loadingQr && qrUrl && (
                    <Image src={qrUrl} alt="QR Code" width={200} height={200} />
                  )}
                </div>

                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Đóng
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
