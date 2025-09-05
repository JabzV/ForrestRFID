import { ipcHandle } from "../../../ipc/ipcHandler";

export async function loadSessionProfiles() {
    try {
      return await ipcHandle("getSessionProfiles");
    } catch (error) {
      return error;
  }
};
