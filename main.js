const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

let win
let savWin
let aboutWin
let settingsWin
let settings

function createWindow (settings) {
  win = new BrowserWindow({
      width: 600,
      height: 800,
      show: false
    })

  win.setMenu(null)
  win.loadFile('index.html')

  // win.webContents.openDevTools()

  win.on('ready-to-show', () => {
    win.webContents.send("loadSettings", settings)
    win.show()
  })

  win.on('closed', () => {
    if (savWin) savWin.close()
    if (aboutWin) aboutWin.close()
    if (settingsWin) settingsWin.close()
    settings = null
    win = null
  })
}

app.on('ready', () => {
  loadSettings()
  createWindow(settings)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow(settings)
  }
})

function loadSettings () {
  let settingsFile = path.join(app.getPath("userData"), "settings.json")
  if (fs.existsSync(settingsFile)) {
    settings = JSON.parse(fs.readFileSync(settingsFile, { encoding: "utf8" }))
  } else {
    settings = {
      keymap: {
        game: {
          "left":     "a",
          "right":    "d",
          "up":       "w",
          "down":     "s",
          "a":        "l",
          "b":        "j",
          "select":   "u",
          "start":    "o"
        },
        system: {
          "save":     "[",
          "load":     "]",
          "capture":  "F12"
        }
      }
    }
    fs.writeFile(settingsFile, JSON.stringify(settings), err => {
      if (err) throw err
    })
  }
}

ipcMain.on("openROM", event => {
  dialog.showOpenDialog({
    title: "打开 ROM",
    properties: ["openFile"],
    filters: [
      { name: "ROM 文件", extensions: ["gb", "gbc"] }
    ]
  }, (files) => {
    if (files) {
      loadRom(files[0], event)
    }
  })
})

function loadRom (filepath, event) {
  var stream = fs.createReadStream(filepath)
  var fsHash = crypto.createHash("md5")
  stream.on("data", d => {
    fsHash.update(d)
  })
  stream.on("end", () => {
    var md5 = fsHash.digest("hex")
    let rom = {
      title: path.basename(filepath, path.extname(filepath)),
      url: filepath,
      md5: md5
    }
    event.sender.send("romSelected", rom)
  })
}

ipcMain.on("saveState", (event, state) => {
  let savePath = path.join(app.getPath("userData"), "saves", state.md5, state.time)
  mkdirp(savePath, err => {
    if (err) throw err
    fs.writeFile(path.join(savePath, "data.json"), JSON.stringify(state.data), err => {
      if (err) throw err
      fs.writeFile(path.join(savePath, "image.png"), state.image.split(',')[1], "base64", err => {
        if (err) throw err
        event.sender.send("stateSaved")
      })
    })
  })
})

function createSavesWindow (rom, saves) {
  if (savWin) return
  savWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    frame: false
  })
  savWin.setMenu(null)
  savWin.loadFile('saves.html')

  // savWin.webContents.openDevTools()

  savWin.on('ready-to-show', () => {
    savWin.webContents.send("savesList", { rom: rom, saves: saves })
    savWin.show()
  })

  savWin.on('closed', () => {
    savWin = null
  })
}

ipcMain.on("listSaves", (event, rom) => {
  let savePath = path.join(app.getPath("userData"), "saves", rom.md5)
  var saves = new Array;
  fs.readdir(savePath, (err, files) => {
    if (files) {
      files.forEach(dir => {
        let absPath = path.join(savePath, dir)
        if (fs.statSync(absPath).isDirectory()) {
          saves.push({
            title: dir,
            path: absPath,
            data: path.join(absPath, "data.json"),
            img: path.join(absPath, "image.png")
          })
        }
      })
    }
    createSavesWindow(rom, saves.reverse())
  })
})

ipcMain.on("loadState", (event, dataURL) => {
  savWin.close()
  if (dataURL) {
    win.send("loadState", dataURL)
  }
})

ipcMain.on("deleteState", (event, dir) => {
  rimraf(dir, err => {
    if (err) throw err
    event.sender.send("stateDeleted", path.basename(dir))
  })
})

ipcMain.on("openSaveDir", (event, rom) => {
  let savePath = path.join(app.getPath("userData"), "saves", rom.md5)
  shell.openItem(savePath)
})

ipcMain.on("saveCapture", (event, imageData) => {
  dialog.showSaveDialog({
    title: "保存屏幕截图",
    defaultPath: path.join(app.getPath("pictures"), "screenshot.png"),
    filters: [
      { name: "便携式网络图形", extensions: ["png"] }
    ]
  }, filename => {
    if (filename) {
      fs.writeFile(filename, imageData.split(',')[1], "base64", err => {
        if (err) throw err
      })
    }
  })
})

function createAboutWindow () {
  if (aboutWin) return
  aboutWin = new BrowserWindow({
    width: 400,
    height: 650,
    show: false,
    frame: false
  })
  aboutWin.setMenu(null)
  aboutWin.loadFile('about.html')

  // aboutWin.webContents.openDevTools()

  aboutWin.on('ready-to-show', () => {
    aboutWin.webContents.send("version", app.getVersion())
    aboutWin.show()
  })

  aboutWin.on('closed', () => {
    aboutWin = null
  })
}

ipcMain.on("openAbout", () => {
  createAboutWindow()
})

function createSettingsWindow () {
  if (settingsWin) return
  settingsWin = new BrowserWindow({
    width: 800,
    height: 600,
    show: false
  })
  settingsWin.setMenu(null)
  settingsWin.loadFile('settings.html')

  // settingsWin.webContents.openDevTools()

  settingsWin.on('ready-to-show', () => {
    settingsWin.webContents.send("settings", settings)
    settingsWin.show()
  })

  settingsWin.on('closed', () => {
    settingsWin = null
  })
}

ipcMain.on("openSettings", event => {
  loadSettings()
  createSettingsWindow()
})

ipcMain.on("saveSettings", (event, s) => {
  let settingsFile = path.join(app.getPath("userData"), "settings.json")
  fs.writeFile(settingsFile, JSON.stringify(s), err => {
    if (err) throw err
    settings = s
    win.webContents.send("settingsChanged", settings)
  })
})

ipcMain.on("romDropped", (event, filepath) => {
  if (path.extname(filepath) !== ".gb" && path.extname(filepath) !== ".gbc") return
  loadRom(filepath, event)
})