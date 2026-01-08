/**
 * Firebase Configuration and Initialization
 * Uses Firebase Web SDK v9+ (Modular)
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    where,
    updateDoc,
    arrayUnion,
    doc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import {
    getAuth,
    signInAnonymously
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAIMw09UZ5UbSVN0IpeuHNQNQVXFcG5L5I",
    authDomain: "aishifts.firebaseapp.com",
    projectId: "aishifts",
    storageBucket: "aishifts.firebasestorage.app",
    messagingSenderId: "630139737286",
    appId: "1:630139737286:web:efeaa6b6434f7508fc73c7",
    measurementId: "G-TZLC1EWKY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Helper to ensure user is signed in
async function ensureAuth() {
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
            console.log('👻 Signed in anonymously for Firebase write access');
        } catch (error) {
            console.error('❌ Error signing in anonymously:', error);
            throw error;
        }
    }
}

// ... existing code ...

/**
 * Add a comment to an item in Firestore
 * @param {string} docId - The Firestore Document ID of the item
 * @param {Object} comment - The comment object {username, text}
 */
export async function addComment(docId, comment) {
    try {
        if (!docId) {
            console.error('❌ No docId provided for addComment');
            return;
        }

        // Ensure we have permission
        await ensureAuth();

        const docRef = doc(db, 'items', docId); // Use direct document reference

        await updateDoc(docRef, {
            comments: arrayUnion(comment)
        });

        console.log('✅ Comment added to Firebase for doc:', docId);
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        throw error;
    }
}

/**
 * Fetch all categories from Firestore
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategories() {
    try {
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, orderBy('categoryId'));
        const querySnapshot = await getDocs(q);

        const categories = [];
        querySnapshot.forEach((doc) => {
            categories.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('📦 Categories loaded from Firebase:', categories.length);
        return categories;
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
    }
}

/**
 * Fetch all items from Firestore
 * @returns {Promise<Array>} Array of item objects
 */
export async function getItems() {
    try {
        const itemsRef = collection(db, 'items');
        const q = query(itemsRef, orderBy('itemId'));
        const querySnapshot = await getDocs(q);

        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('📦 Items loaded from Firebase:', items.length);
        return items;
    } catch (error) {
        console.error('❌ Error fetching items:', error);
        throw error;
    }
}

/**
 * Fetch all data (categories and items) from Firestore
 * @returns {Promise<Object>} Object containing categories and items arrays
 */
export async function getAllData() {
    const [categories, items] = await Promise.all([
        getCategories(),
        getItems()
    ]);

    return { categories, items };
}



export { db };
