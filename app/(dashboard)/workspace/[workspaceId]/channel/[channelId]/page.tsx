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

const ChannelMainPage = () => {
  const { channelId } = useParams<{ channelId: string }>(); 

  const {data, error , isLoading}  = useQuery(
    orpc.channel.get.queryOptions({
      input: {
        channelId: channelId,
      }
    })
  );

  if (error) {
    return <p>Error</p>
    
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Header Section */}
      {isLoading ? (
        <div className="px-4 border-b flex h-14 items-center justify-between">
          {/* Left: Theme Toggle + Channel Name */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-40 rounded-md" />  {/* Channel name */}
          </div>
          {/* Right: Members + Invite buttons */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="size-8" />
          </div>
        </div>
      ) : (
        <ChannelHeader channelName={data?.channelName} />
      )}
      
      {/* Scrollable Message area */}
      <div className="flex-1 overflow-hidden w-full">
        <MessageList />
      </div>

      {/* Fixed Input */}
      <div className="border-t bg-background p-4">
        {/* ✅ Pass actual dynamic channelId */}
        <MessageInputForm 
           user={data?.currentUser as  KindeUser<Record<string, unknown>>} 
           channelId={channelId} 
       />
      </div>
    </div>
  );
};

export default ChannelMainPage;
