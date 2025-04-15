'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from './input';
import { Button } from './button';

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize search query from URL on component mount
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Handle input change and update URL
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams);

    // Set or remove the 'q' parameter based on input value
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }

    // Update the URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Optional: Add additional search logic here
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="flex flex-col items-center mb-10">
      {/* Search Input */}
      <div className="w-full max-w-xl">
        <div className="relative">
          <Input
            type="text"
            className="p-5"
            placeholder="E.g., Extract data from TikTok"
            value={searchQuery}
            onChange={handleInputChange}
          />
          <Button
            className="absolute right-1 top-0.5 bg-gray-800 hover:bg-gray-700 text-white px-6 rounded-xl"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SearchInput;
