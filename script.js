/* ============================================================
   script.js — Ayush OS Portfolio

   TABLE OF CONTENTS:
   1.  Initialization
   2.  Hero Text — Split to Characters
   3.  Magnetic Mouse Effect (Hero Title)
   4.  Window Management — openWin / closeWin / smartClose
   5.  Dock — Icon Magnification Effect
   6.  Live Clock
   7.  Theme Toggle (Dark / Light)
   8.  Draggable Windows
   ============================================================ */


/* ============================================================
   1. INITIALIZATION
   
   - lucide.createIcons() scans the DOM for <i data-lucide="...">
     tags and replaces them with actual SVG icons.
   - Draggable is a GSAP plugin — must be registered before use.
   - topZ tracks the highest z-index so the focused window always
     appears on top of all others.
   - windowOrder is a stack (array) that tracks open windows in
     order, used by smartClose() to close the most recent one.
   ============================================================ */
lucide.createIcons();
gsap.registerPlugin(Draggable);

let topZ = 100;        // z-index counter — incremented each time a window is focused
let windowOrder = [];  // Stack of open window IDs (most recent at the end)


/* ============================================================
   2. HERO TEXT — SPLIT TO CHARACTERS
   
   We split the hero text into individual <span class="char">
   elements so GSAP can animate each letter independently.
   
   Example: "portfolio." becomes:
   <span class="char">p</span>
   <span class="char">o</span>
   ... and so on.
   
   Spaces are replaced with &nbsp; to preserve spacing.
   ============================================================ */

/**
 * Splits an element's text into individual .char spans for animation.
 * @param {string} id - The ID of the element to split
 */
function splitToChars(id) {
    const el = document.getElementById(id);
    if (!el) return;  // Safety check — do nothing if element not found

    el.innerHTML = el.textContent
        .trim()
        .split("")
        .map(c => c === " " ? "&nbsp;" : `<span class="char">${c}</span>`)
        .join("");
}

// Apply to both hero text elements
splitToChars('sub-text');
splitToChars('hero-title');


/* ============================================================
   3. MAGNETIC MOUSE EFFECT (HERO TITLE)
   
   As the mouse moves, each character checks how close the cursor
   is. If within 200px, it gets pushed away from the cursor in 3D
   space — like a magnetic repulsion effect.
   
   How the math works:
   - dist = straight-line distance from cursor to character center
   - force = a value from 0 to 1 (stronger when cursor is closer)
   - The character moves AWAY from the cursor by reversing the
     direction vector (hence the minus sign on x and y)
   - z and scale increase slightly to add a 3D "pop" feeling
   ============================================================ */
const allChars = document.querySelectorAll('.char');

document.addEventListener('mousemove', (e) => {
    allChars.forEach((char) => {
        const rect    = char.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;

        // Euclidean distance between cursor and character center
        const dist = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) +
            Math.pow(e.clientY - centerY, 2)
        );

        if (dist < 200) {
            // force: 1.0 when cursor is ON the char, 0.0 at 200px away
            const force = (200 - dist) / 200;

            gsap.to(char, {
                x:        -(e.clientX - centerX) * force * 0.2,  // Push left/right
                y:        -(e.clientY - centerY) * force * 0.2,  // Push up/down
                z:        force * 60,                             // Pop forward in 3D
                scale:    1 + force * 0.2,                        // Grow slightly
                duration: 0.5
            });
        } else {
            // Outside range — smoothly snap back to original position
            gsap.to(char, { x: 0, y: 0, z: 0, scale: 1, duration: 0.6 });
        }
    });
});


/* ============================================================
   4. WINDOW MANAGEMENT
   
   Each "window" is a hidden <div> that gets shown/animated
   using GSAP when the user clicks a dock icon or menu item.
   
   - openWin(id)  → shows and centers a window, adds to stack
   - closeWin(id) → fades out and hides a window, removes from stack
   - smartClose() → closes the most recently opened window (LIFO)
   ============================================================ */

/**
 * Opens a window, centers it on screen, and animates it in.
 * Also tracks it in windowOrder for smartClose().
 * @param {string} id - The ID of the window element to open
 */
function openWin(id) {
    const win = document.getElementById(id);
    if (!win) return;

    // Only add to stack if it's not already open
    if (win.style.display !== 'block') windowOrder.push(id);

    win.style.display = 'block';
    win.style.zIndex  = ++topZ;  // Bring to front

    // Center the window on screen (works even for windows with custom sizes)
    gsap.set(win, {
        left: (window.innerWidth  - win.offsetWidth)  / 2,
        top:  (window.innerHeight - win.offsetHeight) / 2
    });

    // Animate in with a satisfying "spring" ease
    gsap.to(win, {
        opacity:  1,
        scale:    1,
        duration: 0.4,
        ease:     "back.out(1.2)"  // Slight overshoot for a bouncy feel
    });
}

