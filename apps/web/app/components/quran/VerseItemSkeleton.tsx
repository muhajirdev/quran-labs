import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

export function VerseItemSkeleton() {
  return (
    <div className="pb-6 border-b border-white/10 last:border-0">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
        <Skeleton className="h-6 w-24 rounded-md bg-white/5 opacity-30" />
      </div>

      {/* Arabic text skeleton */}
      <div className="mb-4 flex flex-col items-end gap-1.5">
        <Skeleton className="h-7 w-full rounded-md bg-white/5" />
        <Skeleton className="h-7 w-3/4 rounded-md bg-white/5" />
        <Skeleton className="h-7 w-1/2 rounded-md bg-white/5" />
      </div>

      {/* Translation skeleton */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-full rounded-md bg-white/5" />
        <Skeleton className="h-4 w-full rounded-md bg-white/5" />
        <Skeleton className="h-4 w-3/4 rounded-md bg-white/5" />
      </div>
    </div>
  );
}
