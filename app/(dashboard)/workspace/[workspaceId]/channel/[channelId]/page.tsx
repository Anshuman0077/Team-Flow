"use client";

import React from "react";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageList } from "./_components/MessageList";
import { MessageInputForm } from "./_components/message/MessageInputForm";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadSideBar } from "./_components/Threads/threadSidebare";
import { ThreadProvider, useThread } from "@/provider/ThreadProvider";
import { ChannelRealtimeProvider } from "@/provider/ChannelRealtimeProvider";

const ChannelMainPage = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const {isThreadOpen} = useThread()

  const { data, error, isLoading } = useQuery(
    orpc.channel.get.queryOptions({
      input: { channelId },
    })
  );

  if (error) return <p>Error loading channel</p>;

  return (
    <ChannelRealtimeProvider channelId={channelId}>
      <div className="h-screen w-full flex bg-background">
      {/* ---------- MAIN TWO-COLUMN LAYOUT ---------- */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* LEFT COLUMN - Channel Header + Messages */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Channel Header - Now part of left column */}
          {isLoading ? (
            <div className="px-4 border-b flex h-14 items-center justify-between">
              <Skeleton className="h-6 w-40 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="size-8" />
              </div>
            </div>
          ) : (
            <ChannelHeader channelName={data?.channelName} />
          )}

          {/* Message List Area */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
              <MessageList />
            </div>
            
            {/* Message Input */}
            <div className="border-t bg-background px-2 py-2">
              <MessageInputForm
                user={data?.currentUser as KindeUser<Record<string, unknown>>}
                channelId={channelId}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Threads Sidebar Only */}

        {isThreadOpen && <ThreadSideBar user={data?.currentUser as KindeUser<Record<string, unknown>> } />}


      

      </div>
    </div>
    </ChannelRealtimeProvider>
  );
};



const ThisIsTheChannelPage = () => {
  return (
    <ThreadProvider>
      <ChannelMainPage />
    </ThreadProvider>
  )
}

export default  ThisIsTheChannelPage; 