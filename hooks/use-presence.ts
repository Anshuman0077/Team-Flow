import { useState } from "react";
import usePartySocket from "partysocket/react";
import { PresenceMessage, PresenceMessageSchema, User } from "@/app/(dashboard)/schemas/realtime";

interface usePresenceProps {
    room: string;
    currentUser: User | null
}

export function usePresence({ room , currentUser}: usePresenceProps) {
    const [onlineUsers, setOnlineUsers] = useState<User[]>([])

    const socket  = usePartySocket({
        host:"http://127.0.0.1:8787",
        room: room,
        party: "chat",
        onOpen() {
            console.log("Connected to presence room:", room);
             
            // Register current user when connection opensb
            if (currentUser) {
                const message: PresenceMessage = {
                    type: "add-user",
                    payload: currentUser
                };

                socket.send(JSON.stringify(message));
            }
            
        },
        onMessage(e) {
            try {
                const message = JSON.parse(e.data);

                const result = PresenceMessageSchema.safeParse(message);

                if (result.success && result.data.type === "presence") {
                    setOnlineUsers(result.data.payload.users);
                }

            } catch (error) {
                console.log("Failed to parse message", error);
                
            }
        },
        onClose() {
            console.log("Disconnected from presence room: ", room);
        },
        onError(error) {
            console.log("Websocket error", error);
        },
    });
    return{
        onlineUsers,
        socket,
    }


}