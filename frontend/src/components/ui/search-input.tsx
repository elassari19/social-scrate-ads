'use client';

import React, { ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from './input';
import { Button } from './button';
import { Search } from 'lucide-react';

interface SearchInputProps {
  path?: string;
  placeholder?: string;
  className?: string;
}

function SearchInput({
  path = '',
  placeholder = 'E.g., Extract data from TikTok',
  className = '',
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current search query from URL
  const currentQuery = searchParams.get('q') || '';

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('searchQuery') as string;

    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams);

    // Set or remove the 'q' parameter based on input value
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }

    // Update the URL
    router.push(`${path}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={`flex flex-col items-center mb-10 ${className}`}>
      <form className="w-full max-w-3xl" onSubmit={handleSubmit}>
        <div className="relative shadow-lg rounded-full overflow-hidden bg-white transition-all duration-200 hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-black/20">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            name="searchQuery"
            defaultValue={currentQuery}
            className="p-6 pl-12 pr-32 border-none rounded-full focus:ring-0 focus:border-transparent text-base transition-colors duration-200 hover:bg-gray-50 focus:bg-white"
            placeholder={placeholder}
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:shadow-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SearchInput;
