import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { twMerge } from "tailwind-merge";

type Params = {
  page: number;
  setPage: (page: number) => void;
  className?: string;
  isNextAvailable?: boolean;
};

export function TablePagination({
  className,
  page,
  setPage,
  isNextAvailable = true,
}: Params) {
  return (
    <Pagination className={twMerge("mt-6", className)}>
      <PaginationContent>
        {page-1 > 0 && (
          <>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(page - 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer"
                onClick={() => setPage(page - 1)}
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationLink className="cursor-pointer" isActive>
            {page}
          </PaginationLink>
        </PaginationItem>

        {isNextAvailable && (
          <>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer"
                onClick={() => setPage(page + 1)}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(page + 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}
