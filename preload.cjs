const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose electron API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
  },
  shell: {
    openExternal: (url) => shell.openExternal(url)
  }
});



// window.addEventListener("DOMContentLoaded", () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector);
//     if (element) element.innerText = text;
//   };

//   for (const type of ["chrome", "node", "electron"]) {
//     replaceText(`${type}-version`, process.versions[type]);
//   }
// });
