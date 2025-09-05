import { ipcHandle } from "../../../ipc/ipcHandler";

export async function getAllSessionProfiles() {
    try {
      return await ipcHandle("getSessionProfiles");
    } catch (error) {
      console.error("Error loading session profiles:", error);
      throw new Error(error);
  }
};

export async function getSessionProfile (id) {
  try {
    return await ipcHandle("getSessionProfile", id);
  } catch (error) {
    console.error("Store error:", error);
    throw new Error(error);
  }
}

export async function createSessionProfile (profile) {
  try {
    const cleanedData = JSON.parse(JSON.stringify(profile));
    return await ipcHandle("createSessionProfile", cleanedData);
  } catch (error) {
    console.error("Store error:", error);
    throw new Error(error);
  }
}

export async function updateSessionProfile (profile) {
  try {
    const cleanedData = JSON.parse(JSON.stringify(profile));
    return await ipcHandle("updateSessionProfile", cleanedData);
  } catch (error) {
    console.error("Store error:", error);
    throw new Error(error);
  }
}

export async function deleteSessionProfile (id) {
  try {
    return await ipcHandle("deleteSessionProfile", id);
  } catch (error) {
    console.error("Store error:", error);
    throw new Error(error);
  }
}

export const sessionProfileModalFields = [
  {
    field: "name",
    placeholder: "Profile Name",
    type: "text",
    label: "Profile Name",
    isRequired: true,
  },
  {
    field: "rate_amount",
    placeholder: "Rate Amount (₱)",
    type: "text",
    label: "Rate Amount",
    isRequired: true,
  },
  {
    field: "rate_unit",
    placeholder: "Rate Unit",
    type: "dropdown",
    label: "Rate Unit",
    isRequired: true,
    options: ["hr", "day"],
    divClass: "col-span-1 lg:col-span-2",
  }
];
