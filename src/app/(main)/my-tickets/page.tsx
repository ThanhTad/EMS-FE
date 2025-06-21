// app/(main)/my-tickets/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getTicketPurchaseDetailsByUser } from "@/lib/api";
import { Paginated, TicketPurchaseDetail } from "@/types";
import TicketPurchaseCard from "@/components/shared/TicketPurchaseCard"; // <<< Component mới sẽ được tạo ở dưới
import PaginationControls from "@/components/shared/PaginationControls";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Ticket as TicketIcon, ServerCrash } from "lucide-react";
import { useSearchParams } from "next/navigation";

function MyTicketsSkeleton() {
  // ... (giữ nguyên skeleton của bạn, nó đã tốt)
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg dark:border-gray-700"
        >
          <Skeleton className="w-full sm:w-40 h-24 sm:h-32 rounded-md" />
          <div className="flex-grow space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MyTicketsPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");
  const itemsPerPage = 5;

  const [data, setData] = useState<Paginated<TicketPurchaseDetail> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const pageData = await getTicketPurchaseDetailsByUser(user.id, {
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold flex items-center gap-3">
        <TicketIcon className="h-8 w-8 text-primary" /> Vé của tôi
      </h1>

      {isLoading && <MyTicketsSkeleton />}

      {error && (
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && data && (
        <>
          {data.content.length > 0 ? (
            <div className="space-y-6">
              {data.content.map((purchase) => (
                <TicketPurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <TicketIcon className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">
                Bạn chưa mua vé nào
              </h2>
              <p className="mt-2 text-muted-foreground">
                Hãy khám phá các sự kiện và mua vé ngay!
              </p>
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-10">
              <PaginationControls
                currentPage={currentPage}
                totalPages={data.totalPages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Component Page bọc bởi Suspense và ProtectedRoute
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
