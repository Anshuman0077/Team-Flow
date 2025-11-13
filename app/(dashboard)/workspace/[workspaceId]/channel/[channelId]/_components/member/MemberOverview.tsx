import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { MemberItems } from "./MemberItems";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberOverview() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery(orpc.workspace.member.list.queryOptions());

  const members = data ?? [];
  const query = search.trim().toLowerCase();

  if (error) {
    return <h1>Error: {error.message}</h1>
  }

  const filteredMembers = query
    ? members.filter((m) => {
        const name = m.full_name?.toLowerCase();
        const email = m.email?.toLowerCase();
        return name?.includes(query) || email?.includes(query);
      })
    : members;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 hover:shadow-md hover:bg-accent/40"
        >
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Members</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="p-0 w-[340px] rounded-2xl shadow-2xl border border-border/50 bg-background/95 backdrop-blur-md overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b bg-muted/40">
            <h3 className="font-semibold text-sm text-foreground">Workspace Members</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage and view your team
            </p>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b bg-background/70">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50"
                placeholder="Search members..."
              />
            </div>
          </div>

          {/* Members List */}
          <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-thumb-rounded-xl">
            {isLoading ? (
              <div className="p-3 space-y-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/20 transition-colors"
                  >
                    {/* Avatar Skeleton */}
                    <Skeleton className="size-9 rounded-full" />

                    {/* Text Skeleton */}
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-28 rounded-md" />
                      <Skeleton className="h-2.5 w-20 rounded-md opacity-80" />
                    </div>

                    {/* Role badge skeleton */}
                    <Skeleton className="h-5 w-12 rounded-md" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-500">
                Failed to load members.
              </div>
            ) : filteredMembers?.length ? (
              <div className="flex flex-col gap-1 p-2">
                {filteredMembers.map((member) => (
                  <MemberItems member={member} key={member.id} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No members found.
              </div>
            )}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
