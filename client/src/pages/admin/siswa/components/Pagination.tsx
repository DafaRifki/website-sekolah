import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  // Hide pagination if there is only 1 page
  if (totalPages <= 1) return null;

  const handleSetPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Fungsi untuk men-generate urutan halaman yang lebih rapi dan konsisten
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      // Jika total halaman sedikit (<= 5), tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Jika di halaman awal (1, 2, 3)
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } 
      // Jika di halaman akhir
      else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } 
      // Jika di tengah-tengah
      else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50 ${className}`}>
      
      {/* Info */}
      <div className="text-sm text-gray-700 text-center sm:text-left">
        Halaman <span className="font-medium">{currentPage}</span> dari{" "}
        <span className="font-medium">{totalPages}</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Prev Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handleSetPage(currentPage - 1)}
          className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Dynamic Pages */}
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handleSetPage(page as number)}
              className="w-8 h-8 p-0">
              {page}
            </Button>
          )
        )}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handleSetPage(currentPage + 1)}
          className="flex items-center gap-1">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;