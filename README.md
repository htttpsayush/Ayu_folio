# 🖥️ Ayush OS — Interactive Portfolio

> A macOS-inspired interactive portfolio built with HTML, CSS, and JavaScript.  
> Live at 👉 **[ayush-folio.vercel.app](https://ayush-folio.vercel.app)**

---

## 📌 Project Overview

**Ayush OS** is a portfolio website designed to look and feel like a **macOS desktop environment**. Instead of a traditional scroll-based portfolio, everything lives inside **draggable windows** that open from a **dock** — just like a real operating system.

### ✨ Key Features

- 🪟 **Draggable Windows** — Every section (About, Projects, Skills, Contact) opens as a movable popup window
- 🌊 **Magnetic Hero Text** — Letters in the title repel away from the mouse cursor in 3D space
- 🚀 **macOS-style Dock** — Bottom dock with icon magnification on hover
- 🌙 **Dark / Light Mode** — Toggle between themes with one click
- 🕐 **Live Clock** — Real-time date and time in the taskbar
- 📄 **Resume Viewer** — Embedded PDF viewer with download option
- 📱 **Smooth Animations** — Powered by GSAP for all transitions

---

## 📁 File Structure

```
ayush-folio/
│
├── index.html              # Main HTML — all windows, dock, taskbar
├── styles.css              # All custom CSS — themes, windows, dock, buttons
├── script.js               # All JavaScript — animations, logic, clock
│
├── Mochi Boom DEMO.ttf     # Custom font used for the hero title
├── Ayush_Resume.pdf        # Resume shown in the Resume window
│
├── Apple-removebg-preview.png                        # Taskbar Apple logo
├── download-removebg-preview.png                     # Dock: About Me icon
├── download__1_-removebg-preview.png                 # Dock: Projects icon + folder icons
├── PHOTOS__macOS_Big_Sur_Icons_Pack_-removebg-preview.png  # Dock: Photo icon
├── High_Res_iPhone___iPad_icons-removebg-preview.png # Dock: Contact icon
├── Terminal_free_icons_designed_by_HideMaru-removebg-preview.png  # Dock: Skills icon
├── Cat Meme Format.jpg     # Dock: Clear Desktop icon
└── macos-tahoe-26-5120x2880-22674.jpg  # Desktop wallpaper
```

---

## 🧠 Code Explanation

### `index.html` — Structure

The HTML is divided into these main sections:

| Section | ID / Class | Description |
|---|---|---|
| Taskbar | `header.taskbar` | Fixed top bar with logo, nav links, clock |
| Hero | `main#hero-trigger` | Big centered title on the desktop |
| Windows | `div.window` | Popup panels for each section |
| Dock | `nav > .glass-dock` | Bottom icon bar |

Each **window** follows this pattern:
```html
<div id="win-about" class="window">
    <div class="window-header handle">  <!-- Drag handle + close button -->
        <div class="dot bg-red-500" onclick="closeWin('win-about')"></div>
    </div>
    <div class="p-8">
        <!-- Window content goes here -->
    </div>
</div>
```

---

### `styles.css` — Styling

| Section | What it does |
|---|---|
| `:root` variables | Defines `--text-color`, `--window-bg`, `--header-bg` for dark mode |
| `.light-mode` | Overrides variables when theme is toggled |
| `.window` | Absolutely positioned, hidden by default (`display: none`) |
| `.glass-dock` | Frosted glass effect using `backdrop-filter: blur()` |
| `.char` | Per-character span for GSAP magnetic animation |
| `.demo-btn` | Green pill button for project demo links |
| `.download-btn` | Small dark button in the resume window header |

**Theme System:**
```css
/* Dark mode (default) */
:root {
    --window-bg: #121212;
}

/* Light mode — toggled by JS adding .light-mode to <body> */
.light-mode {
    --window-bg: #ffffff;
}
```

---

### `script.js` — JavaScript Logic

#### 1. 🔤 Hero Text — Magnetic Effect
```
splitToChars('hero-title')
```
- Breaks "portfolio." into individual `<span class="char">` elements
- On `mousemove`, calculates distance from cursor to each character
- Uses GSAP to push characters away from the cursor in 3D space
- Formula: `force = (200 - dist) / 200` → stronger push when cursor is closer

#### 2. 🪟 Window Management
```
openWin(id)   → shows window, centers it, animates in
closeWin(id)  → fades out and hides window
smartClose()  → closes the most recently opened window (LIFO stack)
```
- `windowOrder[]` is a stack that tracks open windows in order
- `topZ` counter ensures the last clicked window is always on top

#### 3. 🚢 Dock Magnification
```
dock.addEventListener('mousemove', ...)
```
- Measures horizontal distance from cursor to each icon center
- Scale formula: `Math.max(1, 1.7 - distance / 150)`
- Icons near the cursor grow up to **1.7x** their original size

#### 4. 🕐 Live Clock
```
setInterval(updateClock, 1000)
```
- Updates the taskbar clock every second
- Format: `Fri 27 Feb  14:35:22`

#### 5. 🌙 Theme Toggle
```
document.body.classList.toggle('light-mode')
```
- Adds/removes `.light-mode` class on `<body>`
- CSS variables handle all color changes automatically

#### 6. 🖱️ Draggable Windows
```
Draggable.create(win, { trigger: '.handle', bounds: 'body' })
```
- GSAP Draggable makes every window movable
- Drag is only triggered from the header bar (`.handle`)
- Windows are bounded to stay inside the viewport

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and all window markup |
| CSS3 | Styling, themes, glassmorphism effects |
| Tailwind CSS | Utility classes for layout and spacing |
| JavaScript (ES6) | Window logic, clock, theme toggle |
| GSAP 3 | All animations — windows, magnetic text, transitions |
| GSAP Draggable | Makes windows draggable |
| Lucide Icons | SVG icons (mail, github, linkedin, etc.) |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <a href="https://github.com/htttpsayush">Ayush Singh</a></p>
