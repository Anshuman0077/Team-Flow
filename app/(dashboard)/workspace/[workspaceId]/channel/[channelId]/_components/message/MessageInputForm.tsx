"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createMessageSchema,
  CreateMessageSchema,
} from "@/app/(dashboard)/schemas/message";
import { orpc } from "@/lib/orpc";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { MessageComposer } from "./MessageComposer";
import { useAttachmentUpload } from "@/hooks/use-attatchment";
import type { Message } from "@prisma/client"; // ✅ Import only type

import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/get-avatar";
import { useChannelRealtime } from "@/provider/ChannelRealtimeProvider";

interface MessageInputFormProps {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
}

// Types for React Query infinite data
type MessagePage = { items: Message[]; nextCursor?: string };
type InfiniteMessages = InfiniteData<MessagePage>;

export const MessageInputForm = ({ channelId, user }: MessageInputFormProps) => {
  const queryClient = useQueryClient();
  const upload = useAttachmentUpload();
  const { send } = useChannelRealtime();

  const form = useForm<CreateMessageSchema>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId,
      content: "",
      imageUrl: undefined,
    },
  });

  // Keep imageUrl in sync with upload.stageUrl
  useEffect(() => {
    form.setValue("imageUrl", upload.stageUrl ?? undefined);
  }, [upload.stageUrl, form]);

  const createMessageMutation = useMutation({
    ...orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["message.list", channelId],
        });

        const previousData = queryClient.getQueriesData<InfiniteMessages>({
          queryKey: ["message.list", channelId],
        });

        const tempId = `optimistic-${crypto.randomUUID()}`;

        const optimisticMessage: Message = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId,
          threadsId: null,
        };

        queryClient.setQueryData<InfiniteMessages>(["message.list", channelId], (old) => {
          if (!old) {
            return {
              pages: [{ items: [optimisticMessage], nextCursor: undefined }],
              pageParams: [undefined],
            } satisfies InfiniteMessages;
          }

          const firstPage = old.pages[0] ?? { items: [], nextCursor: undefined };
          const updatedFirstPage: MessagePage = {
            ...firstPage,
            items: [optimisticMessage, ...firstPage.items],
          };

          return { ...old, pages: [updatedFirstPage, ...old.pages.slice(1)] };
        });

        return { previousData, tempId };
      },
    }),
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<InfiniteMessages>(["message.list", channelId], (old) => {
        if (!old) return old;

        const updatedPages = old.pages.map((page) => ({
          ...page,
          items: page.items.map((m) =>
            m.id === context.tempId
              ? { ...data } // replace temp with real message
              : m
          ),
        }));

        return { ...old, pages: updatedPages };
      });

      toast.success("Message sent successfully!");

      // Reset form and upload state
      form.reset({ channelId, content: "", imageUrl: undefined });
      upload.clear();

      send({ type: "message:created", payload: { message: data } });

      // Trigger scroll in MessageList
      const event = new CustomEvent("newMessageSent", { detail: { timestamp: Date.now() } });
      window.dispatchEvent(event);
    },
    onError: (_err, _variables, context) => {
      console.error("Frontend message creation error:", _err);

      if (context?.previousData) {
        queryClient.setQueryData(["message.list", channelId], context.previousData);
      }
      toast.error("Something went wrong");
    },
  });

  const onSubmit = (data: CreateMessageSchema) => {
    const trimmedContent = data.content?.trim();

    if (!trimmedContent || trimmedContent === "{}" || trimmedContent === '""') {
      toast.error("Please enter a valid message before sending.");
      return;
    }

    createMessageMutation.mutate({
      ...data,
      content: trimmedContent,
      imageUrl: upload.stageUrl || undefined,
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={form.handleSubmit(onSubmit)}
                  isSubmitting={createMessageMutation.isPending}
                  upload={upload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  );
};
