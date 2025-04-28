'use client';

import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

interface LoadMoreProps<T> {
  fetchMoreData: (page: number) => Promise<T[]>;
  initialData: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  loadingSize?: string;
  noMoreMessage?: string;
}

export default function LoadMore<T>({
  fetchMoreData,
  initialData,
  renderItem,
  className = '',
  emptyMessage = 'No items found',
  loadingSize = '20%',
  noMoreMessage = 'No more items',
}: LoadMoreProps<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [done, setDone] = useState(false);
  const [ref, inView] = useInView();

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    try {
      const newItems = await fetchMoreData(nextPage);
      
      if (!newItems || newItems.length === 0) {
        setDone(true);
        return;
      }
      
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more items:', error);
      setDone(true);
    }
  };

  useEffect(() => {
    if (inView && !done) {
      handleLoadMore();
    }
  }, [inView]);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
      
      {!done ? (
        <div ref={ref} className="w-full h-40 flex justify-center items-center">
          {inView && (
            <Loader2 className={`mr-2 h-[${loadingSize}] w-[${loadingSize}] animate-spin text-primary`} />
          )}
        </div>
      ) : (
        <div className="w-full h-20 flex justify-center items-center">
          <span className="text-primary text-lg font-medium">{noMoreMessage}</span>
        </div>
      )}
    </>
  );
}
