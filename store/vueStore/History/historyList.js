import { ipcHandle } from "../../../ipc/ipcHandler";

export async function getHistoryList() {
    try {
        return await ipcHandle("getHistory");
    } catch (error) {
        console.error("Error loading history:", error);
        throw new Error(error);             
    }
}

export function filterAndSortHistory(historyRecords, filters) {
    let filteredRecords = [...historyRecords];

    // Search filter (name and RFID)
    if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        filteredRecords = filteredRecords.filter(record => {
            const fullName = (record.full_name || '').toLowerCase();
            const rfid = (record.rfid || '').toLowerCase();
            return fullName.includes(query) || rfid.includes(query);
        });
    }

    // Date range filter (session date)
    if (filters.dateFrom || filters.dateTo) {
        filteredRecords = filteredRecords.filter(record => {
            if (!record.created_at) return false;
            
            const recordDate = new Date(record.created_at);
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

            if (fromDate && recordDate < fromDate) return false;
            if (toDate && recordDate > toDate) return false;
            
            return true;
        });
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter !== '' && filters.statusFilter !== 'all') {
        filteredRecords = filteredRecords.filter(record => {
            return record.status && record.status.toLowerCase() === filters.statusFilter.toLowerCase();
        });
    }

    // Member type filter
    if (filters.memberTypeFilter && filters.memberTypeFilter !== '' && filters.memberTypeFilter !== 'all') {
        filteredRecords = filteredRecords.filter(record => {
            const isNonMember = record.full_name === 'Non Member';
            if (filters.memberTypeFilter === 'member') {
                return !isNonMember;
            } else if (filters.memberTypeFilter === 'non-member') {
                return isNonMember;
            }
            return true;
        });
    }

    // Sorting by duration
    if (filters.totalTimeSort) {
        filteredRecords.sort((a, b) => {
            const timeA = parseTimeToMinutes(a.duration) || 0;
            const timeB = parseTimeToMinutes(b.duration) || 0;
            
            return filters.totalTimeSort === 'asc' ? timeA - timeB : timeB - timeA;
        });
    }

    // Sorting by amount paid
    if (filters.totalPaidSort) {
        filteredRecords.sort((a, b) => {
            const paidA = parseFloat(a.amount_paid_original) || 0;
            const paidB = parseFloat(b.amount_paid_original) || 0;
            
            return filters.totalPaidSort === 'asc' ? paidA - paidB : paidB - paidA;
        });
    }

    return filteredRecords;
}

export function paginateHistory(historyRecords, currentPage, itemsPerPage) {
    if (itemsPerPage === 'all') {
        return {
            paginatedRecords: historyRecords,
            totalPages: 1,
            totalItems: historyRecords.length
        };
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecords = historyRecords.slice(startIndex, endIndex);
    const totalPages = Math.ceil(historyRecords.length / itemsPerPage);

    return {
        paginatedRecords,
        totalPages,
        totalItems: historyRecords.length
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