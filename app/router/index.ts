
import { createWorkspace, listworkspaces } from "./workspace"

export const router = {
    workspace: {
        list: listworkspaces,
        create: createWorkspace,
    }
}