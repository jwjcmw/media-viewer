import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { startWsServer, sendFire, sendAndWait } from "./wsServer.js";
import { ensureWindow, closeWindow } from "./window.js";

const server = new McpServer({
  name: "media-viewer",
  version: "0.1.0",
});

server.tool(
  "viewer_show",
  "Open a media viewer window to display video, PDF, markdown, or text content",
  {
    type: z.enum(["video", "pdf", "markdown", "text"]),
    source: z
      .string()
      .describe(
        "File path, URL, or raw content string depending on the type",
      ),
    title: z
      .string()
      .optional()
      .describe("Title shown in the viewer title bar"),
  },
  async ({ type, source, title }) => {
    await ensureWindow({ title: title ?? "Media Viewer" });
    sendFire("viewer_show", { type, source, title });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
  },
);

server.tool(
  "viewer_close",
  "Close the media viewer window",
  {},
  async () => {
    try {
      await sendAndWait("viewer_close", {}, 3_000);
    } catch {
      // window may already be closed
    }
    closeWindow();
    return { content: [{ type: "text", text: JSON.stringify({ ok: true }) }] };
  },
);

async function main() {
  startWsServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
