"use client"

import { RichTextEditor } from '@/components/rich-text-editor/Editor'
import { Button } from '@/components/ui/button';
import { ImageIcon, Send } from 'lucide-react';
import React from 'react'

interface iAppProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  onReset?: () => void; // ✅ Add reset prop
}

export const MessageComposer = ({ value, onChange, onSubmit, isSubmitting, onReset }: iAppProps) => {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button 
            type='submit' 
            size="sm" 
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            <Send className='size-4 mr-1' />
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        }
        footerLeft={
          <Button 
            disabled={isSubmitting} 
            type='button' 
            size="sm" 
            variant="outline"
          >
            <ImageIcon className='size-4 mr-1' />
            Attach
          </Button>
        }
        // ✅ Pass reset function to editor
        onReset={onReset}
        isSubmitting={isSubmitting}
      />
    </>
  )
}