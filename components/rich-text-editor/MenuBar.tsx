"use client";

import { Editor, useEditorState } from "@tiptap/react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import { Bold, Code, Italic, List, ListOrdered, Redo, Strikethrough, Undo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ComposeAssistent } from "./ComposeAssistent";
import { markdownToJson } from "@/lib/markdown-to-json";

interface MenuBarProps {
    editor: Editor | null;
}

export const MenuBar = ({ editor }: MenuBarProps) => {
    const editorState = useEditorState({
        editor,
        selector: ({editor}) => {
            if (!editor) return null

            return {
                isBold: editor.isActive('bold'),
                isItalic: editor.isActive("italic"),
                isStrike: editor.isActive("strike"),
                isCode: editor.isActive("code"),
                isCodeBlock: editor.isActive("codeBlock"), // Added code block state
                isBulletList: editor.isActive("bulletList"),
                isOrderedList: editor.isActive("orderedList"),
                canUndo: editor.can().undo(),
                canRedo: editor.can().redo(),
                currentContent: editor.getJSON()
            }
        }
    })

    if (!editor) {
        return null;
    }

    const handleAcceptCompose = (markdown: string) => {
       try {
        const json = markdownToJson(markdown);
        editor.commands.setContent(json)
       } catch {
         console.log("Something went wrong");
         
       }
    }

    return (
        <div className="border border-input border-t-0 border-x-0 rounded-t-lg p-2 bg-card flex flex-wrap items-center gap-2">
            <TooltipProvider>
                <div className="flex items-center gap-2">
                    {/* Text formatting group */}
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle 
                                    size="sm" 
                                    pressed={editor.isActive("bold")} 
                                    onPressedChange={() => {
                                        editor.chain().focus().toggleBold().run();
                                    }}
                                    className={cn(
                                        editorState?.isBold && "bg-muted text-accent-foreground"
                                    )}
                                >
                                    <Bold className="size-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Bold</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle 
                                    size="sm" 
                                    pressed={editor.isActive("italic")} 
                                    onPressedChange={() => {
                                        editor.chain().focus().toggleItalic().run();
                                    }}
                                    className={cn(
                                        editorState?.isItalic && "bg-muted text-accent-foreground"
                                    )}
                                >
                                    <Italic className="size-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Italic</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle 
                                    size="sm" 
                                    pressed={editor.isActive("strike")} 
                                    onPressedChange={() => {
                                        editor.chain().focus().toggleStrike().run();
                                    }}
                                    className={cn(
                                         editorState?.isStrike && "bg-muted text-accent-foreground"
                                    )}
                                >
                                    <Strikethrough className="size-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Strike</p>
                            </TooltipContent>
                        </Tooltip>

                    {/* Code Block */}

                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle 
                                    size="sm" 
                                    pressed={editor.isActive("codeBlock")} 
                                    onPressedChange={() => {
                                        editor.chain().focus().toggleCodeBlock().run();
                                    }}
                                    className={cn(
                                         editorState?.isCodeBlock && "bg-muted text-accent-foreground"
                                    )}
                                >
                                    <Code className="size-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Code Block</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    </div>

                    <div className="w-px h-6 bg-border"></div>

                    {/* Lists group */}
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle 
                                    size="sm" 
                                    pressed={editor.isActive("bulletList")} 
                                    onPressedChange={() => {
                                        editor.chain().focus().toggleBulletList().run();
                                    }}
                                    className={cn(
                                        editorState?.isBulletList && "bg-muted text-accent-foreground"
                                    )}
                                >
                                    <List className="size-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Bullet List</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Toggle 
                                    size="sm" 
                                    pressed={editor.isActive("orderedList")} 
                                    onPressedChange={() => {
                                        editor.chain().focus().toggleOrderedList().run();
                                    }}
                                    className={cn(
                                         editorState?.isOrderedList && "bg-muted text-accent-foreground"
                                    )}
                                >
                                    <ListOrdered className="size-4" />
                                </Toggle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ordered List</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="w-px h-6 bg-border"></div>

                    {/* History group */}
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    onClick={() => editor.chain().focus().undo().run()}
                                    disabled={!editorState?.canUndo}
                                    size="sm" 
                                    variant="ghost" 
                                    type="button"
                                >
                                    <Undo className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Undo</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    onClick={() => editor.chain().focus().redo().run()}
                                    disabled={!editorState?.canRedo}
                                    size="sm" 
                                    variant="ghost" 
                                    type="button"
                                >
                                    <Redo className="size-4" />
                                </Button>
                            </TooltipTrigger>   
                            <TooltipContent>
                                <p>Redo</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                <div className="w-px h-6 bg-border"></div>
                <div className="flex flex-wrap gap-1">
                   <ComposeAssistent content={JSON.stringify(editorState?.currentContent)} OnAccept={handleAcceptCompose} />
                </div>
            </TooltipProvider>
        </div>
    );
};