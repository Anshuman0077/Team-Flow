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

  const onlineUserIds = useMemo( () => new Set(onlineUsers.map((u) => u.id)), [onlineUsers] );

  return (
    <div className="space-y-1 py-2">
      {members.map((member) => {
        // const isOnline = onlineUserIds.has(member.id);

        return (
          <div
            key={member.id}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5",
              "transition-all duration-200",
              "hover:bg-accent/60 hover:shadow-sm"
            )}
          >
            {/* Avatar + Status */}
            <div className="relative">
              {/* Status ring */}
              <div
                className={cn(
                  "absolute -inset-0.5 rounded-full",
                  member.id && onlineUserIds.has(member.id)
                    ? "bg-green-500/30 animate-pulse"
                    : "bg-transparent"
                )}
              />

              <Avatar className="relative z-10 size-9 border border-border">
                <AvatarImage
                  src={getAvatar(
                    member.picture ?? null,
                    member.email ?? "" // ✅ FIXED HERE
                  )}
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
                  member.id && onlineUserIds.has(member.id) ? "bg-green-500" : "bg-muted-foreground/40"
                )}
              />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground leading-tight">
                {member.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {member.email ?? "No email"}
              </p>
            </div>

            {/* Status label */}
            <div
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                member.id && onlineUserIds.has(member.id) ? "text-green-500" : "text-muted-foreground"
              )}
            >
              { member.id && onlineUserIds.has(member.id) ? "Online" : "Offline"}
            </div>
          </div>
        );
      })}
    </div>
  );
};
