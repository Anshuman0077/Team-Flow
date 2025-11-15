

import { createChannel, getChannel, listChannel } from "./channel"
import { InviteMember, listMembers } from "./member"
import { createMessage, listMessages, updateMessage } from "./message"
import { createWorkspace, listworkspaces } from "./workspace"

export const router = {
    workspace: {
        list: listworkspaces,
        create: createWorkspace,
        member: {
            list:listMembers,
            invite: InviteMember,
        },
    },

    channel: {
        create: createChannel,
        list: listChannel,
        get: getChannel,
    },

    message: {
        create: createMessage,
        list:   listMessages,
        update: updateMessage,

    }

}