/**
 * Feed Component
 * Renders post cards with carousel, actions, and captions
 */

import { createCarouselHTML, initCarousel } from './carousel.js?v=20260108b';
import { openChat } from './chat.js?v=20260108b';
import { addComment } from '../firebase-config.js?v=20260108b';

export function renderFeed(items, container) {
    if (!container) return;

    container.innerHTML = '';

    items.forEach(item => {
        const postCard = createPostCard(item);
        container.appendChild(postCard);

        // Initialize carousel after adding to DOM
        const carousel = postCard.querySelector('.post-carousel');
        if (carousel) {
            initCarousel(carousel);
        }
    });
}

function createPostCard(item) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.dataset.itemId = item.itemId || item.id || '0';

    // Default values for potentially missing fields from Firebase
    const username = item.user || item.username || 'kullanıcı';
    const userAvatar = item.userAvatar || `https://ui-avatars.com/api/?name=U&background=333&color=fff&size=32`;
    const head = item.head || '';
    const description = item.description || '';
    const likes = item.likes || 0;
    const comments = Array.isArray(item.comments) ? item.comments.length : (item.comments || 0);
    const timeAgo = item.timeAgo || 'az';
    const images = item.images || [];

    // Format likes
    const likesText = formatNumber(likes);

    // Truncate description
    const maxLength = 100;
    const isLongDesc = description.length > maxLength;
    const shortDesc = isLongDesc
        ? description.substring(0, maxLength) + '...'
        : description;

    article.innerHTML = `
        <!-- Post Header -->
        <header class="post-header">
            <div class="post-user">
                <img 
                    src="${userAvatar}" 
                    alt="${username}" 
                    class="post-avatar"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${username.charAt(0).toUpperCase()}&background=333&color=fff&size=32'"
                >
                <div class="post-user-info">
                    <span class="post-username">${username}</span>
                    <span class="post-location">${head}</span>
                </div>
            </div>
            <button class="ai-chat-btn header-ai-btn" data-item-id="${item.itemId || item.id}">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                AI Başlat
            </button>
        </header>
        
        <!-- Post Carousel -->
        <div class="post-carousel">
            ${createCarouselHTML(images)}
        </div>
        
        <!-- Post Actions -->
        <div class="post-actions">
            <div class="post-actions-left">
                <button class="action-btn like-btn" aria-label="Like">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <button class="action-btn comment-btn" aria-label="Comment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                </button>
                <button class="action-btn share-btn" aria-label="Share">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
            <button class="action-btn save-btn" aria-label="Save">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
            </button>
        </div>
        
        <!-- Post Info -->
        <div class="post-info">
            <div class="post-likes">${likesText} beğenme</div>
            <div class="post-caption">
                <span class="post-caption-username">${username}</span>
                <span class="post-caption-text">${shortDesc}</span>
                ${isLongDesc ? '<span class="post-caption-more">devamı</span>' : ''}
            </div>
            ${comments > 0 ? `
                <div class="post-comments-link" role="button" tabindex="0">${comments} yorumun tümünü gör</div>
            ` : ''}
            <div class="post-comments-container" style="display: none;"></div>
            
            <!-- Comment Form -->
            <form class="post-comment-form comment-form" style="display: none;">
                <input type="text" class="comment-input" placeholder="Yorum ekle..." aria-label="Yorum ekle">
                <button type="submit" class="comment-submit-btn">Paylaş</button>
            </form>
            
        </div>
    `;

    // Add event listeners
    setupPostEventListeners(article, item);

    return article;
}

