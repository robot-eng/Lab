import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdunFvhlnaBk_TMayN7pOGi7uonw_2zV0",
    authDomain: "lab-in-84d28.firebaseapp.com",
    databaseURL: "https://lab-in-84d28-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "lab-in-84d28",
    storageBucket: "lab-in-84d28.firebasestorage.app",
    messagingSenderId: "236487171572",
    appId: "1:236487171572:web:c13e3db463d9735b6deda1",
    measurementId: "G-X3FLMXY92D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);
