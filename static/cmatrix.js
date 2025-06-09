// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

// --- Configuration Variables ---
const FONT_SIZE = 20; // Size of each regular matrix character in pixels
const HIGHLIGHT_FONT_SIZE = 30; // Size of highlighted words in pixels (made bigger)
const MATRIX_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&()_+=[]{}|;:<>?/~'; // Characters for the matrix rain
const HIGHLIGHT_WORDS = ["sarthak", "s1d", "s1dhant"]; // Words to highlight
const WORD_APPEAR_INTERVAL = 6000; // Interval in milliseconds to spawn new highlighted words (increased for slower appearance)
const WORD_FADE_SPEED = 0.0005; // How fast highlighted words fade out (SIGNIFICANTLY SLOWER for prominence)
const WORD_INITIAL_SPEED = 1.8; // Initial falling speed for highlighted words (MADE FASTER)

// New variables for controlling matrix character speed and smoothness
const MIN_MATRIX_SPEED = 0.5; // Minimum speed for a matrix character (pixels per frame)
const MAX_MATRIX_SPEED = 4; // Maximum speed for a matrix character (pixels per frame)
const FADE_ALPHA = 0.65; // Alpha value for the background fading trail (increased for very short trail)
const CHARS_PER_COLUMN_RATIO = 1.0; // How many characters per column relative to screen height/FONT_SIZE (REDUCED FOR OPTIMIZATION)
const MIN_RADIAL_BRIGHTNESS = 0.001; // Minimum brightness for characters at the very edge (0.0 to 1.0) - decreased for more fade
const VERTICAL_FADE_START_RATIO = 0.651971; // Start fading characters when they reach this ratio of screen height - increased for earlier fade

// New variables for varied fading
const FADED_LINES_PERCENTAGE = 0.40; // 40% of lines will fade more
const EXTRA_FADE_FACTOR = 0.5; // How much more these lines fade (0.0 to 1.0, 1.0 means full fade)

// New variables for proximity fade around blue words
const GLOW_FADE_RADIUS = HIGHLIGHT_FONT_SIZE * 4; // Influence radius around blue words (pixels)
const MAX_PROXIMITY_FADE_STRENGTH = 0.8; // Max fade strength (0.8 means 80% fade) at the center of influence

// Mouse position tracking
let mouseX = 0;
let mouseY = 0;
const HOVER_RADIUS = FONT_SIZE * 6.9; // Radius around mouse for green character hover effect

let targetMouseX = window.innerWidth / 2;
let targetMouseY = window.innerHeight / 2;
let visualMouseX = window.innerWidth / 2;
let visualMouseY = window.innerHeight / 2;
const glideFactor = 0.2;

// Update mouse position on mouse move relative to the canvas
// Listen on window to capture events even over the .card element
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Update TARGET mouse position, not visual directly
    targetMouseX = e.clientX - rect.left;
    targetMouseY = e.clientY - rect.top;
});

// --- Canvas Setup and Resizing ---
let columns; // Number of character columns based on canvas width
let matrixCharacters = []; // Array to hold all active green matrix character objects

// --- Cached values for performance ---
let halfCanvasWidth = 0;
let halfCanvasHeight = 0;

/**
 * Represents a single green matrix character falling down a column.
 */
class MatrixCharacter {
    /**
     * @param {number} column - The column index (0 to columns-1).
     * @param {number} initialY - The initial Y-coordinate (pixel value).
     * @param {number} speed - The falling speed in pixels per frame.
     * @param {boolean} isMoreFaded - True if this character should fade more quickly.
     */
    constructor(column, initialY, speed, isMoreFaded) {
        this.column = column;
        this.x = column * FONT_SIZE;
        this.y = initialY;
        this.char = MATRIX_CHARS.charAt(Math.floor(Math.random() * MATRIX_CHARS.length));
        this.speed = speed;
        this.isMoreFaded = isMoreFaded; // New property
    }

