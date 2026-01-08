/**
 * Stories Component
 * Renders horizontal scrollable story circles (categories)
 */

export function renderStories(categories, container, onCategoryClick) {
    if (!container) return;

    container.innerHTML = '';

    categories.forEach((category, index) => {
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.dataset.categoryId = category.categoryId;

        // Add seen class randomly for demo purposes (first 2 are unseen)
        if (index > 1 && Math.random() > 0.5) {
            storyItem.classList.add('seen');
        }

        storyItem.innerHTML = `
            <div class="story-ring">
                <img 
                    src="${category.imageLink}" 
                    alt="${category.name}" 
                    class="story-avatar"
                    loading="lazy"
                    onerror="this.src='https://ui-avatars.com/api/?name=${category.name.charAt(0)}&background=333&color=fff&size=66'"
                >
            </div>
            <span class="story-username">${category.name.toLowerCase()}</span>
        `;

        // Click handler
        storyItem.addEventListener('click', () => {
            // Visual update: Remove active from others, add to this
            const allItems = container.querySelectorAll('.story-item');
            let isActive = storyItem.classList.contains('active');

            // Reset all
            allItems.forEach(item => item.classList.remove('active'));

            // Toggle active state locally
            if (!isActive) {
                storyItem.classList.add('active');
                if (onCategoryClick) onCategoryClick(category.categoryId);
            } else {
                // If already active, deselect (toggle off)
                storyItem.classList.remove('active');
                if (onCategoryClick) onCategoryClick(null); // Clear filter
            }
        });

        container.appendChild(storyItem);
    });
}

