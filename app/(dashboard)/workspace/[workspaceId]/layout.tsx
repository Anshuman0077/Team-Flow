import React, { ReactNode } from 'react'
import { WorkspaceHeader } from './_components/WorkspaceHeader'
import { CreateNewChannel } from './_components/CreateNewChannel'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { ChannelList } from './_components/ChannelList'
import { WorkspaceMembersList } from './_components/WorkspaceMembersList'
import { getQueryClient, HydrateClient } from '@/lib/query/hydration'
import { orpc } from '@/lib/orpc'

interface ChannelListLayoutProps {
    children: ReactNode
    params: {
        workspaceId: string
    }
}

const ChannelListLayout = async ({ children, params }: ChannelListLayoutProps) => {
    const queryClient = getQueryClient();
    
    try {
        await queryClient.prefetchQuery(orpc.channel.list.queryOptions());
    } catch (error) {
        console.error("Error prefetching channels:", error);
        // Don't throw, let the client component handle the error
    }

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className='flex h-full w-80 flex-col bg-secondary border-r border-border'>
                {/* Header */}
                <div className='flex items-center px-4 h-14 border-b border-border shrink-0'>
                    <HydrateClient client={queryClient}>
                        <WorkspaceHeader />
                    </HydrateClient>
                </div>
                
                {/* Create Channel Button */}
                <div className='px-4 py-2 shrink-0'>
                    <CreateNewChannel />
                </div>   
                
                {/* Channels Section */}
                <div className='flex-1 overflow-y-auto px-4 py-2'>
                    <Collapsible defaultOpen className="space-y-2">
                        <CollapsibleTrigger className='flex w-full items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground hover:bg-accent rounded-md transition-colors group'>
                            <span>Channels</span>
                            <ChevronDown className='size-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-1">
                            <HydrateClient client={queryClient}>
                                <ChannelList />
                            </HydrateClient>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* Members Section */}
                <div className='px-4 py-2 border-t border-border'>
                    <Collapsible defaultOpen className="space-y-2">
                        <CollapsibleTrigger className='flex w-full items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-accent-foreground hover:bg-accent rounded-md transition-colors group'>
                            <span>Members</span>
                            <ChevronDown className='size-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-1">
                         <HydrateClient client={queryClient}>
                            <WorkspaceMembersList />
                         </HydrateClient>
                         
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
            
            {/* Main Content */}
            {/* <div className="flex-1 overflow-hidden bg-background">
                {children}
            </div> */}
        </div>
    )
}

export default ChannelListLayout