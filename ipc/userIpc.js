import { ipcMain } from 'electron';
import { createUser, getUsers, getUser } from '../store/sqliteStore/userStore.js';
import { getSessionConfig, getSessionProfiles, getAccountRoles } from '../store/sqliteStore/settingsStore.js';

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

export function registerSettingsIpc() {
    ipcMain.handle('getSessionConfig', (event, id) => {
        return getSessionConfig();
    });

    ipcMain.handle('getSessionProfiles', (event, id) => {
        return getSessionProfiles();
    });

    ipcMain.handle('getAccountRoles', (event, id) => {
        return getAccountRoles();
    });
}