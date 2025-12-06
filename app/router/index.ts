

import { generateCompose, generateThreadSummary } from "./ai"
import { createChannel, getChannel, listChannel } from "./channel"
import { InviteMember, listMembers } from "./member"
import { createMessage, listMessages, listThreadReplies, toggleReaction, updateMessage } from "./message"
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
        reaction: {
            toggle: toggleReaction ,
        },
        thread: {
            list: listThreadReplies,
        }
    },
    ai: {
        compose: {
            generate: generateCompose,
        },
        thread: {
            summary: {
                generate: generateThreadSummary,
            }
        }
    }

}