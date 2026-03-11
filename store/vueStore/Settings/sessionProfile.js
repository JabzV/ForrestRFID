import { ipcHandle } from "../../../ipc/ipcHandler.js";

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
    options: ["hr", "day", "week", "month"],
    divClass: "col-span-1 lg:col-span-2",
  },
  {
    field: "rate_value",
    placeholder: "Num of hrs/days/weeks/etc.",
    type: "text",
    label: "Rate Value",
    isRequired: true,
  },
  {
    field: "surcharge_amount",
    placeholder: "Surcharge Amount (₱)",
    type: "text",
    label: "Surcharge Amount",
    isRequired: false,
  },
  {
    field: "surcharge_minutes",
    placeholder: "Surcharge Minutes",
    type: "text",
    label: "Surcharge Minutes",
    isRequired: false,
  },
  {
    field: "charge_immediately",
    placeholder: "Charge Immediately",
    type: "dropdown",
    label: "Charge Immediately",
    isRequired: false,
    options: [
      { name: "No", id: 0 },
      { name: "Yes", id: 1 }
    ],
    divClass: "col-span-1 lg:col-span-2",
    subtext: "If Yes, charge the full rate on scan-in."
  }
];
