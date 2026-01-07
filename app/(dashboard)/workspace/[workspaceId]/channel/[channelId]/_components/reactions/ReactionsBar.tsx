import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmojiReaction } from "./EmojiReaction";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { GroupReactionsSchemaType } from "@/app/(dashboard)/schemas/message";

import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { MessageListItem } from "@/lib/types";
import { useChannelRealtime } from "@/provider/ChannelRealtimeProvider";
import { useOptionalThreadRealTime, useThreadRealtime } from "@/provider/ThreadRealtimeProvider";

type ThreadContext = { type: "thread"; threadId: string };
type ListContext = { type: "list"; channelId: string };

type MessagePage = {
  items: MessageListItem[];
  nextCursor?: string;
};

type InfiniteReplies = InfiniteData<MessagePage>;

interface ReactionsBarProps {
  messageId: string;
  reactions?: GroupReactionsSchemaType[]; // optional upstream, we will default
  context: ThreadContext | ListContext;
}

export function ReactionsBar({
  messageId,
  reactions = [], // default to empty array — prevents runtime .map on undefined
  context,
}: ReactionsBarProps) {
  const { channelId } = useParams<{ channelId: string }>();
  const queryClient = useQueryClient();
  const { send } = useChannelRealtime()
  const threadRealtime = useOptionalThreadRealTime()

  const toggleMutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({
      onMutate: async (vars: { messageId: string; emoji: string }) => {
        // defensive bump: accepts undefined and treats it as []
        const bump = (rxns?: GroupReactionsSchemaType[]) => {
          const arr = rxns ?? [];
          const found = arr.find((r) => r.emoji === vars.emoji);

          if (found) {
            const dec = found.count - 1;
            if (dec <= 0) {
              return arr.filter((r) => r.emoji !== found.emoji);
            }
            return arr.map((r) =>
              r.emoji === found.emoji
                ? { ...r, count: dec, reactedByMe: false }
                : r
            );
          }

          return [
            ...arr,
            { emoji: vars.emoji, count: 1, reactedByMe: true },
          ];
        };

        // THREAD optimistic update (if inside a thread view)
        const isThread = context && context.type === "thread";
        if (isThread) {
          const listOptions = orpc.message.thread.list.queryOptions({
            input: { messageId: context.threadId },
          });

          await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
          const prevThread = queryClient.getQueryData(listOptions.queryKey);

          queryClient.setQueryData(listOptions.queryKey, (old: any) => {
            if (!old) return old;

            // if toggled on the parent message (thread root)
            if (vars.messageId === context.threadId) {
              return {
                ...old,
                parentRow: {
                  ...old.parentRow,
                  // defend against undefined
                  reactions: bump(old.parentRow.reactions ?? []),
                },
              };
            }

            return {
              ...old,
              messages: old.messages.map((m: any) =>
                m.id === vars.messageId
                  ? { ...m, reactions: bump(m.reactions ?? []) }
                  : m
              ),
            };
          });

          return {
            prevThread,
            threadQueryKey: listOptions.queryKey,
          };
        }

        // LIST optimistic update
        const listKey = ["message.list", channelId];
        await queryClient.cancelQueries({ queryKey: listKey });
        const previous = queryClient.getQueryData(listKey);

        queryClient.setQueryData<InfiniteReplies>(listKey, (old) => {
          if (!old) return old;

          const pages = old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) => {
              if (m.id !== messageId) return m;

              // defend against undefined before bump
              return {
                ...m,
                reactions: bump(m.reactions ?? []),
              };
            }),
          }));

          return {
            ...old,
            pages,
          };
        });

        return {
          previous,
          listKey,
        };
      },

      onSuccess: (data) => {
         send({
          type: "reaction:updated",
          payload: data,
         })

         if (context && context.type === "thread" && threadRealtime ) {
          const threadId = context.threadId;

          threadRealtime.send({
            type: "thread:reaction:updated",
            payload: {...data, threadId},
          });
         }
        return toast.success("Emoji Added successfully");

      },

      onError: (_err, _vars, ctx) => {
        // restore thread state if provided
        if (ctx?.threadQueryKey && ctx.prevThread) {
          queryClient.setQueryData(ctx.threadQueryKey, ctx.prevThread);
        }
        // restore list state if provided
        if (ctx?.listKey && ctx.previous) {
          queryClient.setQueryData(ctx.listKey, ctx.previous);
        }
        return toast.error("Emoji added failed!!");
      },
    })
  );

  const handleToggle = (emoji: string) => {
    toggleMutation.mutate({ emoji, messageId });
  };

  return (
    <div className="flex items-center gap-2 mt-2 px-1">
      {/* safe map over reactions array (defaults to []) */}
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleToggle(r.emoji)}
          disabled={toggleMutation.isPending}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full border text-sm transition-all select-none",
            "hover:scale-[1.08] active:scale-95 hover:bg-accent hover:text-accent-foreground shadow-sm",
            r.reactedByMe
              ? "bg-primary text-primary-foreground border-primary shadow-md"
              : "bg-muted border-border"
          )}
        >
          <span className="text-lg">{r.emoji}</span>
          <span className="font-medium">{r.count}</span>
        </button>
      ))}

      <EmojiReaction onSelect={handleToggle} />
    </div>
  );
}
