// src/components/ui/Search.tsx
import { Search as SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

// Define props type
interface SearchProps {
  placeholder?: string;
  className?: string;
}

export function Search({
  placeholder = 'Search...',
  className = '',
}: SearchProps) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
      />
    </div>
  );
}
