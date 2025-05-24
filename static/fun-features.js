// static/fun-features.js
import { funConfig } from './fun-config.js';

// --- Debounce Utility ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- 1. Glitch Effect on Hover (Unchanged from last good version) ---
export function initGlitchEffectOnHover() {
    const config = funConfig.glitchEffectOnHover;
    if (!config.enabled) return;

    document.querySelectorAll(config.targets.join(', ')).forEach(el => {
        el.setAttribute(config.dataAttribute, el.textContent);
        el.classList.add(config.baseClass);
        let timeoutId = null;

        el.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            el.classList.add(config.activeGlitchClass);
            timeoutId = setTimeout(() => {
                el.classList.remove(config.activeGlitchClass);
            }, config.duration);
        });

        el.addEventListener('mouseleave', () => {
            clearTimeout(timeoutId);
            el.classList.remove(config.activeGlitchClass);
        });
    });
}

// --- 2. System Message Tooltips (Unchanged from last good version) ---
let tooltipElement = null;
export function initSystemTooltips() {
    const config = funConfig.systemTooltips;
    if (!config.enabled) return;
    document.querySelectorAll(config.skillSelector).forEach(skillTag => {
        skillTag.addEventListener('mouseenter', (event) => {
            const skillText = skillTag.textContent.trim().toLowerCase();
            const message = config.tooltipMessages[skillText] || "System query: No data available.";
            if (!tooltipElement) {
                tooltipElement = document.createElement('div');
                tooltipElement.className = config.tooltipClass;
                document.body.appendChild(tooltipElement);
            }
            const formattedMessage = `> ${message.replace(/\n/g, '<br>> ')}`;
            tooltipElement.innerHTML = formattedMessage;
            tooltipElement.style.display = 'block';
            const tooltipRect = tooltipElement.getBoundingClientRect();
            let left = event.pageX + config.offsetX;
            let top = event.pageY + config.offsetY;
            if (left + tooltipRect.width > window.innerWidth) left = event.pageX - tooltipRect.width - config.offsetX - 5;
            if (top + tooltipRect.height > window.innerHeight) top = event.pageY - tooltipRect.height - config.offsetY - 5;
            if (left < 0) left = 5;
            if (top < 0) top = 5;
            tooltipElement.style.left = `${left}px`;
            tooltipElement.style.top = `${top}px`;
            tooltipElement.style.opacity = '1';
            tooltipElement.style.visibility = 'visible';
        });
        skillTag.addEventListener('mousemove', (event) => {
            if (tooltipElement && tooltipElement.style.visibility === 'visible') {
                const tooltipRect = tooltipElement.getBoundingClientRect();
                let left = event.pageX + config.offsetX;
                let top = event.pageY + config.offsetY;
                if (left + tooltipRect.width > window.innerWidth) left = event.pageX - tooltipRect.width - config.offsetX - 5;
                if (top + tooltipRect.height > window.innerHeight) top = event.pageY - tooltipRect.height - config.offsetY - 5;
                if (left < 0) left = 5;
                if (top < 0) top = 5;
                tooltipElement.style.left = `${left}px`;
                tooltipElement.style.top = `${top}px`;
            }
        });
        skillTag.addEventListener('mouseleave', () => {
            if (tooltipElement) {
                tooltipElement.style.opacity = '0';
                tooltipElement.style.visibility = 'hidden';
                tooltipElement.style.display = 'none';
            }
        });
    });
}

// --- 3. Animated Caret in "aka" section (Unchanged from last good version) ---
export function initAnimatedCaret() {
    const config = funConfig.animatedCaret;
    if (!config.enabled) return;
    const akaContainer = document.querySelector(config.targetContainerSelector);
    if (!akaContainer) return;
    const nameElements = Array.from(akaContainer.querySelectorAll(`.${config.nameClass}`));
    if (nameElements.length === 0 && !akaContainer.textContent.toLowerCase().startsWith("aka")) return; // Exit if no names and not typical "aka" start

    let prefixText = "aka ";
    const firstChildNode = akaContainer.childNodes[0];
    if (firstChildNode && firstChildNode.nodeType === Node.TEXT_NODE) {
        const match = firstChildNode.nodeValue.match(/^aka\s*/i);
        if (match) prefixText = match[0];
    } else if (nameElements.length === 0 && akaContainer.textContent.toLowerCase().startsWith("aka")) {
        // Handle case where .aka might only have the "aka" text and no .aka-name spans initially
        // This part may not be strictly necessary if decoder always targets it.
    }


    akaContainer.innerHTML = '';
    const prefixSpan = document.createElement('span');
    prefixSpan.textContent = prefixText;
    akaContainer.appendChild(prefixSpan);

    nameElements.forEach((nameSpan, index) => {
        akaContainer.appendChild(nameSpan.cloneNode(true));
        if (index < nameElements.length - 1) {
            const caretSpanContainer = document.createElement('span');
            caretSpanContainer.innerHTML = config.caretHtml;
            if (caretSpanContainer.firstChild) {
                akaContainer.appendChild(caretSpanContainer.firstChild);
            }
        }
    });
}

