export const funConfig = {
    glitchEffectOnHover: {
        enabled: true,
        targets: ['.profile-header h1', '.section h2', '.nav-button'],
        baseClass: 'glitch-text-base',      // Class added to all targeted elements
        activeGlitchClass: 'glitching-active', // Class added ON HOVER to trigger animation
        dataAttribute: 'data-text',
        duration: 700, // ms
    },
    systemTooltips: {
        enabled: true,
        skillSelector: '.tag.skill',
        tooltipClass: 'system-tooltip',
        tooltipMessages: {
            'procrastinating': 'System Status: Task deferral protocols active.\nPriority: High (eventually).',
            'programming': 'Compiling v42.6...\nSyntax error on line 1 (JK).',
            'grokking': 'Deep understanding achieved.\nSubjective reality matrix updated.',
            'cybersecurity': 'Firewall active.\nThreat level: Caffeinated Squirrel.',
            'marketing': 'Engaging synergy...\nMaximizing paradigm shifts...\nMore buzzwords!',
            'homelabbing': 'Network Status: Mostly stable.\nBlinking lights: Sufficient.',
            'stalking': 'what do you think i use my homelab for\nyour ip address is 192.168.1.7.'
        },
        offsetX: 10,
        offsetY: 20
    },
    
    animatedCaret: {
        enabled: true,
        targetContainerSelector: '.aka',
        nameClass: 'aka-name',
        caretHtml: '<span class="blinking-slash">/</span>'
    },
    decoderEffect: {
        enabled: true,
        targetSelectors: [
            '.profile-header h1',
            '.aka', // If enabled, caret will re-initialize after each decode cycle.
            '.pronouns',
            '.section h2',
            '.tag',
            '.nav-button',
            '.footer p',
            // For '.intro', if it contains HTML like <span class="highlight">,
            // preserveHTML: true is needed. The current decoder animates textContent
            // and then restores innerHTML.
            // '.intro', 
        ],
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+[];\',./<>?{}:"|',
        revealSpeed: 69,        // Time (ms) per character to reveal
        randomizeInterval: 25,  // Time (ms) between random character changes during scramble
        initialDelay: 150,      // Base delay (ms) applied to each element before its decoding sequence begins.
                                // Random offsets are added on top of this per element.
        loopInterval: 0,        // e.g., 60000 for 1 min loop. 0 to disable.
        preserveHTML: true,     // When true, it attempts to restore innerHTML after text scramble/reveal.
                                // Animation primarily uses textContent, innerHTML restored at end.
        dataAttributeOriginalHTML: 'data-original-innerHTML', // Not used by RAF decoder, but kept for potential future use
        dataAttributeOriginalText: 'data-original-text-content' // Not used by RAF decoder
    }
};