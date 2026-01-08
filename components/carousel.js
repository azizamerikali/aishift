/**
 * Carousel Component
 * Touch/swipe enabled image carousel with dot indicators
 */

export function initCarousel(carouselElement) {
    if (!carouselElement) return;

    const track = carouselElement.querySelector('.carousel-track');
    const slides = carouselElement.querySelectorAll('.carousel-slide');
    const dotsContainer = carouselElement.querySelector('.carousel-dots');
    const prevBtn = carouselElement.querySelector('.carousel-nav.prev');
    const nextBtn = carouselElement.querySelector('.carousel-nav.next');

    if (slides.length <= 1) {
        // Hide navigation for single image
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return;
    }

    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;

    // Create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Slide ${index + 1}`);
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    // Navigation buttons
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        updateNavButtons();
    }

    // Touch events
    track.addEventListener('touchstart', touchStart);
    track.addEventListener('touchmove', touchMove);
    track.addEventListener('touchend', touchEnd);

    // Mouse events for desktop
    track.addEventListener('mousedown', touchStart);
    track.addEventListener('mousemove', touchMove);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', touchEnd);

    function touchStart(e) {
        isDragging = true;
        startX = getPositionX(e);
        track.style.transition = 'none';
    }

    function touchMove(e) {
        if (!isDragging) return;
        const currentX = getPositionX(e);
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
    }

    function touchEnd() {
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;

        // Threshold for slide change (20% of width)
        if (movedBy < -50 && currentIndex < slides.length - 1) {
            currentIndex++;
        } else if (movedBy > 50 && currentIndex > 0) {
            currentIndex--;
        }

        goToSlide(currentIndex);
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    function goToSlide(index) {
        // Clamp index
        if (index < 0) index = 0;
        if (index >= slides.length) index = slides.length - 1;

        currentIndex = index;
        currentTranslate = -currentIndex * 100;
        prevTranslate = currentTranslate;

        track.style.transition = 'transform 0.25s ease';
        track.style.transform = `translateX(${currentTranslate}%)`;

        updateDots();
        updateNavButtons();
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function updateNavButtons() {
        if (!prevBtn || !nextBtn) return;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === slides.length - 1;
    }
}

export function createCarouselHTML(images) {
    const slidesHTML = images.map((img, index) => {
        // Support both string URLs and object formats
        const imageUrl = typeof img === 'string' ? img : (img.imageLink || img.url || img.src || '');
        const imageName = typeof img === 'string' ? `Image ${index + 1}` : (img.name || `Image ${index + 1}`);

        return `
        <div class="carousel-slide">
            <img 
                src="${imageUrl}" 
                alt="${imageName}"
                loading="lazy"
                onerror="this.src='https://ui-avatars.com/api/?name=IMG&background=1a1a1a&color=666&size=800'"
            >
        </div>
    `;
    }).join('');

    return `
        <div class="carousel-track">
            ${slidesHTML}
        </div>
        <button class="carousel-nav prev" aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
        </button>
        <button class="carousel-nav next" aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
        </button>
        <div class="carousel-dots"></div>
    `;
}
