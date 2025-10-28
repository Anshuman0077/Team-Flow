"use client";

import { useInfiniteQuery } from "@tanstack/react-query"
import { MessageItem } from "./message/MessageItem"
import { orpc } from "@/lib/orpc"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export function MessageList() {
    const { channelId } = useParams<{ channelId: string }>();
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef<boolean>(false);
    const previousItemsLengthRef = useRef<number>(0);
    const lastMessageIdRef = useRef<string | null>(null);

    const infiniteOptions = orpc.message.list.infiniteOptions({
        input: (pageParam: string | undefined) => ({
            channelId: channelId,
            cursor: pageParam,
            limit: 10,
        }),
        initialPageParam: undefined,
        getNextPageParam: (lastpage) => lastpage.nextCursor,
        select: (data) => ({
            pages: [...data.pages].map((p) => ({ ...p, items: [...p.items].reverse() })).reverse(),
            pageParams: [...data.pageParams].reverse(),
        })
    })

    const { 
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading, 
        error, 
        isFetching,
        isError,
        isFetching: isRefetching 
    } = useInfiniteQuery({
        ...infiniteOptions,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        refetchInterval: false,
    });

    // Memoized items
    const items = useMemo(() => {
        return data?.pages.flatMap((p) => p.items) ?? [];
    }, [data]);

    // Get the latest message ID
    const latestMessageId = useMemo(() => {
        return items[items.length - 1]?.id || null;
    }, [items]);

    // Smart auto-scroll logic
    useEffect(() => {
        if (!scrollRef.current) return;

        const el = scrollRef.current;
        const currentItemsLength = items.length;
        const previousItemsLength = previousItemsLengthRef.current;

        // Check if new messages were added (not from loading older messages)
        const hasNewMessages = currentItemsLength > previousItemsLength;
        const isNewMessageFromBottom = latestMessageId && latestMessageId !== lastMessageIdRef.current;

        // Update refs
        previousItemsLengthRef.current = currentItemsLength;
        lastMessageIdRef.current = latestMessageId;

        if (hasNewMessages && isNewMessageFromBottom) {
            // Always scroll to bottom when new messages arrive from sending
            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            });
        } else if (!hasInitialScrolled && currentItemsLength > 0) {
            // Initial scroll to bottom
            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    setHasInitialScrolled(true);
                }
            });
        }
    }, [items.length, latestMessageId, hasInitialScrolled]);

    // Listen for new message events (from MessageInputForm)
    useEffect(() => {
        const handleNewMessage = () => {
            // Force scroll to bottom when new message is sent
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100); // Small delay to ensure message is rendered
        };

        // Listen for custom event when new message is sent
        window.addEventListener('newMessageSent', handleNewMessage);
        
        return () => {
            window.removeEventListener('newMessageSent', handleNewMessage);
        };
    }, []);

    // Improved scroll handler with throttling
    const handleScroll = useCallback(() => {
        if (loadingRef.current || !scrollRef.current) return;

        const el = scrollRef.current;
        
        // Load more when scrolled near top
        if (el.scrollTop <= 100 && hasNextPage && !isFetchingNextPage) {
            loadingRef.current = true;
            
            const prevScrollHeight = el.scrollHeight;
            const prevScrollTop = el.scrollTop;

            fetchNextPage().finally(() => {
                requestAnimationFrame(() => {
                    if (scrollRef.current) {
                        const newScrollHeight = scrollRef.current.scrollHeight;
                        scrollRef.current.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
                    }
                    loadingRef.current = false;
                });
            });
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Intersection Observer for loading more messages
    useEffect(() => {
        if (!scrollRef.current || !hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { 
                root: scrollRef.current,
                rootMargin: '100px',
                threshold: 0.1 
            }
        );

        // Observe the first message element for infinite scroll
        const firstMessage = scrollRef.current.querySelector('[data-message-item]:first-child');
        if (firstMessage) {
            observer.observe(firstMessage);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

    // Loading state
    if (isLoading) {
        return (
            <div className="relative h-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading messages...</div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="relative h-full flex items-center justify-center">
                <div className="text-destructive">Failed to load messages</div>
            </div>
        );
    }

    // Empty state
    if (!isLoading && items.length === 0) {
        return (
            <div className="relative h-full flex items-center justify-center">
                <div className="text-muted-foreground text-center">
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full">
            {/* Loading indicator for older messages */}
            {isFetchingNextPage && (
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2 flex justify-center">
                    <div className="text-xs text-muted-foreground animate-pulse">
                        Loading older messages...
                    </div>
                </div>
            )}

            {/* Messages container */}
            <div 
                className="h-full overflow-y-auto px-4 scroll-smooth"
                ref={scrollRef}
                onScroll={handleScroll}
            >
                <div className="min-h-full flex flex-col justify-end">
                    {items.map((message, index) => (
                        <div 
                            key={message.id} 
                            data-message-item 
                            data-message-id={message.id}
                            className={index === 0 ? 'mt-auto' : ''}
                        >
                            <MessageItem message={message} />
                        </div>
                    ))}
                    
                    {/* Loading more trigger element */}
                    {hasNextPage && (
                        <div 
                            className="h-1" 
                            data-load-more-trigger 
                        />
                    )}
                </div>
            </div>

            {/* Scroll to bottom button - Show when not at bottom */}
            {hasInitialScrolled && scrollRef.current && 
             scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight > 200 && (
                <button
                    onClick={() => {
                        if (scrollRef.current) {
                            scrollRef.current.scrollTo({
                                top: scrollRef.current.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    }}
                    className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors z-20"
                    aria-label="Scroll to bottom"
                >
                    <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                    >
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                </button>
            )}
        </div>
    );
}