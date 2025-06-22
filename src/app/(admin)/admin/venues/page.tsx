// app/admin/venues/page.tsx (Theo phong cách Server Component)
import { getVenues } from "@/lib/api"; // Giả sử API này không cần token hoặc token được xử lý bên trong
import { VenueColumns } from "@/components/admin/venues/VenueColumns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ServerCrash } from "lucide-react";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Địa điểm | Admin EMS",
  description: "Xem và quản lý danh sách các địa điểm tổ chức sự kiện.",
};

interface AdminVenuesPageProps {
  searchParams: {
    page?: string;
    size?: string;
    keyword?: string; // Giả sử backend hỗ trợ tìm kiếm
    sort?: string;
  };
}

export default async function AdminVenuesPage({
  searchParams,
}: AdminVenuesPageProps) {
  // Logic kiểm tra token có thể được đặt ở đây hoặc trong một middleware
  // const token = cookies().get("ems_auth_token")?.value;
  // if (!token) redirect("/login");

  const keyword = searchParams.keyword ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Địa điểm</h1>
          <p className="text-muted-foreground">
            Tạo, sửa, và quản lý các địa điểm tổ chức sự kiện.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/venues/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm địa điểm
          </Link>
        </Button>
      </div>

      {/* Tương lai: Thêm thanh tìm kiếm ở đây. 
          Tìm kiếm với Server Component cần một chút xử lý khác.
          Bạn sẽ cần một Client Component để quản lý input và cập nhật URL.
      */}

      <Suspense
        key={keyword + JSON.stringify(searchParams)} // Key giúp Suspense reset khi searchParams thay đổi
        fallback={
          <DataTableSkeleton
            columnCount={VenueColumns("").length}
            rowCount={Number(searchParams.size ?? 10)}
          />
        }
      >
        <VenuesTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function VenuesTable({ searchParams }: AdminVenuesPageProps) {
  const page = Number(searchParams.page ?? "1") - 1;
  const size = Number(searchParams.size ?? "10");
  const keyword = searchParams.keyword;
  const sort = searchParams.sort;

  try {
    // API getVenues cần hỗ trợ các tham số này
    const venuesData = await getVenues({ page, size, keyword, sort });

    return (
      <DataTable
        columns={VenueColumns(keyword ?? "")}
        data={venuesData.content}
        pageCount={venuesData.totalPages}
        totalRecords={venuesData.totalElements}
      />
    );
  } catch (error) {
    console.error("Failed to fetch venues:", error);
    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
        <AlertDescription>
          Không thể tải danh sách địa điểm. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }
}