function setupPostEventListeners(article, item) {
    // Like button
    const likeBtn = article.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('liked');
            likeBtn.classList.add('animate');
            setTimeout(() => likeBtn.classList.remove('animate'), 400);

            // Update likes count
            const likesEl = article.querySelector('.post-likes');
            if (likesEl) {
                const isLiked = likeBtn.classList.contains('liked');
                const currentLikes = item.likes + (isLiked ? 1 : 0);
                likesEl.textContent = `${formatNumber(currentLikes)} beğenme`;
            }
        });
    }

    // Comments toggle
    const commentsLink = article.querySelector('.post-comments-link');
    const commentsContainer = article.querySelector('.post-comments-container');

    if (commentsLink && commentsContainer) {
        commentsLink.addEventListener('click', () => {
            const isHidden = commentsContainer.style.display === 'none';

            if (isHidden) {
                // Show comments
                renderComments(commentsContainer, item.comments);
                commentsContainer.style.display = 'block';
                commentsLink.textContent = 'Yorumları gizle';
            } else {
                // Hide comments
                commentsContainer.style.display = 'none';
                const count = Array.isArray(item.comments) ? item.comments.length : (item.comments || 0);
                commentsLink.textContent = `${count} yorumun tümünü gör`;
            }
        });
    }

    // Comment Button (in actions bar)
    const commentBtn = article.querySelector('.comment-btn');
    const commentForm = article.querySelector('.post-comment-form');

    if (commentBtn && commentForm) {
        commentBtn.addEventListener('click', () => {
            // Toggle form visibility
            const isHidden = commentForm.style.display === 'none';
            commentForm.style.display = isHidden ? 'flex' : 'none';

            if (isHidden) {
                // Focus input
                const input = commentForm.querySelector('input');
                if (input) input.focus();

                // Also open comments if needed
                const commentsLink = article.querySelector('.post-comments-link');
                const commentsContainer = article.querySelector('.post-comments-container');

                if (commentsLink && commentsContainer && commentsContainer.style.display === 'none') {
                    commentsLink.click();
                } else if (!commentsLink && commentsContainer && commentsContainer.style.display === 'none') {
                    commentsContainer.style.display = 'block';
                }
            }
        });
    }

    // Comment Form Submit
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = commentForm.querySelector('input');
            const text = input.value.trim();
            const commentsContainer = article.querySelector('.post-comments-container');
            const commentsLink = article.querySelector('.post-comments-link');

            if (text) {
                addCommentToUI(commentsContainer, text);

                // Update data model to persist comment on toggle
                if (Array.isArray(item.comments)) {
                    item.comments.push({ username: 'sen', text });
                }

                // Save to Firebase
                // Use item.id (Firestore Document ID) preferentially
                const docId = item.id || item.itemId;
                const commentData = { username: 'sen', text: text };

                if (docId) {
                    addComment(docId, commentData)
                        .catch(err => console.error("Failed to save comment to Firebase:", err));
                } else {
                    console.error("No document ID found for item, cannot save comment.");
                }

                input.value = '';

                if (commentsLink) {
                    // Update count based on actual data length if array, or increment text
                    if (Array.isArray(item.comments)) {
                        const newCount = item.comments.length;
                        if (!commentsLink.textContent.includes('gizle')) {
                            commentsLink.textContent = `${newCount} yorumun tümünü gör`;
                        }
                    } else {
                        // Fallback implementation
                        const currentText = commentsLink.textContent;
                        const match = currentText.match(/(\d+)/);
                        if (match) {
                            const newCount = parseInt(match[0]) + 1;
                            if (!commentsLink.textContent.includes('gizle')) {
                                commentsLink.textContent = `${newCount} yorumun tümünü gör`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Share button
    const shareBtn = article.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            openShareModal(item);
        });
    }

    // Save button
    const saveBtn = article.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const svg = saveBtn.querySelector('svg');
            const isSaved = svg.getAttribute('fill') !== 'none';
            svg.setAttribute('fill', isSaved ? 'none' : 'currentColor');
        });
    }

    // AI Chat button
    const aiChatBtn = article.querySelector('.ai-chat-btn');
    if (aiChatBtn) {
        aiChatBtn.addEventListener('click', () => {
            openChat(item);
        });
    }

    // Double-tap to like
    let lastTap = 0;
    const carousel = article.querySelector('.post-carousel');
    if (carousel) {
        carousel.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 300 && tapLength > 0) {
                // Double tap detected
                if (!likeBtn.classList.contains('liked')) {
                    likeBtn.click();
                }
                showHeartAnimation(carousel, e);
            }
            lastTap = currentTime;
        });
    }

    // Expand description
    const moreBtn = article.querySelector('.post-caption-more');
    if (moreBtn) {
        moreBtn.addEventListener('click', () => {
            const textSpan = article.querySelector('.post-caption-text');
            if (textSpan) {
                textSpan.textContent = item.description;
                moreBtn.style.display = 'none';
            }
        });
    }
}

function showHeartAnimation(container, event) {
    const heart = document.createElement('div');
    heart.innerHTML = `
        <svg viewBox="0 0 24 24" fill="white" style="width: 80px; height: 80px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    `;
    heart.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: heartPop 0.8s ease-out forwards;
        pointer-events: none;
        z-index: 10;
    `;

    // Add animation keyframes if not exists
    if (!document.querySelector('#heart-animation-style')) {
        const style = document.createElement('style');
        style.id = 'heart-animation-style';
        style.textContent = `
            @keyframes heartPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(heart);
    setTimeout(() => heart.remove(), 800);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'B';
    }
    return num.toLocaleString('tr-TR');
}

/**
 * Renders comments into the container
 * @param {HTMLElement} container 
 * @param {Array|number} comments 
 */
