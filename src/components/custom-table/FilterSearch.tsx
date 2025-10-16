import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Params = {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  refetch: () => void;
};

export const SearchComponent = ({
  searchValue,
  setSearchValue,
  refetch,
}: Params) => {
  const [search, setSearch] = useState<string>(searchValue);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchValue(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        refetch();
      }}
    >
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="h-10 w-full rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:ring-blue-500 pr-10"
      />
      {/* Search Button Icon inside the Input */}
      <Button
        variant="link"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
        aria-label="Search"
        type="submit"
      >
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
};
