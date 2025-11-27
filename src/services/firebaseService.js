import { ref, get, set, onValue } from 'firebase/database';
import { database } from './firebase';

/**
 * Service to handle Firebase Realtime Database operations
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
                return snapshot.val();
            }
            return [];
        } catch (error) {
            console.error('Error fetching data from Firebase:', error);
            throw error;
        }
    },

    /**
     * Save chemical data to Firebase
     * @param {Array} data - Array of chemical items
     * @returns {Promise<void>}
     */
    async saveData(data) {
        try {
            const dbRef = ref(database, 'chemicals');
            await set(dbRef, data);
        } catch (error) {
            console.error('Error saving data to Firebase:', error);
            throw error;
        }
    },

    /**
     * Subscribe to realtime updates
     * @param {Function} callback - Function to call when data changes
     * @returns {Function} Unsubscribe function
     */
    subscribeToData(callback) {
        const dbRef = ref(database, 'chemicals');
        return onValue(dbRef, (snapshot) => {
            const data = snapshot.exists() ? snapshot.val() : [];
            callback(data);
        });
    }
};
