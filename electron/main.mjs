import { app, BrowserWindow, shell } from "electron";
import serve from "electron-serve";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Em desenvolvimento a janela abre o servidor do Next (npm run dev).
// Com --prod, ou no instalador, abre o export estático da pasta out/.
const emDesenvolvimento = !app.isPackaged && !process.argv.includes("--prod");
const carregarBuild = serve({ directory: path.join(raiz, "out") });

async function abrirJanela() {
  const janela = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 400,
    minHeight: 600,
    title: "Prévia",
    icon: path.join(raiz, "electron", "icone.png"),
    backgroundColor: "#EEF2F0",
    autoHideMenuBar: true,
  });

  // Links externos abrem no navegador do sistema, não dentro do app.
  janela.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });

  if (emDesenvolvimento) await janela.loadURL("http://localhost:3000");
  else await carregarBuild(janela);
}

app.whenReady().then(abrirJanela);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) abrirJanela();
});
