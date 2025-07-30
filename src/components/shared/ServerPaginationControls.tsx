"use client"; // Cần "use client" vì nó sử dụng hooks như usePathname, useSearchParams

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

// Props không thay đổi
interface ServerPaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

const ServerPaginationControls: React.FC<ServerPaginationControlsProps> = ({
  currentPage,
  totalPages,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hàm helper để tạo URL mới, giữ lại các tham số tìm kiếm khác
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  // Logic hiển thị các trang (có thể dùng lại từ component kia)
  const renderPageNumbers = () => {
    // ... logic tạo pageNumbers array ...
    // (Sao chép logic từ câu trả lời trước hoặc từ component PaginationControls cũ của bạn)
    const pageNumbers = [];
    const windowSize = 2;

    pageNumbers.push(1);
    if (currentPage > windowSize + 1) pageNumbers.push(-1);

    const startPage = Math.max(2, currentPage - (windowSize - 1));
    const endPage = Math.min(totalPages - 1, currentPage + (windowSize - 1));
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    if (currentPage < totalPages - windowSize) pageNumbers.push(-1);
    if (totalPages > 1) pageNumbers.push(totalPages);

    return [...new Set(pageNumbers)];
  };

  const pageNumbers = renderPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {/* Nút Previous */}
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            className={
              currentPage <= 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>

        {/* Các số trang */}
        {pageNumbers.map((page, index) =>
          page === -1 ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href={createPageURL(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {/* Nút Next */}
        <PaginationItem>
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ServerPaginationControls;
