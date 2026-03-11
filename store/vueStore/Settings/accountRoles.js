import { ipcHandle } from "../../../ipc/ipcHandler.js";

export async function loadAccountRoles() {
    try {
      return await ipcHandle("getAccountRoles");
    } catch (error) {
      return error;
  }
};

export async function createAccountRole(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("createAccountRole", cleanedData);
    } catch (error) {
        return error;
    }
};

export async function updateAccountRole(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("updateAccountRole", cleanedData);
    } catch (error) {
        return error;
    }
};

export async function deleteAccountRole(id) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(id));
        return await ipcHandle("deleteAccountRole", cleanedData);
    } catch (error) {
        return error;
    }
};

export const accountRolesModalFields = [
    {
        field: "name",
        label: "Name",
        placeholder: "Role Name",
        type: "text",
        isRequired: true,
    },
    {
        field: "expiry_months",
        label: "Expiry",
        placeholder: "Expiry",
        type: "dropdown",
        isRequired: true,
        options: [
            { name: "None", id: 0 },
            { name: "1 month", id: 1 },
            { name: "2 months", id: 2 },
            { name: "3 months", id: 3 },
            { name: "4 months", id: 4 },
            { name: "5 months", id: 5 },
            { name: "6 months", id: 6 },
            { name: "7 months", id: 7 },
            { name: "8 months", id: 8 },
            { name: "9 months", id: 9 },
            { name: "10 months", id: 10 },
            { name: "11 months", id: 11 },
            { name: "12 months", id: 12 }
        ],
    },
    {
        field: "benefits_type",
        label: "Benefits Type",
        placeholder: "Benefits Type",
        type: "dropdown",
        isRequired: true,
        options: ["fixed", "percentage"],
    },
    {
        field: "value",
        label: "Value",
        placeholder: "Value",
        type: "number",
        isRequired: true,
        divClass: "col-span-1 lg:col-span-2",
    },
];