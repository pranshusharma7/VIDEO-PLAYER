# 🎬 OmniPlayer Pro — Cinematic Movie Streaming & Discovery Platform

**OmniPlayer Pro** is a world-class, cinematic movie streaming and entertainment discovery platform that blends the visual sophistication of Netflix, Apple TV+, and Prime Video with a universal video playback engine.

---

## 🎨 Design Philosophy & Color System

The platform features a sophisticated dark cinematic aesthetic engineered for high contrast, deep immersion, and modern typography:

- **Main Background**: `#0D0D14` (Deep space obsidian)
- **Secondary Background**: `#141421` (Card rails and panels)
- **Card Background**: `#191927` (Interactive poster surfaces)
- **Primary Accent**: `#8B5CF6` (Vibrant royal purple)
- **Secondary Accent**: `#5B8CFF` (Electric sapphire blue)
- **Highlight**: `#C084FC` (Luminous violet)
- **Primary Text**: `#F8FAFC` (Clean optical white)
- **Secondary Text**: `#A1A1B5` (Muted silver)

No harsh solid black backgrounds, no cluttered neon borders — only subtle frosted glass (`backdrop-filter: blur(20px)`), smooth bezier transitions, and elegant ambient lighting.

---

## 🧭 Platform Architecture & Navigation

OmniPlayer Pro is built with a responsive single-page application (SPA) router supporting deep-linking and browser history:

### 1. Persistent Left Sidebar
- 🏠 **Home / Player (`#home`)**: The universal media player studio with custom controls, multi-server embeds, lecture notes, and the AI Assistant.
- 🎬 **Movies (`#movies`)**: Dedicated cinematic movie discovery hub.
- 📺 **TV Shows (`#tv`)**: Curated episodic content and serials.
- ⚡ **Anime (`#anime`)**: Japanese animation and series catalog.
- 📚 **My Library (`#library`)**: Saved watchlists and custom collections.
- ⏱️ **Watch History (`#history`)**: Chronological playback history with quick resume.
- ❤️ **Favorites (`#favorites`)**: Bookmarked titles with instant play actions.
- 📥 **Downloads (`#downloads`)**: Offline media manager and snapshot gallery.
- 📑 **Playlists (`#playlists`)**: Custom queues and lecture series.
- 💎 **OmniPlayer VIP Card**: Premium upgrade card with perks.
- 👤 **User Profile**: Profile preview for Alex Vance with VIP badge.

### 2. Sticky Glass Topbar & Floating Smart Search
- 🔍 **Smart Movie Search (`#globalSearchInput`)**: Global floating dropdown with instant debounced multi-search across TMDB and curated blockbuster libraries.
  - Floating modal design that hovers over content without layout shifts.
  - Full keyboard navigation (<kbd>↓</kbd>, <kbd>↑</kbd>, <kbd>Enter</kbd>, <kbd>Esc</kbd>).
  - Search history chips with 1-click removal.
  - Trending search suggestion pills (*Avengers, Interstellar, Dune, Oppenheimer, Inception, Batman*).
  - High-res poster thumbnails, release year, IMDb golden ratings, and genre tags.

---

## 🍿 Movies Discovery Page (`#movies`)

The heart of the new discovery experience:

### 🌟 Cinematic Hero Carousel
- Large, dynamic high-resolution movie backdrop with multi-stop dark gradient vignettes.
- Real-time metadata: Movie title, release year, duration, 4K Ultra HD badge, and IMDb rating badge.
- Interactive actions: **Watch Now** (instant stream playback), **More Info** (navigates to `#movie/:id`), and **Add to Watchlist**.
- Auto-rotating carousel with previous/next controls and auto-pause on hover.

### 🎭 Browse by 12 Cinematic Genres
Visually rich interactive genre cards with smooth hover zoom:
- 💥 **Action**
- 🗺️ **Adventure**
- 😂 **Comedy**
- 🎭 **Drama**
- 🔪 **Thriller**
- 👻 **Horror**
- 🚀 **Sci-Fi**
- 💖 **Romance**
- 🕵️ **Crime**
- 🎨 **Animation**
- 🧙 **Fantasy**
- 🔍 **Mystery**

