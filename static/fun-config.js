// static/fun-config.js
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
    // static/fun-config.js
    // ...
    decoderEffect: {
        enabled: true,
        targetSelectors: [
            '.profile-header h1',
            '.aka', // If enabled, caret will re-initialize after each decode cycle.
            '.pronouns',
            //'.intro', // REMOVED by default. If you add, set preserveHTML: true & test.
            '.section h2',
            '.tag',
            '.nav-button',
            '.footer p'

        ],
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+[];\',./<>?{}:"|',
        revealSpeed: 69,        // Time (ms) per character to reveal
        randomizeInterval: 25,  // Time (ms) between random character changes during scramble
        initialDelay: 200,      // Base delay (ms) before the very first decoder starts.
                                // Individual elements will get an additional random delay on top of this.
        loopInterval: 0,        // e.g., 60000 for 1 min loop. 0 to disable.
        preserveHTML: true,     // true is experimental. For `.intro`, you'd need this to be true.
                                // When true, it attempts to restore innerHTML after text scramble/reveal.
        dataAttributeOriginalHTML: 'data-original-innerHTML',
        dataAttributeOriginalText: 'data-original-text-content'
    }
    // ...
};