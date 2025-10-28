import { SafeContent } from '@/components/rich-text-editor/safeContent';
import { getAvatar } from '@/lib/get-avatar';
import { Message } from '@prisma/client'
import Image from 'next/image'
import React from 'react'

interface MessageItemProps {
    message: Message;
}

export const MessageItem = ({ message}: MessageItemProps) => {
    return (
        <div className='flex space-x-3  relative p-3 rounded-lg group hover:bg-muted/50'>
            <Image
                src={getAvatar(message.authorAvatar , message.authorEmail)}
                alt='User Avatar'
                width={32}
                height={32}
                className='size-8 rounded-full ' // Fixed from size-4 to size-8
            />

            <div className='flex-1 space-y-1 min-w-0'>
                <div className='flex items-center gap-x-2'>
                    <p className='font-medium text-foreground leading-none'>{message.authorName}</p>
                    <span className='text-xs text-muted-foreground leading-none'>
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }).format(message.createdAt)
                      }
                      {"  "}
                      {new Intl.DateTimeFormat("en-GB", {
                       hour12: true,
                       hour:"2-digit",
                       minute:"2-digit",
                      }).format(message.updatedAt)
                      }
                    
                    </span>
                </div>
                {/* <p className='text-sm max-w-none break-words'>{message.content}</p> */}
                <SafeContent className='text-sm break-words prose dark:prose-invert max-w-none mark:text-primary'  content={JSON.parse(message.content)}  /> 
            </div>
        </div>
    )
}