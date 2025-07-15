"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminApproveEvent, adminRejectEvent } from "@/lib/api";

interface Props {
  eventId: string;
}

export default function ApprovalActionButtons({ eventId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await adminApproveEvent(eventId);
      toast.success("Đã duyệt sự kiện thành công!");
      // Quay về trang danh sách duyệt và làm mới
      router.push("/admin/events/approval");
      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi duyệt sự kiện.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await adminRejectEvent(eventId);
      toast.success("Đã từ chối sự kiện.");
      router.push("/admin/events/approval");
      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối sự kiện.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <h3 className="font-semibold">Hành động:</h3>

      <Button
        onClick={handleApprove}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Duyệt sự kiện
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isLoading}>
            <XCircle className="mr-2 h-4 w-4" />
            Từ chối
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận từ chối sự kiện?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ từ chối sự kiện và gửi thông báo đến nhà tổ chức.
              Vui lòng nhập lý do từ chối.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
