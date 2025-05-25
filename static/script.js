// static/script.js

// --- IMPORT FUN FEATURES AND CONFIG ---
// Ensure these paths are correct and the files export the named entities.
import { funConfig } from 'https://sar.s1d.me/static/fun-config.js'; // Assuming fun-config.js exports 'funConfig'
import {
    initGlitchEffectOnHover,
    initSystemTooltips,
    initAnimatedCaret,
    initDecoderEffect
} from 'https://sar.s1d.me/static/fun-features.js'; 




console.log('sar.s1d script.js vFINAL_WITH_FUN loaded');

document.addEventListener('DOMContentLoaded', function() {

    // --- AESTHETIC ANIMATIONS & INTERACTIONS (Profile Pic, Tags, AKA Names, Project Ripples) ---
    const allAnimatedTags = document.querySelectorAll('.card .tag, .card .tag-placeholder');
    allAnimatedTags.forEach((tag, index) => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(10px)';
        setTimeout(() => {
            tag.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 150 + (index * 50));
    });

    const profilePic = document.querySelector('.profile-picture img');
    if (profilePic) {
        let floatDirection = 1;
        let floatPosition = 0;
        function floatAnimation() {
            floatPosition += 0.04 * floatDirection;
            if (floatPosition > 2) floatDirection = -1;
            else if (floatPosition < -0.2) floatDirection = 1;
            profilePic.style.transform = `translateY(${floatPosition}px)`;
            requestAnimationFrame(floatAnimation);
        }
        requestAnimationFrame(floatAnimation);
    }

    const akaNames = document.querySelectorAll('.aka-name');
    akaNames.forEach(name => {
        name.addEventListener('mouseover', () => name.style.textShadow = '0 0 6px var(--accent-primary)');
        name.addEventListener('mouseout', () => name.style.textShadow = 'none');
    });

    const projectLinksWithRipple = document.querySelectorAll('.tag.project');
    projectLinksWithRipple.forEach(link => {
        if (!link.classList.contains('nav-button')) {
            link.addEventListener('click', function(e) {
                if (this.target === '_blank' || (this.getAttribute('href') && this.getAttribute('href').startsWith('#'))) {
                    if (this.closest('.tags') && !this.getAttribute('href')) return;
                } else if (!this.getAttribute('href') && !this.closest('a[href]')) {
                    return;
                }

                const existingRipple = this.querySelector('.ripple-effect-span');
                if(existingRipple) existingRipple.remove();

                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect-span');
                Object.assign(ripple.style, {
                    position: 'absolute', borderRadius: '50%', transform: 'scale(0)',
                    animation: 'ripple-keyframe-animation 0.6s linear',
                    backgroundColor: 'rgba(43, 182, 140, 0.35)',
                    pointerEvents: 'none', zIndex: '0'
                });
                this.style.position = 'relative'; this.style.overflow = 'hidden';
                this.appendChild(ripple);
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                const size = Math.max(this.clientWidth, this.clientHeight);
                Object.assign(ripple.style, {
                    width: `${size * 2}px`, height: `${size * 2}px`,
                    left: `${x - size}px`, top: `${y - size}px`
                });
                setTimeout(() => ripple.remove(), 600);
            });
        }
    });
    if (!document.getElementById('ripple-keyframes-dynamic-id')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "ripple-keyframes-dynamic-id";
        styleSheet.innerText = `@keyframes ripple-keyframe-animation { to { transform: scale(1.5); opacity: 0; } }`;
        document.head.appendChild(styleSheet);
    }

    // --- FUN FEATURES INITIALIZATION ---
    // Check if funConfig and its properties exist before calling functions
    // The functions themselves are imported, so typeof check is for the imported function.
    if (funConfig?.glitchEffectOnHover?.enabled && typeof initGlitchEffectOnHover === 'function') {
        initGlitchEffectOnHover();
    }
    if (funConfig?.systemTooltips?.enabled && typeof initSystemTooltips === 'function') {
        initSystemTooltips();
    }
    if (funConfig?.animatedCaret?.enabled && typeof initAnimatedCaret === 'function') {
        initAnimatedCaret(); // Call it once, decoder might re-call it if it modifies the .aka container
    }
    if (funConfig?.decoderEffect?.enabled && typeof initDecoderEffect === 'function') {
        initDecoderEffect();
    }


    // --- CARD NAVIGATION SCRIPT with HEIGHT ANIMATION ---
    const allNavButtons = document.querySelectorAll('.card .navigation .nav-button');
    const allPageContentDivs = document.querySelectorAll('.card .page-content-wrapper .page-content');
    const contentWrapperForAnimation = document.querySelector('.card .page-content-wrapper');

    let isPageSwitchAnimating = false;
    let currentActivePageId = null;

    // Read durations from CSS Custom Properties
    const rootStyles = getComputedStyle(document.documentElement);
    const COLLAPSE_DURATION_MS = parseFloat(rootStyles.getPropertyValue('--animation-collapse-duration').trim() || '0.35s') * 1000;
    const EXPAND_DURATION_MS = parseFloat(rootStyles.getPropertyValue('--animation-expand-duration').trim() || '0.35s') * 1000;


    function updateNavigationButtonVisibility(activePageId) {
        allNavButtons.forEach(button => {
            button.style.display = (button.dataset.target === activePageId) ? 'none' : '';
        });
    }

    function setContentWrapperHeightCssVar(height) {
        contentWrapperForAnimation.style.setProperty('--content-wrapper-height', `${height}px`);
    }

    function animatePageSwitch(targetPageId) {
        if (isPageSwitchAnimating) return;
        isPageSwitchAnimating = true;

        const currentActivePageElement = document.getElementById(currentActivePageId);

        const currentWrapperHeight = contentWrapperForAnimation.scrollHeight;
        setContentWrapperHeightCssVar(currentWrapperHeight);
        contentWrapperForAnimation.style.height = `${currentWrapperHeight}px`;
        contentWrapperForAnimation.style.opacity = '1';

        requestAnimationFrame(() => {
            contentWrapperForAnimation.classList.add('page-wrapper-is-collapsing');
            contentWrapperForAnimation.classList.remove('page-wrapper-is-expanding');
        });

        setTimeout(() => {
            if (currentActivePageElement) {
                currentActivePageElement.classList.remove('active');
            }

            const newTargetPageElement = document.getElementById(targetPageId);
            if (newTargetPageElement) {
                newTargetPageElement.classList.add('active');

                contentWrapperForAnimation.style.height = 'auto';
                const newContentHeight = newTargetPageElement.scrollHeight;

                setContentWrapperHeightCssVar(newContentHeight);
                contentWrapperForAnimation.style.height = '0px';

                currentActivePageId = targetPageId;
                updateNavigationButtonVisibility(currentActivePageId);
                if (contentWrapperForAnimation) contentWrapperForAnimation.scrollTop = 0;

                requestAnimationFrame(() => {
                    contentWrapperForAnimation.classList.remove('page-wrapper-is-collapsing');
                    contentWrapperForAnimation.classList.add('page-wrapper-is-expanding');
                });

                setTimeout(() => {
                    contentWrapperForAnimation.classList.remove('page-wrapper-is-expanding');
                    contentWrapperForAnimation.style.height = 'auto';
                    isPageSwitchAnimating = false;
                }, EXPAND_DURATION_MS);
            } else {
                console.error("Target page for switch not found:", targetPageId);
                isPageSwitchAnimating = false;
            }
        }, COLLAPSE_DURATION_MS);
    }

    allNavButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.dataset.target;
            if (targetId !== currentActivePageId && !isPageSwitchAnimating) {
                animatePageSwitch(targetId);
            }
        });
    });

    function initializeCardView() {
        const initiallyActivePageElement = document.querySelector('.page-content.active');
        if (initiallyActivePageElement) {
            currentActivePageId = initiallyActivePageElement.id;
            updateNavigationButtonVisibility(currentActivePageId);
            contentWrapperForAnimation.style.height = 'auto';
            const initialHeight = initiallyActivePageElement.scrollHeight;
            contentWrapperForAnimation.style.height = `${initialHeight}px`;
            setContentWrapperHeightCssVar(initialHeight);
        } else if (allPageContentDivs.length > 0 && allNavButtons.length > 0) {
            currentActivePageId = allNavButtons[0].dataset.target;
            const targetPage = document.getElementById(currentActivePageId);
            if (targetPage) {
                targetPage.classList.add('active');
                updateNavigationButtonVisibility(currentActivePageId);
                contentWrapperForAnimation.style.height = 'auto';
                const initialHeight = targetPage.scrollHeight;
                contentWrapperForAnimation.style.height = `${initialHeight}px`;
                setContentWrapperHeightCssVar(initialHeight);
            }
        }
    }
    initializeCardView();

    let resizeDebounceTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeDebounceTimeout);
        resizeDebounceTimeout = setTimeout(() => {
            if (!isPageSwitchAnimating) {
                const activePage = document.getElementById(currentActivePageId);
                if (activePage && getComputedStyle(activePage).display !== 'none') {
                    contentWrapperForAnimation.style.transition = 'none';
                    contentWrapperForAnimation.style.height = 'auto';
                    const newHeight = activePage.scrollHeight;
                    contentWrapperForAnimation.style.height = `${newHeight}px`;
                    setContentWrapperHeightCssVar(newHeight);
                    setTimeout(() => { contentWrapperForAnimation.style.transition = ''; }, 50);
                }
            }
        }, 200);
    });

}); // End of DOMContentLoaded