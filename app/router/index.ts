

import { createChannel, listChannel } from "./channel"
import { createWorkspace, listworkspaces } from "./workspace"

export const router = {
    workspace: {
        list: listworkspaces,
        create: createWorkspace,
    },

    channel: {
        create: createChannel,
        list: listChannel,
    },

}