import { ipcHandle } from "../../../ipc/ipcHandler";

export async function loadSessionConfiguration() {
    try {
      return await ipcHandle("getSessionConfig");
    } catch (error) {
      return error;
  }
};

export async function updateSessionConfiguration(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("updateSessionConfig", cleanedData);
    } catch (error) {
        return error;
    }
};