"use client";

import React from "react";
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageList } from "./_components/MessageList";
import { MessageInputForm } from "./_components/message/MessageInputForm";
import { useParams } from "next/navigation";

const ChannelName = () => {
  const { channelId } = useParams<{ channelId: string }>();

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Fixed header */}
      <ChannelHeader />

      {/* Scrollable Message area */}
      <div className="flex-1 overflow-hidden w-full">
        <MessageList />
      </div>

      {/* Fixed Input */}
      <div className="border-t bg-background p-4">
        {/* ✅ Pass actual dynamic channelId */}
        <MessageInputForm channelId={channelId} />
      </div>
    </div>
  );
};

export default ChannelName;
