lucide.createIcons();
gsap.registerPlugin(Draggable);

let topZ = 100;
let windowOrder = [];

// Hero text — split into individual characters for animation
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

// Magnetic mouse repulsion effect on hero text
const allChars = document.querySelectorAll('.char');
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

// Open a window — center it and animate in
function openWin(id) {
    const win = document.getElementById(id);
    if (!win) return;
    if (win.style.display !== 'block') windowOrder.push(id);
    win.style.display = 'block';
    win.style.zIndex = ++topZ;
    gsap.set(win, {
        left: (window.innerWidth - win.offsetWidth) / 2,
        top: (window.innerHeight - win.offsetHeight) / 2
    });
    gsap.to(win, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
}

// Close a window — fade out and hide
function closeWin(id) {
    windowOrder = windowOrder.filter(item => item !== id);
    gsap.to(`#${id}`, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        onComplete: () => document.getElementById(id).style.display = 'none'
    });
}

// Close most recently opened window
function smartClose() {
    if (windowOrder.length > 0) closeWin(windowOrder.pop());
}

// Dock magnification effect
const icons = document.querySelectorAll('.dock-icon');
const dock = document.getElementById('dock');
dock.addEventListener('mousemove', (e) => {
    icons.forEach(icon => {
        const iconCenterX = icon.getBoundingClientRect().left + icon.offsetWidth / 2;
        const distance = Math.abs(e.clientX - iconCenterX);
        const scale = Math.max(1, 1.7 - distance / 150);
        icon.style.width = `${48 * scale}px`;
        icon.style.height = `${48 * scale}px`;
    });
});
dock.addEventListener('mouseleave', () => {
    icons.forEach(icon => {
        icon.style.width = '48px';
        icon.style.height = '48px';
    });
});

// Live clock
function updateClock() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.textContent = `${dateStr}  ${timeStr}`;
}
setInterval(updateClock, 1000);
updateClock();

// Theme toggle
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};

// Draggable windows
document.querySelectorAll('.window').forEach(win => {
    Draggable.create(win, {
        trigger: win.querySelector('.handle'),
        bounds: "body"
    });
    win.onmousedown = () => { win.style.zIndex = ++topZ; };
});

// Email fix — JS se set karo taaki Cloudflare scramble na kare
document.getElementById('email-link').href = 'mailto:' + 'ac.ayush2007' + '@' + 'gmail.com';
document.getElementById('email-text').textContent = 'ac.ayush2007' + '@' + 'gmail.com';