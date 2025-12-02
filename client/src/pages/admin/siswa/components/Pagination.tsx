import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  if (totalPages <= 1) return null;

  const handleSetPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const middlePages = Array.from({ length: 3 }).map((_, i) => {
    const page = currentPage - 1 + i;
    if (page <= 1 || page >= totalPages) return null;
    return page;
  });

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 border-t bg-gray-50 ${className}`}>
      {/* Info */}
      <div className="text-sm text-gray-700">
        Halaman {currentPage} dari {totalPages}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Prev */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handleSetPage(currentPage - 1)}
          className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>

        {/* Page 1 */}
        <Button
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handleSetPage(1)}
          className="w-8 h-8 p-0">
          1
        </Button>

        {/* Left Ellipsis */}
        {currentPage > 3 && <span className="px-1 text-gray-500">...</span>}

        {/* Middle pages */}
        {middlePages.map((p, i) =>
          p ? (
            <Button
              key={i}
              variant={currentPage === p ? "default" : "outline"}
              size="sm"
              onClick={() => handleSetPage(p)}
              className="w-8 h-8 p-0">
              {p}
            </Button>
          ) : null
        )}

        {/* Right Ellipsis */}
        {currentPage < totalPages - 2 && (
          <span className="px-1 text-gray-500">...</span>
        )}

        {/* Last Page */}
        {totalPages > 1 && (
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => handleSetPage(totalPages)}
            className="w-8 h-8 p-0">
            {totalPages}
          </Button>
        )}

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handleSetPage(currentPage + 1)}
          className="flex items-center gap-1">
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
