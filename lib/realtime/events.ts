import { EventEmitter } from "events";

// Global event bus for real-time ticket room pub/sub
const globalForEvents = globalThis as unknown as {
  ticketEvents: EventEmitter | undefined;
};

export const ticketEvents = globalForEvents.ticketEvents ?? new EventEmitter();
ticketEvents.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalForEvents.ticketEvents = ticketEvents;
}

export interface TicketRealtimeEvent {
  type: "NEW_MESSAGE" | "STATUS_CHANGE" | "PRIORITY_CHANGE" | "CATEGORY_CHANGE" | "ASSIGNMENT_CHANGE";
  ticketId: string;
  data: unknown;
  timestamp: string;
}

/**
 * Broadcast an authorized public event to clients subscribed to a ticket room
 */
export function emitTicketEvent(event: TicketRealtimeEvent) {
  ticketEvents.emit(`ticket:${event.ticketId}`, event);
}

/**
 * Subscribe a callback to real-time events for a specific ticket
 */
export function subscribeTicketEvent(
  ticketId: string,
  callback: (event: TicketRealtimeEvent) => void
): () => void {
  const channel = `ticket:${ticketId}`;
  ticketEvents.on(channel, callback);
  return () => {
    ticketEvents.off(channel, callback);
  };
}
