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