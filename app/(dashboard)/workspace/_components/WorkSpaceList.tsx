"use client"

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { usePresence } from "@/hooks/use-presence";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const colorCombinations = [
    "bg-blue-500 hover:bg-blue-600 text-white",       
    "bg-emerald-500 hover:bg-emerald-600 text-white", 
    "bg-purple-500 hover:bg-purple-600 text-white",    
    "bg-rose-500 hover:bg-rose-600 text-white",        
    "bg-indigo-500 hover:bg-indigo-600 text-white",    
    "bg-cyan-500  hover:bg-cyan-600  text-white",      
    "bg-pink-500 hover:bg-pink-600 text-white"         
];

const getWorkspaceColor = (id: string) => {
    const charSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charSum % colorCombinations.length;
    return colorCombinations[colorIndex];
};

export function WorkSpaceList() {
    const {
      data: { workspaces, currentWorkspace },
    } = useSuspenseQuery(orpc.workspace.list.queryOptions());
    return (
      <TooltipProvider>
        {workspaces.map((ws) => {
          const isActive = currentWorkspace?.orgCode === ws.id;
  
          return (
            <Tooltip key={ws.id}>
              <TooltipTrigger asChild>
                <LoginLink orgCode={ws.id} postLoginRedirectURL="/workspace">
                  <Button
                    size="icon"
                    className={cn(
                      "size-12 transition-all duration-200",
                      getWorkspaceColor(ws.id),
                      isActive
                        ? "ring-2 ring-blue-500 rounded-lg"
                        : "rounded-xl"
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {ws.avatar}
                    </span>
                  </Button>
                </LoginLink>
              </TooltipTrigger>
  
              <TooltipContent side="right">
                <p>
                  {ws.name} {isActive && "(Current)"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    );
  }
  
