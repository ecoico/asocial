// Main Application Logic for Asocial with Firebase
import { requireAuth, logout, getCurrentUser } from './auth.js';
import Storage from './storage.js';

class AsocialApp {
    constructor() {
        this.posts = [];
        this.currentUser = null;
        this.currentPage = 'feed';
        this.currentProfileUserId = null;
        this.unsubscribePosts = null;

        this.init();
    }

    getUserColor(name) {
        if (!name) return '#FFFFFF';
        // Palette: Orange, Pink, Blue, Red, Green, Purple, Cyan, Yellow
        const colors = [
            '#FF9F43', // Orange
            '#FF9FF3', // Pink
            '#54A0FF', // Blue
            '#FF6B6B', // Red
            '#1DD1A1', // Green
            '#5F27CD', // Purple
            '#48DBFB', // Cyan
            '#FECA57'  // Yellow
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }

    async init() {
        // Require authentication
        try {
            this.currentUser = await requireAuth();

            // CRITICAL: Check if name is missing and try to recover it
            if (!this.currentUser.displayName) {
                await this.currentUser.reload();
                this.currentUser = getCurrentUser(); // Refresh object reference

                // If still missing, check local backup from registration
                if (!this.currentUser.displayName) {
                    const tempName = localStorage.getItem('temp_display_name');
                    if (tempName) {
                        // Force update profile again if found locally
                        // Note: We can't easily import updateProfile here without refactoring, 
                        // so we will just assume the UI uses the temp name for now.
                        // Or better, just treat it as the display name for UI purposes.
                        this.currentUser.displayName = tempName;
                    }
                }
            }

            // Set up UI with user info
            this.setupUserInfo();

            // Set up navigation
            this.setupNavigation();

            // Set up logout button
            this.setupLogout();

            // Set up create post form
            this.setupCreatePost();

            // Subscribe to real-time posts
            this.subscribeToPostsUpdates();

            // Load initial page
            this.loadPage('feed');
        } catch (error) {
            console.error('Authentication required:', error);
        }
    }

    getEffectiveDisplayName() {
        if (!this.currentUser) return 'Anonimo';

        // 1. Check Firebase Auth profile
        if (this.currentUser.displayName) return this.currentUser.displayName;

        // 2. Check local backup (set during registration)
        const tempName = localStorage.getItem('temp_display_name');
        if (tempName) return tempName;

        // 3. Fallback to email username or Anonimo
        return this.currentUser.email ? this.currentUser.email.split('@')[0] : 'Anonimo';
    }

    setupUserInfo() {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.getEffectiveDisplayName();
        }
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                logout();
            });
        }
    }

    subscribeToPostsUpdates() {
        // Subscribe to real-time updates from Firestore
        this.unsubscribePosts = Storage.onPostsChanged((posts) => {
            this.posts = posts;

            // Re-render current view
            if (this.currentPage === 'feed') {
                this.renderFeed();
            } else if (this.currentPage === 'profile') {
                this.renderProfile(this.currentProfileUserId || this.currentUser.uid);
            }
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.loadPage(page);
            });
        });
    }

    loadPage(page) {
        this.currentPage = page;

        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

        // Show requested page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');

            if (page === 'feed') {
                this.renderFeed();
            } else if (page === 'profile') {
                this.renderProfile(this.currentUser.uid);
            }
        }
    }

    renderFeed() {
        const feedContainer = document.getElementById('feed-container');
        if (!feedContainer) return;

        if (this.posts.length === 0) {
            feedContainer.innerHTML = '<div class="empty-state">per ora nessun post, scrivi per primo!</div>';
            return;
        }

        feedContainer.innerHTML = this.posts.map((post, index) =>
            this.renderPost(post, index)
        ).join('');

        // Attach event listeners
        this.attachPostListeners();
    }

    renderPost(post, index = 0) {
        const isBookmarked = Storage.isBookmarked(post.id);
        const commentCount = post.comments ? post.comments.length : 0;
        const isOwnPost = this.currentUser && post.authorId === this.currentUser.uid;

        /* REACTION LOGIC COMMENTED OUT
        // Reactions logic - Track all reactions and show a summary
        const reactions = post.reactions || {};
        const myReaction = this.currentUser ? reactions[this.currentUser.uid] : null;

        // Count each type of reaction
        const reactionSummary = {};
        Object.values(reactions).forEach(type => {
            reactionSummary[type] = (reactionSummary[type] || 0) + 1;
        });

        const reactionTypes = ['osservato', 'discreto', 'dignitoso', 'inaccettabile'];
        const summaryHtml = reactionTypes
            .filter(type => reactionSummary[type])
            .map(type => `<span class="reaction-summary-item ${myReaction === type ? 'active' : ''}">${type} ${reactionSummary[type]}</span>`)
            .join(' ');

        const reactionActive = !!myReaction;
        const reactionLabel = myReaction ? myReaction : 'aggiungi reazione';
        */

        return `
      <div class="card post-card" style="--index: ${index}">
        <div class="post-header">
          <!-- Avatar removed for cleaner look -->
          <div class="post-info">
            <span class="post-username" style="color: ${this.getUserColor(post.authorName)}">${this.escapeHtml(post.authorName || 'Anonimo')}</span>
            <div class="post-timestamp">${this.formatTimestamp(post.timestamp)}${post.edited ? ' (mod)' : ''}</div>
          </div>
          ${isOwnPost ? `
            <div class="post-menu">
              <button class="post-menu-btn edit-btn" data-post-id="${post.id}">modifica</button>
              <button class="post-menu-btn delete-btn" data-post-id="${post.id}">elimina</button>
            </div>
          ` : ''}
        </div>
        
        <div class="post-content" id="content-${post.id}">
            ${this.escapeHtml(post.content)}
            <!-- Image removed from render -->
        </div>
        
        <div class="post-actions">
           <!-- REACTION UI REMOVED -->

          <button class="post-action bookmark-btn ${isBookmarked ? 'active' : ''}" data-post-id="${post.id}">
            <span>${isBookmarked ? 'salvato' : 'salva'}</span>
          </button>
          <button class="post-action comment-btn" data-post-id="${post.id}">
            <span>${commentCount} ${commentCount === 1 ? 'commento' : 'commenti'}</span>
          </button>
        </div>
        
        <div class="comments-section hidden" id="comments-${post.id}">
          ${this.renderComments(post)}
          ${this.renderCommentForm(post.id)}
        </div>
      </div>
    `;
    }

    renderComments(post) {
        if (!post.comments || post.comments.length === 0) {
            return '<div class="empty-state">commenta il post per primo!</div>';
        }

        return post.comments.map(comment => {
            return `
        <div class="commenta">
          <div class="comment-author" style="color: ${this.getUserColor(comment.authorName)}">${this.escapeHtml(comment.authorName || 'Anonimo')}</div>
          <div class="comment-text">${this.escapeHtml(comment.text)}</div>
          <div class="comment-timestamp">${this.formatTimestamp(comment.timestamp)}</div>
        </div>
      `;
        }).join('');
    }

    renderCommentForm(postId) {
        return `
      <form class="comment-form" data-post-id="${postId}">
        <textarea 
          class="comment-input" 
          placeholder="aggiungi un commento, qui puoi essere spietato..." 
          maxlength="280"
        ></textarea>
        <button type="submit" class="btn btn-primary">commenta</button>
      </form>
    `;
    }

    attachPostListeners() {
        /* REACTION EVENT LISTENERS COMMENTED OUT
        // Reaction buttons (open menu)
        document.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing immediately
                const postId = btn.dataset.postId;

                // Close all other open reaction menus first
                document.querySelectorAll('.reaction-menu').forEach(menu => {
                    if (menu.id !== `reactions-${postId}`) {
                        menu.classList.add('hidden');
                    }
                });

                const menu = document.getElementById(`reactions-${postId}`);
                menu.classList.toggle('hidden');
            });
        });

        // Reaction options (select reaction)
        document.querySelectorAll('.reaction-option').forEach(opt => {
            opt.addEventListener('click', async (e) => {
                e.stopPropagation();
                const menu = opt.parentElement;
                const postId = menu.id.replace('reactions-', '');
                const value = opt.dataset.value;
                const btn = document.querySelector(`.reaction-btn[data-post-id="${postId}"]`);
                const currentLabelSpan = btn.querySelector('span:first-child');
                const currentVal = currentLabelSpan.textContent;

                // Optimistic UI update (optional, but good for responsiveness)
                // For now relying on real-time update from Firestore

                // Determine if we are setting new or toggling off (if same value clicked)
                // Actually, since the menu is generic, checking against current UI state is tricky if the button text is "Reagisci".
                // But if button says "Osservato" and we click "Osservato", we should probably toggle off.

                let newValue = value;
                if (currentVal === value) {
                    newValue = null; // Toggle off
                }

                const result = await Storage.updateReaction(postId, this.currentUser.uid, newValue);

                if (!result.success) {
                    alert('Errore nell\'inserimento della reazione. Potresti non avere i permessi necessari.');
                    console.error('Reaction error:', result.error);
                }

                // Hide menu
                menu.classList.add('hidden');
            });
        });

        // Close menus when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.reaction-menu').forEach(menu => menu.classList.add('hidden'));
        });
        */

        // Bookmark buttons
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = btn.dataset.postId;
                const isBookmarked = Storage.toggleBookmark(postId);

                btn.classList.toggle('active', isBookmarked);
                const textSpan = btn.querySelector('span:first-child');
                textSpan.textContent = isBookmarked ? 'salvato' : 'salva';
            });
        });

        // Comment toggle buttons
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = btn.dataset.postId;
                const commentsSection = document.getElementById(`comments-${postId}`);
                commentsSection.classList.toggle('hidden');
            });
        });

        // Comment forms
        document.querySelectorAll('.comment-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const postId = form.dataset.postId;
                const textarea = form.querySelector('textarea');
                const text = textarea.value.trim();

                if (text) {
                    await this.addComment(postId, text);
                    textarea.value = '';
                }
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = btn.dataset.postId;
                await this.editPost(postId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = btn.dataset.postId;
                await this.deletePost(postId);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const postId = btn.dataset.postId;
                await this.editPost(postId);
            });
        });
    }

    async addComment(postId, text) {
        const commentData = {
            authorId: this.currentUser.uid,
            authorName: this.currentUser.displayName || this.currentUser.email.split('@')[0] || 'Anonimo',
            text: text,
            timestamp: new Date()
        };

        const result = await Storage.addComment(postId, commentData);

        if (!result.success) {
            alert('Errore nell\'aggiunta del commento');
        }
        // Real-time listener will update the UI automatically
    }

    async editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const newContent = prompt('modifica il tuo messaggio:', post.content);

        if (newContent && newContent.trim() && newContent !== post.content) {
            const result = await Storage.updatePost(postId, newContent.trim());

            if (!result.success) {
                alert('Errore nella modifica del messaggio');
            }
        }
    }

    async deletePost(postId) {
        if (confirm('sei sicuro di voler eliminare questo messaggio?')) {
            const result = await Storage.deletePost(postId);

            if (!result.success) {
                alert('Errore nell\'eliminazione del messaggio');
            }
        }
    }

    setupCreatePost() {
        const form = document.getElementById('create-post-form');
        const textarea = document.getElementById('post-text');
        const postBtn = document.getElementById('post-btn');

        if (!form || !textarea || !postBtn) return;

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // LOWERCASE FILTER: Force all text to lowercase
            const rawText = textarea.value.trim();
            const text = rawText.toLowerCase();

            // Validate: check text
            if (!text) return;

            // Disable button during send
            postBtn.disabled = true;
            postBtn.textContent = 'invio...';

            try {
                // Create post
                const postData = {
                    content: text,
                    imageUrl: null,
                    authorId: this.currentUser.uid,
                    authorName: this.getEffectiveDisplayName()
                };

                // CRITICAL: Ensure we use the most up-to-date name if it was just changed/set
                if (!this.currentUser.displayName && this.currentUser.reload) {
                    await this.currentUser.reload();
                    // Re-evaluate name after reload
                    postData.authorName = this.getEffectiveDisplayName();
                }

                const result = await Storage.createPost(postData);

                if (result.success) {
                    // Reset form
                    textarea.value = '';
                } else {
                    alert('Errore nell\'invio del messaggio');
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('Errore nell\'invio del messaggio: ' + error.message);
            } finally {
                postBtn.disabled = false;
                postBtn.textContent = 'invio';
            }
        });
    }

    renderProfile(userId) {
        const profileHeader = document.getElementById('profile-header');
        const profilePosts = document.getElementById('profile-posts');

        this.currentProfileUserId = userId;

        // Render header
        const isCurrentUser = userId === this.currentUser.uid;
        const displayName = isCurrentUser
            ? this.getEffectiveDisplayName()
            : 'Utente';

        profileHeader.innerHTML = `
      <!-- Avatar removed -->
      <h2 class="profile-username" style="color: ${this.getUserColor(displayName)}">${this.escapeHtml(displayName)}</h2>
    `;

        // Render user's posts
        const userPosts = this.posts.filter(p => p.authorId === userId);

        if (userPosts.length === 0) {
            profilePosts.innerHTML = '<div class="empty-state">no posts yet</div>';
        } else {
            profilePosts.innerHTML = userPosts.map((post, index) =>
                this.renderPost(post, index)
            ).join('');

            this.attachPostListeners();
        }
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'just now';

        // Handle Firestore timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AsocialApp();
});
