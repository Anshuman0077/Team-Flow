"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { SafeContent } from "@/components/rich-text-editor/safeContent";
import { getAvatar } from "@/lib/get-avatar";
import { MessageHoverToolBar } from "../toolbar";
import { EditMessage } from "../toolbar/EditMessage";
import { useThread } from "@/provider/ThreadProvider";
import { useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import type { MessageListItem } from "@/lib/types";
import { ReactionsBar } from "../reactions/ReactionsBar";

/**
 * - Prefetch: debounced, cached-check, only when repliesCount > 0
 * - Prevents unnecessary re-renders via memo
 */

interface MessageItemProps {
  message: MessageListItem;
  currentUser: string;
}

function safeParseContent(content: string) {
  try {
    return typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    // Fallback to simple prosemirror-like doc for SafeContent
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: String(content ?? "") }] }],
    };
  }
}

function usePrefetchThread(queryClient: ReturnType<typeof useQueryClient>, messageId: string | undefined, repliesCount: number) {
  // Use ref for timer handle (browser timer ID number)
  const timerRef = useRef<number | null>(null);

  const prefetch = useCallback(() => {
    if (!messageId || repliesCount <= 0) return;

    const options = orpc.message.thread.list.queryOptions({
      input: { messageId },
    });

    // If already cached -> skip
    const cached = queryClient.getQueryData(options.queryKey);
    if (cached) return;

    // debounce: clear previous timer
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    // delay prefetch slightly to avoid spamming on scroll/fast hover
    timerRef.current = window.setTimeout(() => {
      queryClient
        .prefetchQuery({
          ...options,
          staleTime: 60_000,
        })
        .catch(() => {});
      timerRef.current = null;
    }, 180); // 180ms is a sweet spot

  }, [queryClient, messageId, repliesCount]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return prefetch;
}

export const MessageItem = React.memo(function MessageItemInner({
  message,
  currentUser,
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { openThread } = useThread();
  const queryClient = useQueryClient();

  // safe parse content memoized
  const parsedContent = useMemo(() => safeParseContent(message.content), [message.content]);

  // prefetch hook
  const prefetchThreads = usePrefetchThread(queryClient, message.id, message.repliesCount ?? 0);

  // open thread click handler (stable)
  const handleOpenThread = useCallback(() => {
    if (!message.id) return;
    openThread(message.id);
  }, [openThread, message.id]);

  // show/hide edit
  const handleEdit = useCallback(() => setIsEditing(true), []);
  const handleCancelEdit = useCallback(() => setIsEditing(false), []);
  const handleSaveEdit = useCallback(() => setIsEditing(false), []);

  // memoized avatar url
  const avatarSrc = useMemo(() => getAvatar(message.authorAvatar, message.authorEmail), [
    message.authorAvatar,
    message.authorEmail,
  ]);

  return (
    <div className="flex items-start gap-3 relative p-3 rounded-lg group transition-all hover:bg-muted/40">
      {/* Avatar */}
      <Image
        src={avatarSrc}
        alt={`${message.authorName} avatar`}
        width={40}
        height={40}
        className="rounded-full object-cover border border-border shadow-sm"
      />

      {/* Content */}
      <div className="flex-1 space-y-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-2">
          <p className="font-medium text-foreground leading-none truncate">{message.authorName}</p>

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

        {/* edit or read mode */}
        {isEditing ? (
          <EditMessage message={message} onCancel={handleCancelEdit} onSave={handleSaveEdit} />
        ) : (
          <>
            <SafeContent
              className="text-sm break-words prose dark:prose-invert max-w-none mark:text-primary"
              content={parsedContent}
            />

            {/* attachment */}
            {message.imageUrl && (
              <div className="mt-2">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-black/5 dark:bg-neutral-900 max-w-[250px] max-h-[250px] flex items-center justify-center">
                  <Image
                    src={message.imageUrl}
                    alt="attachment"
                    width={800}
                    height={800}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-[1.03]"
                    priority={false}
                    loading="lazy"
                  />
                </div>
              </div>
            )}
            
            {/* Reactions  */}
            <ReactionsBar 
            reactions={message.reactions}
            messageId={message.id} 
            context={{type: "list", channelId: message.channelId!}}
            />

            {/* thread button */}
            {message.repliesCount > 0 && (
              <button
                type="button"
                onClick={handleOpenThread}
                onMouseEnter={prefetchThreads}
                onFocus={prefetchThreads}
                className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border"
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {message.repliesCount} {message.repliesCount === 1 ? "reply" : "replies"}
                </span>
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs">View thread</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* toolbar */}
      <MessageHoverToolBar
        messageId={message.id}
        canEdit={message.authorId === currentUser}
        onEdit={handleEdit}
      />

{/* <div className="text-2xl font-bold text-blue-800 ">
   <h1>Hello world</h1>
</div> */}
    </div>




  );
});

// helpful for debugging displayName
MessageItem.displayName = "MessageItem";
