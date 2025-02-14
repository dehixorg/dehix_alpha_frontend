import { Skeleton } from '@/components/ui/skeleton';

const SkeletonLoader = ({ isTableView }: { isTableView: boolean }) => {
  return (
    <div className="space-y-4 w-full">
      <Skeleton className="h-6 w-1/4 flex justify-start" />

      {isTableView ? (
        <div className="border rounded-lg shadow-sm p-4">
          <Skeleton className="h-6 w-1/3 mb-3" /> {/* Table Title */}
          <div className="border-t">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b"
              >
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/5" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/8" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Card View Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="border rounded-2xl shadow-md p-4 space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/6 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-1/5" />
                <Skeleton className="h-7 w-1/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Second Section: Added Skeletons for both Table and Card views */}
      <div className="flex justify-between items-center mt-10">
        <Skeleton className="h-6 w-1/4 flex justify-start" />
        <Skeleton className="h-6 w-1/12 flex justify-start" />
      </div>

      {isTableView ? (
        <div className="border rounded-lg shadow-sm p-4">
          <div className="border-t">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b"
              >
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/5" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/8" />
                <Skeleton className="h-5 w-1/8" />
                <Skeleton className="h-5 w-1/8" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="border rounded-2xl shadow-md p-4 space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/6 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-1/5" />
                <Skeleton className="h-7 w-1/5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkeletonLoader;
