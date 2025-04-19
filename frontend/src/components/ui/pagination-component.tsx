'use client';

import React from 'react';
import { Button } from '../ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create page navigation function
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());

    // Update the URL
    router.push(`${baseUrl}?${params.toString()}`, { scroll: false });
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(
      <Button
        key="page-1"
        variant={currentPage === 1 ? 'default' : 'outline'}
        className="mx-1"
        onClick={() => goToPage(1)}
      >
        1
      </Button>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <Button variant="outline" className="mx-1" key="ellipsis-1" disabled>
          ...
        </Button>
      );
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown

      items.push(
        <Button
          key={`page-${i}`}
          variant={currentPage === i ? 'default' : 'outline'}
          className="mx-1"
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <Button variant="outline" className="mx-1" key="ellipsis-2" disabled>
          ...
        </Button>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <Button
          key={`page-${totalPages}`}
          variant={currentPage === totalPages ? 'default' : 'outline'}
          className="mx-1"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  return (
    <div className="mt-8 flex justify-center">
      <Button
        variant="outline"
        className="mx-1"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </Button>

      {renderPaginationItems()}

      <Button
        variant="outline"
        className="mx-1"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}
