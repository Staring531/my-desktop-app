import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { createDesktopBridge } from './bridge.js';

const desktop = createDesktopBridge({
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
  subscribe: (channel, listener) => {
    const wrapped = (_event: IpcRendererEvent, payload: unknown) => listener(payload);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
});

contextBridge.exposeInMainWorld('desktop', desktop);
