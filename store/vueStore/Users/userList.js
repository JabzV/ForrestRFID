import { ipcHandle } from "../../../ipc/ipcHandler.js";
import { loadAccountRoles } from "../Settings/accountRoles.js";

export async function getUserList() {
    try {
        return await ipcHandle("getUsers");
    } catch (error) {
        return error;
    }
}

export function filterAndSortUsers(users, filters) {
    let filteredUsers = [...users];

    // Search filter (name and RFID)
    if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        filteredUsers = filteredUsers.filter(user => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
            const rfid = (user.rfid || '').toLowerCase();
            return fullName.includes(query) || rfid.includes(query);
        });
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
        filteredUsers = filteredUsers.filter(user => {
            if (!user.created_at) return false;
            
            const userDate = new Date(user.created_at);
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

            if (fromDate && userDate < fromDate) return false;
            if (toDate && userDate > toDate) return false;
            
            return true;
        });
    }

    // Sorting
    if (filters.totalTimeSort) {
        filteredUsers.sort((a, b) => {
            const timeA = parseTimeToMinutes(a.total_time) || 0;
            const timeB = parseTimeToMinutes(b.total_time) || 0;
            
            return filters.totalTimeSort === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }

    if (filters.totalPaidSort) {
        filteredUsers.sort((a, b) => {
            const paidA = parseFloat(a.total_paid) || 0;
            const paidB = parseFloat(b.total_paid) || 0;
            
            return filters.totalPaidSort === 'asc' ? paidA - paidB : paidB - paidA;
        });
    }

    return filteredUsers;
}

export function paginateUsers(users, currentPage, itemsPerPage) {
    if (itemsPerPage === 'all') {
        return {
            paginatedUsers: users,
            totalPages: 1,
            totalItems: users.length
        };
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = users.slice(startIndex, endIndex);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    return {
        paginatedUsers,
        totalPages,
        totalItems: users.length
    };
}

// Helper function to parse time strings like "2h 30m" to minutes
function parseTimeToMinutes(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
    
    let totalMinutes = 0;
    
    // Match hours (e.g., "2h")
    const hoursMatch = timeString.match(/(\d+)h/);
    if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    
    // Match minutes (e.g., "30m")
    const minutesMatch = timeString.match(/(\d+)m/);
    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1]);
    }
    
    // If no h/m format, try to parse as plain number (assuming minutes)
    if (!hoursMatch && !minutesMatch) {
        const plainNumber = parseFloat(timeString);
        if (!isNaN(plainNumber)) {
            totalMinutes = plainNumber;
        }
    }
    
    return totalMinutes;
}

export async function updateUser(data) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(data));
        return await ipcHandle("updateUser", cleanedData);
    } catch (error) {
        return error;
    }
}

export async function deleteUser(id) {
    try {
        const cleanedData = JSON.parse(JSON.stringify(id));
        return await ipcHandle("deleteUser", cleanedData);
    } catch (error) {
        return error;
    }
}

const userListModalFields = [ 
  {
    field: "first_name",
    placeholder: "First Name",
    type: "text",
    label: "First Name",
    isRequired: true,
  },
  {
    field: "last_name",
    placeholder: "Last Name",
    type: "text",
    label: "Last Name",
    isRequired: true,
  },
  {
    field: "contact_number",
    placeholder: "09xxxxxxxxx",
    type: "tel",
    pattern: "^(09|\\+639)\\d{9}$",
    label: "Contact Number",
  },
  {
    field: "birthday",
    placeholder: "mm/dd/yyyy",
    type: "date",
    label: "Date of Birth",
  },
  {
    field: "gender",
    placeholder: "Select Gender",
    type: "dropdown",
    label: "Gender",
    options: ["Male", "Female"],
  },
  {
    field: "email",
    placeholder: "example@gmail.com",
    type: "email",
    label: "Email",
  },
  {
    field: "account_role_id",
    placeholder: "Select Account Role",
    type: "dropdown",
    label: "Account Role",
    divClass: "col-span-1 lg:col-span-2",
    options: [],

    isRequired: true,
  },
];

export async function getUserListModalFields() {
    let accountRoles = await loadAccountRoles();
    return userListModalFields.map(field => {
        if (field.field === "account_role_id") {
            field.options = accountRoles.map(role => ({
                name: role.name,
                id: role.id
            }));
        }
        return field;
    });
}