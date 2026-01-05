// index.ts

import { ChannelEventSchema, PresenceMessageSchema, UserSchema } from "@/app/(dashboard)/schemas/realtime";
import { log } from "node:console";
import { Connection, routePartykitRequest, Server } from "partyserver";
import z from "zod";


const ConnectionStateSchema = z.object({
    user: UserSchema.nullable().optional(),
}).nullable();

type ConnectionState = z.infer<typeof ConnectionStateSchema>;

type Message = z.infer<typeof PresenceMessageSchema>

// Define your Server
export class Chat extends Server {
    static options = {
        hibernate: true
      };
  onConnect(connection: Connection) {
    console.log("Connected", connection.id, "to server", this.name);
     
    // Send current presence to the newly connected user
    connection.send(JSON.stringify(this.getPresenceMessage()))
  }

  onClose(connetion: Connection) {
    console.log(`User disconnected: ${connetion.id}`);
    
    this.updateUsers();
  }
  onError(connection: Connection){
      console.log(`Connection error ${connection.id}`);

      this.updateUsers();
  }

  onMessage(connection: Connection, message: string) {
    try {
        const parsed = JSON.parse(message)
        const presence = PresenceMessageSchema.safeParse(parsed)

        if (presence.success) {
            if (presence.data.type === "add-user") {
                // Store user info on the connection
                this.setConnectionState(connection, {user: presence.data.payload });
                // Broadcast updated presence to all clients
                this.updateUsers();
                return;
            } if (presence.data.type === "remove-user") {
                this.setConnectionState(connection, null);

                this.updateUsers();

                return;
            }
        }

        const channelEvents = ChannelEventSchema.safeParse(parsed);

        if (channelEvents.success) {
          const payload = JSON.stringify(channelEvents.data);
          this.broadcast(payload, [connection.id]);
          return;
        }
    } catch (error) {
        console.log("Error processing message", error)
        
    }
  }

  updateUsers() {
    const presenceMessage = JSON.stringify(this.getPresenceMessage());

    // Use PartyServer's built-in broadCast method
    this.broadcast(presenceMessage)
  }
  
  getPresenceMessage() {
    return {
        type: "presence",
        payload: {users: this.getUsers()}
    } satisfies Message;
  }

  getUsers() {
    const users = new Map()

    for (const connection of this.getConnections()) {
        const state = this.getConnectionState(connection)

        if (state?.user) {
            users.set(state.user.id, state.user)
        }

    }
    return Array.from(users.values());
  }

  private setConnectionState(connection: Connection, state: ConnectionState) {
    connection.setState(state);
  }

  private getConnectionState(connection: Connection): ConnectionState {
    const result = ConnectionStateSchema.safeParse(connection.state)

    if (result.success) {
        return result.data
    }
    return null
  }


}

export default {
  // Set up your fetch handler to use configured Servers
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;