"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { MessageItem } from "./message/MessageItem";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/general/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronsDown } from "lucide-react";

// 🧠 Refined, stable MessageList
export function MessageList() {
  const { data: { user } } = useSuspenseQuery(orpc.workspace.list.queryOptions());
  const { channelId } = useParams<{ channelId: string }>();
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const previousItemsLengthRef = useRef<number>(0);
  const lastMessageIdRef = useRef<string | null>(null);

  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageParam?: string | undefined) => ({
      channelId: channelId!,
      cursor: pageParam,
      limit: 10,
    }),
    queryKey: ["message.list", channelId],
    initialPageParam: undefined,
    getNextPageParam: (lastpage) => lastpage.nextCursor,
    select: (data) => ({
      pages: [...data.pages].map((p) => ({ ...p, items: [...p.items].reverse() })).reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const latestMessageId = items[items.length - 1]?.id ?? null;

  // 🪄 Scroll + unread logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const currentItemsLength = items.length;
    const previousItemsLength = previousItemsLengthRef.current;
    const hasNewMessages = currentItemsLength > previousItemsLength;
    const isNewMessageFromBottom =
      latestMessageId && latestMessageId !== lastMessageIdRef.current;

    previousItemsLengthRef.current = currentItemsLength;
    lastMessageIdRef.current = latestMessageId;

    if (hasNewMessages && isNewMessageFromBottom) {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 200;
      if (atBottom) {
        requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
        setShowScrollToBottom(false);
      } else {
        setShowScrollToBottom(true);
      }
    } else if (!hasInitialScrolled && currentItemsLength > 0) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        setHasInitialScrolled(true);
      });
    }
  }, [items.length, latestMessageId, hasInitialScrolled]);

  useEffect(() => {
    const handleNewMessage = () => {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          setShowScrollToBottom(false);
        }
      }, 100);
    };

    window.addEventListener("newMessageSent", handleNewMessage);
    return () => window.removeEventListener("newMessageSent", handleNewMessage);
  }, []);

  // 🌀 Scroll + pagination logic
  const handleScroll = useCallback(() => {
    if (loadingRef.current || !scrollRef.current) return;
    const el = scrollRef.current;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollToBottom(distanceFromBottom > 200);

    if (el.scrollTop <= 120 && hasNextPage && !isFetchingNextPage) {
      loadingRef.current = true;
      const prevScrollHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;

      fetchNextPage().finally(() => {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            const newScrollHeight = scrollRef.current.scrollHeight;
            scrollRef.current.scrollTop =
              newScrollHeight - prevScrollHeight + prevScrollTop;
          }
          loadingRef.current = false;
        });
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Optional IntersectionObserver backup
  useEffect(() => {
    if (!scrollRef.current || !hasNextPage) return;
    const container = scrollRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !loadingRef.current
        ) {
          fetchNextPage();
        }
      },
      { root: container, rootMargin: "200px", threshold: 0.05 }
    );

    const first = container.querySelector("[data-message-item]:first-child");
    if (first) observer.observe(first);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-destructive">Failed to load messages</div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <EmptyState
          title="No messages yet"
          description="Say hello — send the first message to start the conversation."
          buttonText="Send a message"
          href="#"
          className="h-full w-full flex items-center justify-center"
        />
      </div>
    );
  }

  const scrollToBottom = (smooth = true) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    // setUnreadCount(0);
    setShowScrollToBottom(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Elegant top sticky loader */}
      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-background/70 backdrop-blur-md border border-border/40 px-4 py-2 rounded-full shadow-sm"
        >
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            Loading previous messages...
          </span>
        </motion.div>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto px-4 pb-6 scroll-smooth"
      >
        <div className="flex flex-col gap-2 min-h-full justify-end">
          <AnimatePresence initial={false}>
            {items.map((message) => (
              <motion.div
                layout
                key={message.id}
                data-message-item
                data-message-id={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <MessageItem message={message} currentUser={user.id} />
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="h-8" />
        </div>
      </div>

      {/* Floating "scroll to bottom" button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            onClick={() => scrollToBottom(true)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            aria-label="Scroll to bottom"
            className="absolute bottom-5 right-5 z-40 flex items-center gap-2 bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg hover:scale-[1.03] transition-transform"
          >
            <ChevronsDown className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}