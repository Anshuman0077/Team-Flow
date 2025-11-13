import { ThemeToggle } from '@/components/ui/themeToggle'
import { Hash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InviteMember } from './member/InviteMember'
import { MemberOverview } from './member/MemberOverview';

interface ChannelHeaderProps {
  channelName?: string;
}

export const ChannelHeader = ({ channelName }: ChannelHeaderProps) => {
  return (
    <TooltipProvider>
      <header className="flex items-center justify-between w-full h-14 px-6 border-b bg-card/60 backdrop-blur-md">
        {/* Left side - Channel Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Hash className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate capitalize">
            {channelName || 'Unnamed Channel'}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
        <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <MemberOverview />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Member Overview</p>
            </TooltipContent>
          </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <InviteMember />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Invite members</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>


        </div>
      </header>
    </TooltipProvider>
  )
}
