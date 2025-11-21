/**
 * Generates a Purchase Order ID from a timestamp
 * Format: PO-YYYY-MMDDHHMISS
 * Example: PO-2025-1121171130
 * 
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted PO ID
 */
export const generatePOId = (timestamp) => {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `PO-${year}-${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Formats a date for display
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};
