import { GroupReactionsSchemaType } from "@/app/(dashboard)/schemas/message";
import { Message } from "@prisma/client";


export type MessageListItem = Message & {
    repliesCount: number;
    reactions:  GroupReactionsSchemaType[]
}