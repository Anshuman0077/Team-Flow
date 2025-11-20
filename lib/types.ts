import { Message } from "@prisma/client";


export type MessageListItem = Message & {
    repliesCount: number;
}