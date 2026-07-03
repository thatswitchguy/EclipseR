const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  dnsLookup: (hostname) => ipcRenderer.invoke('dns-lookup', hostname)
});
