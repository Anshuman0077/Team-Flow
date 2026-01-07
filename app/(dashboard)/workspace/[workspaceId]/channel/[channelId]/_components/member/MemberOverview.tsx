import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { MemberItems } from "./MemberItems";
import { Skeleton } from "@/components/ui/skeleton";
import { usePresence } from "@/hooks/use-presence";
import { useParams } from "next/navigation";
import { User } from "@/app/(dashboard)/schemas/realtime";

export function MemberOverview() {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // 🔹 Queries (ALWAYS on top)
  const {
    data: membersData,
    isLoading,
    error,
  } = useQuery(orpc.workspace.member.list.queryOptions());

  const { data: workspaceData } = useQuery(
    orpc.workspace.list.queryOptions()
  );

  // 🔹 Derived data
  const members = membersData ?? [];

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = q
      ? members.filter((m) => {
          const name = m.full_name?.toLowerCase() ?? "";
          const email = m.email?.toLowerCase() ?? "";
          return name.includes(q) || email.includes(q);
        })
      : members;

    const admins = filtered.filter((m) => m.roles?.includes("admin"));
    const users = filtered.filter((m) => !m.roles?.includes("admin"));

    return [...admins, ...users];
  }, [members, search]);

  const currentUser = useMemo(() => {
    if (!workspaceData?.user) return null;

    return {
      id: workspaceData.user.id,
      full_name: workspaceData.user.given_name,
      email: workspaceData.user.email,
      picture: workspaceData.user.picture,
    } satisfies User;
  }, [workspaceData?.user]);

  const { onlineUsers } = usePresence({
    room: `workspace-${params.workspaceId}`,
    currentUser,
  });

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers]
  );

  // 🔹 Safe early return (after hooks)
  if (error) {
    return <h1>Error: {error.message}</h1>;
  }

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
            <h3 className="font-semibold text-sm">Workspace Members</h3>
            <p className="text-xs text-muted-foreground">
              Manage and view your team
            </p>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
                placeholder="Search members..."
              />
            </div>
          </div>

          {/* Members */}
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-2 py-2">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            ) : filteredMembers.length ? (
              <div className="flex flex-col gap-1 p-2">
                {filteredMembers.map((member) => (
                  <MemberItems
                    key={member.id}
                    member={member}
                    isOnline={
                      member.id ? onlineUserIds.has(member.id) : false
                    }
                  />
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
