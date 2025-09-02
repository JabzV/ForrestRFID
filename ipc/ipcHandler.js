export function ipcHandle(channel, data) {
  return window.electron.ipcRenderer.invoke(channel, data);
}