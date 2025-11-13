"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { inviteMemberSchema, InviteMemberSchemaType } from "@/app/(dashboard)/schemas/member";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

export const InviteMember = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);



  const form = useForm({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      name: "",
    }
  })


  const inviteMutation = useMutation(
    orpc.workspace.member.invite.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation sent successfully!");
        form.reset();
        setOpen(false);
      },
       onError: (error) => {
        toast.error(error.message)
       }
    })
  )




  async function onSubmit(values: InviteMemberSchemaType) {
    setLoading(true);
    try {
      // ✅ Replace this mock with your API call
      // await new Promise((resolve) => setTimeout(resolve, 1200));
      // toast.success(`Invitation sent to ${values.email}`);
      // form.reset();
      // setOpen(false);
      inviteMutation.mutate(values)
      
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-[420px] bg-card/70 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Invite a Member
          </DialogTitle>
          <DialogDescription>
            Fill out the details below to invite a member to this channel.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name..." {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address..."
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Invite"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
