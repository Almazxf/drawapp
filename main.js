const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'DrawApp',
    backgroundColor: '#1a1a2e',
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

// Save project
ipcMain.handle('save-project', async (event, data) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Сохранить проект',
    defaultPath: 'project.drawapp',
    filters: [{ name: 'DrawApp Project', extensions: ['drawapp'] }]
  });
  if (canceled || !filePath) return { success: false };
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Open project
ipcMain.handle('open-project', async (event) => {
  const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
    title: 'Открыть проект',
    filters: [{ name: 'DrawApp Project', extensions: ['drawapp'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths.length) return { success: false };
  try {
    const raw = fs.readFileSync(filePaths[0], 'utf-8');
    return { success: true, data: JSON.parse(raw) };
  } catch (e) {
    return { success: false, error: e.message };
  }
});
