"use client";

import { buttonVariants } from "@/components/ui/button"
import { Hash, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { AlertCircle } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  __optimistic?: boolean; // Flag for optimistic updates
}

export function ChannelList() {
    const { data, error, isLoading, isFetching } = useQuery(orpc.channel.list.queryOptions());

    // Handle loading state
    if (isLoading) {
        return (
            <div className="space-y-0.5 py-1">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-full justify-start px-2 py-1 h-7 text-muted-foreground font-normal animate-pulse"
                        )}
                    >
                        <div className="flex items-center">
                            <Hash className="size-4 mr-2 text-muted-foreground/50" />
                            <div className="h-4 bg-muted-foreground/20 rounded w-20"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Handle error state
    if (error) {
        console.error("Error loading channels:", error);
        return (
            <div className="p-2 text-center">
                <AlertCircle className="size-4 mx-auto text-destructive mb-1" />
                <p className="text-xs text-destructive">Failed to load channels</p>
                <button 
                  className="text-xs text-primary underline mt-1"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
            </div>
        );
    }

    // Check if data exists and has channels array
    const channels = data?.channels || [];

    // Show loading indicator when refetching in background
    const showRefetching = isFetching && !isLoading && channels.length > 0;

    return (
        <div className="space-y-0.5 py-1 relative">
            {/* Refetching indicator */}
            {/* {showRefetching && (
                <div className="absolute -top-2 right-2">
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                </div>
            )} */}

            {/* Empty state */}
            {channels.length === 0 && !isLoading && (
                <div className="p-2 text-center">
                    <p className="text-xs text-muted-foreground">No channels yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Create your first channel!</p>
                </div>
            )}

            {/* Channels list */}
            {channels.map((channel: Channel) => (
                <Link  
                    key={channel.id}
                    href={`/workspace/${channel.workspaceId}/channel/${channel.id}`}
                    className={buttonVariants({
                        variant: "ghost",
                        className: cn(
                            "w-full justify-start px-2 py-1 h-7 text-muted-foreground hover:text-accent-foreground hover:bg-accent font-normal relative",
                            channel.__optimistic && "opacity-60" // Dim optimistic updates
                        )
                    })}  
                >
                    <Hash className="size-4 mr-2" />
                    <span className="truncate flex-1">
                        {channel.name}
                    </span>
                    
                    {/* Loading indicator for optimistic updates */}
                    {channel.__optimistic && (
                        <Loader2 className="size-3 animate-spin ml-2" />
                    )}
                </Link>
            ))}
        </div>
    );
}