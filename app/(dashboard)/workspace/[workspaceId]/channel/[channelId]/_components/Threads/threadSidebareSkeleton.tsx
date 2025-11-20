import { Skeleton } from "@/components/ui/skeleton";

export function ThreadSidebareSkeleton() {
  return (
    <div className="w-[30rem] h-full flex flex-col bg-background/70 backdrop-blur-xl border-l shadow-xl">

      {/* HEADER */}
      <div className="h-14 flex items-center justify-between px-4 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto smooth-scroll">

        {/* Parent Message Skeleton */}
        <div className="p-4 border-b bg-muted/20 flex gap-3">
          {/* avatar */}
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="flex-1 space-y-2">
            {/* name + time */}
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* content text lines */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[80%]" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
        </div>

        {/* Replies count */}
        <div className="py-3 ml-4">
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Replies list */}
        <div className="space-y-2 px-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReplySkeleton key={i} />
          ))}
        </div>

      </div>

      {/* Reply Form Skeleton */}
      {/* <div className="border-t p-2 bg-background/80 backdrop-blur-lg">
        <Skeleton className="h-56 w-full rounded-md" />
      </div> */}
    </div>
  );
}

/* ------------------------------------------ */
/* ---------- Reply ITEM SKELETON ------------ */
/* ------------------------------------------ */

function ReplySkeleton() {
  return (
    <div className="
      flex items-start gap-3 p-3 rounded-xl 
      bg-muted/20 backdrop-blur-sm border border-transparent
    ">
      {/* avatar */}
      <Skeleton className="h-9 w-9 rounded-full" />

      <div className="flex-1 space-y-2">

        {/* name + time */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>

        {/* message bubble */}
        <div className="border border-white/10 rounded-lg p-3 bg-background/50 backdrop-blur-sm space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[80%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
      </div>
    </div>
  );
}
