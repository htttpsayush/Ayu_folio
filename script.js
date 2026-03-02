/* ============================================================
   script.js — Ayush OS Portfolio

   INDEX:
   1.  Initialization
   2.  Hero Text — Split to Characters
   3.  Magnetic Mouse Effect
   4.  Window Management (openWin / closeWin / smartClose)
   5.  Dock Magnification
   6.  Live Clock
   7.  Theme Toggle (Dark/Light + Wallpaper + Icon)
   8.  Draggable Windows
   9.  Email Fix (Cloudflare bypass)
   ============================================================ */


/* ============================================================
   1. INITIALIZATION
   ============================================================ */
lucide.createIcons();
gsap.registerPlugin(Draggable);

let topZ = 100;       // z-index counter for window stacking
let windowOrder = []; // Stack of open window IDs for smartClose()
const isMobile = () => window.innerWidth <= 768; // Mobile check helper


/* ============================================================
   2. HERO TEXT — SPLIT TO CHARACTERS
   Breaks text into <span class="char"> so GSAP can animate each letter
   ============================================================ */
function splitToChars(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = el.textContent
        .trim()
        .split("")
        .map(c => c === " " ? "&nbsp;" : `<span class="char">${c}</span>`)
        .join("");
}
splitToChars('sub-text');
splitToChars('hero-title');


/* ============================================================
   3. MAGNETIC MOUSE EFFECT
   Letters repel away from cursor — desktop only for performance
   force = 0 at 200px away, force = 1 when cursor is ON the char
   ============================================================ */
const allChars = document.querySelectorAll('.char');
document.addEventListener('mousemove', (e) => {
    if (isMobile()) return; // Skip on mobile
    allChars.forEach((char) => {
        const rect    = char.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const dist    = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
        if (dist < 200) {
            const force = (200 - dist) / 200;
            gsap.to(char, {
                x: -(e.clientX - centerX) * force * 0.2,
                y: -(e.clientY - centerY) * force * 0.2,
                z: force * 60,
                scale: 1 + force * 0.2,
                duration: 0.5
            });
        } else {
            gsap.to(char, { x: 0, y: 0, z: 0, scale: 1, duration: 0.6 });
        }
    });
});


/* ============================================================
   4. WINDOW MANAGEMENT
   ============================================================ */

// Open a window — center on desktop, CSS handles mobile position
function openWin(id) {
    const win = document.getElementById(id);
    if (!win) return;
    if (win.style.display !== 'block') windowOrder.push(id);
    win.style.display = 'block';
    win.style.zIndex  = ++topZ;
    if (!isMobile()) {
        gsap.set(win, {
            left: (window.innerWidth  - win.offsetWidth)  / 2,
            top:  (window.innerHeight - win.offsetHeight) / 2
        });
    }
    gsap.to(win, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.2)" });
}

// Close a window with fade + shrink animation
function closeWin(id) {
    windowOrder = windowOrder.filter(item => item !== id);
    gsap.to(`#${id}`, {
        opacity: 0, scale: 0.92, duration: 0.2,
        onComplete: () => document.getElementById(id).style.display = 'none'
    });
}

// Close the most recently opened window (LIFO)
function smartClose() {
    if (windowOrder.length > 0) closeWin(windowOrder.pop());
}


/* ============================================================
   5. DOCK MAGNIFICATION
   Icons grow when cursor is nearby — desktop only
   scale = 1.7x max when cursor is directly on icon
   ============================================================ */
const icons = document.querySelectorAll('.dock-icon');
const dock  = document.getElementById('dock');

dock.addEventListener('mousemove', (e) => {
    if (isMobile()) return;
    icons.forEach(icon => {
        const iconCenterX = icon.getBoundingClientRect().left + icon.offsetWidth / 2;
        const distance    = Math.abs(e.clientX - iconCenterX);
        const scale       = Math.max(1, 1.7 - distance / 150);
        icon.style.width  = `${48 * scale}px`;
        icon.style.height = `${48 * scale}px`;
    });
});

dock.addEventListener('mouseleave', () => {
    const size = isMobile() ? '36px' : '48px';
    icons.forEach(icon => { icon.style.width = size; icon.style.height = size; });
});


/* ============================================================
   6. LIVE CLOCK
   Updates every second — mobile shows time only to save space
   ============================================================ */
function updateClock() {
    const now     = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.textContent = isMobile() ? timeStr : `${dateStr}  ${timeStr}`;
}
setInterval(updateClock, 1000);
updateClock();


/* ============================================================
   7. THEME TOGGLE
   - Toggles .light-mode on <body>
   - Changes emoji: 🌙 (dark) ↔ ☀️ (light)
   - Changes wallpaper: wallpaper-dark.png ↔ wallpaper-light.png
   ============================================================ */
document.getElementById('theme-toggle').onclick = () => {
    const isLight = document.body.classList.toggle('light-mode');

    // Update icon
    document.getElementById('theme-toggle').textContent = isLight ? '☀️' : '🌙';

    // Update wallpaper
    document.body.style.backgroundImage = isLight
        ? "url('wallpaper-light.png')"
        : "url('wallpaper-dark.png')";
};


/* ============================================================
   8. DRAGGABLE WINDOWS
   Desktop only — mobile uses fixed CSS positioning
   Drag trigger = header bar (.handle) only
   ============================================================ */
document.querySelectorAll('.window').forEach(win => {
    if (!isMobile()) {
        Draggable.create(win, {
            trigger: win.querySelector('.handle'),
            bounds: "body"
        });
    }
    // Clicking any window brings it to front
    win.onmousedown = () => { win.style.zIndex = ++topZ; };
});


/* ============================================================
   9. EMAIL FIX
   Set email via JS to prevent Cloudflare from scrambling it
   ============================================================ */
document.getElementById('email-link').href = 'mailto:' + 'ac.ayush2007' + '@' + 'gmail.com';
document.getElementById('email-text').textContent = 'ac.ayush2007' + '@' + 'gmail.com';