/**
 * Table of contents functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Generate table of contents
    generateTableOfContents();

    // Set up scroll spy for TOC highlighting
    setupScrollSpy();

    // Set up smooth scrolling for TOC links
    setupSmoothScrolling();

    // Handle initial hash on page load
    handleInitialHash();

    // Initialize theme toggle
    initializeTheme();

    // Initialize hamburger menu
    initializeHamburgerMenu();

    // Initialize auto-calculated stats
    initializeStats();
});

/**
 * Generates the table of contents based on headings in the document
 */
function generateTableOfContents() {
    const tocContainer = document.getElementById('toc');
    const contentSection = document.querySelector('.content');
    const headings = contentSection.querySelectorAll('h1, h2, h3');

    // Clear any existing TOC items first
    tocContainer.innerHTML = '';

    headings.forEach(heading => {
        // Check if heading already has an ID (from markdown-it-attrs)
        // If not, create a safe ID
        if (!heading.id) {
            const headingText = heading.textContent.trim();
            const sanitizedId = createSafeId(headingText);
            heading.id = sanitizedId;
        }

        const listItem = document.createElement('li');
        const link = document.createElement('a');

        // Clean the text for display in TOC
        const displayText = heading.textContent.replace(/#/g, '').trim();

        link.href = `#${heading.id}`;
        link.textContent = displayText;
        link.classList.add(`toc-${heading.tagName.toLowerCase()}`);

        listItem.appendChild(link);
        tocContainer.appendChild(listItem);
    });
}

/**
 * Creates a safe ID from heading text by removing problematic characters
 * and ensuring it's valid for use as an HTML ID
 */
function createSafeId(text) {
    // Remove any quotes, special characters, and convert spaces to hyphens
    return text
        .toLowerCase()
        .replace(/['"]/g, '') // Remove quotes
        .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove consecutive hyphens
        .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
}

/**
 * Sets up scroll spy to highlight current section in TOC
 */
function setupScrollSpy() {
    // Get all section headings with IDs
    const sections = Array.from(document.querySelectorAll('.content h1[id], .content h2[id], .content h3[id]'));
    const tocLinks = document.querySelectorAll('#toc a');

    // Update scroll spy on scroll and resize
    function updateScrollSpy() {
        // Early exit if no sections or toc links
        if (sections.length === 0 || tocLinks.length === 0) return;

        // Get current scroll position
        const scrollPosition = window.scrollY;

        // Find the current section in view
        let currentSection = null;
        let minDistance = Infinity;

        // Get visible portion of the page
        const bufferTop = getFixedElementsHeight();
        const visibleTop = scrollPosition + bufferTop;

        // Find the section closest to the top of the visible area
        for (const section of sections) {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            // Calculate how far this section is from the ideal position
            const distance = Math.abs(sectionTop - visibleTop);

            // If this section is closer than the current best match, update
            if (distance < minDistance) {
                minDistance = distance;
                currentSection = section;
            }
        }

        // Update active state in TOC
        if (currentSection) {
            const currentId = currentSection.id;
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentId}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    // Run scroll spy on scroll
    window.addEventListener('scroll', updateScrollSpy);

    // Also update on resize and TOC toggle
    window.addEventListener('resize', updateScrollSpy);

    // Update when hamburger menu is toggled
    const hamburgerToggle = document.getElementById('hamburger-menu');
    if (hamburgerToggle) {
        hamburgerToggle.addEventListener('click', function() {
            // Wait for transition to complete
            setTimeout(updateScrollSpy, 300);
        });
    }

    // Initial run
    updateScrollSpy();
}

/**
 * Sets up smooth scrolling for TOC links
 */
function setupSmoothScrolling() {
    const tocLinks = document.querySelectorAll('#toc a');

    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                scrollToElement(targetElement);

                // Update URL hash without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Gets the height of all fixed elements at the top of the page
 */
function getFixedElementsHeight() {
    if (window.innerWidth <= 768) {
        // On mobile, the sidebar is not fixed when scrolling
        const sidebar = document.querySelector('.sidebar');
        return sidebar.offsetHeight;
    } else {
        // On desktop, account for any fixed headers/nav
        // We use a reasonable default that works well
        return 120; // Adjusted value to ensure proper positioning
    }
}

/**
 * Scroll to an element with proper positioning
 */
function scrollToElement(element) {
    // Calculate the target position
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;

    // Get the height of fixed elements at the top
    const fixedElementsHeight = getFixedElementsHeight();

    // Calculate the final scroll position
    // Subtract fixed elements height and add some padding for better visibility
    const scrollPosition = absoluteElementTop - fixedElementsHeight;

    // Perform the scroll
    window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
    });
}

/**
 * Handle initial hash on page load
 */
function handleInitialHash() {
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);

        if (targetElement) {
            // Delay to ensure page is fully loaded
            setTimeout(() => {
                scrollToElement(targetElement);
            }, 300);
        }
    }
}

/**
 * Initialize theme based on user preference and set up toggle behavior
 */
function initializeTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    let currentTheme = 'auto';

    // Check if user has previously selected a theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        applyTheme(currentTheme);
    }

    // Update button text to show current theme
    themeToggleBtn.textContent = capitalizeFirstLetter(currentTheme);

    // Add click event to toggle theme
    themeToggleBtn.addEventListener('click', function() {
        // Cycle through themes: auto -> light -> dark -> auto
        if (currentTheme === 'auto') {
            currentTheme = 'light';
        } else if (currentTheme === 'light') {
            currentTheme = 'dark';
        } else {
            currentTheme = 'auto';
        }

        // Apply the new theme
        applyTheme(currentTheme);

        // Update button text
        themeToggleBtn.textContent = capitalizeFirstLetter(currentTheme);

        // Save preference
        localStorage.setItem('theme', currentTheme);
    });
}

