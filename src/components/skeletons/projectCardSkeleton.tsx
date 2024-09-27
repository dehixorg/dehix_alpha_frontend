import { Skeleton } from '@/components/ui/skeleton';

export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/10 rounded-lg shadow-sm animate-pulse min-w-[45%]">
      {/* Skeleton for Project Title */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 rounded-lg" /> {/* Project title */}
        <Skeleton className="h-4 w-1/2 rounded-md" /> {/* Project creation date */}
      </div>

      {/* Skeleton for Description */}
      <div className="flex flex-col gap-2 mt-4">
        <Skeleton className="h-4 w-full rounded-sm" /> {/* Description Line 1 */}
        <Skeleton className="h-4 w-5/6 rounded-sm" /> {/* Description Line 2 */}
        <Skeleton className="h-4 w-2/3 rounded-sm" /> {/* Description Line 3 */}
      </div>

      {/* Skeleton for Company and Role */}
      <div className="flex flex-col gap-2 mt-4">
        <Skeleton className="h-4 w-2/3 rounded-sm" /> {/* Company */}
        <Skeleton className="h-4 w-1/2 rounded-sm" /> {/* Role */}
        <Skeleton className="h-4 w-1/3 rounded-sm" /> {/* Status */}
      </div>

      {/* Skeleton for Skills */}
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Skill 1 */}
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Skill 2 */}
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Skill 3 */}
      </div>

      {/* Skeleton for Button */}
      <div className="mt-4">
        <Skeleton className="h-10 w-full rounded-lg" /> {/* Button */}
      </div>
    </div>
  );
}
