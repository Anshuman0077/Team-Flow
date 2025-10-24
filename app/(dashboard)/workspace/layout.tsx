import React, { ReactNode } from 'react'
import { WorkSpaceList } from './_components/WorkSpaceList'
import { CreateWorkSpace } from './_components/CreateWorkSpce'
import { TooltipProvider } from "@/components/ui/tooltip" // Import TooltipProvider
import { UserNav } from './_components/UserNav'
import { getQueryClient, HydrateClient } from '@/lib/query/hydration'
import { orpc } from '@/lib/orpc'

const WorkSpaceLayout = async ({children} : {children: ReactNode}) => {

  

  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(orpc.workspace.list.queryOptions());


  return (
   <div className='flex w-full h-screen'>
     <div className='flex h-full w-16 flex-col items-center justify-between bg-secondary py-4 px-2 border-r border-border'>
      {/* Wrap BOTH components in a single TooltipProvider */}
      <TooltipProvider>
      <div className='flex flex-col items-center gap-4'>
        <HydrateClient client={queryClient}>
           <WorkSpaceList/>
        </HydrateClient>

        
          <div className='mt-2'>
            <CreateWorkSpace />
          </div>
        </div>

        {/* Bottom Section: User Navigation */}
        <div className='w-full'>
          <HydrateClient client={queryClient}>
          <UserNav />

          </HydrateClient>
       
        </div>

      
       
      </TooltipProvider>
      
    </div>
    {children}
   
   </div>
  )
}

export default WorkSpaceLayout