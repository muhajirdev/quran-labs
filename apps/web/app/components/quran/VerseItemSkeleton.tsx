import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

export function VerseItemSkeleton() {
  return (
    <div className="relative pb-8">
      {/* Verse actions at the top */}
      <div className="flex justify-between items-center mb-4">
        {/* Verse number badge skeleton */}
        <Skeleton className="h-6 w-16 rounded-full bg-white/5" />

        {/* Action buttons skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full bg-white/5 opacity-30" />
          <Skeleton className="h-7 w-7 rounded-full bg-white/5 opacity-30" />
          <Skeleton className="h-7 w-7 rounded-full bg-white/5 opacity-30" />
        </div>
      </div>

      {/* Content with elegant spacing */}
      <div className="relative">
        {/* Arabic text skeleton */}
        <div className="mb-6 flex flex-col items-end gap-2">
          <Skeleton className="h-8 w-full rounded-md bg-white/5" />
          <Skeleton className="h-8 w-4/5 rounded-md bg-white/5" />
          <Skeleton className="h-8 w-3/5 rounded-md bg-white/5" />
        </div>

        {/* Translation skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-full rounded-md bg-white/5" />
          <Skeleton className="h-5 w-full rounded-md bg-white/5" />
          <Skeleton className="h-5 w-4/5 rounded-md bg-white/5" />
          <div className="mt-3">
            <Skeleton className="h-3 w-32 rounded-md bg-white/5" />
          </div>
        </div>

        {/* Subtle verse separator */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>
    </div>
  );
}
