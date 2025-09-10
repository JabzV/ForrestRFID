import { ipcHandle } from "../../../ipc/ipcHandler";

export async function getHistoryList() {
    try {
        return await ipcHandle("getHistory");
    } catch (error) {
        console.error("Error loading history:", error);
        throw new Error(error);
    }
}