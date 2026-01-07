"use client";

import {
  CreateMessageSchema,
  createMessageSchema,
} from "@/app/(dashboard)/schemas/message";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { useAttachmentUpload } from "@/hooks/use-attatchment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { MessageComposer } from "../message/MessageComposer";
import { useEffect, useState } from "react";
import { InfiniteData,  useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { MessageListItem } from "@/lib/types";
import { useChannelRealtime } from "@/provider/ChannelRealtimeProvider";
import { useThreadRealtime } from "@/provider/ThreadRealtimeProvider";

interface ThreadReplyFormProps {
  threadId: string;
  user: KindeUser<Record<string , unknown>>;
}

export const ThreadReplyForm = ({ threadId , user}: ThreadReplyFormProps) => {
  const { channelId } = useParams<{ channelId: string }>();
  const upload = useAttachmentUpload();
const queryClient = useQueryClient()
const {send } = useChannelRealtime()
const {send: sendThread} = useThreadRealtime()
const [editorkey , setEditorKey] = useState(0)
  const form = useForm<CreateMessageSchema>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId,
      threadId,
    },
  });

  // console.log(threadId);
  
  // ✔️ IMPORTANT FIX: update threadId when switching threads
  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [threadId, form]);

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOptions = orpc.message.thread.list.queryOptions({
          input: {
            messageId: threadId
          }
        })

        //types define for replies count bumps of the main replies page
        type MessagePage = {
          items: Array<MessageListItem>
          nextCursor?: string
        }

        type InfiniteMessages = InfiniteData<MessagePage>

        await queryClient.cancelQueries({queryKey: listOptions.queryKey})

        const previous = queryClient.getQueryData(listOptions.queryKey)
        const optimistic: MessageListItem = {
          id: `optimistic:${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail:user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture , user.email!),
          channelId: data.channelId,
          threadsId: data.threadId!,
          imageUrl: data.imageUrl ?? null,
          reactions: [],
          repliesCount: 0,
        };

        queryClient.setQueryData(listOptions.queryKey , (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages , optimistic],
          }
        });

        //// optimistaclly bump rpliesCount in main message list for the parent message
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;

            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) => 
                m.id === threadId ? 
               {...m, repliesCount: m.repliesCount + 1} : 
               m
              
              ),
            }));
            return {
              ...old, pages
            }
          }
        )


        return {
          listOptions,
          previous
        }
      },
      onSuccess: (data, _vars, ctx) => {
        queryClient.invalidateQueries({queryKey: ctx.listOptions.queryKey})
        form.reset({
          content: "",
          channelId,
          threadId,
        });
        setEditorKey((k) => k + 1);
        
        sendThread({
          type: "thread:reply:created",
          payload: {reply: data}
        })

        send({
          type: "message:replies:increment",
          payload: {messageId: threadId, delta: 1}
        })
        toast.success("Reply added");
      },
      onError: (_err, _vars, ctx) => {
        if (!ctx) return;

        const {listOptions, previous} = ctx;

        if (previous) {
          queryClient.setQueryData(listOptions.queryKey, previous); 
        }
        
        toast.error("Something went wrong!");
      },
    })
  );

  function onSubmit(data: CreateMessageSchema) {
    upload.clear(); // ✔️ clear old image BEFORE submit

    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stageUrl || undefined,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-2"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  key={editorkey} // ✅ FIXED
                  value={field.value}
                  onChange={field.onChange}
                  upload={upload}
                  onSubmit={form.handleSubmit(onSubmit)} // ✔️ SINGLE submit source
                  isSubmitting={createMessageMutation.isPending}   // ✔️ VALID NOW
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
