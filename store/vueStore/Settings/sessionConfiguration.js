import { ipcHandle } from "../../../ipc/ipcHandler";

export async function loadSessionConfiguration() {
    try {
      return await ipcHandle("getSessionConfig");
    } catch (error) {
      return error;
  }
};