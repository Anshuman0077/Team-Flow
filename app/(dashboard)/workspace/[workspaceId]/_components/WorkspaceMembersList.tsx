"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatar } from '@/lib/get-avatar';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query';
import { Crown } from 'lucide-react'
import React from 'react'

export const WorkspaceMembersList = () => {
  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'online': return 'bg-green-500'
  //     case 'offline': return 'bg-gray-400'
  //     case 'idle': return 'bg-yellow-500'
  //     default: return 'bg-gray-400'
  //   } 
  // }



  const { 
    data:{members},
  } = useSuspenseQuery(orpc.channel.list.queryOptions())


  return (
    <div className="space-y-2 py-1">
      {/* Members Header */}
      {/* <div className="px-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Members — {Members.length}
          </span>
        </div>
      </div> */}

      {/* Members List */}
      <div className="space-y-1">
        {members.map((member) => (
          <div 
            key={member.id} 
            className={cn(
              "group flex items-center gap-3 px-3 py-2 rounded-lg",
              "hover:bg-accent cursor-pointer transition-all duration-200"
            )}
          >
            {/* Avatar with status */}
            <div className="relative flex-shrink-0">
              <Avatar className="size-8">
                <AvatarImage 
                  // src={member.picture} 
                  src={getAvatar(member.picture ?? null, member.email!)}
                  alt="User Picture"
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Status indicator */}
              {/* <div 
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background",
                  getStatusColor(member.status)
                )}
              /> */}
            </div>

            {/* Member info - Clean layout */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate text-foreground">
                  {member.full_name}
                </p>
                {/* {member.role === 'admin' && (
                  <Crown className="size-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )} */}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {member.email}
              </p>
            </div>

            {/* Status badge */}
            {/* <div className={cn(
              "text-xs px-2 py-1 rounded-full font-medium flex-shrink-0",
              member.status === 'online' && "text-green-700 bg-green-100",
              member.status === 'offline' && "text-gray-700 bg-gray-100",
              member.status === 'idle' && "text-yellow-700 bg-yellow-100"
            )}>
              {member.status === 'online' ? 'Online' : member.status === 'idle' ? 'Idle' : 'Offline'}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  )
}