/**
 * Applies the selected theme to the document
 */
function applyTheme(theme) {
    if (theme === 'auto') {
        // Remove any theme attribute to use system preference
        document.documentElement.removeAttribute('data-theme');
    } else {
        // Set the selected theme
        document.documentElement.setAttribute('data-theme', theme);
    }
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Initializes the hamburger menu for mobile view
 */
function initializeHamburgerMenu() {
    const hamburgerToggle = document.getElementById('hamburger-menu');
    const tocContainer = document.querySelector('.toc-container');

    if (!hamburgerToggle || !tocContainer) return;

    // Add click event to hamburger icon
    hamburgerToggle.addEventListener('click', function() {
        // Toggle active class on hamburger icon
        this.classList.toggle('active');

        // Toggle open class on TOC container
        tocContainer.classList.toggle('open');
    });

    // Close menu when clicking a link (on mobile)
    const tocLinks = document.querySelectorAll('#toc a');

    tocLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only run on mobile
            if (window.innerWidth <= 768) {
                hamburgerToggle.classList.remove('active');
                tocContainer.classList.remove('open');
            }
        });
    });

    // Check if we're on mobile to set initial state
    if (window.innerWidth <= 768) {
        tocContainer.classList.remove('open');
    } else {
        tocContainer.classList.add('open');
    }

    // Update on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            // On mobile: collapse if not active
            if (!hamburgerToggle.classList.contains('active')) {
                tocContainer.classList.remove('open');
            }
        } else {
            // On desktop: always show
            tocContainer.classList.add('open');
        }
    });

    // Handle mentorship link on mobile
    const mentorshipLink = document.querySelector('.mentorship-link');
    if (mentorshipLink) {
        // On mobile, shrink the mentorship link and keep it visible
        if (window.innerWidth <= 768) {
            mentorshipLink.style.padding = '0.5rem';
            mentorshipLink.style.fontSize = '0.85rem';
        }
    }
}

/**
 * Initializes and calculates experience statistics
 */
function initializeStats() {
    // Get the current year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Calculate years of experience
    const startManagingYear = siteData.managingYear;
    const startExecutiveYear = siteData.executiveYear;
    const startDevYear = siteData.devYear;

    const yearsManaging = currentYear - startManagingYear;
    const yearsExecutive = currentYear - startExecutiveYear;
    const yearsDev = currentYear - startDevYear;

    // Update the DOM
    document.getElementById('years-managing').textContent = yearsManaging;
    document.getElementById('years-executive').textContent = yearsExecutive;
    document.getElementById('years-dev').textContent = yearsDev;
}