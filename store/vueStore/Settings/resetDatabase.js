import { ipcHandle } from "../../../ipc/ipcHandler.js";

export async function resetDatabase() {
    try {
        return await ipcHandle("resetDatabase");
    } catch (error) {
        console.error("Error resetting database:", error);
        throw new Error(error);
    }
}