Clicking any genre filters the curated catalog and opens a dedicated collection grid.

### 🎞️ 8 Curated Discovery Carousels
Every section features smooth horizontal scrolling buttons, animated movie cards, and a working **See All** action:
1. **Trending Movies**
2. **Recommended For You**
3. **Top Rated Masterpieces**
4. **New Releases**
5. **Most Watched**
6. **Award Winning Movies**
7. **Continue Watching** (with progress indicators)
8. **Recently Added**

---

## 📽️ Dedicated Movie Details Page (`#movie/:id`)

Deep dive into any title:
- Full-bleed cinematic backdrop with atmospheric lighting.
- High-res movie poster with quick action pills.
- Title, tagline, duration, release date, and genre tags.
- Full storyline synopsis.
- Interactive cast carousel with actor portraits, real names, and character roles.
- Authentic user reviews with star ratings and publication dates.
- Direct **Watch Now** button that launches the player with verified stream embeds.
- Similar movies recommendation shelf.

---

## ⚡ Professional Universal Video Player Engine

Maintains 100% of OmniPlayer's high-performance playback capabilities:

1. **Pure Custom YouTube Engine**:
   - Strips 100% of native YouTube controls, title bars, and watermark overlays.
   - Enforces OmniPlayer's custom 60fps timeline scrubber, play/pause animations, and double-click seek ripples.
2. **Cinema Stream Mode**:
   - Intelligently recognizes external cinema embed links (Nxsha, AutoEmbed, VidLink, MultiEmbed, VidSrc) and unmasks pointer events to allow native embed controls.
3. **Universal Media Support**:
   - HLS (`.m3u8`) streaming with adaptive quality levels.
   - Direct MP4, WebM, OGG, and MOV streams.
   - Local video files via zero-buffering drag & drop.
4. **300% Web Audio Gain Booster**:
   - Amplify low-volume speech and lectures up to 300% using real-time Web Audio API filters.
5. **Ultra-Smooth Gestures**:
   - Double-click left: **-10s** rewind with ripple.
   - Double-click right: **+10s** fast-forward with ripple.
   - Double-click center: Fullscreen toggle.
6. **Timestamped Lecture & Study Notes**:
   - Capture real-time timecodes, write notes, jump to timestamps on click, and export as Markdown (`.md`).

---

## 🤖 AI Assistant Panel

Integrated directly beside the video player stage:
- 📝 **Summarize Plot**: Generate concise, spoiler-aware overviews of the current video or movie.
- 🎬 **Explain Scenes**: Breakdown critical plot points, cinematic subtext, and scene transitions.
- 💡 **Key Takeaways & Themes**: Highlight overarching motifs, character arcs, and study takeaways.
- 🎯 **Similar Content**: AI-recommended titles based on themes, tone, and director style.
- 💬 **Interactive Q&A**: Ask any question about the video in natural language with instant smart answers.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open in Browser
Visit `http://localhost:5173/` to explore the platform.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> / <kbd>K</kbd> | Play / Pause |
| <kbd>←</kbd> / <kbd>J</kbd> | Rewind 10 Seconds |
| <kbd>→</kbd> / <kbd>L</kbd> | Forward 10 Seconds |
| <kbd>Double Click (Left / Right)</kbd> | Seek -10s / +10s with Ripple Effect |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume Up / Down (5%) |
| <kbd>M</kbd> | Mute / Unmute |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>T</kbd> | Theatre Mode |
| <kbd>P</kbd> | Picture-in-Picture (PiP) |
| <kbd>S</kbd> | Capture HD Video Snapshot |
| <kbd>N</kbd> | Focus Timestamped Note Input |
| <kbd>/</kbd> | Focus Global Movie Search |
| <kbd>Esc</kbd> | Close Modals & Search Dropdown |
