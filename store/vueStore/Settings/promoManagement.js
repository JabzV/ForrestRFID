import { ipcHandle } from "../../../ipc/ipcHandler";


export async function loadPromos() {
    try {
        return await ipcHandle("getPromos");
    } catch (error) {
        console.error("Error loading promos:", error);
        throw new Error(error);
    }
}

export async function createPromo(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("createPromo", cleanedData);
    } catch (error) {
        console.error("Error creating promo:", error);
        throw new Error(error);
    }
}

export async function updatePromo(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("updatePromo", cleanedData);
    } catch (error) {
        console.error("Error updating promo:", error);
        throw new Error(error);
    }
}

export async function deletePromo(id) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(id));
        return await ipcHandle("deletePromo", cleanedData);
    } catch (error) {
        console.error("Error deleting promo:", error);
        throw new Error(error);
    }
}

export const promoManagementModalFields = [
    {
        field: "name",
        label: "Name",
        placeholder: "Promo Name",
        type: "text",
        isRequired: true,
    },
    {
        field: "date_from",
        label: "Date From",
        placeholder: "Date From",
        type: "date",
        isRequired: true,
    },
    {
        field: "date_to",
        label: "Date To",
        placeholder: "Date To",
        type: "date",
        isRequired: true,
    },
    {
        field: "promo_type",
        label: "Promo Type",
        placeholder: "Promo Type",
        type: "dropdown",
        isRequired: true,
        options: ["fixed", "percentage"]
    },
    {
        field: "value",
        label: "Value",
        placeholder: "Value",
        type: "number",
        isRequired: true,
    },
];