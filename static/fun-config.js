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
            'procrastinating': 'System Status: i just dont want to do anything\nPriority: High (eventually).',
            'programming': 'Interpreting not Compiling\nSyntax error on line 1 (real).',
            'grokking': 'Deep*shit* understanding achieved.\n All reality is me.',
            'cybersecurity': 'starts flexing about how i hacked my school using APi endpoints..',
            'marketing': '"aaloo lelo; kaanda lelo" \n ~ nana patekar, welcome',
            'homelabbing': 'Network Status: Mostly never stable.\nBlinking lights: not sufficient.',
            'stalking': 'what do you think i use my homelab for\nyour ip address is 192.168.1.7.',
            'existing': 'uhhh how do i explain it... so theres this idea of things that you just are',
            'humor /jk': 'you have a very bad ass hair! \n\n Bad ASs hair'
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