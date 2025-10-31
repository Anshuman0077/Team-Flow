"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface MessageInputFormProps {
  channelId: string;
}

export const MessageInputForm = ({ channelId }: MessageInputFormProps) => {
  const queryClient = useQueryClient();
  const upload = useAttachmentUpload();

  const form = useForm<CreateMessageSchema>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId,
      content: "",
      imageUrl: undefined,
    },
  });

  // ✅ Keep imageUrl in sync with upload.stageUrl
  useEffect(() => {
    if (upload.stageUrl) {
      form.setValue("imageUrl", upload.stageUrl);
    } else {
      form.setValue("imageUrl", undefined);
    }
  }, [upload.stageUrl, form]);

  const createMessageMutation = useMutation({
    ...orpc.message.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.message.list.key(),
      });
      toast.success("Message sent successfully!");

      // Reset form and upload state
      form.reset({
        channelId,
        content: "",
        imageUrl: undefined,
      });
      upload.clear();

      // ✅ Trigger scroll in MessageList
      window.dispatchEvent(new CustomEvent("newMessageSent"));
    },
    onError: (error: any) => {
      console.error("Frontend message creation error:", error);

      switch (error?.code) {
        case "FORBIDDEN":
          toast.error("You don't have access to this channel.");
          break;
        case "BAD_REQUEST":
          toast.error("Message content cannot be empty.");
          break;
        default:
          toast.error("Failed to send message. Please try again.");
      }
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
      imageUrl: upload.stageUrl || undefined, //  ensure latest URL is sent
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