// --- 4. Decoder Effect ---
const decoderEffectItems = []; // Array to store elements and their original content

function collectDecoderItems() {
    const config = funConfig.decoderEffect;
    if (!config.enabled) return;
    decoderEffectItems.length = 0; // Clear previous items

    document.querySelectorAll(config.targetSelectors.join(', ')).forEach(el => {
        if (decoderEffectItems.some(item => item.element.contains(el) && item.element !== el)) {
            return;
        }
        if (decoderEffectItems.find(item => item.element === el)) return;

        el.setAttribute(config.dataAttributeOriginalHTML, el.innerHTML);
        el.setAttribute(config.dataAttributeOriginalText, el.textContent);

        decoderEffectItems.push({
            element: el,
            intervals: [],
            isDecoding: false
        });
    });
}

function processDecoderItem(item) {
    const config = funConfig.decoderEffect;
    if (item.isDecoding || !item.element) return; // Already decoding or element missing

    const el = item.element;
    const originalText = el.getAttribute(config.dataAttributeOriginalText);

    if (!originalText) { // Should not happen if collectDecoderItems ran
        // console.warn("Decoder: No original text for item", item.element);
        return;
    }
    item.isDecoding = true;

    const originalChars = originalText.split('');
    // The textContent is already scrambled by triggerAllDecoders before this is called.
    // So, currentDisplay should reflect that.
    const currentDisplay = el.textContent.split('');


    let revealedCount = 0;
    originalChars.forEach((originalChar, index) => {
        if (originalChar.trim() === '') { // Keep whitespace as is
            currentDisplay[index] = originalChar; // Ensure it's set if scramble missed it
            revealedCount++;
            // Check if this is the last character and all are revealed
            if (revealedCount === originalChars.length && index === originalChars.length - 1) {
                finalizeDecoding(item, originalText);
            }
            return;
        }

        // This char is currently scrambled. We need to set an interval to keep it
        // scrambling until its reveal time.
        const randomInterval = setInterval(() => {
            if (!item.isDecoding) {
                clearInterval(randomInterval);
                return;
            }
            currentDisplay[index] = config.chars[Math.floor(Math.random() * config.chars.length)];
            el.textContent = currentDisplay.join('');
        }, config.randomizeInterval);
        item.intervals.push(randomInterval);

        // Calculate reveal delay based on how many non-whitespace chars have been scheduled for reveal
        // This ensures sequential reveal of meaningful characters.
        const nonWhitespaceCharsProcessed = originalChars.slice(0, index + 1).filter(ch => ch.trim() !== '').length;
        const revealDelayForThisChar = (nonWhitespaceCharsProcessed * config.revealSpeed) + (Math.random() * config.revealSpeed / 3);


        setTimeout(() => {
            if (!item.isDecoding && !item.intervals.includes(randomInterval)) { // Check if decoding stopped
                return;
            }
            clearInterval(randomInterval);
            item.intervals = item.intervals.filter(id => id !== randomInterval);

            currentDisplay[index] = originalChar;
            el.textContent = currentDisplay.join('');
            revealedCount++;

            if (revealedCount === originalChars.length) {
                finalizeDecoding(item, originalText);
            }
        }, revealDelayForThisChar);
    });
}


