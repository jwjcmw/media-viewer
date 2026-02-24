import { useEffect, useRef, useState } from "react";
import VideoViewer from "./viewers/VideoViewer";
import PdfViewer from "./viewers/PdfViewer";
import MarkdownViewer from "./viewers/MarkdownViewer";
import TextViewer from "./viewers/TextViewer";

interface ViewerCommand {
  type: "video" | "pdf" | "markdown" | "text";
  source: string;
  title?: string;
}

export default function App() {
  const [command, setCommand] = useState<ViewerCommand | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket("ws://localhost:9998");
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "ready" }));
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.tool === "viewer_show") {
            setCommand(msg.params as ViewerCommand);
          } else if (msg.tool === "viewer_close") {
            ws.send(JSON.stringify({ id: msg.id, result: { ok: true } }));
            window.close();
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        setTimeout(connect, 1000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const title = command?.title ?? "Media Viewer";

  return (
    <div className="flex flex-col h-screen bg-zinc-900/95 text-zinc-100 rounded-xl overflow-hidden">
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 shrink-0 select-none"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <span className="text-sm font-medium truncate">{title}</span>
        <button
          onClick={() => window.close()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!command && (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            Waiting for content...
          </div>
        )}
        {command?.type === "video" && <VideoViewer source={command.source} />}
        {command?.type === "pdf" && <PdfViewer source={command.source} />}
        {command?.type === "markdown" && (
          <MarkdownViewer source={command.source} />
        )}
        {command?.type === "text" && <TextViewer source={command.source} />}
      </div>
    </div>
  );
}
