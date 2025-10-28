"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import { editorExtensions } from './extensions'
import { MenuBar } from './MenuBar'
import { ReactNode } from 'react'
import React from 'react'

interface iAppProps {
    field: any;
    sendButton: ReactNode;
    footerLeft?: ReactNode;
}

export function RichTextEditor({ field, sendButton, footerLeft }: iAppProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: editorExtensions,
        content: (() => {
            if (!field?.value) return "";
            try {
                const parsed = JSON.parse(field.value);
                return parsed && typeof parsed === 'object' ? parsed : "";
            } catch {
                return "";
            }
        })(),
        onUpdate: ({ editor }) => {
            if (field?.onChange) {
                const content = editor.getJSON();
                if (content && content.content && content.content.length > 0) {
                    field.onChange(JSON.stringify(content));
                } else {
                    field.onChange("");
                }
            }
        },
        editorProps: {
            attributes: {
                class: "min-h-[125px] w-full focus:outline-none p-4 prose prose-sm dark:prose-invert max-w-none",
            },
        }
    })

    return (
        <div className='relative w-full border border-input rounded-lg overflow-hidden bg-background flex flex-col'>
            <MenuBar editor={editor} />
            <EditorContent 
                editor={editor} 
                className='max-h-[200px] overflow-y-auto' 
            />

            <div className='flex items-center justify-between gap-2 px-3 py-2 border-t border-input bg-card'>
                <div className='min-h-8 flex items-center'>{footerLeft}</div>
                <div className='shrink-0'>{sendButton}</div>
            </div>
        </div>
    )
}