function finalizeDecoding(item, originalText) {
    const config = funConfig.decoderEffect;
    item.isDecoding = false; // Mark as not decoding
    item.intervals.forEach(clearInterval); // Clear any remaining intervals for this item
    item.intervals = [];

    if (config.preserveHTML) {
        const originalHTML = item.element.getAttribute(config.dataAttributeOriginalHTML);
        item.element.innerHTML = originalHTML;
    } else {
        item.element.textContent = originalText; // Ensure exact original text
    }

    // MODIFIED: Re-initialize animated caret if the decoded element was its container
    if (funConfig.animatedCaret.enabled && item.element.matches(funConfig.animatedCaret.targetContainerSelector)) {
        // console.log(`Decoder finished for ${funConfig.animatedCaret.targetContainerSelector}, re-initializing caret.`);
        setTimeout(initAnimatedCaret, 30); // Short delay to ensure DOM is fully updated
    }
}

function triggerAllDecoders() {
    const config = funConfig.decoderEffect;
    if (!config.enabled || decoderEffectItems.length === 0) return;

    // Stop any ongoing decodings and restore original content first
    decoderEffectItems.forEach(item => {
        if (item.isDecoding) {
            item.isDecoding = false;
            item.intervals.forEach(clearInterval);
            item.intervals = [];
        }
        // Always restore from attributes before a new cycle
        const originalText = item.element.getAttribute(config.dataAttributeOriginalText);
        if (config.preserveHTML) {
            item.element.innerHTML = item.element.getAttribute(config.dataAttributeOriginalHTML);
        } else if (originalText) {
            item.element.textContent = originalText;
        }
    });

    // MODIFIED: Perform initial (or re-cycle) scramble synchronously
    decoderEffectItems.forEach(item => {
        const el = item.element;
        const originalText = el.getAttribute(config.dataAttributeOriginalText);
        if (originalText) {
            if (config.preserveHTML) {
                // If preserving HTML, we need to be more careful.
                // A simple textContent scramble might break it if it hasn't been restored to full HTML yet.
                // For now, with preserveHTML, the initial scramble is tricky if we want to see it before reveal.
                // The most straightforward is to let processDecoderItem handle scrambling for preserveHTML.
                // If NOT preserving HTML, we can scramble textContent here.
                if (!config.preserveHTML) {
                     el.textContent = originalText.split('').map(char =>
                        char.trim() === '' ? char : config.chars[Math.floor(Math.random() * config.chars.length)]
                    ).join('');
                } else {
                    // For preserveHTML, ensure it's reset to original HTML, processDecoderItem will handle text nodes.
                    // The "instant scramble" for preserveHTML is harder. We might need to walk text nodes.
                    // For now, preserveHTML will show original, then text nodes will animate.
                     el.innerHTML = el.getAttribute(config.dataAttributeOriginalHTML);
                }
            } else {
                 el.textContent = originalText.split('').map(char =>
                    char.trim() === '' ? char : config.chars[Math.floor(Math.random() * config.chars.length)]
                ).join('');
            }
        }
    });

    // Then start the timed reveal process for each item with a random delay
    decoderEffectItems.forEach((item) => {
        // MODIFIED: Random delay for each element's start
        // The base initialDelay is from config, then add a random component.
        const randomStartOffset = Math.random() * (config.revealSpeed * 5); // Random up to 5 chars reveal time
        const startDelay = config.initialDelay + randomStartOffset;

        setTimeout(() => {
            processDecoderItem(item);
        }, startDelay);
    });
}


export function initDecoderEffect() {
    const config = funConfig.decoderEffect;
    if (!config.enabled) return;

    collectDecoderItems(); // Initial collection

    // MODIFIED: Trigger decoders (which now includes initial scramble) after initialDelay
    // The initialDelay in triggerAllDecoders' setTimeout for processDecoderItem will be relative to this first call.
    // No, triggerAllDecoders should be called after config.initialDelay, and *it* handles the per-item delays.
    setTimeout(triggerAllDecoders, config.initialDelay);


    if (config.loopInterval > 0) {
        setInterval(() => {
            collectDecoderItems(); // Re-collect in case DOM changed
            triggerAllDecoders();
        }, config.loopInterval + config.initialDelay); // Ensure loop timing is consistent
    }

    // MODIFIED: Add debounced resize handler
    const debouncedRestartDecoder = debounce(() => {
        // console.log("Window resized, re-initializing decoder effect.");
        if (funConfig.decoderEffect.enabled) { // Check again in case it was disabled
            collectDecoderItems();
            triggerAllDecoders();
        }
    }, 300); // 300ms debounce time

    window.addEventListener('resize', debouncedRestartDecoder);
}