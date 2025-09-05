import { ipcHandle } from "../../../ipc/ipcHandler";

export async function loadAccountRoles() {
    try {
      return await ipcHandle("getAccountRoles");
    } catch (error) {
      return error;
  }
};