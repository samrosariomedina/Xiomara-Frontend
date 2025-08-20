"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Create an array of page numbers to display
  const getPageNumbers = () => {
    // Always show first and last page
    // For pages in between, show current page and one page before and after
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // If there are 7 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always add page 1
      pageNumbers.push(1);
      
      // Calculate range around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis if there's a gap after page 1
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if there's a gap before last page
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always add last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="w-full px-4 md:px-0 flex items-center justify-center md:justify-end space-x-2 mt-4 md:mt-8">
      {/* First page button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <ChevronLeft className="h-4 w-4 -ml-2" />
      </Button>
      
      {/* Previous page button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => (
        typeof page === 'number' ? (
          <Button
            key={index}
            variant={currentPage === page ? "default" : "ghost"}
            size="sm"
            className={`h-8 w-8 p-0 ${
              currentPage === page ? "bg-blue-900 hover:bg-blue-800" : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="text-gray-400 text-sm">
            {page}
          </span>
        )
      ))}

      {/* Next page button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Last page button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 bg-white hover:bg-gray-100"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <ChevronRight className="h-4 w-4 -ml-2" />
      </Button>
    </div>
  );
}
