import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Check if user is authenticated
export function checkAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}

// Redirect to login if not authenticated
export function requireAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                window.location.href = 'login.html';
                reject('Not authenticated');
            }
        });
    });
}

// Sign up new user
export async function signUp(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update user profile with display name
        await updateProfile(userCredential.user, {
            displayName: displayName
        });

        // Force reload ensuring profile is updated locally
        await userCredential.user.reload();

        return { success: true, user: auth.currentUser };
    } catch (error) {
        console.error("Error signing up:", error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign in existing user
export async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Error signing in:", error);
        return { success: false, error: getErrorMessage(error.code) };
    }
}

// Sign out
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Questa email è già registrata';
        case 'auth/invalid-email':
            return 'Email non valida';
        case 'auth/weak-password':
            return 'La password deve essere di almeno 6 caratteri';
        case 'auth/user-not-found':
            return 'Utente non trovato';
        case 'auth/wrong-password':
            return 'Password errata';
        case 'auth/invalid-credential':
            return 'Credenziali non valide';
        default:
            return 'Si è verificato un errore. Riprova.';
    }
}
