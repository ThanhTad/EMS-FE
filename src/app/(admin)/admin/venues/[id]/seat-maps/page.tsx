// app/admin/venues/[venueId]/seat-maps/page.tsx
import { getSeatMapsByVenue, getVenueById } from "@/lib/api";
import { SeatMapColumns } from "@/components/admin/venues/seat-maps/SeatMapColumns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ServerCrash, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/shared/DataTableSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Metadata } from "next";

// Hàm tạo metadata động
export async function generateMetadata({
  params,
}: {
  params: { venueId: string };
}): Promise<Metadata> {
  try {
    const venue = await getVenueById(params.venueId);
    return {
      title: `Sơ đồ cho ${venue.name} | Admin EMS`,
      description: `Quản lý sơ đồ chỗ ngồi cho địa điểm ${venue.name}.`,
    };
  } catch {
    return {
      title: "Quản lý Sơ đồ | Admin EMS",
    };
  }
}

interface SeatMapsPageProps {
  params: {
    venueId: string;
  };
  searchParams: {
    page?: string;
    size?: string;
  };
}

export default async function SeatMapsPage({
  params,
  searchParams,
}: SeatMapsPageProps) {
  const { venueId } = params;

  // TỐI ƯU: Khởi chạy cả hai request cùng lúc thay vì chờ đợi tuần tự
  const venueDataPromise = getVenueById(venueId);
  // Không cần lấy seat maps ở đây nữa, vì đã có trong component con rồi

  // Chỉ cần lấy venue data để hiển thị tiêu đề
  const venue = await venueDataPromise;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumb hoặc tiêu đề */}
          <Button
            variant="link"
            asChild
            className="p-0 h-auto mb-2 text-muted-foreground"
          >
            <Link href="/admin/venues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách Địa điểm
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            Sơ đồ chỗ ngồi cho:{" "}
            <span className="text-blue-600">{venue.name}</span>
          </h1>
        </div>
        <Button asChild>
          <Link href={`/admin/venues/${venueId}/seat-maps/new`}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tạo Sơ đồ mới
          </Link>
        </Button>
      </div>

      <Suspense fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}>
        <SeatMapsTable venueId={venueId} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Component con để fetch và hiển thị bảng
async function SeatMapsTable({
  venueId,
  searchParams,
}: {
  venueId: string;
  searchParams: SeatMapsPageProps["searchParams"];
}) {
  const page = Number(searchParams.page ?? "1") - 1;
  const size = Number(searchParams.size ?? "10");

  try {
    const seatMapsData = await getSeatMapsByVenue(venueId, { page, size });

    return (
      <DataTable
        columns={SeatMapColumns}
        data={seatMapsData.content}
        pageCount={seatMapsData.totalPages}
        totalRecords={seatMapsData.totalElements}
      />
    );
  } catch (error) {
    console.error("Failed to fetch seat maps:", error);
    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
        <AlertDescription>
          Không thể tải danh sách sơ đồ. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }
}
