import { ref, get, set, update, remove, onValue, serverTimestamp } from 'firebase/database';
import { database } from './firebase';

/**
 * Service to handle Firebase Realtime Database operations
 * Optimized for Atomicity and Multi-user Reliability
 */
export const firebaseService = {
    /**
     * Get all chemical data from Firebase
     * @returns {Promise<Array>} Array of chemical items
     */
    async getData() {
        try {
            const dbRef = ref(database, 'chemicals');
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const val = snapshot.val();
                // Ensure we return an array regardless of storage format
                return Array.isArray(val) ? val : Object.values(val);
            }
            return [];
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
            throw error;
        }
    },

    /**
     * Fetch data once with timeout protection
     */
    async fetchDataOnce() {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timed out')), 8000)
        );
        return Promise.race([this.getData(), timeout]);
    },

    /**
     * Save/Update a single item atomically
     * This prevents overwriting other users' edits
     */
    async saveItem(item) {
        if (!item.id) throw new Error('Item ID is required for saving');
        try {
            // Clean ID for Firebase key (remove special characters if any)
            const cleanId = item.id.replace(/[.#$[\]]/g, '_');
            const itemRef = ref(database, `chemicals/${cleanId}`);

            // Inject server timestamp for global synchronization
            const itemWithTimestamp = {
                ...item,
                updatedAt: serverTimestamp()
            };

            await set(itemRef, itemWithTimestamp);
        } catch (error) {
            console.error('Error saving item to Firebase:', error);
            throw error;
        }
    },

    /**
     * Delete a single item atomically
     */
    async deleteItem(id) {
        if (!id) return;
        try {
            const cleanId = id.replace(/[.#$[\]]/g, '_');
            const itemRef = ref(database, `chemicals/${cleanId}`);
            await remove(itemRef);
        } catch (error) {
            console.error('Error deleting item from Firebase:', error);
            throw error;
        }
    },

    /**
     * Push a new activity log entry
     */
    async pushLog(action, itemId, itemName, details = '') {
        try {
            const logsRef = ref(database, 'history');
            const newLogRef = ref(database, `history/${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
            const logEntry = {
                action, // 'ADD', 'EDIT', 'DELETE', 'TOGGLE_DANGER'
                itemId,
                itemName,
                details,
                timestamp: serverTimestamp()
            };
            await set(newLogRef, logEntry);
        } catch (error) {
            console.error('Error pushing log to Firebase:', error);
            // Don't throw here to avoid blocking main actions if logging fails
        }
    },

    /**
     * Subscribe to history logs
     */
    subscribeToLogs(callback) {
        const logsRef = ref(database, 'history');
        return onValue(logsRef, (snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.val();
                const logsArray = Object.entries(val).map(([id, data]) => ({
                    id,
                    ...data
                }));
                // Sort by timestamp descending
                callback(logsArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
            } else {
                callback([]);
            }
        });
    },

    /**
     * Delete a specific log entry
     */
    async deleteLog(logId) {
        if (!logId) return;
        try {
            const logRef = ref(database, `history/${logId}`);
            await remove(logRef);
        } catch (error) {
            console.error('Error deleting log from Firebase:', error);
            throw error;
        }
    },

    /**
     * Clear all history logs
     */
    async clearLogs() {
        try {
            const logsRef = ref(database, 'history');
            await remove(logsRef);
        } catch (error) {
            console.error('Error clearing logs from Firebase:', error);
            throw error;
        }
    },

    /**
     * Subscribe to realtime updates
     * @param {Function} callback - Function to receive the sanitized array
     */
    subscribeToData(callback) {
        const dbRef = ref(database, 'chemicals');
        return onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const val = snapshot.val();
                const dataArray = Array.isArray(val) ? val : Object.values(val);
                // Filter out any null entries that might occur in sparse arrays
                callback(dataArray.filter(item => item !== null));
            } else {
                callback([]);
            }
        });
    }
};
