"use client";

import { ChannelNameSchema, transformChannelName } from "@/app/(dashboard)/schemas/channels";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { orpc } from "@/lib/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { isDefinedError } from "@orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function CreateNewChannel() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  type FormValues = z.infer<typeof ChannelNameSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(ChannelNameSchema),
    defaultValues: {
      name: "",
    }
  });

  const watchedName = form.watch("name");
  const transformedName = watchedName ? transformChannelName(watchedName) : "";

  const createChannelMutation = useMutation(
    orpc.channel.create.mutationOptions({
      // Optimistic update - immediately update the UI before the server responds
      onMutate: async (newChannel) => {
        // Cancel any outgoing refetches to avoid overwriting our optimistic update
        await queryClient.cancelQueries({ 
          queryKey: orpc.channel.list.queryKey() 
        });

        // Snapshot the previous value
        const previousChannels = queryClient.getQueryData(
          orpc.channel.list.queryKey()
        );

        // Optimistically update the cache
        queryClient.setQueryData(
          orpc.channel.list.queryKey(),
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              channels: [
                {
                  id: `optimistic-${Date.now()}`,
                  name: newChannel.name,
                  workspaceId: "optimistic", // This will be replaced by the real data
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  createdById: "optimistic",
                  __optimistic: true // Mark as optimistic for UI treatment
                },
                ...old.channels
              ]
            };
          }
        );

        return { previousChannels };
      },

      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (error, variables, context) => {
        if (context?.previousChannels) {
          queryClient.setQueryData(
            orpc.channel.list.queryKey(),
            context.previousChannels
          );
        }

        if (isDefinedError(error)) {
          toast.error(error.message);
        } else {
          toast.error("Failed to create channel. Please try again.");
        }
      },

      // Always refetch after error or success
      onSettled: () => {
        // Invalidate and refetch regardless of success/error
        queryClient.invalidateQueries({ 
          queryKey: orpc.channel.list.queryKey() 
        });
      },

      onSuccess: (newChannel) => {
        toast.success(`Channel "${newChannel.name}" created successfully!`);
        
        // Reset form and close dialog
        form.reset();
        setOpen(false);
        
        // The optimistic update already added it, but we want to ensure
        // we have the real data from the server
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: orpc.channel.list.queryKey() 
          });
        }, 100);
      },
    })
  );

  const onSubmit = (data: FormValues) => {
    createChannelMutation.mutate(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when dialog closes
      form.reset();
      createChannelMutation.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Plus className="size-4 mr-2" />
          Add Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Create New Channel
          </DialogTitle>
          <DialogDescription>
            Create a new channel for your workspace members to collaborate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField 
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., general, announcements, help..."
                      {...field}
                      disabled={createChannelMutation.isPending}
                    />
                  </FormControl>
                  {transformedName && transformedName !== watchedName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Will be created as: <code className="bg-muted px-1 py-0.5 rounded">{transformedName}</code>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={createChannelMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createChannelMutation.isPending || !form.formState.isValid}
              >
                {createChannelMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  "Create Channel"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}