    /**
     * Draws the character on the canvas, applying radial, vertical, proximity, and hover fade.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
     * @param {number} canvasHeight - Current canvas height.
     * @param {Array<HighlightedWord>} activeHighlightedWords - Array of currently active blue words.
     * @param {number} mouseX - Current mouse X position.
     * @param {number} mouseY - Current mouse Y position.
     */
    draw(ctx, canvasHeight, activeHighlightedWords, mouseX, mouseY) { // canvasWidth removed, use halfCanvasWidth*2 if needed
        // Calculate radial fade factor based on distance from center
        const distanceX = Math.abs(this.x - halfCanvasWidth);
        const distanceY = Math.abs(this.y - halfCanvasHeight);
        const maxDimDistance = Math.sqrt(halfCanvasWidth * halfCanvasWidth + halfCanvasHeight * halfCanvasHeight);
        let radialFactor = 1 - (Math.sqrt(distanceX * distanceX + distanceY * distanceY) / maxDimDistance);
        radialFactor = Math.max(MIN_RADIAL_BRIGHTNESS, radialFactor);

        // Calculate vertical fade factor based on Y position
        let verticalFadeFactor = 1.0;
        const fadeStartPoint = canvasHeight * VERTICAL_FADE_START_RATIO;
        if (this.y > fadeStartPoint) {
            // Linearly fade from fadeStartPoint to bottom
            verticalFadeFactor = 1 - ((this.y - fadeStartPoint) / (canvasHeight - fadeStartPoint));
            verticalFadeFactor = Math.max(0, verticalFadeFactor);
        }

        // Apply extra fade for designated lines
        if (this.isMoreFaded) {
            verticalFadeFactor *= (1 - EXTRA_FADE_FACTOR); // Reduce brightness further
        }

        // Calculate proximity fade factor based on distance to blue words
        let proximityFadeFactor = 1.0; // Starts at no extra fade
        for (const word of activeHighlightedWords) {
            // Optimization: Broad phase check - only calculate if char is roughly within word's influence box + radius
            if (Math.abs(this.x - (word.x + word.width / 2)) < GLOW_FADE_RADIUS + word.width / 2 &&
                Math.abs(this.y - (word.y - HIGHLIGHT_FONT_SIZE / 2)) < GLOW_FADE_RADIUS + HIGHLIGHT_FONT_SIZE) {

                const wordCenterX = word.x + word.width / 2;
                const wordCenterY = word.y - HIGHLIGHT_FONT_SIZE / 2; // Approx center

                const dx = this.x - wordCenterX;
                const dy = this.y - wordCenterY;
                const distanceSq = dx * dx + dy * dy; // Use squared distance to avoid sqrt initially

                if (distanceSq < GLOW_FADE_RADIUS * GLOW_FADE_RADIUS) {
                    const distance = Math.sqrt(distanceSq);
                    let fadeStrength = (1 - (distance / GLOW_FADE_RADIUS)) * MAX_PROXIMITY_FADE_STRENGTH;
                    proximityFadeFactor = Math.min(proximityFadeFactor, 1 - fadeStrength);
                }
            }
        }
        if (proximityFadeFactor < 0) { // Ensure it does not go below 0
            proximityFadeFactor = 0;
        }


        // Combine all fade factors
        let finalAlpha = radialFactor * verticalFadeFactor * proximityFadeFactor;

        // Calculate hover effect factor based on distance from mouse
        const charCenterX = this.x + FONT_SIZE / 2;
        const charCenterY = this.y - FONT_SIZE / 2; // Adjust for text baseline
        const distToMouse = Math.sqrt(
            Math.pow(charCenterX - mouseX, 2) +
            Math.pow(charCenterY - mouseY, 2)
        );

        let hoverEffectStrength = 0;
        if (distToMouse < HOVER_RADIUS) {
            hoverEffectStrength = (1 - (distToMouse / HOVER_RADIUS)); // 0 to 1
        }

        // Define NEW BASE GREEN COLOR: #014421 (RGB: 1, 68, 33)
        const BASE_GREEN_R = 1;
        const BASE_GREEN_G = 68;
        const BASE_GREEN_B = 33;

        const HOVER_TARGET_R = 173;
        const HOVER_TARGET_G = 216;
        const HOVER_TARGET_B = 230;

        let r = Math.floor(BASE_GREEN_R + (HOVER_TARGET_R - BASE_GREEN_R) * hoverEffectStrength);
        let g = Math.floor(BASE_GREEN_G + (HOVER_TARGET_G - BASE_GREEN_G) * hoverEffectStrength);
        let b = Math.floor(BASE_GREEN_B + (HOVER_TARGET_B - BASE_GREEN_B) * hoverEffectStrength);
        // Apply overall alpha to the blended color
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
        
        ctx.font = `${FONT_SIZE}px monospace`;
        // Use Math.floor for y to ensure characters are drawn on whole pixels, preventing blending
        ctx.fillText(this.char, this.x, Math.floor(this.y));
    }

