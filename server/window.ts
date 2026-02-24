import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";
import { waitForConnection } from "./wsServer.js";

let electronProc: ChildProcess | null = null;

const ROOT = path.resolve(import.meta.dirname, "..");
const ELECTRON_MAIN = path.join(ROOT, "electron-main.cjs");

function electronBin(): string {
  // electron package exports the path to the binary
  return path.join(ROOT, "node_modules", ".bin", "electron");
}

export interface WindowOpts {
  title?: string;
  url?: string;
}

export async function ensureWindow(opts?: WindowOpts): Promise<void> {
  if (electronProc && electronProc.exitCode === null) {
    // already running
    return;
  }

  const env: Record<string, string> = { ...process.env } as Record<
    string,
    string
  >;
  if (opts?.title) env.VIEWER_TITLE = opts.title;
  env.VIEWER_URL = opts?.url ?? "http://localhost:5174";

  electronProc = spawn(electronBin(), [ELECTRON_MAIN], {
    stdio: "ignore",
    env,
    detached: false,
  });

  electronProc.on("exit", () => {
    electronProc = null;
  });

  await waitForConnection(15_000);
}

export function closeWindow(): void {
  if (electronProc && electronProc.exitCode === null) {
    electronProc.kill();
    electronProc = null;
  }
}
