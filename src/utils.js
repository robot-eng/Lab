/**
 * Checks if a chemical item is expired based on its expiry date string.
 * Supports DD/MM/YYYY and YYYY formats.
 */
export const checkIsExpired = (expiryDate) => {
    if (!expiryDate || typeof expiryDate !== 'string') return false;

    const cleanDate = expiryDate.trim();

    // Check for Year only format (YYYY)
    if (/^\d{4}$/.test(cleanDate)) {
        const year = parseInt(cleanDate, 10);
        const currentYear = new Date().getFullYear();
        return year < currentYear;
    }

    // Try parsing DD/MM/YYYY
    const parts = cleanDate.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const expDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return expDate < today;
    }
    return false;
};

/**
 * Validates a CAS Registry Number format (XXXXXXX-XX-X).
 */
export const isValidCAS = (cas) => {
    if (!cas || cas === "-") return true; // Optional field
    return /^\d{2,7}-\d{2}-\d$/.test(cas.trim());
};

/**
 * Formats a timestamp into DD/MM/YYYY at HH:mm format.
 */
export const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} at ${hours}:${minutes}`;
};
