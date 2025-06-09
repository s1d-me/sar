// static/script.js

// --- IMPORT FUN FEATURES AND CONFIG ---
// Ensure these paths are correct and the files export the named entities.
import { funConfig } from './fun-config.js'; // Assuming fun-config.js exports 'funConfig'
import {
    initGlitchEffectOnHover,
    initSystemTooltips,
    initAnimatedCaret,
    initDecoderEffect
} from './fun-features.js'; 

// console.log('sar.s1d script.js loaded');

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
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            requestAnimationFrame(floatAnimation);
        }
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
                const href = this.getAttribute('href');
                if (!href || href === '#') {
                    if (this.tagName.toLowerCase() !== 'a' && !this.closest('a[href]')) {
                         e.preventDefault(); 
                    } else if (href === '#') {
                        e.preventDefault(); 
                    }
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
                if (getComputedStyle(this).position === 'static') {
                    this.style.position = 'relative';
                }
                this.style.overflow = 'hidden'; 
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
    if (funConfig?.glitchEffectOnHover?.enabled && typeof initGlitchEffectOnHover === 'function') {
        initGlitchEffectOnHover();
    }
    if (funConfig?.systemTooltips?.enabled && typeof initSystemTooltips === 'function') {
        initSystemTooltips();
    }
    if (funConfig?.animatedCaret?.enabled && typeof initAnimatedCaret === 'function') {
        initAnimatedCaret(); 
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

    const rootStyles = getComputedStyle(document.documentElement);
    const COLLAPSE_DURATION_MS = parseFloat(rootStyles.getPropertyValue('--animation-collapse-duration').trim() || '0.35s') * 1000;
    const EXPAND_DURATION_MS = parseFloat(rootStyles.getPropertyValue('--animation-expand-duration').trim() || '0.35s') * 1000;

    // This function correctly handles hiding the active button
    // and showing others. It works for any number of buttons
    // as long as they are in `allNavButtons`.
    function updateNavigationButtonVisibility(activePageId) {
        allNavButtons.forEach(button => {
            if (button.dataset.target === activePageId) {
                button.classList.add('nav-button-hidden');
            } else {
                button.classList.remove('nav-button-hidden');
            }
        });
    }
    // Ensure you have CSS for .nav-button-hidden, e.g.:
    // .nav-button-hidden { display: none !important; } /* or other hiding technique */
    // This style should be in your main styles.css
    if (!document.getElementById('nav-button-hidden-style')) {
        const style = document.createElement('style');
        style.id = 'nav-button-hidden-style';
        style.textContent = '.nav-button-hidden { display: none !important; }';
        document.head.appendChild(style);
    }


    function setContentWrapperHeightCssVar(height) {
        contentWrapperForAnimation.style.setProperty('--content-wrapper-height', `${height}px`);
    }

    function animatePageSwitch(targetPageId) {
        if (isPageSwitchAnimating || !contentWrapperForAnimation) return;
        isPageSwitchAnimating = true;

        const currentActivePageElement = currentActivePageId ? document.getElementById(currentActivePageId) : null;

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
                updateNavigationButtonVisibility(currentActivePageId); // THIS IS KEY
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
                isPageSwitchAnimating = false;
                contentWrapperForAnimation.classList.remove('page-wrapper-is-collapsing');
                contentWrapperForAnimation.style.height = 'auto';
                if(currentActivePageElement) currentActivePageElement.classList.add('active');
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
        if (!contentWrapperForAnimation) return;

        const initiallyActivePageElement = document.querySelector('.page-content.active');
        if (initiallyActivePageElement) {
            currentActivePageId = initiallyActivePageElement.id;
        } else if (allNavButtons.length > 0) { // Fallback to first button's target if no page is active
            currentActivePageId = allNavButtons[0].dataset.target;
            const targetPage = document.getElementById(currentActivePageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        }
        
        // If a currentActivePageId is determined, update buttons and set height
        if (currentActivePageId) {
            updateNavigationButtonVisibility(currentActivePageId); // Crucial call
            const activeElementForHeight = document.getElementById(currentActivePageId);
            if (activeElementForHeight) {
                 contentWrapperForAnimation.style.height = 'auto'; 
                const initialHeight = activeElementForHeight.scrollHeight;
                contentWrapperForAnimation.style.height = `${initialHeight}px`; 
                setContentWrapperHeightCssVar(initialHeight);
            } else { // Active page ID set, but element not found - problematic
                contentWrapperForAnimation.style.height = '0px';
                setContentWrapperHeightCssVar(0);
            }
        } else { // No active page determined (e.g., no buttons, no active page class)
            contentWrapperForAnimation.style.height = '0px';
            setContentWrapperHeightCssVar(0);
        }
    }
    initializeCardView();

    let resizeDebounceTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeDebounceTimeout);
        resizeDebounceTimeout = setTimeout(() => {
            if (!isPageSwitchAnimating && contentWrapperForAnimation) {
                const activePage = currentActivePageId ? document.getElementById(currentActivePageId) : null;
                if (activePage && getComputedStyle(activePage).display !== 'none') {
                    const originalTransition = contentWrapperForAnimation.style.transition;
                    contentWrapperForAnimation.style.transition = 'none';
                    
                    contentWrapperForAnimation.style.height = 'auto'; 
                    const newHeight = activePage.scrollHeight;
                    contentWrapperForAnimation.style.height = `${newHeight}px`; 
                    setContentWrapperHeightCssVar(newHeight);
                    
                    requestAnimationFrame(() => {
                        contentWrapperForAnimation.style.transition = originalTransition;
                    });
                }
            }
        }, 200);
    });

}); // End of DOMContentLoaded