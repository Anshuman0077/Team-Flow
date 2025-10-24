"use client"

import { orpc } from "@/lib/orpc"
import { useSuspenseQuery } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"

export function WorkspaceHeader() {
  const { data, error, isLoading } = useSuspenseQuery({
    ...orpc.channel.list.queryOptions(),
    retry: 2,
    retryDelay: 1000,
  })

  if (error) {
    console.error("Error loading workspace:", error)
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-5" />
        <div>
          <h1 className="text-sm font-semibold">
            Error loading workspace
          </h1>
          <p className="text-xs">
            Failed to load workspace information
          </p>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2">
        <div className="size-8 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-1">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  const currentWorkspace = data.currentWorkspace

  if (!currentWorkspace) {
    return (
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
          <span className="text-xs font-medium">?</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            No Workspace
          </h1>
          <p className="text-xs text-muted-foreground">
            Select a workspace
          </p>
        </div>
      </div>
    )
  }

  // Use the correct property names from KindeOrganization
  const workspaceName = currentWorkspace.name || currentWorkspace.orgName || 'My Workspace'
  const workspaceCode = currentWorkspace.code || currentWorkspace.orgCode || ''

  return (
    <div className="flex items-center gap-3">
      {/* Workspace Avatar */}
      <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-sm font-bold text-white shadow-sm">
        {workspaceName.charAt(0).toUpperCase()}
      </div>
      
      {/* Workspace Info */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">
          {workspaceName}
        </h1>
        <p className="text-sm text-muted-foreground truncate">
          {workspaceCode ? `Team workspace` : 'Collaboration space'}
        </p>
      </div>
    </div>
  )
}