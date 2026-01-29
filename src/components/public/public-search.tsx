'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for the PublicSearch component
 */
interface PublicSearchProps {
  /** Callback fired when search query changes (debounced) */
  onSearch: (query: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PublicSearch Component
 *
 * Search input for filtering gallery images with:
 * - 300ms debounced real-time filtering
 * - Search icon prefix
 * - Clear button when input has value
 * - Theme-aware focus ring (Pacific Blue light / Lime Moss dark)
 */
export function PublicSearch({
  onSearch,
  placeholder = 'Search images...',
  className,
}: PublicSearchProps) {
  const [value, setValue] = React.useState('');
  const inputId = React.useId();
  const descriptionId = `${inputId}-description`;

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-describedby={descriptionId}
      />
      <span id={descriptionId} className="sr-only">
        Type to search and filter gallery images
      </span>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
