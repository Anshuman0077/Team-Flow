import React, { ReactNode } from 'react'
import { WorkSpaceList } from './_components/WorkSpaceList'
import { CreateWorkSpace } from './_components/CreateWorkSpce'
import { TooltipProvider } from "@/components/ui/tooltip" // Import TooltipProvider
import { UserNav } from './_components/UserNav'

const WorkSpaceLayout = ({children} : {children: ReactNode}) => {
  return (
   <div className='flex w-full h-screen'>
     <div className='flex h-full w-16 flex-col items-center justify-between bg-secondary py-4 px-2 border-r border-border'>
      {/* Wrap BOTH components in a single TooltipProvider */}
      <TooltipProvider>
      <div className='flex flex-col items-center gap-4'>
          <WorkSpaceList/>
          <div className='mt-2'>
            <CreateWorkSpace />
          </div>
        </div>

        {/* Bottom Section: User Navigation */}
        <div className='w-full'>
          <UserNav />
        </div>

      
       
      </TooltipProvider>
      
    </div>
    {children}
   
   </div>
  )
}

export default WorkSpaceLayout