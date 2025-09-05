import { ipcMain } from 'electron';
import { createUser, getUsers, getUser } from '../store/sqliteStore/userStore.js';
import { getSessionConfig, getSessionProfiles, getAccountRoles, createSessionProfile, updateSessionProfile, deleteSessionProfile, getSessionProfile, updateSessionConfig, createAccountRole, updateAccountRole, deleteAccountRole } from '../store/sqliteStore/settingsStore.js';

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

    ipcMain.handle('getSessionProfiles', (event, id) => {
        return getSessionProfiles();
    });

    ipcMain.handle('getSessionProfile', (event, id) => {
        return getSessionProfile(id);
    });

    ipcMain.handle('createSessionProfile', (event, data) => {
        return createSessionProfile(data);
    });

    ipcMain.handle('updateSessionProfile', (event, data) => {
        return updateSessionProfile(data);
    });

    ipcMain.handle('deleteSessionProfile', (event, id) => {
        return deleteSessionProfile(id);
    });


    ipcMain.handle('getSessionConfig', (event, id) => {
        return getSessionConfig();
    });

    ipcMain.handle('updateSessionConfig', (event, data) => {
        return updateSessionConfig(data);
    });

    ipcMain.handle('getAccountRoles', (event, id) => {
        return getAccountRoles();
    });

    ipcMain.handle('createAccountRole', (event, data) => {
        return createAccountRole(data);
    });

    ipcMain.handle('updateAccountRole', (event, data) => {
        return updateAccountRole(data);
    });

    ipcMain.handle('deleteAccountRole', (event, id) => {
        return deleteAccountRole(id);
    });
}