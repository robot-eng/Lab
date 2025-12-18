const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const THAI_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const ENG_MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * Robustly parses various date formats into a Javascript Date object.
 * Supports: 
 * - DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * - Month YYYY (e.g., "พ.ค. 26", "May 2025")
 * - YYYY (Year only)
 * - BE (Buddhist Era) to AD (Anno Domini) conversion
 */
export const parseFlexibleDate = (input) => {
    if (!input || typeof input !== 'string') return null;
    let clean = input.trim().toLowerCase();
    if (clean === '-' || clean === '') return null;

    // 1. Check for Year only (4 digits)
    if (/^\d{4}$/.test(clean)) {
        let year = parseInt(clean, 10);
        if (year > 2400) year -= 543; // Convert BE to AD
        return new Date(year, 11, 31, 23, 59, 59); // End of that year
    }

    // 2. Handle Named Months (Thai/English)
    // Extract potential year and month
    let foundMonth = -1;
    let foundYear = -1;
    let foundDay = 1;

    // Check Thai Months
    THAI_MONTHS.forEach((m, i) => { if (clean.includes(m.toLowerCase())) foundMonth = i; });
    THAI_MONTHS_FULL.forEach((m, i) => { if (clean.includes(m.toLowerCase())) foundMonth = i; });
    // Check English Months
    ENG_MONTHS.forEach((m, i) => { if (clean.includes(m)) foundMonth = i; });

    if (foundMonth !== -1) {
        // Try to find a year (2 or 4 digits)
        const yearMatch = clean.match(/\b(\d{2}|\d{4})\b/);
        if (yearMatch) {
            foundYear = parseInt(yearMatch[1], 10);
            if (yearMatch[1].length === 2) {
                foundYear += 2000; // Assume 20xx
            }
            if (foundYear > 2400) foundYear -= 543; // BE to AD
        }

        // Try to find a day
        const dayMatch = clean.match(/^\d{1,2}\b/);
        if (dayMatch) foundDay = parseInt(dayMatch[0], 10);

        if (foundYear !== -1) {
            // Return Last day of month if no specific day was found (and format was just Month-Year)
            // But if we found a day, use it.
            const date = new Date(foundYear, foundMonth, foundDay);
            // If we only had Month-Year (no day in regex), set to end of month for safety
            if (!/^\d{1,2}/.test(clean)) {
                return new Date(foundYear, foundMonth + 1, 0, 23, 59, 59);
            }
            return date;
        }
    }

    // 3. Handle Numeric Separators (DD/MM/YYYY, etc.)
    const parts = clean.split(/[/\-.]/);
    if (parts.length >= 2) {
        let d = 1, m = 1, y = 1;

        if (parts.length === 3) {
            d = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10) - 1;
            y = parseInt(parts[2], 10);
        } else if (parts.length === 2) {
            // Month/Year
            m = parseInt(parts[0], 10) - 1;
            y = parseInt(parts[1], 10);
            return new Date(y > 2400 ? y - 543 : y, m + 1, 0, 23, 59, 59);
        }

        if (y < 100) y += 2000;
        if (y > 2400) y -= 543;

        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) return date;
    }

    return null;
};

/**
 * Checks if a chemical item is expired based on its expiry date string.
 */
export const checkIsExpired = (expiryDate) => {
    const expDate = parseFlexibleDate(expiryDate);
    if (!expDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expDate < today;
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
