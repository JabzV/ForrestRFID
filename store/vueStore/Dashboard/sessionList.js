import { getAllSessionProfiles } from "../Settings/sessionProfile";
import { ipcHandle } from "../../../ipc/ipcHandler";

// Function to get populated dialog fields
export async function getSessionDialogFields() {

    let sessionProfileData = await getAllSessionProfiles();
    
    return [
        {
            field: "session_profile_id",
            label: "Session Profile",
            placeholder: "Select Session Profile",
            type: "dropdown",
            options: sessionProfileData.map(profile => ({
                name: `${profile.name} - ₱${profile.rate_amount}/${profile.rate_unit}`,
                id: profile.id
            })),
            required: true
        },
        {
            field: "member_type",
            label: "Member Type",
            placeholder: "Select Member Type",
            type: "dropdown",
            options: ["Member", "Non-Member"],
            required: true
        }
    ];
}

// Static fields (for synchronous imports)
export const sessionDialogFields = [
    {
        field: "session_profile_id",
        label: "Session Profile",
        placeholder: "Select Session Profile",
        type: "dropdown",
        options: [], // Will be populated dynamically
        required: true
    },
    {
        field: "member_type",
        label: "Member Type",
        placeholder: "Select Member Type",
        type: "dropdown",
        options: ["Member", "Non-Member"],
        required: true
    }
];


export async function createSession(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("createSession", cleanedData);
    } catch (error) {
        console.error("Error creating session:", error);
        throw error; // Re-throw so Dashboard.vue can catch it
    }
}

export async function endSession(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("endSession", cleanedData);
    } catch (error) {
        console.error("Error ending session:", error);
        throw error; // Re-throw so Dashboard.vue can catch it
    }
}

export async function loadActiveSessions() {
    try {
        return await ipcHandle("loadActiveSessions");
    } catch (error) {
        console.error("Error loading active sessions:", error);
        throw error;
    }
}
