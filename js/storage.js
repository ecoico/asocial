// Storage utilities using Firestore
import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const Storage = {
    // Real-time listener for posts
    onPostsChanged(callback) {
        const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));

        return onSnapshot(postsQuery, (snapshot) => {
            const posts = [];
            snapshot.forEach((doc) => {
                posts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(posts);
        });
    },

    // Get all posts (one-time fetch)
    async getPosts() {
        try {
            const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(postsQuery);

            const posts = [];
            snapshot.forEach((doc) => {
                posts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return posts;
        } catch (error) {
            console.error("Error getting posts:", error);
            return [];
        }
    },

    // Create a new post
    async createPost(postData) {
        try {
            const docRef = await addDoc(collection(db, 'posts'), {
                ...postData,
                timestamp: serverTimestamp(),
                comments: []
            });

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error creating post:", error);
            return { success: false, error: error.message };
        }
    },

    // Add a comment to a post
    async addComment(postId, commentData) {
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                comments: arrayUnion(commentData)
            });

            return { success: true };
        } catch (error) {
            console.error("Error adding comment:", error);
            return { success: false, error: error.message };
        }
    },

    // Delete a post
    async deletePost(postId) {
        try {
            await deleteDoc(doc(db, 'posts', postId));
            return { success: true };
        } catch (error) {
            console.error("Error deleting post:", error);
            return { success: false, error: error.message };
        }
    },

    // Update a post
    async updatePost(postId, newContent) {
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                content: newContent,
                edited: true,
                editedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error("Error updating post:", error);
            return { success: false, error: error.message };
        }
    },

    // Bookmarks (still using localStorage for per-user privacy)
    getBookmarks() {
        const bookmarks = localStorage.getItem('asocial_bookmarks');
        return bookmarks ? JSON.parse(bookmarks) : [];
    },

    toggleBookmark(postId) {
        const bookmarks = this.getBookmarks();
        const index = bookmarks.indexOf(postId);

        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(postId);
        }

        localStorage.setItem('asocial_bookmarks', JSON.stringify(bookmarks));
        return bookmarks.includes(postId);
    },

    isBookmarked(postId) {
        return this.getBookmarks().includes(postId);
    }
};

window.Storage = Storage;
export default Storage;
