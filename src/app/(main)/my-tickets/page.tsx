// app/(main)/my-tickets/page.tsx
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getTicketPurchasesByUser } from "@/lib/api";
import { Paginated, TicketPurchase } from "@/types";
import TicketPurchaseCard from "@/components/shared/TicketPurchaseCard";
import PaginationControls from "@/components/shared/PaginationControls";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Ticket as TicketIcon, ServerCrash } from "lucide-react";
import { useSearchParams } from "next/navigation";

function MyTicketsSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-lg dark:bg-gray-700" />
      ))}
      <Skeleton className="h-10 w-64 mx-auto mt-10 dark:bg-gray-700" />
    </div>
  );
}

function MyTicketsPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");
  const itemsPerPage = 5;

  const [data, setData] = useState<Paginated<TicketPurchase> | null>(null);
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
        const pageData = await getTicketPurchasesByUser(user.id, {
          page: currentPage - 1,
          size: itemsPerPage,
        });
        setData(pageData);
      } catch (err: unknown) {
        let msg = "Không thể tải danh sách vé của bạn.";
        if (err instanceof Error) msg = err.message;
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 text-gray-900 dark:text-gray-100">
      <h1 className="mb-8 text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
        <TicketIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" /> Vé
        của tôi
      </h1>

      {isLoading ? (
        <MyTicketsSkeleton />
      ) : error ? (
        <Alert variant="destructive" className="dark:bg-gray-800">
          <ServerCrash className="h-4 w-4 text-destructive-foreground dark:text-destructive" />
          <AlertTitle className="text-destructive-foreground dark:text-destructive-foreground">
            Lỗi tải dữ liệu
          </AlertTitle>
          <AlertDescription className="dark:text-destructive-foreground">
            {error}
          </AlertDescription>
        </Alert>
      ) : data ? (
        <>
          {data.content.length > 0 ? (
            <div className="space-y-6">
              {data.content.map((purchase) => (
                <TicketPurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-700 rounded-lg bg-muted/30 dark:bg-muted/30">
              <TicketIcon className="h-16 w-16 text-muted-foreground dark:text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Bạn chưa mua vé nào
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground">
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
      ) : null}
    </div>
  );
}

export default function MyTicketsPage() {
  return (
    <ProtectedRoute>
      <MyTicketsPageContent />
    </ProtectedRoute>
  );
}
