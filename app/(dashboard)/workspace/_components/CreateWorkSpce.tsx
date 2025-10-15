"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus } from "lucide-react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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

// Define the form validation schema using Zod
const formSchema = z.object({
    workspaceName: z.string().min(2, {
        message: "Workspace name must be at least 2 characters.",
    }),
})

export function CreateWorkSpace() {
    const [open, setOpen] = useState(false)

    // Initialize the form with useForm hook
    // 1. resolver: connects Zod schema with react-hook-form
    // 2. defaultValues: sets initial form values
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            workspaceName: "",
        },
    })

    /**
     * Handle form submission
     * @param values - The form data that has been validated by Zod schema
     */
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form submitted with values:", values);
        // Here you would typically:
        // 1. Send data to your API
        // 2. Update state
        // 3. Close the dialog
        // 4. Reset the form
        
        // For now, just log and close dialog
        setOpen(false);
        
        // Optional: Reset the form after submission
        form.reset();
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
            <DialogContent className="sm:max-w-[425px]"> {/* Fixed typo: sm:mx-w -> sm:max-w */}
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
                            name="workspaceName"  // This must match the schema field name
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
                            <Button type="submit">
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>      
    )    
}