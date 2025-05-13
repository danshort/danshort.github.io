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
        // Ensure heading has an id
        if (!heading.id) {
            heading.id = heading.textContent.toLowerCase().replace(/[^\w]+/g, '-');
        }

        const listItem = document.createElement('li');
        const link = document.createElement('a');

        // Remove any heading IDs that appear in the text itself (like #)
        const headingText = heading.textContent.replace(/#/g, '').trim();

        link.href = `#${heading.id}`;
        link.textContent = headingText;
        link.classList.add(`toc-${heading.tagName.toLowerCase()}`);

        listItem.appendChild(link);
        tocContainer.appendChild(listItem);
    });
}

/**
 * Sets up scroll spy to highlight current section in TOC
 */
function setupScrollSpy() {
    // Get all section headings with IDs
    const sections = Array.from(document.querySelectorAll('.content h2[id], .content h3[id]'));
    const tocLinks = document.querySelectorAll('#toc a');

    // Update scroll spy on scroll and resize
    function updateScrollSpy() {
        // Sort sections by their position on the page (top to bottom)
        // This needs to be recalculated on each check as positions may change
        sections.sort((a, b) => a.offsetTop - b.offsetTop);

        // Find the current section in view
        let currentSectionId = '';
        // Use the same offset calculation for consistency
        const offset = calculateScrollOffset();
        const scrollPosition = window.scrollY + offset;

        // Find the last section that starts before the current scroll position
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            if (section.offsetTop <= scrollPosition) {
                currentSectionId = section.id;
            } else {
                // Stop once we find a section below the scroll position
                break;
            }
        }

        // Update TOC active state
        tocLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Run scroll spy on scroll
    window.addEventListener('scroll', updateScrollSpy);

    // Also update on resize and TOC toggle
    window.addEventListener('resize', updateScrollSpy);

    // Update when hamburger menu is toggled
    const hamburgerToggle = document.getElementById('hamburger-menu');
    hamburgerToggle.addEventListener('click', function() {
        // Wait a bit for the transition to complete
        setTimeout(updateScrollSpy, 300);
    });

    // Trigger scroll event on page load
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
                // Calculate offset based on screen size and sidebar state
                const offset = calculateScrollOffset();
                const targetPosition = targetElement.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
}

/**
 * Calculate appropriate scroll offset based on viewport and sidebar state
 */
function calculateScrollOffset() {
    // Default offset for desktop
    let offset = 80;

    // Adjust for mobile if the menu is collapsed
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        offset = sidebar.offsetHeight + 20; // Height of collapsed sidebar + buffer
    }

    return offset;
}

/**
 * Handle initial hash on page load
 */
function handleInitialHash() {
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);

        if (targetElement) {
            setTimeout(() => {
                // Use the same offset calculation as smooth scrolling
                const offset = calculateScrollOffset();
                const targetPosition = targetElement.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 100);
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
    const startManagingYear = site.managingYear;
    const startExecutiveYear = site.executiveYear;
    const startDevYear = site.devYear;

    const yearsManaging = currentYear - startManagingYear;
    const yearsExecutive = currentYear - startExecutiveYear;
    const yearsDev = currentYear - startDevYear;

    // Update the DOM
    document.getElementById('years-managing').textContent = yearsManaging;
    document.getElementById('years-executive').textContent = yearsExecutive;
    document.getElementById('years-dev').textContent = yearsDev;
}