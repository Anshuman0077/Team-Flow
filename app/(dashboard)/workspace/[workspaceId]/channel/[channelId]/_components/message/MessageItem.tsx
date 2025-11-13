"use client";

import { SafeContent } from "@/components/rich-text-editor/safeContent";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "@prisma/client";
import Image from "next/image";
import React from "react";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  // 🎯 Parse content safely
  const parseContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] };
    }
  };

  return (
    <div className="flex items-start gap-3 relative p-3 rounded-lg group transition-all hover:bg-muted/40">
      {/* Avatar */}
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt="User Avatar"
        width={40}
        height={40}
        className="size-10 rounded-full object-cover border border-border shadow-sm"
      />

      {/* Message Content */}
      <div className="flex-1 space-y-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-2">
          <p className="font-medium text-foreground leading-none">
            {message.authorName}
          </p>
          <span className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(message.createdAt))}{" "}
            •{" "}
            {new Intl.DateTimeFormat("en-GB", {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(message.updatedAt))}
          </span>
        </div>

        {/* Message Text */}
        <SafeContent
          className="text-sm break-words prose dark:prose-invert max-w-none mark:text-primary"
          content={parseContent(message.content)}
        />

        {/* Image Attachment */}
        {message.imageUrl && (
          <div className="mt-2">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-black/5 dark:bg-neutral-900 max-w-[250px] max-h-[250px] flex items-center justify-center">
              <Image
                src={message.imageUrl}
                alt="Message Attachment"
                width={800}
                height={800}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-[1.03]"
                priority={false}
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};