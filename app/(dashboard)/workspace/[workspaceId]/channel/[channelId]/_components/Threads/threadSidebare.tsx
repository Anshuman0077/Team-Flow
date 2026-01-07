"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, X, ChevronsDown } from "lucide-react";
import Image from "next/image";
import { ThreadReplies } from "./threadReplies";
import { ThreadReplyForm } from "./threadReplyForm";
import { motion, AnimatePresence } from "framer-motion";
import { useThread } from "@/provider/ThreadProvider";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { SafeContent } from "@/components/rich-text-editor/safeContent";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ThreadSidebareSkeleton } from "./threadSidebareSkeleton";
import { useEffect, useRef, useState } from "react";
import { SummaizeeThread } from "./SummarizeThread";
import { ThreadRealtimeProvider } from "@/provider/ThreadRealtimeProvider";

interface ThreadSidebarProps {
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadSideBar({ user }: ThreadSidebarProps) {
  const { selectedThreadId, closeThread } = useThread();

  // 🔹 REFS (always called)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const replyFormRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef(0);

  // 🔹 STATE
  const [buttonBottomPx, setButtonBottomPx] = useState(88);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 🔹 QUERY (always called, condition handled by enabled)
  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: { messageId: selectedThreadId as string },
      enabled: Boolean(selectedThreadId),
    })
  );

  const messageCount = data?.messages.length ?? 0;

  // 🔹 Helpers
  const isNearBottom = (el?: HTMLDivElement | null) => {
    const container = el ?? scrollRef.current;
    if (!container) return true;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <= 60
    );
  };

  const handleScroll = () => {
    setIsAtBottom(isNearBottom());
  };

  // 🔹 Auto-scroll on new messages
  useEffect(() => {
    if (!selectedThreadId) return;

    const el = scrollRef.current;
    if (!el) return;

    const prev = lastMessageCountRef.current;

    if (prev !== 0 && messageCount > prev && isNearBottom(el)) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      setIsAtBottom(true);
    }

    lastMessageCountRef.current = messageCount;
  }, [messageCount, selectedThreadId]);

  // 🔹 Keep pinned on resize / image load
  useEffect(() => {
    if (!selectedThreadId) return;

    const el = scrollRef.current;
    if (!el) return;

    const scrollIfNeeded = () => {
      if (isAtBottom) {
        requestAnimationFrame(() =>
          bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        );
      }
    };

    const ro = new ResizeObserver(scrollIfNeeded);
    ro.observe(el);

    const mo = new MutationObserver(scrollIfNeeded);
    mo.observe(el, { childList: true, subtree: true });

    const onLoad = (e: Event) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        scrollIfNeeded();
      }
    };

    el.addEventListener("load", onLoad, true);

    return () => {
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener("load", onLoad, true);
    };
  }, [isAtBottom, selectedThreadId]);

  // 🔹 Measure reply form height
  useEffect(() => {
    if (!selectedThreadId) return;

    const update = () => {
      const h = replyFormRef.current?.offsetHeight ?? 64;
      setButtonBottomPx(h + 12);
    };

    update();

    const el = replyFormRef.current;
    if (!el) {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [selectedThreadId]);

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
    setIsAtBottom(true);
  };

  // 🔹 SAFE early render
  if (!selectedThreadId) return null;

  return (
    <ThreadRealtimeProvider threadId={selectedThreadId}>
      <AnimatePresence>
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="w-[30rem] h-full flex flex-col bg-background/70 backdrop-blur-xl border-l shadow-xl relative"
        >
          {/* HEADER */}
          <div className="h-14 flex items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Thread</span>
            </div>
            <div className="flex gap-2">
              <SummaizeeThread messageId={selectedThreadId} />
              <Button variant="ghost" size="icon" onClick={closeThread}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* BODY */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            {isLoading && <ThreadSidebareSkeleton />}

            {data && (
              <>
                {/* Parent */}
                <div className="p-4 flex gap-3 border-b">
                  <Image
                    src={data.parentRow.authorAvatar}
                    width={48}
                    height={48}
                    alt=""
                    className="rounded-full"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">
                        {data.parentRow.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("en-IN", {
                          hour: "numeric",
                          minute: "numeric",
                        }).format(new Date(data.parentRow.createdAt))}
                      </span>
                    </div>

                    <SafeContent
                      className="prose dark:prose-invert"
                      content={
                        typeof data.parentRow.content === "string"
                          ? JSON.parse(data.parentRow.content)
                          : data.parentRow.content
                      }
                    />
                  </div>
                </div>

                {/* Replies */}
                <div className="py-3 px-2">
                  {data.messages.map((msg) => (
                    <ThreadReplies
                      key={msg.id}
                      message={msg}
                      selectedThreadId={selectedThreadId}
                    />
                  ))}
                  <div ref={bottomRef} />
                </div>
              </>
            )}
          </div>

          {!isAtBottom && (
            <button
              onClick={() => scrollToBottom()}
              style={{ bottom: `${buttonBottomPx}px` }}
              className="absolute right-6 z-50 bg-primary p-3 rounded-full"
            >
              <ChevronsDown className="size-3" />
            </button>
          )}

          <div ref={replyFormRef} className="border-t p-2">
            <ThreadReplyForm user={user} threadId={selectedThreadId} />
          </div>
        </motion.div>
      </AnimatePresence>
    </ThreadRealtimeProvider>
  );
}
