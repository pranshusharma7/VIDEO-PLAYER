# ⚡ OmniPlayer Studio Pro — The Universal Video Engine

**OmniPlayer Studio Pro** ek ultra-smooth, lightweight aur modern web video player hai jo YouTube, Apna College, Coursera, Udemy, direct MP4, HLS (.m3u8), Vimeo aur local files ko seamlessly play karta hai.

---

## 🌟 Focused & Essential Features

1. **Dual Theme Engine (Dark Obsidian & Ceramic Light Mode)**:
   - 🌙 **Obsidian Cyber Dark Mode**: Deep obsidian glassmorphism with glowing neon accents.
   - ☀️ **Ceramic Light Mode**: Apple & Linear-inspired ultra-clean ceramic white aesthetic with soft frosted glass and crisp typography.
   - Top-right corner me single click switch.

2. **Ultra-Smooth Gestures (YouTube Style Double-Click Seek)**:
   - Video ke **Left side par double-click** &rarr; Seek **-10s** with animated ripple.
   - Video ke **Right side par double-click** &rarr; Seek **+10s** with animated ripple.
   - Video ke **Center par double-click** &rarr; Fullscreen toggle.
   - **Single click** &rarr; Smooth play/pause.

3. **60FPS Liquid Smooth Timeline Scrubbing**:
   - Zero-stutter mouse drag scrubbing with instant timecode tooltip and buffered progress bar.

4. **Next-Level Pure Custom YouTube Engine**:
   - 🚫 **Zero YouTube Controls**: Native YouTube controls, bottom red bar, top title cards aur watermark ko 100% remove karke apna custom player overlay enforce kiya gaya hai.
   - ⚡ **Full OmniPlayer Control**: YouTube videos par bhi double-click gestures (-10s / +10s ripples), smooth play/pause center flash icon, aur mouse inactivity par automatic fade-out controls chalti hain.
   - ⏱️ **60FPS High-Precision Progress Ticker**: Real-time YouTube current time, duration aur buffer percentage tracking.
   - 🎚️ **Native Timeline Scrubbing**: YouTube video par timeline par kahin bhi drag/click karke instant bina lag seek karo.
   - 🌟 **Dynamic YouTube Ambient Glow**: YouTube video thumbnail se background me matching neon ambilight glow effect.
   - 🏷️ **Auto Title & Channel Fetching**: Link paste karte hi YouTube API / oEmbed se asli title aur channel name auto-display hota hai.
   - 🎛️ **Resolution / Quality Selector**: YouTube ke original resolutions (1080p, 720p, 480p, etc.) OmniPlayer ke glassmorphic menu se switch karo.
   - 🛡️ **Zero Third-Party UI Guarantee**: Player mein sirf aur sirf OmniPlayer ke original custom controls chalte hain. YouTube watermark, top title aur related video tiles 100% physically blocked hain.

5. **Ultra-Transparent Frosted Cinema Recommendation HUD & Movie Stream Engine**:
   - 🪟 **True Liquid Frosted Glass Transparency**: Recommendation list player stage ke upar ek dam transparent glassmorphism (`backdrop-filter: blur(34px) saturate(210%)`, `rgba(8, 12, 22, 0.45)`) ke saath floating HUD ban kar aati hai, jisse piche ka player aur background cleanly visible rehta hai.
   - 🍿 **Instant 1-Click "🍿 Recommendations" Button**: Search bar me direct button jisse bina type kiye bhi 1 click me transparent recommendation shelf open/close ho jati hai.
   - 🏷️ **Quick Category Filter Tabs**: Top par `🔥 All Trending`, `🎬 Blockbusters`, `📺 Top Series`, aur `⭐ 8.4+ Masterpieces` tabs jisse user instant category filter kar sake.
   - 🖼️ **Rich 3D Floating Poster Cards**: High-res poster image, golden rating pill (`★ 8.4`), release year tag, `4K ULTRA HD` neon badge, aur 2-line storyline preview.
   - 🎯 **Exact Match Prioritization**: Exact match hone wali movie list mein sabse upar `🎯 Exact Match` badge aur pulsating emerald live dot ke saath aati hai.
   - ⚡ **Dedicated "▶ Stream Movie / Series" Gradient Pill**: Card ya button click karte hi movie seedhe cinema mode me load ho jati hai.
   - 🎬 **Hero Stage Quick-Start HUD**: Initial player stage par cyber-cinema ambient card with 5 instant quick-stream blockbuster chips (*Fight Club, Interstellar, Inception, The Dark Knight, Oppenheimer*).
   - 🛡️ **Intelligent Controls Separation**: Movie embeds par website ke native controls 100% active rehte hain, jabki YouTube aur local files par OmniPlayer ke apne custom sleek controls enforce hote hain.
   - 🔀 **Multi-Server Switcher**: Player ke niche 5 cinema servers (Nxsha, AutoEmbed, VidLink, MultiEmbed, VidSrc) se 1-click fallback streaming.

