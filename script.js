// =============================
// INITIALIZATION
// =============================
lucide.createIcons();
gsap.registerPlugin(Draggable);

let topZ = 100;
let windowOrder = [];

// =============================
// HERO TEXT — SPLIT TO CHARS
// =============================

/**
 * Splits the text content of an element into individual <span class="char"> elements
 * to enable per-character animations.
 * @param {string} id - The element ID to split
 */
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

// =============================
// MAGNETIC MOUSE EFFECT ON HERO TEXT
// =============================

const allChars = document.querySelectorAll('.char');

/**
 * Creates a 3D magnetic repulsion effect on hero characters
 * as the user moves their mouse near them.
 */
document.addEventListener('mousemove', (e) => {
    allChars.forEach((char) => {
        const rect = char.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

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

// =============================
// WINDOW MANAGEMENT
// =============================

/**
 * Opens a window by ID, centers it on screen, and animates it in.
 * @param {string} id - The window element ID
 */
function openWin(id) {
    const win = document.getElementById(id);
    if (!win) return;

    // Track window order for smartClose
    if (win.style.display !== 'block') windowOrder.push(id);

    win.style.display = 'block';
    win.style.zIndex = ++topZ;

    // Center on screen
    gsap.set(win, {
        left: (window.innerWidth - win.offsetWidth) / 2,
        top: (window.innerHeight - win.offsetHeight) / 2
    });

    // Animate in
    gsap.to(win, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
}

/**
 * Closes a window by ID with a fade-out animation.
 * @param {string} id - The window element ID
 */
function closeWin(id) {
    windowOrder = windowOrder.filter(item => item !== id);
    gsap.to(`#${id}`, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        onComplete: () => document.getElementById(id).style.display = 'none'
    });
}

/**
 * Closes the most recently opened window (LIFO order).
 * Used by the "Clear Desktop" dock icon.
 */
function smartClose() {
    if (windowOrder.length > 0) {
        const lastId = windowOrder.pop();
        closeWin(lastId);
    }
}

// =============================
// DOCK — MAGNIFICATION EFFECT
// =============================

const icons = document.querySelectorAll('.dock-icon');
const dock = document.getElementById('dock');

/**
 * Magnifies dock icons based on mouse proximity (macOS-style effect).
 */
dock.addEventListener('mousemove', (e) => {
    icons.forEach(icon => {
        const iconRect = icon.getBoundingClientRect();
        const iconCenterX = iconRect.left + icon.offsetWidth / 2;
        const distance = Math.abs(e.clientX - iconCenterX);
        const scale = Math.max(1, 1.7 - distance / 150);
        icon.style.width  = `${48 * scale}px`;
        icon.style.height = `${48 * scale}px`;
    });
});

/**
 * Resets all dock icons to their default size when mouse leaves dock.
 */
dock.addEventListener('mouseleave', () => {
    icons.forEach(icon => {
        icon.style.width  = '48px';
        icon.style.height = '48px';
    });
});

// =============================
// LIVE CLOCK
// =============================

/**
 * Updates the taskbar clock every second with current date and time.
 */
function updateClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.textContent = `${dateStr}  ${timeStr}`;
}

setInterval(updateClock, 1000);
updateClock(); // Run immediately on load

// =============================
// THEME TOGGLE (DARK / LIGHT)
// =============================

document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};

// =============================
// DRAGGABLE WINDOWS
// =============================

/**
 * Makes all windows draggable via their header handle,
 * and brings clicked windows to the front.
 */
document.querySelectorAll('.window').forEach(win => {
    Draggable.create(win, {
        trigger: win.querySelector('.handle'),
        bounds: "body"
    });

    // Bring to front on click
    win.onmousedown = () => {
        win.style.zIndex = ++topZ;
    };
});
