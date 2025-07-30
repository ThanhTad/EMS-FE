// app/(main)/my-tickets/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { getMyTicketPurchases } from "@/lib/api";
import { Paginated, TicketPurchaseDetail } from "@/types";
import TicketPurchaseCard from "@/components/shared/TicketPurchaseCard";
import PaginationControls from "@/components/shared/PaginationControls";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Ticket as TicketIcon, ServerCrash, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function MyTicketsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-1/3" />
      </div>
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg dark:border-gray-700"
          >
            <Skeleton className="w-full sm:w-48 h-48 sm:h-auto rounded-md" />
            <div className="flex-grow space-y-4 py-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyTicketsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Dùng state để quản lý dữ liệu, tránh phụ thuộc trực tiếp vào searchParams
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page") || "1")
  );
  const itemsPerPage = 5;

  const [data, setData] = useState<Paginated<TicketPurchaseDetail> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Dùng useTransition để cập nhật URL mà không block UI
  const [isPending, startTransition] = useTransition();
  const isLoading = isPending || data === null; // Loading khi đang chuyển trang hoặc chưa có data lần đầu

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const pageData = await getMyTicketPurchases({
          page: currentPage - 1,
          size: itemsPerPage,
        });
        setData(pageData);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách vé của bạn."
        );
        setData({
          content: [],
          totalPages: 0,
          totalElements: 0,
          pageNumber: 0,
          pageSize: 0,
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true,
        });
      }
    };
    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      params.set("page", String(newPage));
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  if (isLoading && !data) {
    return <MyTicketsSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold flex items-center gap-3">
        <TicketIcon className="h-8 w-8 text-primary" /> Vé của tôi
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data && data.content.length > 0 ? (
        <div className={`space-y-6 ${isPending ? "opacity-50" : ""}`}>
          {data.content.map((purchase) => (
            <TicketPurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/20">
          <TicketIcon className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">
            Bạn chưa có đơn hàng nào
          </h2>
          <p className="mt-2 text-muted-foreground">
            Các vé bạn mua sẽ xuất hiện ở đây.
          </p>
          <Button asChild className="mt-6">
            <Link href="/events">Khám phá sự kiện</Link>
          </Button>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-10">
          <PaginationControls
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  );
}

// Component Page bọc ngoài không thay đổi
function MyTicketsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<MyTicketsSkeleton />}>
        <MyTicketsPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}

export default MyTicketsPage;
