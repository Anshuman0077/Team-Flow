import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmojiReaction } from "./EmojiReaction";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { GroupReactionsSchemaType } from "@/app/(dashboard)/schemas/message";

import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { MessageListItem } from "@/lib/types";


type ThreadContext = {type: "thread" , threadId: string}
type ListContext = {type: "list", channelId: string}

type MessagePage = {
  items: MessageListItem[],
  nextCursor?: string;
}

type InfiniteReplies = InfiniteData<MessagePage>;


interface  ReactionsBarProps {
  messageId: string
  reactions: GroupReactionsSchemaType[];
  context: ThreadContext | ListContext; 
}

export function ReactionsBar({messageId, reactions, context}: ReactionsBarProps) {
  
  const {channelId} = useParams<{channelId: string}>();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({

      onMutate: async (vars: {messageId: string, emoji: string}) => {
        const bump = (rxns: GroupReactionsSchemaType[]) => {
        const found = rxns.find((r) => r.emoji === vars.emoji)

        if (found) {
          const dec = found.count - 1

          return dec <= 0 ? rxns.filter((r) => r.emoji !== found.emoji) : rxns.map((r) => r.emoji === found.emoji ? {...r , count: dec , reactedByMe: false } : r)
        }
        return [...rxns , { emoji: vars.emoji, count: 1 , reactedByMe: true }]
        }

        const isThread = context && context.type === "thread"
        if (isThread) {
          const listOptions = orpc.message.thread.list.queryOptions({
            input: {
              messageId: context.threadId,
            }
          })
          await queryClient.cancelQueries({queryKey: listOptions.queryKey});
          const prevThread = queryClient.getQueryData(listOptions.queryKey)

          queryClient.setQueryData(listOptions.queryKey, 
            (old) => {
              
              if (!old) return old;

              if (vars.messageId === context.threadId) {
                return {
                   ...old,
                   parentRow: {
                    ...old.parentRow,
                    reactions: bump(old.parentRow.reactions)
                   }
                }
              }
              return {
                ...old,
                messages: old.messages.map((m) => m.id === vars.messageId ? {...m, reactions: bump(m.reactions)}: m)
              }

            }
          );

          return {
            prevThread,
            threadQueryKey: listOptions.queryKey,
          }
        }

        const listkey =  ["message.list", channelId];
        await queryClient.cancelQueries({queryKey: listkey});
        const previous = queryClient.getQueryData(listkey);


        queryClient.setQueryData<InfiniteReplies>(
          listkey,
          (old) => {
            if (!old) return old;

            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) => {
                if (m.id !== messageId) return m;
              const current = m.reactions

              return {
                ...m,
                reactions: bump(current),
              }
             
              })
            }))
             return {
              ...old,
              pages,

             }

          });
          return {
            previous,
            listkey,
          }
      },
      onSuccess: () => {
        return toast.success("Emoji Added successfully")
      },
      onError: (_err , _vars , ctx) => {
        if (ctx?.threadQueryKey && ctx.prevThread) {
          queryClient.setQueryData(ctx.threadQueryKey , ctx.prevThread)
        }
        if (ctx?.previous && ctx.listkey) {
          queryClient.setQueryData(ctx.listkey, ctx.previous);
        }
        return toast.error("Emoji added failed!!")
      }
    })
  )

  const handleToggle = (emoji: string) => {

    toggleMutation.mutate({emoji, messageId})
    // console.log(emoji);
    
  }
  return (
    <div className=" flex items-center gap-2 mt-2 px-1">
      {/* Render each reaction button */}
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

      {/* Example future UI — reactions display */}
      {/* <span className="px-2 py-1 text-xs bg-muted rounded-full">👍 12</span> */}
    </div>
  );
}