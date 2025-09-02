import { ipcMain } from 'electron';
import { createUser, getUsers, getUser } from '../store/sqliteStore/userStore.js';

export function registerUserIpc() {
    ipcMain.handle('createUser', (event, data) => {
        return createUser(data);
    });
    
    ipcMain.handle('getUsers', (event, id) => {
        if (id) {
            return getUser(id);
        } else {
            return getUsers();
        }
    });
}