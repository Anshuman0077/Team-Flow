import { ThemeToggle } from '@/components/ui/themeToggle'
import { Hash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const ChannelHeader = () => {
  return (
    <TooltipProvider>
      <div className='flex items-center justify-between w-full h-14 px-4 border-b bg-card/50 backdrop-blur-sm flex-shrink-0'>
        {/* Left side - Channel info */}
        <div className='flex items-center gap-2 min-w-0 flex-1'>
          <Hash className='size-5 text-muted-foreground flex-shrink-0' />
          <h1 className='text-lg font-semibold text-foreground truncate'>
            super-cool-channel
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className='flex items-center gap-1 flex-shrink-0'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}