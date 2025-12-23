// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCoqenYD3RJulb7TMt3smFLVJC2R0gLikY",
    authDomain: "asocial-blog-78865.firebaseapp.com",
    projectId: "asocial-blog-78865",
    storageBucket: "asocial-blog-78865.firebasestorage.app",
    messagingSenderId: "635062396362",
    appId: "1:635062396362:web:440a9803659f64fc6f1b33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase initialized successfully");
