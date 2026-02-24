const { app, BrowserWindow } = require("electron");

const TITLE = process.env.VIEWER_TITLE || "Media Viewer";
const URL = process.env.VIEWER_URL || "http://localhost:5174";

app.commandLine.appendSwitch("disable-features", "CrossOriginOpenerPolicy");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 960,
    height: 700,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: true,
    center: true,
    title: TITLE,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false,
    },
  });

  win.loadURL(URL);

  win.on("closed", () => {
    app.quit();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
