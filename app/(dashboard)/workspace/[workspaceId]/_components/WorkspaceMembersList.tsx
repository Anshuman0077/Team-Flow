"use client";

import { User } from '@/app/(dashboard)/schemas/realtime';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePresence } from '@/hooks/use-presence';
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React, { useMemo } from 'react';

export const WorkspaceMembersList = () => {
  const {
    data: { members },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  const { data: workspaceData } = useQuery(
    orpc.workspace.list.queryOptions()
  );

  const params = useParams();
  const workspaceId = params.workspaceId;

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
    room: `workspace-${workspaceId}`,
    currentUser,
  });

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers]
  );

  // 🔥 Admins always on top
  const sortedMembers = useMemo(() => {
    const admins = members.filter((m) => m.roles?.includes("admin"));
    const users = members.filter((m) => !m.roles?.includes("admin"));
    return [...admins, ...users];
  }, [members]);

  return (
    <div className="space-y-1 py-2">
      {sortedMembers.map((member) => {
        const isOnline = member.id && onlineUserIds.has(member.id);
        const isAdmin = member.roles?.includes("admin");

        return (
          <div
            key={member.id}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5",
              "transition-all duration-200 cursor-pointer",
              isAdmin
                ? "bg-amber-50/40 hover:bg-amber-100/50 dark:bg-amber-500/5 dark:hover:bg-amber-500/10"
                : "hover:bg-accent/60"
            )}
          >
            {/* Avatar */}
            <div className="relative">
              {/* Online glow */}
              {isOnline && (
                <span className="absolute -inset-1 rounded-full bg-green-500/20 blur-md" />
              )}

              <Avatar
                className={cn(
                  "relative z-10 size-9 ring-1 shadow-sm",
                  isAdmin
                    ? "ring-amber-400/50"
                    : "ring-border/40"
                )}
              >
                <AvatarImage
                  src={getAvatar(member.picture ?? null, member.email ?? "")}
                  alt={member.full_name ?? "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {member.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Online dot */}
              <span
                className={cn(
                  "absolute bottom-0 right-0 z-20 size-2.5 rounded-full border-2 border-background",
                  isOnline ? "bg-green-500" : "bg-muted-foreground/40"
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "truncate text-sm font-medium leading-tight",
                  isAdmin
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-foreground"
                )}
              >
                {member.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {member.email ?? "No email"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
