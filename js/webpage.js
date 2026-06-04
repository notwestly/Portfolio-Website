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

initTheme();
bootTerminal();
document.getElementById('certCount').textContent = document.querySelectorAll('.cert-card').length || '—';

/* ══════════════════════════════════════════════════
   PROFILE PHOTO ROTATION
   Cycles 3 photos every 30 s with a 0.4 s fade.
   The "JW" initials remain as a fallback if any
   image fails to load.
══════════════════════════════════════════════════ */
const PROFILE_PICS = [
    'assets/Profile%20Pic%201.jpg',
    'assets/Profile%20Pic%202.jpg',
    'assets/Profile%20Pic%203.jpg',
    'assets/Profile%20Pic%204.jpg'
];
let profilePicIdx = 0;

(function initProfilePic() {
    const img = document.getElementById('profilePhoto');
    if (!img) return;
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.src = PROFILE_PICS[0];
})();

setInterval(function () {
    const img = document.getElementById('profilePhoto');
    if (!img) return;
    img.classList.remove('loaded');
    profilePicIdx = (profilePicIdx + 1) % PROFILE_PICS.length;
    setTimeout(() => {
        const onLoad = () => { img.classList.add('loaded'); img.removeEventListener('load', onLoad); };
        img.addEventListener('load', onLoad);
        img.src = PROFILE_PICS[profilePicIdx];
    }, 420);
}, 30000);

/* ══════════════════════════════════════════════════
   CERTIFICATION LIGHTBOX
   Note: PDF rendering requires a served URL (http/https).
   The "Open in new tab" button works in all cases.
══════════════════════════════════════════════════ */
function openCert(path, title) {
    const modal    = document.getElementById('certModal');
    const frame    = document.getElementById('certModalFrame');
    const titleEl  = document.getElementById('certModalTitle');
    const openLink = document.getElementById('certModalOpenLink');
    const encoded  = encodeURI(path);

    titleEl.textContent = title;
    frame.src           = encoded;
    openLink.href       = encoded;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
}

function closeCert() {
    const modal = document.getElementById('certModal');
    const frame = document.getElementById('certModalFrame');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { frame.src = ''; }, 250);
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape')     { closeCert(); closePhoto(); }
    if (e.key === 'ArrowLeft')  { const m = document.getElementById('photoModal'); if (m?.classList.contains('active')) shiftPhoto(-1); }
    if (e.key === 'ArrowRight') { const m = document.getElementById('photoModal'); if (m?.classList.contains('active')) shiftPhoto(1); }
});

/* ══════════════════════════════════════════════════
   PHOTO ZOOM
   Opens the current profile photo in a lightbox with
   prev/next arrows to cycle through all photos.
══════════════════════════════════════════════════ */
let photoModalIdx = 0;

function openPhoto() {
    const img = document.getElementById('profilePhoto');
    if (!img || !img.classList.contains('loaded')) return;
    photoModalIdx = profilePicIdx;
    const modal = document.getElementById('photoModal');
    document.getElementById('photoModalImg').src = PROFILE_PICS[photoModalIdx];
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
}

function closePhoto() {
    const modal = document.getElementById('photoModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function shiftPhoto(dir) {
    const img = document.getElementById('photoModalImg');
    if (!img) return;
    img.style.opacity = '0';
    setTimeout(() => {
        photoModalIdx = (photoModalIdx + dir + PROFILE_PICS.length) % PROFILE_PICS.length;
        img.src = PROFILE_PICS[photoModalIdx];
        img.style.opacity = '1';
    }, 180);
}