6. **Universal Link Support & Smart Real-Time Inspector**:
   - 📺 **YouTube**: Direct links, Shorts, embeds.
   - 🎓 **Apna College / Course Websites**: Native HLS (`.m3u8`) streaming with adaptive resolution selector.
   - 🎞️ **Direct Video Streams**: MP4, WebM, OGG, MOV.
   - 📂 **Local Video Files**: Drag & drop any video file for instant zero-buffering playback.
   - 🏷️ **Smart Live Detector**: Link type karte hi format auto-detect karta hai (`YouTube Detected`, `HLS .m3u8 Stream`, etc.).
   - 📋 **1-Click Paste**: Dedicated Paste button jo clipboard se direct link copy karke play kar deta hai.

5. **300% Lecture Audio Gain Booster (Web Audio API)**:
   - Dheemi recordings aur college lectures ki aawaz ko **100% se 300% tak amplify** karne ka direct pill button.

6. **Dynamic Ambient Glow (Ambilight Engine)**:
   - Real-time canvas lighting jo screen colors ke hisaab se matching soft ambient backlight create karta hai.

7. **Timestamped Lecture Notes**:
   - Lecture dekhte waqt note type karo &rarr; current timestamp automatically save hota hai &rarr; click karte hi video usi exact second par jump karti hai &rarr; download as **Markdown (`.md`)**.

---

## 🚀 How to Run

1. Dev server start karo:
   ```bash
   npm run dev
   ```
2. Browser me open karo:
   ```
   http://localhost:5173/
   ```

---

## 🎓 Apna College Ya Kisi Bhi Website Ka Video Link Kaise Nikale?

1. Browser me Apna College lecture open karo aur video 2 seconds ke liye play karo.
2. Keyboard par **F12** (Mac par **Cmd + Option + I**) dabakar **Developer Tools** open karo.
3. **Network** tab par click karo aur filter box me `m3u8` likho.
4. List me jo `master.m3u8` ya `index.m3u8` aayega, us par Right Click karo &rarr; **Copy URL** karo.
5. OmniPlayer ke search box me paste karo aur **Play Now** dabao!

---

## ⌨️ Master Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> / <kbd>K</kbd> | Play / Pause |
| <kbd>←</kbd> / <kbd>J</kbd> | Rewind 10 Seconds |
| <kbd>→</kbd> / <kbd>L</kbd> | Forward 10 Seconds |
| <kbd>Double Click (Left / Right)</kbd> | Seek -10s / +10s with Ripple |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume Up / Down |
| <kbd>M</kbd> | Mute / Unmute |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>T</kbd> | Theatre / Cinema Mode |
| <kbd>P</kbd> | Picture-in-Picture (PiP) |
| <kbd>S</kbd> | Capture HD Snapshot |
| <kbd>N</kbd> | Focus Note Input |
| <kbd>B</kbd> | Toggle 300% Audio Boost |