    /**
     * Updates the character's position. Resets to top with new char/speed if off-screen.
     * @param {number} canvasHeight - The current height of the canvas.
     */
    update(canvasHeight) {
        this.y += this.speed;

        // If character goes off screen, reset it to the top with new char/speed
        if (this.y > canvasHeight + FONT_SIZE) {
            // Reset above screen with random offset to create varied starting points
            this.y = 0 - FONT_SIZE - (Math.random() * canvasHeight * 0.5);
            this.char = MATRIX_CHARS.charAt(Math.floor(Math.random() * MATRIX_CHARS.length));
            this.speed = Math.random() * (MAX_MATRIX_SPEED - MIN_MATRIX_SPEED) + MIN_MATRIX_SPEED;
            // Re-evaluate if this character should be more faded
            this.isMoreFaded = Math.random() < FADED_LINES_PERCENTAGE;
        }
    }
}

/**
 * Resizes the canvas to fill the window and reinitializes matrix characters.
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Update cached half dimensions
    halfCanvasWidth = canvas.width / 2;
    halfCanvasHeight = canvas.height / 2;

    columns = Math.floor(canvas.width / FONT_SIZE);

    matrixCharacters = []; // Clear existing characters
    // Calculate how many characters are needed per column for a continuous stream
    const charsPerColumn = Math.floor(canvas.height / FONT_SIZE) * CHARS_PER_COLUMN_RATIO;

    // Initialize characters for each column
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < charsPerColumn; j++) {
            // Stagger initial Y positions to create a continuous stream effect
            const initialY = (j * FONT_SIZE) - (canvas.height * CHARS_PER_COLUMN_RATIO);
            const speed = Math.random() * (MAX_MATRIX_SPEED - MIN_MATRIX_SPEED) + MIN_MATRIX_SPEED;
            const isMoreFaded = Math.random() < FADED_LINES_PERCENTAGE; // Randomly assign fade intensity
            matrixCharacters.push(new MatrixCharacter(i, initialY, speed, isMoreFaded));
        }
    }
}

// Call resize on initial load and whenever the window is resized
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call

// --- Highlighted Word Class ---
/**
 * Represents a highlighted word falling and fading on the canvas.
 */
class HighlightedWord {
    /**
     * @param {string} text - The word to display.
     * @param {number} x - The x-coordinate (column index) where the word starts.
     * @param {number} y - The y-coordinate (pixel value) where the word starts.
     * @param {number} speed - The falling speed of the word (in pixels per frame).
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context (for initial text measurement).
     */
    constructor(text, x, y, speed, ctx) {
        this.text = text;
        this.x = x * FONT_SIZE; // Convert column index to pixel x-coordinate
        this.y = y; // y is already a pixel value
        this.opacity = 1.0; // Initial opacity (fully visible)
        this.speed = speed; // Falling speed
        this.active = true; // Is the word currently active and visible?

        // Pre-calculate word width for optimization
        ctx.font = `${HIGHLIGHT_FONT_SIZE}px monospace`; // Set font before measuring
        this.width = ctx.measureText(this.text).width;
    }

