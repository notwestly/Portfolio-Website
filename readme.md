# JWC Portfolio — Jhon Westly A. Carmelotes

A personal developer portfolio built from scratch — no templates, no frameworks, no CMS. Just clean HTML, CSS, and vanilla JavaScript with a terminal twist.

[![Version](https://img.shields.io/badge/version-1.0.1-00d4ff?style=flat-square)](https://github.com/notwestly/notwestly.github.io)
[![Status](https://img.shields.io/badge/status-live-39ff14?style=flat-square)](https://notwestly.github.io)
[![License](https://img.shields.io/badge/license-MIT-7b2fff?style=flat-square)](LICENSE)

---

## About

This is my personal portfolio website — designed to be a living resume and first impression for recruiters, collaborators, and anyone curious about my work.

The core idea: a split-panel layout where the left side is a traditional profile view (bio, skills, experience, certifications) and the right side is an interactive terminal that lets visitors explore the same information through typed commands. It's a nod to my engineering background and a way to make the portfolio feel distinctly mine.

### Built With

- **HTML5 / CSS3 / Vanilla JavaScript** — no build tools, no bundlers
- **Bootstrap 5** — grid and utility base only
- **Bootstrap Icons** — icon set
- **Google Fonts** — Rajdhani, JetBrains Mono, Figtree

---

## Features

- **Split-panel layout** — profile panel (left) + interactive terminal (right)
- **Interactive terminal** — type `help`, `skills`, `experience`, `contact`, and more
- **Dynamic profile photo** — cycles through photos every 30 seconds with fade transition
- **Photo zoom** — click the avatar to view full-size with prev/next navigation
- **Certifications viewer** — click any cert card to view the PDF inline
- **Dark / light theme** — persists via localStorage, respects system preference
- **Responsive** — collapses to single-column on tablet and mobile with a terminal FAB
- **Data file** (`js/data.js`) — single source of truth for all portfolio content; terminal reads from it automatically

---

## Project Structure

```
portfolio-website/
├── index.html
├── css/
│   ├── main.css          # Profile panel, layout, components
│   └── terminal.css      # Terminal panel styles
├── js/
│   ├── data.js           # All portfolio content (single source of truth)
│   ├── terminalgui.js    # Terminal engine, commands, typing animation
│   └── webpage.js        # Tabs, theme, photo zoom, cert lightbox
└── assets/
    ├── Certifications/   # PDF certificates
    └── Profile Pic *.jpg # Profile photos
```

---

## Getting Started

No build step required. Open `index.html` in a browser or serve it locally:

```bash
python -m http.server 8080
# then open http://localhost:8080
```

> PDF certificates require a served URL (http/https) to render inline. Opening `index.html` directly via `file://` will fall back to the "Open in new tab" button.

---

## Terminal Commands

| Command         | Output                          |
|-----------------|---------------------------------|
| `about`         | Name, role, location, bio       |
| `skills`        | Full tech stack by category     |
| `experience`    | Work history with bullets       |
| `contact`       | Email, phone, LinkedIn          |
| `certification` | All certifications with issuer  |
| `resume`        | Resume file reference           |
| `projects`      | Coming soon                     |
| `themes`        | Coming soon                     |
| `clear`         | Clear terminal output           |
| `help`          | List all commands               |

---

## Roadmap

- [x] Profile panel with tabs (About, Skills, Experience, Certifications, Contact)
- [x] Interactive terminal with real data
- [x] Dynamic profile photo rotation
- [x] Certification PDF viewer
- [x] Dark / light theme toggle
- [x] Mobile responsive layout
- [ ] Projects tab — featured work with live links and tech tags
- [ ] Terminal `themes` command — switchable terminal color schemes
- [ ] AI chatbot integration

---

## Contact

**Jhon Westly A. Carmelotes**
- Email: westlycarmelotes@gmail.com
- LinkedIn: [linkedin.com/in/jhon-westly-a-carmelotes](https://www.linkedin.com/in/jhon-westly-a-carmelotes/)
- GitHub: [github.com/notwestly](https://github.com/notwestly)

---

## Version History

| Version | Notes |
|---------|-------|
| 1.0.1   | Terminal synced to data.js, photo zoom with navigation, certifications viewer, improved tab styling |
| 1.0.0   | Initial build — layout, terminal engine, theme switcher |
