import { app, shell, BrowserWindow, ipcMain, nativeImage, dialog } from 'electron'
import { join } from 'path'
import { initDb, listItems, createItem, updateItem, deleteItem } from './db'
import type { ItemInput, ItemPatch } from '../shared/types'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 760,
    minHeight: 560,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 20 },
    backgroundColor: '#0b0b0c',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin' && !app.isPackaged) {
    const icon = nativeImage.createFromPath(join(__dirname, '../../build/icon.png'))
    if (!icon.isEmpty()) app.dock.setIcon(icon)
  }

  try {
    initDb()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    dialog.showErrorBox('Queue failed to start', `Could not open the local database:\n\n${message}`)
    app.quit()
    return
  }

  ipcMain.handle('items:list', () => listItems())
  ipcMain.handle('items:create', (_e, input: ItemInput) => createItem(input))
  ipcMain.handle('items:update', (_e, id: number, patch: ItemPatch) => updateItem(id, patch))
  ipcMain.handle('items:delete', (_e, id: number) => deleteItem(id))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
