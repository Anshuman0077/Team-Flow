"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuGroup, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
    Settings, 
    User, 
    CreditCard, 
    Bell, 
    LogOut, 
    HelpCircle,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutLink, PortalLink,  } from "@kinde-oss/kinde-auth-nextjs/components";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { getAvatar } from "@/lib/get-avatar";
import Image from "next/image";


interface UserNavProps {
    className?: string;
}

export function UserNav({ className }: UserNavProps) {

    const { 
       data: {user},
    } = useSuspenseQuery(orpc.workspace.list.queryOptions())
   
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon"
                    className="size-12 rounded-xl hover:rounded-lg transition-all duration-200 bg-background/50 border-border/50 hover:bg-accent hover:text-accent-foreground"
                >
                    {/* User Avatar */}
                    <Avatar className="h-8 w-8 border-2 border-background shadow-sm">


                        <Image
                        src={getAvatar(user.picture , user.email!)}
                        alt="User profile picture"
                        className="object-cover" 
                        fill  
                        /> 

                        {/* <AvatarImage
                            
                          
                        /> */}
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
                            {user.given_name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="right"
                sideOffset={8}
                className="w-64 rounded-xl shadow-lg border"
            >
                {/* User Info Section */}
                <DropdownMenuLabel className="p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={getAvatar(user.picture , user.email!)}
                                alt="User profile picture"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {user.given_name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium truncate">{user.given_name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Main Navigation Items */}
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent">
                        <PortalLink>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Profile</span>
                        </PortalLink>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent">
                        <PortalLink>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>Billing</span>

                        </PortalLink>

                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {/* Logout Section */}
                <DropdownMenuItem asChild className="flex  items-center gap-3 px-3 py-2.5 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700">
                    <LogoutLink>
                    <LogOut className="h-4 w-4" />
                    Log out 
                    </LogoutLink>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}