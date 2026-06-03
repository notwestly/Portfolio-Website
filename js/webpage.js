/* ══════════════════════════════════════════════════
   WEBPAGE  —  js/webpage.js
   Controls the profile panel tabs, navbar links,
   theme switching, and the terminal show/hide toggle.
══════════════════════════════════════════════════ */

/* ── Profile Tab Switcher ────────────────────────
   Activates the correct tab pane when a tab is clicked.
   Add new tabs by giving them data-tab="name" and
   adding a matching <div class="tab-pane" id="tab-name">.
─────────────────────────────────────────────────── */
function switchTab(name) {
    document.querySelectorAll('.profile-tab')
        .forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-pane')
        .forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
}

document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

/* ── Mobile / Portrait Detection ────────────────
   When the viewport grows past 1024 px, close the
   mobile drawer (if open) and re-enable the input.
   When it shrinks below 1025 px, disable the input
   unless the drawer is already open.
─────────────────────────────────────────────────── */
function checkMobile() {
    const isMobile = window.innerWidth <= 1024;

    if (!isMobile) {
        // Switched to desktop — close any open mobile drawer
        const panel    = document.querySelector('.terminal-panel');
        const backdrop = document.getElementById('termBackdrop');
        const fab      = document.getElementById('termFab');

        panel?.classList.remove('mobile-open');
        backdrop?.classList.remove('active');
        fab?.classList.remove('open');
        if (fab) fab.querySelector('i').className = 'bi bi-terminal-fill';

        termInput.disabled = false;
    } else {
        // On mobile — input disabled unless drawer is open
        const isOpen = document.querySelector('.terminal-panel')
                           ?.classList.contains('mobile-open');
        termInput.disabled = !isOpen;
    }
}
window.addEventListener('resize', checkMobile);
checkMobile();

/* ══════════════════════════════════════════════════
   TERMINAL SHOW / HIDE TOGGLE
   Adds / removes .terminal-hidden on #mainWrap.
   CSS handles the panel widths and button position.
══════════════════════════════════════════════════ */
function toggleTerminal() {
    const wrap     = document.getElementById('mainWrap');
    const icon     = document.getElementById('termToggleIcon');
    const isHidden = wrap.classList.toggle('terminal-hidden');

    // Chevron points left (close) when terminal visible,
    // right (open) when terminal is hidden
    icon.className = isHidden ? 'bi bi-chevron-left' : 'bi bi-chevron-right';
}

/* ══════════════════════════════════════════════════
   THEME SWITCHER
   Reads system preference on first visit; persists
   the user's manual choice in localStorage.
══════════════════════════════════════════════════ */
const THEME_KEY = 'jwc-theme';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const icon  = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');

    if (theme === 'light') {
        if (icon)  icon.className    = 'bi bi-sun-fill';
        if (label) label.textContent = 'Light';
    } else {
        if (icon)  icon.className    = 'bi bi-moon-fill';
        if (label) label.textContent = 'Dark';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
        applyTheme(stored);
    } else {
        // Default to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
}

// Re-apply if the OS theme changes and the user hasn't set a manual preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});

/* ══════════════════════════════════════════════════
   MOBILE TERMINAL DRAWER
   Slides the terminal panel up from the bottom as a
   sheet on tablet / phone. The FAB button toggles it.
   Tapping the backdrop also closes it.
══════════════════════════════════════════════════ */
function toggleMobileTerminal() {
    const panel    = document.querySelector('.terminal-panel');
    const backdrop = document.getElementById('termBackdrop');
    const fab      = document.getElementById('termFab');
    const icon     = fab?.querySelector('i');

    const isOpen = panel.classList.toggle('mobile-open');

    backdrop?.classList.toggle('active', isOpen);
    fab?.classList.toggle('open', isOpen);

    if (icon) {
        icon.className = isOpen ? 'bi bi-x-lg' : 'bi bi-terminal-fill';
    }

    if (isOpen) {
        // Enable input and focus after the slide-up animation finishes
        termInput.disabled = false;
        setTimeout(() => termInput.focus(), 360);
    } else {
        termInput.disabled = true;
    }
}

/* ── Init ────────────────────────────────────────
   Order matters: theme first (avoids flash),
   then boot the terminal.
─────────────────────────────────────────────────── */
initTheme();
bootTerminal();
