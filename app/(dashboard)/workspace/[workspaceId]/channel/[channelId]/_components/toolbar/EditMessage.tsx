"use client";

import {
  updateMessageSchema,
  UpdateMessageSchemaType,
} from "@/app/(dashboard)/schemas/message";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { orpc } from "@/lib/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Message } from "@prisma/client";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { memo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditMessageProps {
  message: Message;
  onCancel: () => void;
  onSave: () => void;
}

export const EditMessage = memo(function EditMessage({
  message,
  onCancel,
  onSave,
}: EditMessageProps) {
  const queryClient = useQueryClient();

  // -----------------------------
  // 📝 Setup form
  // -----------------------------
  const form = useForm<UpdateMessageSchemaType>({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      messageId: message.id,
      content: message.content,
    },
    mode: "onChange",
  });

  // -----------------------------
  // ⚡ Mutation for updating message
  // -----------------------------
  const updateMutation = useMutation(
    orpc.message.update.mutationOptions({
      onSuccess: (updated) => {
        type MessagePage = { items: Message[]; nextCursor?: string };
        type InfiniteMessages = InfiniteData<MessagePage>;

        // Efficient update in cached messages
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", message.channelId],
          (prev) => {
            if (!prev) return prev;

            const updatedMessage = updated.message;

            return {
              ...prev,
              pages: prev.pages.map((page) => ({
                ...page,
                items: page.items.map((msg) =>
                  msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                ),
              })),
            };
          }
        );

        toast.success("Message updated successfully");
        onSave();
      },

      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const onSubmit = (data: UpdateMessageSchemaType) => {
    updateMutation.mutate(data);
  };

  // -----------------------------
  // 🖍 UI
  // -----------------------------
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RichTextEditor
                  field={field}
                  sendButton={
                    <div className="flex gap-2">
                      <Button
                        onClick={onCancel}
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>

                      <Button 
                      size="sm"
                      type="submit"
                      disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
});
