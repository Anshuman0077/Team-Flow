

import { createChannel, listChannel } from "./channel"
import { createMessage, listMessages } from "./message"
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

    message: {
        create: createMessage,
        list:   listMessages,
    }

}