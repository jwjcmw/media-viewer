import { WebSocketServer, WebSocket } from "ws";
import crypto from "node:crypto";

const PORT = 9998;

let wss: WebSocketServer | null = null;
let socket: WebSocket | null = null;

const pending = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: Error) => void }
>();

let connectionResolvers: Array<() => void> = [];

export function startWsServer(): void {
  wss = new WebSocketServer({ port: PORT });

  wss.on("connection", (ws) => {
    socket = ws;

    // Wait for the UI to send a "ready" ping before resolving waiters.
    // This ensures React's onmessage handler is registered before we sendFire.
    ws.once("message", (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === "ready") {
          for (const resolve of connectionResolvers) resolve();
          connectionResolvers = [];
        }
      } catch {
        // fallback: resolve anyway
        for (const resolve of connectionResolvers) resolve();
        connectionResolvers = [];
      }
    });

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        const entry = pending.get(msg.id);
        if (entry) {
          pending.delete(msg.id);
          entry.resolve(msg.result);
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      socket = null;
      rejectAll("WebSocket closed");
    });

    ws.on("error", () => {
      socket = null;
      rejectAll("WebSocket error");
    });
  });
}

function rejectAll(reason: string): void {
  for (const [id, entry] of pending) {
    entry.reject(new Error(reason));
    pending.delete(id);
  }
}

export function isUiConnected(): boolean {
  return socket !== null && socket.readyState === WebSocket.OPEN;
}

export function waitForConnection(timeoutMs = 10_000): Promise<void> {
  if (isUiConnected()) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      connectionResolvers = connectionResolvers.filter((r) => r !== resolve);
      reject(new Error("Timed out waiting for UI connection"));
    }, timeoutMs);

    connectionResolvers.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export function sendFire(tool: string, params: unknown): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const id = crypto.randomUUID();
  socket.send(JSON.stringify({ id, tool, params }));
}

export function sendAndWait(
  tool: string,
  params: unknown,
  timeoutMs = 10_000,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return reject(new Error("UI not connected"));
    }

    const id = crypto.randomUUID();
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Timed out waiting for UI response"));
    }, timeoutMs);

    pending.set(id, {
      resolve: (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });

    socket.send(JSON.stringify({ id, tool, params }));
  });
}

export function stopWsServer(): void {
  if (wss) {
    wss.close();
    wss = null;
  }
}
