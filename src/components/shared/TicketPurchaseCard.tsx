// components/shared/TicketPurchaseCard.tsx
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { TicketPurchaseDetail } from "@/types";
import { formatDateTime, formatPrice } from "@/lib/utils";
import {
  CalendarDays,
  MapPin,
  Users,
  QrCode,
  ServerCrash,
  Download,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getQrCodeByPurchaseId, downloadQrCode } from "@/lib/api";

// --- Custom Hooks & Helper Components (nằm trong cùng file cho tiện) ---

// Custom hook for QR code management
function useQrCode(purchaseId: string) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_QR_RETRIES = 3;

  const fetchQr = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await getQrCodeByPurchaseId(purchaseId);
      setQrUrl(URL.createObjectURL(blob));
    } catch (err) {
      if (err instanceof Error)
        setError("Không thể tải mã QR. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [purchaseId]);

  const retryFetchQr = useCallback(() => {
    if (retryCount < MAX_QR_RETRIES) {
      setRetryCount((prev) => prev + 1);
      setTimeout(fetchQr, 1000);
    } else {
      toast.error("Đã thử tải lại nhiều lần nhưng không thành công.");
    }
  }, [fetchQr, retryCount]);

  const cleanup = useCallback(() => {
    if (qrUrl) URL.revokeObjectURL(qrUrl);
  }, [qrUrl]);

  return {
    qrUrl,
    loading,
    error,
    fetchQr,
    cleanup,
    retryFetchQr,
    canRetry: retryCount < MAX_QR_RETRIES,
  };
}

// Custom hook for copy to clipboard
function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Đã sao chép mã vé");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (err instanceof Error) toast.error("Không thể sao chép");
    }
  }, []);

  return { copied, copyToClipboard };
}

// --- Status Configuration ---

interface StatusConfig {
  variant: "default" | "destructive" | "secondary" | "outline";
  text: string;
  showQr: boolean;
}

function getStatusConfig(statusName: string): StatusConfig {
  const upperStatus = statusName.toUpperCase();
  switch (upperStatus) {
    case "SUCCESS":
    case "COMPLETED":
      return { variant: "default", text: "THÀNH CÔNG", showQr: true };
    case "CHECKED_IN":
      return { variant: "default", text: "ĐÃ CHECK-IN", showQr: true };
    case "FAILED":
    case "CANCELED":
      return { variant: "destructive", text: upperStatus, showQr: false };
    case "PENDING":
      return { variant: "secondary", text: "CHỜ XỬ LÝ", showQr: false };
    default:
      return { variant: "outline", text: upperStatus, showQr: false };
  }
}

// --- Main Component ---

export default function TicketPurchaseCard({
  purchase,
}: {
  purchase: TicketPurchaseDetail;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { qrUrl, loading, error, fetchQr, cleanup, retryFetchQr, canRetry } =
    useQrCode(purchase.id);
  const { copied, copyToClipboard } = useCopyToClipboard();

  const statusConfig = useMemo(
    () => getStatusConfig(purchase.status),
    [purchase.status]
  );
  const formattedDateTime = useMemo(
    () => formatDateTime(purchase.eventStartDate),
    [purchase.eventStartDate]
  );

  useEffect(() => {
    if (!dialogOpen) cleanup();
  }, [dialogOpen, cleanup]);

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-700">
          <Image
            src={purchase.eventCoverImageUrl || "/placeholder-event.jpg"}
            alt={purchase.eventTitle}
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="flex-grow p-4 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-muted-foreground">
                {purchase.eventCity}
              </span>
              <Badge variant={statusConfig.variant}>{statusConfig.text}</Badge>
            </div>
            <h2 className="text-xl font-bold hover:text-primary transition-colors">
              <Link href={`/events/${purchase.eventId}`}>
                {purchase.eventTitle}
              </Link>
            </h2>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>
                  {formattedDateTime.date}
                  {formattedDateTime.time && ` lúc ${formattedDateTime.time}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{purchase.eventVenueName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {purchase.itemCount} vé -{" "}
                  <strong>{formatPrice(purchase.totalPrice)}</strong>
                </span>
              </div>
            </div>
          </div>

          {statusConfig.showQr && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={fetchQr} size="sm">
                    <QrCode className="mr-2 h-4 w-4" />
                    Xem QR & Chi tiết
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Mã QR Check-in
                    </DialogTitle>
                    <DialogDescription className="text-center">
                      Sử dụng mã này để quét khi vào sự kiện.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-6 py-4">
                    <div className="flex justify-center items-center min-h-[280px] w-full">
                      {loading && (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <RefreshCw className="h-8 w-8 animate-spin" />
                          <p>Đang tải mã QR...</p>
                        </div>
                      )}
                      {error && (
                        <Alert
                          variant="destructive"
                          className="w-full text-center"
                        >
                          <ServerCrash className="h-4 w-4 mx-auto mb-2" />
                          <AlertTitle>Lỗi tải mã QR</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                          {canRetry && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={retryFetchQr}
                              className="gap-2 mt-3"
                              disabled={loading}
                            >
                              <RefreshCw
                                className={`h-4 w-4 ${
                                  loading ? "animate-spin" : ""
                                }`}
                              />{" "}
                              Thử lại
                            </Button>
                          )}
                        </Alert>
                      )}
                      {qrUrl && !loading && (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                          <div className="border-2 p-2 bg-white rounded-lg shadow-md">
                            <Image
                              src={qrUrl}
                              alt="QR Code để check-in"
                              width={200}
                              height={200}
                            />
                          </div>
                          <div className="text-center space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Mã vé:
                              </span>
                              <code className="font-mono bg-muted px-2 py-1 rounded">
                                {purchase.id}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => copyToClipboard(purchase.id)}
                              >
                                {copied ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => downloadQrCode(purchase.id)}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" /> Tải xuống
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                    >
                      Đóng
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
