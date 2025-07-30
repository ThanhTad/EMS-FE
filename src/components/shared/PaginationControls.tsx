"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

// ===== BƯỚC 1: CẬP NHẬT PROPS =====
// Component sẽ nhận tất cả những gì nó cần từ bên ngoài
export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void; // Hàm callback để thông báo cho cha
  isPending?: boolean; // Cờ trạng thái loading
}

// ===== BƯỚC 2: ĐƠN GIẢN HÓA COMPONENT =====
// Bỏ hết các hook về router
const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isPending = false, // Gán giá trị mặc định
}) => {
  // Điều kiện này vẫn giữ nguyên
  if (totalPages <= 1) {
    return null;
  }

  // Logic tạo số trang có thể được đơn giản hóa một chút
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const windowSize = 2; // Số lượng trang hiển thị ở mỗi bên của trang hiện tại

    // Luôn hiển thị trang 1
    pageNumbers.push(1);

    // Dấu ... ở đầu
    if (currentPage > windowSize + 1) {
      pageNumbers.push(-1); // Dùng số âm để đại diện cho ellipsis
    }

    // Các trang ở giữa
    const startPage = Math.max(2, currentPage - (windowSize - 1));
    const endPage = Math.min(totalPages - 1, currentPage + (windowSize - 1));

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Dấu ... ở cuối
    if (currentPage < totalPages - windowSize) {
      pageNumbers.push(-1);
    }

    // Luôn hiển thị trang cuối (nếu nó chưa được thêm)
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    // Loại bỏ các số trùng lặp (ví dụ khi totalPages nhỏ)
    const uniquePageNumbers = [...new Set(pageNumbers)];
    return uniquePageNumbers;
  };

  const pageNumbers = renderPageNumbers();

  // Hàm xử lý chung cho việc click, tránh lặp code
  const handleClick = (page: number) => {
    if (isPending || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  // ===== BƯỚC 3: CẬP NHẬT JSX =====
  // Bỏ href và chỉ dùng onClick
  return (
    <Pagination>
      <PaginationContent>
        {/* Nút Previous */}
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={isPending || currentPage === 1}
            className={
              isPending || currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            onClick={() => handleClick(currentPage - 1)}
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
                isActive={currentPage === page}
                aria-disabled={isPending}
                className={
                  isPending
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                onClick={() => handleClick(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {/* Nút Next */}
        <PaginationItem>
          <PaginationNext
            aria-disabled={isPending || currentPage === totalPages}
            className={
              isPending || currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            onClick={() => handleClick(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
