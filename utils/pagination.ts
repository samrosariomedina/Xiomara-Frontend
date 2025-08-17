"use client";

/**
 * Paginates an array of items
 * 
 * @param items Array of items to paginate
 * @param currentPage Current page number (1-based)
 * @param itemsPerPage Number of items per page
 * @returns Object with paginated items and pagination info
 */
export function paginateItems<T>(
  items: T[],
  currentPage: number = 1,
  itemsPerPage: number = 8
) {
  // Ensure current page is valid
  const validCurrentPage = Math.max(1, Math.min(currentPage, Math.ceil(items.length / itemsPerPage) || 1));
  
  // Calculate pagination values
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  // Get current page items
  const currentItems = items.slice(startIndex, endIndex);
  
  return {
    currentItems,
    pagination: {
      currentPage: validCurrentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: validCurrentPage < totalPages,
      hasPrevPage: validCurrentPage > 1
    }
  };
}