function renderComments(container, comments) {
    container.innerHTML = '';

    // Fallback if comments is just a number (no actual data)
    if (typeof comments === 'number' || !Array.isArray(comments)) {
        container.innerHTML = '<div class="comment-item" style="color: grey; padding-bottom: 8px;">Yorum detayları yüklenemedi.</div>';
        return;
    }

    comments.forEach(comment => {
        // Handle both string comments and object comments
        let username = 'kullanıcı';
        let text = '';

        if (typeof comment === 'string') {
            text = comment;
        } else if (typeof comment === 'object') {
            username = comment.username || 'kullanıcı';
            text = comment.text || '';
        }

        if (!text) return;

        const div = document.createElement('div');
        div.className = 'comment-item';

        // Truncate logic for comments
        const maxLength = 60;
        const isLong = text.length > maxLength;
        const shortText = isLong ? text.substring(0, maxLength) + '...' : text;

        div.innerHTML = `
            <div class="comment-content">
                <span class="comment-username">${username}</span>
                <span class="comment-text">${shortText}</span>
                ${isLong ? '<span class="comment-more">devamı</span>' : ''}
            </div>
            <button class="action-btn comment-like-btn" aria-label="Like comment">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;">
                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </button>
        `;

        // Event listener for "devamı" in comment
        if (isLong) {
            const moreBtn = div.querySelector('.comment-more');
            if (moreBtn) {
                moreBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent bubbling just in case
                    const textSpan = div.querySelector('.comment-text');
                    textSpan.textContent = text;
                    moreBtn.remove();
                });
            }
        }

        container.appendChild(div);
    });
}

function addCommentToUI(container, text) {
    if (!container) return;

    // Create comment element
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
        <div class="comment-content">
            <span class="comment-username">sen</span>
            <span class="comment-text">${text}</span>
        </div>
        <button class="action-btn comment-like-btn" aria-label="Like comment">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;">
                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
             </svg>
        </button>
    `;

    // Append at the end
    container.appendChild(div);
    container.style.display = 'block'; // Ensure visible

    // Scroll to new comment
    div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Share Modal Logic
let shareModalOverlay = null;

function openShareModal(item) {
    if (!shareModalOverlay) {
        createShareModal();
    }

    // Update link (demo link)
    const postLink = `https://aishifts.com/post/${item.itemId || '1'}`;
    const modal = shareModalOverlay;

    // Setup handlers with new link
    const copyBtn = modal.querySelector('.share-copy');
    const whatsappBtn = modal.querySelector('.share-whatsapp');
    const linkedinBtn = modal.querySelector('.share-linkedin');

    // Reset copy button text
    const copySpan = copyBtn.querySelector('span');
    if (copySpan) copySpan.textContent = 'Bağlantıyı Kopyala';

    // Remove old listeners (cloning)
    const newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);

    const newWhatsappBtn = whatsappBtn.cloneNode(true);
    whatsappBtn.parentNode.replaceChild(newWhatsappBtn, whatsappBtn);

    const newLinkedinBtn = linkedinBtn.cloneNode(true);
    linkedinBtn.parentNode.replaceChild(newLinkedinBtn, linkedinBtn);

    // Add new listeners
    newCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(postLink).then(() => {
            const span = newCopyBtn.querySelector('span');
            if (span) span.textContent = 'Kopyalandı! ✅';
            setTimeout(() => {
                closeShareModal();
                if (span) span.textContent = 'Bağlantıyı Kopyala';
            }, 1000);
        });
    });

    newWhatsappBtn.addEventListener('click', () => {
        window.open(`https://wa.me/?text=${encodeURIComponent('Bu harika içeriğe göz at: ' + postLink)}`, '_blank');
        closeShareModal();
    });

    newLinkedinBtn.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postLink)}`, '_blank');
        closeShareModal();
    });

    shareModalOverlay.classList.add('active');
}

function createShareModal() {
    shareModalOverlay = document.createElement('div');
    shareModalOverlay.className = 'share-modal-overlay';

    shareModalOverlay.innerHTML = `
        <div class="share-modal">
            <div class="share-header">
                <span>Paylaş</span>
                <button class="share-close-btn">&times;</button>
            </div>
            <div class="share-options">
                <button class="share-option share-copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Bağlantıyı Kopyala</span>
                </button>
                <button class="share-option share-whatsapp">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                </button>
                <button class="share-option share-linkedin">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(shareModalOverlay);

    // Close events
    const closeBtn = shareModalOverlay.querySelector('.share-close-btn');
    closeBtn.addEventListener('click', closeShareModal);

    shareModalOverlay.addEventListener('click', (e) => {
        if (e.target === shareModalOverlay) {
            closeShareModal();
        }
    });
}

function closeShareModal() {
    if (shareModalOverlay) {
        shareModalOverlay.classList.remove('active');
    }
}
