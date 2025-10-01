import { ipcMain, shell } from 'electron';
import { createUser, getUsers, getUser, updateUser, deleteUser, checkIfMember } from '../store/sqliteStore/userStore.js';
import { getSessionConfig, getSessionProfiles, getAccountRoles, createSessionProfile, updateSessionProfile, deleteSessionProfile, getSessionProfile, updateSessionConfig, createAccountRole, updateAccountRole, deleteAccountRole, getPromos, createPromo, updatePromo, deletePromo } from '../store/sqliteStore/settingsStore.js';
import { createSession, endSession, loadActiveSessions, cancelSession, checkPendingSession } from '../store/sqliteStore/dashboardStore.js';
import { getHistory, getSessionDetailsById, saveBillingSnapshot, getBillingSnapshot } from '../store/sqliteStore/historyStore.js';
import { calculateBillSync } from '../store/sqliteStore/calculatBillService.js';
import { getAllDashboardStats } from '../store/sqliteStore/dashboardStatisticsService.js';
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

    ipcMain.handle('updateUser', (event, data) => {
        return updateUser(data);
    });

    ipcMain.handle('deleteUser', (event, id) => {
        return deleteUser(id);
    });

    ipcMain.handle('checkIfMember', (event, rfid) => {
        return checkIfMember(rfid);
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

    ipcMain.handle('getPromos', (event, id) => {
        return getPromos();
    });

    ipcMain.handle('createPromo', (event, data) => {
        return createPromo(data);
    });

    ipcMain.handle('updatePromo', (event, data) => {
        return updatePromo(data);
    });

    ipcMain.handle('deletePromo', (event, id) => {
        return deletePromo(id);
    });
}

export function registerDashboardIpc() {

    ipcMain.handle('loadActiveSessions', (event, data) => {
        return loadActiveSessions();
    });

    ipcMain.handle('checkPendingSession', (event, rfid) => {
        return checkPendingSession(rfid);
    });

    ipcMain.handle('createSession', (event, data) => {
        return createSession(data);
    });

    ipcMain.handle('endSession', (event, data) => {
        return endSession(data);
    });

    ipcMain.handle('cancelSession', (event, data) => {
        return cancelSession(data);
    });

    ipcMain.handle('getDashboardStats', (event) => {
        return getAllDashboardStats();
    });
}

export function registerCalculateBillIpc() {
    ipcMain.handle('calculateBill', (event, data) => {
        return calculateBillSync(data);
    });
}

export function registerHistoryIpc() {
    ipcMain.handle('getHistory', (event) => {
        return getHistory();
    });

    ipcMain.handle('getSessionDetails', (event, sessionId) => {
        return getSessionDetailsById(sessionId);
    });

    // Billing snapshot handlers
    ipcMain.handle('saveBillingSnapshot', (event, data) => {
        return saveBillingSnapshot(data);
    });

    ipcMain.handle('getBillingSnapshot', (event, sessionId) => {
        return getBillingSnapshot(sessionId);
    });
}

export function registerUtilityIpc() {
    // Open external URL in default browser
    ipcMain.handle('openExternal', async (event, url) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            console.error('Error opening external URL:', error);
            return { success: false, error: error.message };
        }
    });
}