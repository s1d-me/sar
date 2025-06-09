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

// --- 4. Decoder Effect (Refactored with requestAnimationFrame) ---
const decoderElementDataStore = new Map(); // Stores data about elements being decoded
let activeDecoderItems = []; // Items currently undergoing RAF-driven decoding
let decoderRafId = null;
let lastTimestamp = 0; // For RAF loop

function collectDecoderItems() {
    const config = funConfig.decoderEffect;
    if (!config.enabled) return;

    const currentElements = new Set();

    document.querySelectorAll(config.targetSelectors.join(', ')).forEach(el => {
        // Basic check to avoid processing children if parent is already targeted.
        // This is a simple check; complex nested scenarios might need more robust logic.
        let parentIsTargeted = false;
        let parent = el.parentElement;
        while(parent) {
            if (decoderElementDataStore.has(parent)) {
                parentIsTargeted = true;
                break;
            }
            parent = parent.parentElement;
        }
        if (parentIsTargeted) return;

        currentElements.add(el);
        if (!decoderElementDataStore.has(el)) {
            decoderElementDataStore.set(el, {
                originalHTML: el.innerHTML,
                originalText: el.textContent, // Fallback if no HTML or simple text element
                isDecoding: false // Local flag per element for state
            });
        } else {
            // Element already known, update its content if changed by other means
            // This helps if DOM is manipulated externally and then decoder runs again
            const data = decoderElementDataStore.get(el);
            if (data.originalHTML !== el.innerHTML) data.originalHTML = el.innerHTML;
            if (data.originalText !== el.textContent) data.originalText = el.textContent;
        }
    });

    // Clean up data for elements that are no longer in the DOM / targeted
    for (const el of decoderElementDataStore.keys()) {
        if (!currentElements.has(el)) {
            decoderElementDataStore.delete(el);
        }
    }
}


function decoderLoop(timestamp) {
    const config = funConfig.decoderEffect;
    if (!config.enabled) {
        activeDecoderItems = []; // Clear active items if disabled
        decoderRafId = null;
        return;
    }

    if (!lastTimestamp) lastTimestamp = timestamp;
    // let deltaTime = timestamp - lastTimestamp; // Can be used if animation is time-delta based
    lastTimestamp = timestamp;

    activeDecoderItems.forEach(item => {
        if (!item.elementData.isDecoding) return;

        let textChanged = false;
        for (let i = 0; i < item.originalChars.length; i++) {
            const charData = item.charData[i];
            if (charData.revealed) continue;

            // Scramble phase
            if (timestamp >= charData.nextScrambleTime) {
                if (item.originalChars[i].trim() !== '') { // Don't scramble whitespace
                    item.currentDisplay[i] = config.chars[Math.floor(Math.random() * config.chars.length)];
                    textChanged = true;
                }
                charData.nextScrambleTime = timestamp + config.randomizeInterval;
            }

            // Reveal phase
            if (timestamp >= charData.revealTime) {
                item.currentDisplay[i] = item.originalChars[i];
                charData.revealed = true;
                item.revealedCount++;
                textChanged = true;
            }
        }

        if (textChanged) {
            // For preserveHTML:true, this strategy is simple (text only).
            // A true HTML-preserving scramble is far more complex (traversing text nodes).
            item.element.textContent = item.currentDisplay.join('');
        }

        if (item.revealedCount === item.originalChars.length) {
            finalizeDecoding(item); // Finalize this specific item
        }
    });

    activeDecoderItems = activeDecoderItems.filter(item => item.elementData.isDecoding && item.revealedCount < item.originalChars.length);

    if (activeDecoderItems.length > 0) {
        decoderRafId = requestAnimationFrame(decoderLoop);
    } else {
        decoderRafId = null;
        lastTimestamp = 0; // Reset for next cycle
    }
}

function finalizeDecoding(item) {
    const config = funConfig.decoderEffect;
    item.elementData.isDecoding = false; // Mark as not decoding

    if (config.preserveHTML) {
        item.element.innerHTML = item.elementData.originalHTML;
    } else {
        // Ensure exact original text, even if it was only whitespace
        item.element.textContent = item.elementData.originalText; 
    }

    if (funConfig.animatedCaret.enabled && item.element.matches(funConfig.animatedCaret.targetContainerSelector)) {
        setTimeout(initAnimatedCaret, 30);
    }
}