    /**
     * Draws the highlighted word on the canvas, including a shadow.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
     */
    draw(ctx) {
        if (!this.active) return;

        // NEW SHADOW COLOR: Lighter pink to match #FEBBDE
        ctx.shadowColor = `rgba(255, 210, 240, ${this.opacity * 0.8})`; // Lighter pink for glow
        ctx.shadowBlur = 35; // Increased blur for a thicker glow
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // NEW WORD COLOR: #FEBBDE (RGB: 254, 187, 222)
        ctx.fillStyle = `rgba(254, 187, 222, ${this.opacity})`; 
        ctx.font = `${HIGHLIGHT_FONT_SIZE}px monospace`; // Use bigger font size for highlighted words
        ctx.fillText(this.text, this.x, this.y);

        // Reset shadow properties to avoid affecting subsequent drawings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    /**
     * Updates the word's position and opacity.
     * Deactivates the word if it fades out or goes off-screen.
     */
    update() {
        if (!this.active) return;

        this.y += this.speed; // Move down by 'speed' pixels
        this.opacity -= WORD_FADE_SPEED; // Fade out

        // Deactivate if fully faded or off-screen
        if (this.opacity <= 0 || this.y > canvas.height + HIGHLIGHT_FONT_SIZE) {
            this.active = false;
        }
    }
}

let activeHighlightedWords = []; // Array to hold currently active highlighted word objects

/**
 * Spawns a new highlighted word at a random column, avoiding immediate overlaps.
 * It tries to find a clear column by checking for vertical clearance with existing words.
 */
function spawnHighlightedWord() {
    const randomWord = HIGHLIGHT_WORDS[Math.floor(Math.random() * HIGHLIGHT_WORDS.length)];
    // Start word well above the canvas to allow for fading in
    const potentialStartY = -HIGHLIGHT_FONT_SIZE - (Math.random() * canvas.height * 0.5);

    let foundClearColumn = false;
    let attempts = 0;
    const maxAttempts = columns * 2; // Limit attempts to prevent infinite loops

    while (!foundClearColumn && attempts < maxAttempts) {
        const currentColumn = Math.floor(Math.random() * columns);
        let collisionDetected = false;

        // Temporarily set font for measuring the new word's width
        ctx.font = `${HIGHLIGHT_FONT_SIZE}px monospace`;
        const newWordWidth = ctx.measureText(randomWord).width;

        for (const word of activeHighlightedWords) {
            // Check if the existing word is in the same column or very close
            // Use pre-calculated word.width for horizontal collision checks
            const wordStartX = word.x;
            const wordEndX = word.x + word.width; // Use pre-calculated width

            const newWordStartX = currentColumn * FONT_SIZE;
            const newWordEndX = newWordStartX + newWordWidth; // Use pre-calculated width for new word

            // Check for horizontal overlap
            const horizontalOverlap = (newWordStartX < wordEndX && newWordEndX > wordStartX);

            if (horizontalOverlap) {
                // Define a buffer (minimum vertical gap) to ensure visual separation
                const buffer = HIGHLIGHT_FONT_SIZE * 1.0; // 100% of word height as buffer

                // Check for vertical overlap between the potential new word and the existing word
                if (
                    potentialStartY < (word.y + HIGHLIGHT_FONT_SIZE + buffer) &&
                    (potentialStartY + HIGHLIGHT_FONT_SIZE + buffer) > word.y
                ) {
                    collisionDetected = true;
                    break; // Collision detected, try another column
                }
            }
        }

        if (!collisionDetected) {
            // If no collision, add the new word to the active list
            // Pass ctx to the constructor for initial width calculation
            activeHighlightedWords.push(new HighlightedWord(randomWord, currentColumn, potentialStartY, WORD_INITIAL_SPEED, ctx));
            foundClearColumn = true;
        }
        attempts++;
    }
    // If after maxAttempts, no clear column is found, no word is spawned in this interval,
    // which helps prevent overcrowding.
}

// Start spawning highlighted words periodically
setInterval(spawnHighlightedWord, WORD_APPEAR_INTERVAL);

// --- Main Animation Loop ---
/**
 * The main animation function that draws the matrix rain and highlighted words.
 */
function animate() {
    // Update visual mouse position (LERP)
    visualMouseX += (targetMouseX - visualMouseX) * glideFactor;
    visualMouseY += (targetMouseY - visualMouseY) * glideFactor;

    // Create a fading trail effect...
    ctx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw and update the green matrix characters
    for (let i = 0; i < matrixCharacters.length; i++) {
        const charObj = matrixCharacters[i];
        // Pass VISUAL mouse coordinates to the draw function
        charObj.draw(ctx, canvas.height, activeHighlightedWords, visualMouseX, visualMouseY);
        charObj.update(canvas.height);
    }
    
    // Draw and update highlighted words (drawn second, ensuring they are on top)
    for (let i = activeHighlightedWords.length - 1; i >= 0; i--) {
        const word = activeHighlightedWords[i];
        word.draw(ctx);
        word.update();
        // Remove inactive words from the array to keep it clean
        if (!word.active) {
            activeHighlightedWords.splice(i, 1);
        }
    }

    // Request the next animation frame
    requestAnimationFrame(animate);
}

// Start the animation loop when the window loads
window.onload = function() {
    resizeCanvas(); // Ensure canvas is sized before first animation frame
    animate();
};