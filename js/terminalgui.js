/* ══════════════════════════════════════════════════
   TERMINAL ENGINE  —  js/terminalgui.js

   Architecture
   ────────────
   • Every CMDS[x]() function calls line() to build output.
   • line() pushes to outputBuffer when buffering is active.
   • runCmd() wraps each command in startBuffer / flushBuffer.
   • flushBuffer() counts visible chars:
       < 1000  → show all lines immediately
       ≥ 1000  → type them out char-by-char (~2.5 s total)
   • The prompt echo (guest:~$) always appears immediately,
     before the buffer starts, so it never lags.
══════════════════════════════════════════════════ */

const termOut   = document.getElementById('termOut');
const termInput = document.getElementById('termInput');

const cmdHistory = [];
let   histIdx     = -1;
let   isTyping    = false;   // blocks new commands during animation
let   pendingAction = null;  // set when a command is waiting for Y/N confirmation

// Output buffer: null = immediate mode, [] = collecting mode
let outputBuffer = null;

/* ── ASCII logo ──────────────────────────────────── */
const LOGO = [
    '    ██╗  ██╗    ██╗  ██████╗ ',
    '    ██║  ██║    ██║ ██╔════╝ ',
    '    ██║  ██║ █╗ ██║ ██║      ',
    ' ██ ██║  ╚██╗███╔╝  ╚██████╗ ',
    ' ╚════╝   ╚═╝╚═╝    ╚═════╝  ',
];

/* ══════════════════════════════════════════════════
   CORE RENDERING HELPERS
══════════════════════════════════════════════════ */

/** Append one line to the DOM immediately. */
function appendLine(html = '', cls = '') {
    const div = document.createElement('div');
    div.className = 'tl' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    termOut.appendChild(div);
    termOut.scrollTop = termOut.scrollHeight;
}

/**
 * Public line() used by all CMDS.
 * Goes to the buffer when buffering is active,
 * otherwise hits the DOM directly.
 */
function line(html = '', cls = '') {
    if (outputBuffer !== null) {
        outputBuffer.push({ html, cls });
    } else {
        appendLine(html, cls);
    }
}

function blank() { line(); }