function triggerAllDecoders() {
    const config = funConfig.decoderEffect;
    if (!config.enabled) return;

    // Stop any ongoing decodings by clearing active items and letting RAF loop naturally end
    activeDecoderItems.forEach(item => finalizeDecoding(item)); // Finalize/restore all
    activeDecoderItems = [];
    if (decoderRafId) {
        cancelAnimationFrame(decoderRafId);
        decoderRafId = null;
    }
    lastTimestamp = 0;

    // Collect / re-collect items and their original state
    collectDecoderItems();

    decoderElementDataStore.forEach((data, el) => {
        const originalTextForLogic = data.originalText; // Use textContent for char array logic
        if (!originalTextForLogic && originalTextForLogic !== "") return; // Allow empty string

        data.isDecoding = true; // Set isDecoding on the stored data object

        const newItem = {
            element: el,
            elementData: data, // Reference to the data in decoderElementDataStore
            originalChars: originalTextForLogic.split(''),
            currentDisplay: originalTextForLogic.split('').map(char =>
                char.trim() === '' ? char : config.chars[Math.floor(Math.random() * config.chars.length)]
            ),
            revealedCount: 0,
            charData: [] // Stores revealTime, nextScrambleTime, revealed status per char
        };

        // Initial display is scrambled text (primarily for textContent)
        if (!config.preserveHTML || (config.preserveHTML && newItem.element.children.length === 0)) {
            newItem.element.textContent = newItem.currentDisplay.join('');
        } else if (config.preserveHTML) {
            // If preserving HTML, and it's complex, the initial visual state is original HTML.
            // The textContent will be virtually scrambled and applied if it doesn't break structure.
            // For simplicity with complex HTML, textContent changes during animation are okay,
            // then full innerHTML is restored.
            newItem.element.innerHTML = data.originalHTML; // Start with original HTML
            // The currentDisplay is still based on originalText for logic, but visual is originalHTML
        }

        let nonWhitespaceCharsProcessed = 0;
        // Each element gets its own base time for starting, including initialDelay and a random offset
        const elementBaseTime = performance.now() + config.initialDelay + (Math.random() * config.revealSpeed * 5);

        newItem.originalChars.forEach((originalChar, index) => {
            let charRevealTime = elementBaseTime; // Default for whitespace
            if (originalChar.trim() !== '') {
                nonWhitespaceCharsProcessed++;
                // Calculate reveal time for this specific character
                charRevealTime = elementBaseTime + (nonWhitespaceCharsProcessed * config.revealSpeed);
            }

            newItem.charData[index] = {
                revealTime: charRevealTime,
                nextScrambleTime: elementBaseTime + Math.random() * config.randomizeInterval, // Scramble starts around elementBaseTime
                revealed: originalChar.trim() === '' // Whitespace is instantly "revealed"
            };

            if (originalChar.trim() === '') {
                 newItem.revealedCount++;
            }
        });
        
        // If all characters are whitespace, finalize immediately
        if (newItem.revealedCount === newItem.originalChars.length) {
            finalizeDecoding(newItem);
        } else {
            activeDecoderItems.push(newItem);
        }
    });

    if (activeDecoderItems.length > 0 && !decoderRafId) {
        lastTimestamp = performance.now(); // Set initial timestamp for the loop
        decoderRafId = requestAnimationFrame(decoderLoop);
    }
}

export function initDecoderEffect() {
    const config = funConfig.decoderEffect;
    if (!config.enabled) return;

    // Initial collection and trigger is now handled by a slight delay to ensure DOM is ready.
    // The initialDelay in config is for per-element animation start, not this first call.
    setTimeout(() => {
        collectDecoderItems(); // Initial collection
        triggerAllDecoders();  // Start animations
    }, 50); // Small delay to ensure other DOM manipulations (if any) are done.


    if (config.loopInterval > 0) {
        setInterval(() => {
            // triggerAllDecoders internally calls collectDecoderItems
            triggerAllDecoders();
        }, config.loopInterval + config.initialDelay); // Add initialDelay to loopInterval for more predictable restart visual
    }

    const debouncedRestartDecoder = debounce(() => {
        if (funConfig.decoderEffect.enabled) { // Check again in case it was disabled
            triggerAllDecoders();
        }
    }, 300); 

    window.addEventListener('resize', debouncedRestartDecoder);
}