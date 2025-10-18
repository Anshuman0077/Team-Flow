// CreateWorkspace.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus } from "lucide-react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// Import the schema and type from the separate file
// import { workspaceFormSchema, WorkspaceFormValues } from "./workspace-schema"
import { WorkspaceFormValues , workspaceFormSchema } from "../../schemas/workspace-schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { orpc } from "@/lib/orpc"
import { toast } from "sonner"

export function CreateWorkSpace() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    // Initialize the form with useForm hook
    // Using the imported schema and type
    const form = useForm<WorkspaceFormValues>({
        resolver: zodResolver(workspaceFormSchema),
        defaultValues: {
            name: "",
        },
    })


    const createWorkspaceMutation = useMutation(
        orpc.workspace.create.mutationOptions({
            onSuccess: (newWorkspace) => {
                toast.success(
                    `Workspace ${newWorkspace.workspaceName} created successfully`
                );
                queryClient.invalidateQueries({
                    queryKey: orpc.workspace.list.queryKey(),
                });
                form.reset();
                setOpen(false);
            },
            onError: (error) => {
                console.error("Workspace creation error:", error);
                toast.error("Failed to create workspace. Please try again!");
            }
        })
    );

    /**
     * Handle form submission
     * @param values - The form data that has been validated by Zod schema
     */
    function onSubmit(values: WorkspaceFormValues , ) {
        // console.log("Form submitted with values:", values);
        createWorkspaceMutation.mutate(values)
        // Here you would typically:
        // 1. Send data to your API
        // 2. Update state
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-12 rounded-xl border-2 border-dashed border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:rounded-lg transition-all duration-200"
                        >
                            <Plus className="size-5" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                {/* Tooltip that appears on hover */}
                <TooltipContent side="right">
                    <p>Create new workspace</p>
                </TooltipContent>
            </Tooltip>
            
            {/* Dialog content that appears when triggered */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Create Workspace
                    </DialogTitle>
                    <DialogDescription>
                        Create a new workspace to get started with your projects and collaboration.
                    </DialogDescription>
                </DialogHeader>

                {/* Form component that provides form context */}
                <Form {...form}>
                    {/* 
                    form onSubmit handler - this connects the form submission 
                    to our onSubmit function 
                    */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Form field for workspace name */}
                        <FormField
                            control={form.control}
                            name="name"  // This must match the schema field name
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
                                    <FormControl>
                                        {/* 
                                        Input field bound to the form 
                                        {...field} includes: 
                                        - value
                                        - onChange
                                        - onBlur
                                        - ref
                                        */}
                                        <Input 
                                            placeholder="My Workspace" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    {/* 
                                    FormDescription: Optional helper text 
                                    FormMessage: Shows validation errors automatically 
                                    */}
                                    <FormDescription>
                                        This will be the name of your new workspace.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {/* Form submission buttons */}
                        <div className="flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button disabled={createWorkspaceMutation.isPending} type="submit">
                               {createWorkspaceMutation.isPending ? "Creating..." : "Create Workspace"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>      
    )    
}