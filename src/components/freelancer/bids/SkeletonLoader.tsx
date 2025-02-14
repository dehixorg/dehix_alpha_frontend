import { Skeleton } from '@/components/ui/skeleton';

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <Skeleton key={index} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

export default SkeletonLoader;
