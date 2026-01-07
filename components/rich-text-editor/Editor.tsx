"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import { editorExtensions } from './extensions'
import { MenuBar } from './MenuBar'
import { ReactNode, useEffect } from 'react'
import React from 'react'


interface RichTextField {
    value: string;
    onChange: (value: string) => void;
  }
interface iAppProps {
    field: RichTextField;
    sendButton: ReactNode;
    footerLeft?: ReactNode;
    onReset?: () => void; // ✅ Add reset prop
    isSubmitting?: boolean; // ✅ Add submitting state
}

export function RichTextEditor({ field, sendButton, footerLeft, onReset, isSubmitting }: iAppProps) {
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

    // ✅ Clear editor when form is reset
    useEffect(() => {
        if (editor && field.value === "") {
          editor.commands.clearContent();
          onReset?.();
        }
      }, [editor, field.value, onReset]);

    // ✅ Clear editor when submission completes successfully
    useEffect(() => {
        if (editor && !isSubmitting && field.value === "") {
            editor.commands.clearContent();
        }
    }, [editor, isSubmitting, field.value]);

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