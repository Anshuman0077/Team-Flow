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

interface ThreadSidebarProps {
  user: KindeUser<Record<string, unknown>>;
}

export function ThreadSideBar({ user }: ThreadSidebarProps) {
  const { selectedThreadId, closeThread } = useThread();

  if (!selectedThreadId) return null;

  // scroll container & anchor
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // reply form measurement for button placement
  const replyFormRef = useRef<HTMLDivElement | null>(null);
  const [buttonBottomPx, setButtonBottomPx] = useState<number>(88); // default

  // message count tracking and bottom state
  const lastMessageCountRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: { messageId: selectedThreadId! },
      enabled: Boolean(selectedThreadId),
    })
  );

  const messageCount = data?.messages.length ?? 0;

  // --- Helper: are we near the bottom of scroll container? ---
  const isNearBottom = (el?: HTMLDivElement | null) => {
    const container = el ?? scrollRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= 60;
  };

  // --- Scroll handler ---
  const handleScroll = () => {
    setIsAtBottom(isNearBottom());
  };

  // --- Auto-scroll when new messages arrive (only if user is at bottom) ---
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const prevCount = lastMessageCountRef.current;

    if (prevCount !== 0 && messageCount > prevCount) {
      if (isNearBottom(el)) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        });
        setIsAtBottom(true);
      }
    }

    lastMessageCountRef.current = messageCount;
  }, [messageCount]);

  // --- Keep pinned to bottom when images/load/resize change (if user was at bottom) ---
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollToBottomIfNeeded = () => {
      if (isAtBottom) {
        requestAnimationFrame(() =>
          bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
        );
      }
    };

    const resizeObs = new ResizeObserver(scrollToBottomIfNeeded);
    resizeObs.observe(el);

    const mutationObs = new MutationObserver(scrollToBottomIfNeeded);
    mutationObs.observe(el, { childList: true, subtree: true });

    // image load bubbling: listen on container for load events (capturing)
    const onLoad = (ev: Event) => {
      if ((ev.target as HTMLElement).tagName === "IMG") {
        scrollToBottomIfNeeded();
      }
    };
    el.addEventListener("load", onLoad, true);

    return () => {
      resizeObs.disconnect();
      mutationObs.disconnect();
      el.removeEventListener("load", onLoad, true);
    };
  }, [isAtBottom]);

  // --- Compute floating button bottom offset based on reply form height ---
  useEffect(() => {
    const update = () => {
      const formHeight = replyFormRef.current?.offsetHeight ?? 64;
      const safeGap = 12; // gap above reply form
      setButtonBottomPx(formHeight + safeGap);
    };

    update();

    // observe size changes of reply form
    const formEl = replyFormRef.current;
    if (!formEl) {
      // keep a window resize fallback
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const ro = new ResizeObserver(update);
    ro.observe(formEl);

    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [replyFormRef.current]);

  // --- Scroll to bottom action (exposed to button) ---
  const scrollToBottom = (smooth = true) => {
    if (!scrollRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    setIsAtBottom(true);
  };

  return (
    <AnimatePresence>
      {selectedThreadId && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="w-[30rem] h-full flex flex-col bg-background/70 backdrop-blur-xl border-l shadow-xl relative"
        >
          {/* HEADER */}
          <div className="h-14 flex items-center justify-between px-4 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Thread</span>
            </div>
            <div className="flex items-center gap-2">
            <SummaizeeThread messageId={selectedThreadId!} />
            <Button variant="ghost" size="icon" onClick={closeThread}>
              <X className="w-4 h-4" />
            </Button>
            </div>
          </div>

          {/* BODY: scrollRef SHOULD wrap all messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto smooth-scroll"
            aria-label="thread-scroll"
          >
            {isLoading && <ThreadSidebareSkeleton />}

            {data && (
              <>
                {/* Parent Message */}
                <div className="p-4 flex gap-x-3 bg-muted/10 backdrop-blur-md border-b">
                  <Image
                    src={data.parentRow.authorAvatar}
                    width={48}
                    height={48}
                    alt=""
                    className="rounded-full border border-white/10 shadow-sm"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">
                        {data.parentRow.authorName}
                      </span>

                      <span className="text-[11px] text-muted-foreground">
                        {new Intl.DateTimeFormat("en-IN", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                          month: "short",
                          day: "numeric",
                        }).format(new Date(data.parentRow.createdAt))}
                      </span>
                    </div>

                    <SafeContent
                      className="prose dark:prose-invert text-sm leading-6 break-words bg-background/40 backdrop-blur-sm"
                      content={
                        typeof data.parentRow.content === "string"
                          ? JSON.parse(data.parentRow.content)
                          : data.parentRow.content
                      }
                    />
                  </div>
                </div>

                {/* Replies */}
                <div className="py-3">
                  <p className="text-xs text-muted-foreground ml-4 mb-2">
                    {data.messages.length} replies
                  </p>

                  <div className="space-y-1 px-2">
                    {data.messages.map((msg) => (
                      <ThreadReplies key={msg.id} message={msg} selectedThreadId={selectedThreadId} />
                    ))}
                  </div>

                  {/* Scroll Anchor */}
                  <div ref={bottomRef} />
                </div>
              </>
            )}
          </div>

          {/* Floating Scroll-to-Bottom Button: positioned above the reply form using measured px */}
          {!isAtBottom && (
            <button
              onClick={() => scrollToBottom(true)}
              aria-label="scroll-to-bottom"
              style={{ bottom: `${buttonBottomPx}px` }}
              className="
                absolute
                right-6
                z-50
                bg-primary
                text-primary-foreground
                p-3
                rounded-full
                shadow-lg
                hover:scale-105
                transition
                flex
                items-center
                justify-center
              "
            >
              <ChevronsDown className="size-3" />
            </button>
          )}

          {/* Reply Form (measured) */}
          <div ref={replyFormRef} className="border-t p-2 bg-background/80 backdrop-blur-lg">
            <ThreadReplyForm user={user} threadId={selectedThreadId} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
