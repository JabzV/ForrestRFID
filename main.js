import { app, BrowserWindow } from "electron/main";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerUserIpc, registerSettingsIpc, registerDashboardIpc, registerHistoryIpc, registerCalculateBillIpc, registerUtilityIpc } from "./ipc/userIpc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database after app is ready
let db = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (process.env.DEV) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist/index.html"));
  }
}

app.whenReady().then(async () => {
  // Import and initialize database after app is ready
  const dbModule = await import("./database.js");
  db = dbModule.default;
  
  registerUserIpc();
  registerSettingsIpc();
  registerDashboardIpc();
  registerHistoryIpc();
  registerCalculateBillIpc();
  registerUtilityIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
