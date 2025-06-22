//app/components/shared/PaginationControls.tsx
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
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pageNumbers = [];
    // Show prev, current, next pages (window size = 3)
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pageNumbers.push(
        <PaginationItem key={i}>
          <PaginationLink
            href={createPageURL(i)}
            isActive={currentPage === i}
            className={currentPage === i ? "bg-primary text-white" : ""}
            aria-current={currentPage === i ? "page" : undefined}
            tabIndex={currentPage === i ? -1 : 0}
            onClick={
              currentPage === i
                ? undefined
                : (e) => {
                    e.preventDefault();
                    router.push(createPageURL(i));
                  }
            }
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // First page + ellipsis
    if (currentPage > 2) {
      pageNumbers.unshift(
        <PaginationItem key={1}>
          <PaginationLink
            href={createPageURL(1)}
            className={currentPage === 1 ? "bg-primary text-white" : ""}
            aria-current={currentPage === 1 ? "page" : undefined}
            tabIndex={currentPage === 1 ? -1 : 0}
            onClick={
              currentPage === 1
                ? undefined
                : (e) => {
                    e.preventDefault();
                    router.push(createPageURL(1));
                  }
            }
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (currentPage > 3) {
        pageNumbers.splice(
          1,
          0,
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Last page + ellipsis
    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) {
        pageNumbers.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pageNumbers.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href={createPageURL(totalPages)}
            className={
              currentPage === totalPages ? "bg-primary text-white" : ""
            }
            aria-current={currentPage === totalPages ? "page" : undefined}
            tabIndex={currentPage === totalPages ? -1 : 0}
            onClick={
              currentPage === totalPages
                ? undefined
                : (e) => {
                    e.preventDefault();
                    router.push(createPageURL(totalPages));
                  }
            }
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pageNumbers;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={
              currentPage <= 1 ? "pointer-events-none opacity-50" : undefined
            }
            onClick={
              currentPage <= 1
                ? undefined
                : (e) => {
                    e.preventDefault();
                    router.push(createPageURL(currentPage - 1));
                  }
            }
          />
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <PaginationNext
            href={
              currentPage < totalPages ? createPageURL(currentPage + 1) : "#"
            }
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : undefined
            }
            onClick={
              currentPage >= totalPages
                ? undefined
                : (e) => {
                    e.preventDefault();
                    router.push(createPageURL(currentPage + 1));
                  }
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