/**
 * Closes a window with a fade-out + shrink animation.
 * After animation completes, the element is hidden with display:none.
 * @param {string} id - The ID of the window element to close
 */
function closeWin(id) {
    // Remove from the open window stack
    windowOrder = windowOrder.filter(item => item !== id);

    gsap.to(`#${id}`, {
        opacity:    0,
        scale:      0.9,
        duration:   0.2,
        onComplete: () => document.getElementById(id).style.display = 'none'
    });
}

/**
 * Closes the most recently opened window (Last In, First Out).
 * Used by the "Clear Desktop" dock icon — acts like pressing Escape.
 * Does nothing if no windows are open.
 */
function smartClose() {
    if (windowOrder.length > 0) {
        const lastId = windowOrder.pop();  // Remove last item from stack
        closeWin(lastId);
    }
}


/* ============================================================
   5. DOCK — ICON MAGNIFICATION EFFECT
   
   As the mouse moves over the dock, icons near the cursor grow
   larger — just like the macOS Dock magnification effect.
   
   How it works:
   - For each icon, we measure its horizontal distance from the cursor
   - Icons closer to the cursor get a higher scale multiplier
   - Max scale: 1.7x (when cursor is directly over the icon)
   - Min scale: 1.0x (when cursor is 150px+ away)
   - When mouse leaves the dock, all icons reset to 48x48px
   ============================================================ */
const icons = document.querySelectorAll('.dock-icon');
const dock  = document.getElementById('dock');

// Magnify icons based on horizontal distance from cursor
dock.addEventListener('mousemove', (e) => {
    icons.forEach(icon => {
        const iconRect   = icon.getBoundingClientRect();
        const iconCenterX = iconRect.left + icon.offsetWidth / 2;
        const distance   = Math.abs(e.clientX - iconCenterX);

        // scale goes from 1.7 (cursor ON icon) down to 1.0 (150px+ away)
        const scale = Math.max(1, 1.7 - distance / 150);

        icon.style.width  = `${48 * scale}px`;
        icon.style.height = `${48 * scale}px`;
    });
});

// Reset all icons to default size when mouse leaves the dock
dock.addEventListener('mouseleave', () => {
    icons.forEach(icon => {
        icon.style.width  = '48px';
        icon.style.height = '48px';
    });
});


/* ============================================================
   6. LIVE CLOCK
   
   Displays the current date and time in the taskbar, updating
   every second. Format: "Fri 27 Feb  14:35:22"
   
   - setInterval calls updateClock() every 1000ms (1 second)
   - We also call it immediately so the clock shows on page load
     instead of waiting 1 second for the first tick
   ============================================================ */

/**
 * Reads current time and updates the #live-clock element in the taskbar.
 */
function updateClock() {
    const now     = new Date();
    const dateStr = now.toLocaleDateString('en-GB',  { weekday: 'short', day: '2-digit', month: 'short' });
    const timeStr = now.toLocaleTimeString('en-GB',  { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.textContent = `${dateStr}  ${timeStr}`;
}

setInterval(updateClock, 1000);
updateClock();  // Run immediately so clock shows on page load (no 1s delay)


/* ============================================================
   7. THEME TOGGLE (DARK / LIGHT MODE)
   
   Clicking the 🌙 icon in the taskbar toggles the .light-mode
   class on <body>. CSS variables in styles.css handle the rest —
   colors update automatically across the whole page.
   ============================================================ */
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
    // Optional: you could also update the emoji here
    // e.g. toggle between 🌙 and ☀️ based on current mode
};


/* ============================================================
   8. DRAGGABLE WINDOWS
   
   We use GSAP's Draggable plugin to make every .window element
   draggable. The drag is triggered only from the .handle (header
   bar), so clicking inside the window content doesn't drag it.
   
   We also attach onmousedown to bring the clicked window to
   the front by incrementing its z-index.
   ============================================================ */
document.querySelectorAll('.window').forEach(win => {

    // Make this window draggable — only via the header (.handle)
    Draggable.create(win, {
        trigger: win.querySelector('.handle'),  // Drag zone = header bar only
        bounds:  "body"                         // Can't drag outside the viewport
    });

    // When any part of the window is clicked, bring it to the front
    win.onmousedown = () => {
        win.style.zIndex = ++topZ;
    };
});
