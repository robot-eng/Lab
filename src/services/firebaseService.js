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
