import { storage } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Upload image to Firebase Storage
export async function uploadImage(file, userId) {
    try {
        // Validate file
        if (!file) {
            return { success: false, error: 'Nessun file selezionato' };
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: 'File troppo grande (max 5MB)' };
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Tipo di file non supportato' };
        }

        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `posts/${userId}/${filename}`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return { success: true, url: downloadURL };
    } catch (error) {
        console.error("Error uploading image:", error);
        return { success: false, error: 'Errore durante il caricamento' };
    }
}

// Helper to generate preview
export function createImagePreview(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
}