/** Escape user text before inserting into innerHTML. */
function esc(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Echo the prompt + command immediately (never buffered). */
function echoCmd(cmd) {
    appendLine(`<span class="c-green">guest:~$</span> ${esc(cmd)}`);
}

/* ── Box drawing helpers ──────────────────────── */
function boxTop(title) {
    const dashes = '─'.repeat(Math.max(0, 41 - title.length));
    line(`┌─ <span class="c-green">${title}</span> ${dashes}┐`, 'c-mid');
}
function boxBot() {
    line(`└${'─'.repeat(43)}┘`, 'c-mid');
}

/* ══════════════════════════════════════════════════
   TYPING ENGINE
══════════════════════════════════════════════════ */

const TYPING_TARGET_MS = 2500;  // total typing duration target
const FRAME_MS         = 16;    // ~60 fps tick rate
const CHAR_THRESHOLD   = 1000;  // chars needed to trigger typing

/** Count printable characters in an HTML string (strips tags). */
function visibleLen(html) {
    return html.replace(/<[^>]*>/g, '').length;
}

/**
 * Reveal the first `n` visible characters of an HTML string.
 * Tags are always included in full so colour spans stay intact.
 * Browsers handle unclosed tags gracefully, so mid-span clips look fine.
 */
function revealHtml(html, n) {
    if (n <= 0) return '';
    let count  = 0;
    let result = '';
    let inTag  = false;

    for (let i = 0; i < html.length; i++) {
        const ch = html[i];
        if      (ch === '<') { inTag = true;  result += ch; }
        else if (ch === '>') { inTag = false; result += ch; }
        else if (inTag)      { result += ch; }
        else {
            result += ch;
            count++;
            if (count >= n) break;
        }
    }
    return result;
}

/** Simple promise-based sleep. */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Start collecting output into the buffer. */
function startBuffer() { outputBuffer = []; }

/**
 * Flush the buffer.
 *
 * < CHAR_THRESHOLD  → type output character by character (Claude-stream feel).
 *                     Speed adapts so the whole response lands in ~1.5 – 3 s.
 * ≥ CHAR_THRESHOLD  → dump all lines immediately (typing 1 000+ chars is too slow).
 */
async function flushBuffer() {
    const lines = outputBuffer;
    outputBuffer = null;

    const totalChars = lines.reduce((s, l) => s + visibleLen(l.html), 0);

    if (totalChars >= CHAR_THRESHOLD) {
        // ── Immediate mode — large output ──────────
        lines.forEach(({ html, cls }) => appendLine(html, cls));
        return;
    }

    // ── Typing mode — small output ─────────────────
    // Target ~2 500 ms total. Clamp between 5 ms (fast) and 30 ms (slow)
    // so even a 10-char line feels deliberate and a 999-char one isn't painful.
    const msPerChar = Math.max(5, Math.min(30, Math.round(TYPING_TARGET_MS / Math.max(1, totalChars))));

    isTyping = true;
    termInput.disabled = true;
    document.querySelector('.terminal-panel').classList.add('is-typing');

    for (const { html, cls } of lines) {
        const len = visibleLen(html);

        // Blank lines (box separators, blank() calls) appear instantly
        if (len === 0) {
            appendLine(html, cls);
            continue;
        }

        // Create the line div then grow it one visible char at a time
        const div = document.createElement('div');
        div.className = 'tl' + (cls ? ' ' + cls : '');
        termOut.appendChild(div);

        for (let i = 1; i <= len; i++) {
            await sleep(msPerChar);
            div.innerHTML = revealHtml(html, i);
            termOut.scrollTop = termOut.scrollHeight;
        }

        // Guarantee the final HTML is exactly correct (closes any open tags)
        div.innerHTML = html;
    }

    isTyping = false;
    document.querySelector('.terminal-panel').classList.remove('is-typing');
    if (window.innerWidth >= 992) {
        termInput.disabled = false;
        termInput.focus();
    }
}

/* ══════════════════════════════════════════════════
   COMMAND DEFINITIONS
   ── Edit the content inside each function to
      customise what appears in the terminal.
   ── Each line() call goes to the buffer, so
      you can freely add or remove lines.
══════════════════════════════════════════════════ */
const CMDS = {

    // ── about ─────────────────────────────────────
    about() {
        const p = PORTFOLIO_DATA.profile;
        boxTop('ABOUT');
        line(`│  <span class="c-cyan">Name    </span> : ${p.name}`);
        line(`│  <span class="c-cyan">Role    </span> : ${p.role}`);
        line(`│  <span class="c-cyan">Location</span> : ${p.location}`);
        line(`│  <span class="c-cyan">Status  </span> : <span class="c-green">● ${p.status}</span>`);
        blank();
        p.bio.forEach(b => line(`│  ${b}`));
        boxBot();
        blank();
    },

    // ── skills ────────────────────────────────────
    skills() {
        const s = PORTFOLIO_DATA.skills;
        boxTop('SKILLS');
        line(`│  <span class="c-cyan">Languages   </span> ${s.languages.join(' · ')}`);
        blank();
        line(`│  <span class="c-cyan">Frameworks  </span> ${s.frameworks.join(' · ')}`);
        blank();
        line(`│  <span class="c-cyan">Cloud/DevOps</span> ${s.cloud.join(' · ')}`);
        blank();
        line(`│  <span class="c-cyan">Testing     </span> ${s.testing.join(' · ')}`);
        blank();
        line(`│  <span class="c-cyan">Methods     </span> ${s.methodologies.join(' · ')}`);
        boxBot();
        blank();
    },

    // ── projects ──────────────────────────────────
    projects() {
        const projects = PORTFOLIO_DATA.projects;
        boxTop('PROJECTS');
        projects.forEach((p, i) => {
            line(`│  <span class="c-green">${p.name}</span>  <span class="c-yellow">[${p.status}]</span>`);
            line(`│  <span class="c-gray">${p.desc}</span>`);
            blank();
            line(`│  <span class="c-cyan">Stack </span> ${p.stack.join(' · ')}`);
            line(`│  <span class="c-cyan">Repo  </span> ${p.repo}`);
            line(`│  <span class="c-cyan">Demo  </span> ${p.demo}`);
            if (i < projects.length - 1) blank();
        });
        boxBot();
        blank();
    },

    // ── experience ────────────────────────────────
    experience() {
        const exps = PORTFOLIO_DATA.experience;
        boxTop('EXPERIENCE');
        exps.forEach((exp, i) => {
            line(`│  <span class="c-green">${exp.title}</span>  <span class="c-gray">${exp.period}</span>`);
            line(`│  <span class="c-cyan">${exp.company}</span>`);
            exp.bullets.forEach(b => line(`│    <span class="c-gray">›</span> ${b}`));
            if (i < exps.length - 1) blank();
        });
        boxBot();
        blank();
    },

    // ── contact ───────────────────────────────────
    contact() {
        const c = PORTFOLIO_DATA.contact;
        boxTop('CONTACT');
        line(`│  <span class="c-cyan">Email   </span> : ${c.emails.join(' / ')}`);
        line(`│  <span class="c-cyan">Phone   </span> : ${c.phone}`);
        line(`│  <span class="c-cyan">LinkedIn</span> : ${c.linkedin}`);
        line(`│  <span class="c-cyan">Location</span> : ${c.location}`);
        boxBot();
        blank();
    },

    // ── resume ────────────────────────────────────
    resume() {
        boxTop('RESUME');
        line(`│  <span class="c-cyan">File    </span> : Jhon_Westly_A_Carmelotes_Resume.pdf`);
        blank();
        line(`│  <span class="c-gray">Download resume?  <span class="c-yellow">[ Y / N ]</span>  (default: N)</span>`);
        line(`│  <span class="c-gray">Type <span class="c-cyan">y</span> + Enter to download, or <span class="c-cyan">n</span> + Enter to cancel.</span>`);
        boxBot();
        blank();
        pendingAction = 'resume-download';
    },

    // ── certification ─────────────────────────────
    certification() {
        const certs = PORTFOLIO_DATA.certifications;
        boxTop('CERTIFICATIONS');
        certs.forEach(cert => {
            line(`│  <span class="c-green">✓</span>  <span class="c-cyan">${cert.name}</span>  <span class="c-gray">(${cert.year})</span>`);
            line(`│     <span class="c-gray">${cert.issuer}</span>`);
        });
        boxBot();
        blank();
    },

    // ── themes ────────────────────────────────────
    themes() {
        boxTop('THEMES');
        line(`│  <span class="c-yellow">[ Coming Soon ]</span>`);
        line(`│  <span class="c-gray">Theme switching will be available soon.</span>`);
        boxBot();
        blank();
    },

    // ── chat ──────────────────────────────────────
    chat() {
        line(`  <span class="c-yellow">[ Future Feature ]</span>`);
        line(`  <span class="c-gray">An AI chatbot is in the works. Stay tuned!</span>`);
        blank();
    },

    // ── clear ─────────────────────────────────────
    clear() {
        termOut.innerHTML = '';
    },

    // ── help ──────────────────────────────────────
    help() {
        boxTop('AVAILABLE COMMANDS');
        line(`│  <span class="c-green">about        </span> <span class="c-gray">→</span>  Who Am I?`);
        line(`│  <span class="c-green">skills       </span> <span class="c-gray">→</span>  Tech Stack`);
        line(`│  <span class="c-green">projects     </span> <span class="c-gray">→</span>  Featured Work`);
        line(`│  <span class="c-green">experience   </span> <span class="c-gray">→</span>  Work History`);
        line(`│  <span class="c-green">contact      </span> <span class="c-gray">→</span>  Get In Touch`);
        line(`│  <span class="c-green">resume       </span> <span class="c-gray">→</span>  My Resume`);
        line(`│  <span class="c-green">certification</span> <span class="c-gray">→</span>  Certifications Earned`);
        line(`│  <span class="c-green">themes       </span> <span class="c-gray">→</span>  Change Themes`);
        line(`│  <span class="c-gray c-strike">chat         </span> <span class="c-gray">→</span>  <span class="c-gray c-strike">Chat With Me</span>`);
        line(`│  <span class="c-green">clear        </span> <span class="c-gray">→</span>  Clear Terminal`);
        line(`│  <span class="c-green">help         </span> <span class="c-gray">→</span>  Show This Menu`);
        boxBot();
        blank();
    },
};

/* ══════════════════════════════════════════════════
   COMMAND RUNNER
══════════════════════════════════════════════════ */
async function runCmd(raw) {
    if (isTyping) return;

    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    // Handle pending Y/N confirmation
    if (pendingAction === 'resume-download') {
        pendingAction = null;
        echoCmd(cmd);
        startBuffer();
        if (cmd === 'y') {
            line(`  <span class="c-green">✓ Downloading resume…</span>`);
            blank();
            const a = document.createElement('a');
            a.href = PORTFOLIO_DATA.resume;
            a.download = 'Jhon_Westly_A_Carmelotes_Resume.pdf';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            line(`  <span class="c-gray">Download cancelled.</span>`);
            blank();
        }
        await flushBuffer();
        return;
    }

    // Prompt echo is ALWAYS immediate — never buffered
    if (cmd !== 'clear') echoCmd(cmd);

    startBuffer();

    if (CMDS[cmd]) {
        CMDS[cmd]();
    } else {
        line(`  <span class="c-red">command not found:</span> ${esc(cmd)}`);
        line(`  <span class="c-gray">Type <span class="c-cyan">'help'</span> to see available commands.</span>`);
        blank();
    }

    await flushBuffer();
}

/* ══════════════════════════════════════════════════
   INPUT HANDLING
══════════════════════════════════════════════════ */

// Force lowercase — ensures all commands match CMDS keys
termInput.addEventListener('input', () => {
    const pos = termInput.selectionStart;
    termInput.value = termInput.value.toLowerCase();
    termInput.setSelectionRange(pos, pos);
});

termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (isTyping) return;  // ignore keystrokes mid-animation
        const val = termInput.value;
        if (val.trim()) { cmdHistory.unshift(val); histIdx = -1; }
        runCmd(val);
        termInput.value = '';

    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < cmdHistory.length - 1) {
            histIdx++;
            termInput.value = cmdHistory[histIdx];
        }

    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx > 0) {
            histIdx--;
            termInput.value = cmdHistory[histIdx];
        } else {
            histIdx = -1;
            termInput.value = '';
        }
    }
});

// Click anywhere in terminal → focus input (desktop only)
document.querySelector('.terminal-panel').addEventListener('click', () => {
    if (window.innerWidth >= 992 && !isTyping) termInput.focus();
});

/* ══════════════════════════════════════════════════
   BOOT SEQUENCE
══════════════════════════════════════════════════ */
async function bootTerminal() {
    // Logo appears immediately — not buffered
    LOGO.forEach(l => appendLine(l, 'c-green'));
    blank();
    appendLine('  <span class="c-green">JWC Terminal</span>  <span class="c-gray">v1.0.2</span>');
    appendLine(`  Type <span class="c-cyan">'help'</span> to see available commands.`, 'c-gray');
    blank();

    // Auto-run 'about' after a short delay so the logo settles first
    setTimeout(async () => {
        await runCmd('about');
        if (window.innerWidth >= 992) termInput.focus();
    }, 300);
}
