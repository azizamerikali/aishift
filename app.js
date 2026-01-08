/**
 * AIShifts - Main Application
 * Instagram-like social media app with AI chat integration
 * Connected to Firebase Firestore for dynamic data
 */

import { sampleData } from './data/sample-data.js?v=20260108b';
import { renderStories } from './components/stories.js?v=20260108b';
import { renderFeed } from './components/feed.js?v=20260108b';
import { initChat } from './components/chat.js?v=20260108b';
import { getAllData } from './firebase-config.js?v=20260108b';

// Application State
const state = {
    data: null,
    isLoading: true,
    error: null,
    useFirebase: true, // Toggle for Firebase vs sample data
    activeCategoryId: null, // ID of the currently selected category for filtering 
    searchQuery: '' // Current search query text
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    try {
        // Initialize chat modal
        initChat();

        // Show loading state
        showLoading();

        // Try to load data from Firebase first
        if (state.useFirebase) {
            try {
                console.log('🔥 Connecting to Firebase...');
                const firebaseData = await getAllData();

                if (firebaseData.categories.length > 0 || firebaseData.items.length > 0) {
                    state.data = firebaseData;
                    console.log('✅ Data loaded from Firebase');
                } else {
                    console.log('⚠️ Firebase collections empty, using sample data');
                    state.data = sampleData.content;
                }
            } catch (firebaseError) {
                console.warn('⚠️ Firebase connection failed, falling back to sample data:', firebaseError.message);
                state.data = sampleData.content;
            }
        } else {
            // Use sample data
            state.data = sampleData.content;
            console.log('📦 Using sample data');
        }

        state.isLoading = false;

        // Render UI
        render();

        // Setup global event listeners
        setupEventListeners();

        console.log('✅ AIShifts initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
        state.error = error.message;
        showError();
    }
}

function showLoading() {
    const feedContainer = document.getElementById('feedContainer');
    if (feedContainer) {
        feedContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                <div class="loading-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--bg-tertiary);
                    border-top: 3px solid var(--accent-blue);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                "></div>
                <p>Yükleniyor...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
}

function render() {
    const storiesContainer = document.getElementById('storiesContainer');

    if (state.data) {
        // Render stories (categories)
        renderStories(state.data.categories, storiesContainer, (categoryId) => {
            console.log('Category filter selected:', categoryId);
            state.activeCategoryId = categoryId;
            renderFeedWithFilter();
        });

        // Initial feed render
        renderFeedWithFilter();
    }
}

function renderFeedWithFilter() {
    const feedContainer = document.getElementById('feedContainer');
    if (!feedContainer || !state.data) return;

    let itemsToRender = state.data.items;

    // Filter by category
    if (state.activeCategoryId) {
        itemsToRender = itemsToRender.filter(item => item.categoryId === state.activeCategoryId);
    }

    // Filter by search query (head and description)
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        itemsToRender = itemsToRender.filter(item => {
            const headMatch = (item.head || '').toLowerCase().includes(query);
            const descMatch = (item.description || '').toLowerCase().includes(query);
            return headMatch || descMatch;
        });
    }

    // Show message if no items found
    if (itemsToRender.length === 0) {
        feedContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                <p>${state.searchQuery ? 'Arama sonuçları bulunamadı.' : 'Bu kategoride henüz içerik yok.'}</p>
            </div>
        `;
        return;
    }

    renderFeed(itemsToRender, feedContainer);
}

function setupEventListeners() {
    // Bottom navigation
    const bottomNavBtns = document.querySelectorAll('.bottom-nav-btn');
    bottomNavBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            bottomNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Search button is at index 1 (second button)
            if (index === 1) {
                toggleSearchBar();
            } else {
                // Home button - close search and reset
                closeSearchBar();
                state.searchQuery = '';
                state.activeCategoryId = null;
                renderFeedWithFilter();
            }
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderFeedWithFilter();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                state.searchQuery = '';
                renderFeedWithFilter();
                searchInput.focus();
            }
        });
    }

    // Pull to refresh simulation
    let touchStartY = 0;
    let isPulling = false;

    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            touchStartY = e.touches[0].clientY;
            isPulling = true;
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (!isPulling) return;
        const touchY = e.touches[0].clientY;
        const pullDistance = touchY - touchStartY;

        if (pullDistance > 100) {
            // Trigger refresh
            console.log('🔄 Refreshing...');
            isPulling = false;
        }
    });

    document.addEventListener('touchend', () => {
        isPulling = false;
    });
}

function toggleSearchBar() {
    const searchBar = document.getElementById('searchBar');
    const storiesSection = document.querySelector('.stories-section');
    const searchInput = document.getElementById('searchInput');

    if (searchBar) {
        searchBar.classList.toggle('active');
        if (storiesSection) {
            storiesSection.classList.toggle('search-active');
        }
        if (searchBar.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    }
}

function closeSearchBar() {
    const searchBar = document.getElementById('searchBar');
    const storiesSection = document.querySelector('.stories-section');
    const searchInput = document.getElementById('searchInput');

    if (searchBar) {
        searchBar.classList.remove('active');
        if (storiesSection) {
            storiesSection.classList.remove('search-active');
        }
        if (searchInput) {
            searchInput.value = '';
        }
    }
}

function showError() {
    const feedContainer = document.getElementById('feedContainer');
    if (feedContainer) {
        feedContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                <p>😕 Bir hata oluştu</p>
                <p style="font-size: 14px; margin-top: 8px;">${state.error}</p>
                <button onclick="location.reload()" style="
                    margin-top: 16px;
                    padding: 10px 20px;
                    background: var(--accent-blue);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Tekrar Dene</button>
            </div>
        `;
    }
}

// Export for potential external use
export { state, render };
