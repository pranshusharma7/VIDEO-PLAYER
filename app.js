/**
 * OmniPlayer Studio Pro — Universal High-Performance Video Player
 * Features:
 *  - Dual Theme Engine: Dark Obsidian Cyber Mode & Ceramic Light Mode
 *  - Universal Parser: YouTube, HLS (.m3u8), MP4/WebM, Vimeo, Local Files, Embedded LMS Streams
 *  - Smart Live URL Stream Detection Badge & Clipboard Auto-Paste
 *  - Dynamic Ambient Glow Backlight (Canvas-based Real-time Ambilight)
 *  - 300% Lecture Audio Gain Booster (Web Audio API for quiet teachers/lectures)
 *  - Ultra-Smooth YouTube-like Gesture Seeking (Double-click left/right for -10s/+10s with ripple)
 *  - 60fps Liquid Scrubbing with Instant Thumbnail Timecode & Buffering
 *  - Timestamped Study Notes with 1-click Timeline Seeking & Markdown Export
 *  - Master Keyboard Shortcuts
 */

// ==========================================================================
// CONSTANTS & STATE MANAGEMENT
// ==========================================================================
const STORAGE_KEYS = {
  THEME: 'omni_theme',
  AMBIENT_ENABLED: 'omni_ambient_enabled',
  AUDIO_BOOST: 'omni_audio_boost',
  RECENT_HISTORY: 'omni_recent_history',
  NOTES_PREFIX: 'omni_notes_',
};

const state = {
  theme: 'dark', // 'dark' | 'light'
  activeEngine: 'html5', // 'html5' | 'youtube' | 'iframe'
  currentUrl: '',
  currentTitle: 'Ready to stream',
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 1.0,
  isMuted: false,
  playbackRate: 1.0,
  audioBoostFactor: 1.0, // 1.0 to 3.0
  ambientEnabled: true,
  theatreMode: false,
  currentNotes: [],
  history: [],
};

// ==========================================================================
// DOM ELEMENT REFERENCES
// ==========================================================================
const elements = {
  // Theme Switcher
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeLabelText: document.getElementById('themeLabelText'),

  // Container & Stages
  playerLayout: document.getElementById('playerLayout'),
  playerWrapper: document.getElementById('playerWrapper'),
  mediaContainer: document.getElementById('mediaContainer'),
  html5Video: document.getElementById('html5Video'),
  youtubeContainer: document.getElementById('youtubePlayerContainer'),
  genericIframe: document.getElementById('genericIframe'),
  bufferingSpinner: document.getElementById('bufferingSpinner'),
  centerIndicator: document.getElementById('centerIndicator'),
  dragDropOverlay: document.getElementById('dragDropOverlay'),
  playerToast: document.getElementById('playerToast'),
  
  // Gesture Ripples
  rippleLeft: document.getElementById('rippleLeft'),
  rippleRight: document.getElementById('rippleRight'),

  // Ambient Canvas
  ambientWrapper: document.getElementById('ambientWrapper'),
  ambientCanvas: document.getElementById('ambientCanvas'),
  ambientToggleBtn: document.getElementById('ambientToggleBtn'),
  
  // Search Bar & Stream Tag
  videoUrlInput: document.getElementById('videoUrlInput'),
  streamTypeTag: document.getElementById('streamTypeTag'),
  streamTypeLabel: document.getElementById('streamTypeLabel'),
  btnPasteClipboard: document.getElementById('btnPasteClipboard'),
  btnLoadUrl: document.getElementById('btnLoadUrl'),
  localFileInput: document.getElementById('localFileInput'),
  
  // Scrubber & Timeline
  timelineContainer: document.getElementById('timelineContainer'),
  timelineTrack: document.getElementById('timelineTrack'),
  timelineProgress: document.getElementById('timelineProgress'),
  timelineBuffer: document.getElementById('timelineBuffer'),
  timelineTooltip: document.getElementById('timelineTooltip'),
  tooltipTime: document.getElementById('tooltipTime'),
  bookmarkDotsContainer: document.getElementById('bookmarkDotsContainer'),
  
  // Controls Bar
  controlsOverlay: document.getElementById('controlsOverlay'),
  btnPlayPause: document.getElementById('btnPlayPause'),
  iconPlay: document.getElementById('iconPlay'),
  iconPause: document.getElementById('iconPause'),
  btnRewind10: document.getElementById('btnRewind10'),
  btnForward10: document.getElementById('btnForward10'),
  
  // Volume & Audio Boost
  btnMute: document.getElementById('btnMute'),
  iconVolHigh: document.getElementById('iconVolHigh'),
  iconVolMuted: document.getElementById('iconVolMuted'),
  volumeSlider: document.getElementById('volumeSlider'),
  boostBadge: document.getElementById('boostBadge'),
  boostText: document.getElementById('boostText'),
  
  // Time display
  currentTime: document.getElementById('currentTime'),
  durationTime: document.getElementById('durationTime'),
  liveBadge: document.getElementById('liveBadge'),
  
  // Speed
  btnSpeedMenu: document.getElementById('btnSpeedMenu'),
  speedPopover: document.getElementById('speedPopover'),
  currentSpeedText: document.getElementById('currentSpeedText'),
  speedOptions: document.querySelectorAll('.speed-option'),
  
  // Quality
  qualityMenuWrapper: document.getElementById('qualityMenuWrapper'),
  btnQualityMenu: document.getElementById('btnQualityMenu'),
  qualityPopover: document.getElementById('qualityPopover'),
  currentQualityText: document.getElementById('currentQualityText'),
  qualityList: document.getElementById('qualityList'),
  
  // Other Player Action buttons
  btnScreenshot: document.getElementById('btnScreenshot'),
  btnPip: document.getElementById('btnPip'),
  btnTheatre: document.getElementById('btnTheatre'),
  btnFullscreen: document.getElementById('btnFullscreen'),
  iconEnterFs: document.getElementById('iconEnterFs'),
  iconExitFs: document.getElementById('iconExitFs'),
  
  // Metadata Bar
  videoTitle: document.getElementById('videoTitle'),
  badgeSource: document.getElementById('badgeSource'),
  badgeRes: document.getElementById('badgeRes'),
  badgeSpeed: document.getElementById('badgeSpeed'),
  btnCopyLink: document.getElementById('btnCopyLink'),
  subtitlesFileInput: document.getElementById('subtitlesFileInput'),
  subtitlesTrack: document.getElementById('subtitlesTrack'),
  
  // Workspace Sidebar & Tabs
  sidebarTabs: document.querySelectorAll('.tab-btn'),
  tabContentNotes: document.getElementById('tabContentNotes'),
  tabContentHistory: document.getElementById('tabContentHistory'),
  
  // Notes
  currentNoteTimestamp: document.getElementById('currentNoteTimestamp'),
  noteTextInput: document.getElementById('noteTextInput'),
  btnAddNote: document.getElementById('btnAddNote'),
  btnExportNotes: document.getElementById('btnExportNotes'),
  notesList: document.getElementById('notesList'),
  notesCount: document.getElementById('notesCount'),
  
  // History
  historyList: document.getElementById('historyList'),
  btnClearHistory: document.getElementById('btnClearHistory'),
  
  // Modals
  btnGuideModal: document.getElementById('btnGuideModal'),
  btnCloseGuide: document.getElementById('btnCloseGuide'),
  modalGuide: document.getElementById('modalGuide'),
  btnShortcutsModal: document.getElementById('btnShortcutsModal'),
  btnCloseShortcuts: document.getElementById('btnCloseShortcuts'),
  modalShortcuts: document.getElementById('modalShortcuts'),
};

// ==========================================================================
// THEME CONTROLLER (LIGHT / DARK SYSTEM)
// ==========================================================================
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  if (theme === 'light') {
    elements.themeLabelText.textContent = 'Light Mode';
    showToast('Switched to Ceramic Light Mode ☀️');
  } else {
    elements.themeLabelText.textContent = 'Dark Mode';
    showToast('Switched to Obsidian Dark Mode 🌙');
  }
}

function toggleTheme() {
  const next = (state.theme === 'dark') ? 'light' : 'dark';
  setTheme(next);
}

// ==========================================================================
// MEDIA ENGINE CONTROLLERS (HLS.js & YOUTUBE API & WEB AUDIO)
// ==========================================================================
let hlsInstance = null;
let ytPlayer = null;
let ytReady = false;
let audioCtx = null;
let audioGainNode = null;
let audioSourceNode = null;
let ambientRaf = null;
let isUserSeeking = false;
let idleTimer = null;
let clickTimeout = null;

/**
 * Initialize Web Audio API for up to 300% Lecture Audio Gain Booster
 */
function initWebAudio() {
  if (audioCtx) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
    audioGainNode = audioCtx.createGain();
    audioGainNode.gain.value = state.audioBoostFactor;
    
    // Connect HTML5 video element through the gain node
    audioSourceNode = audioCtx.createMediaElementSource(elements.html5Video);
    audioSourceNode.connect(audioGainNode);
    audioGainNode.connect(audioCtx.destination);
  } catch (err) {
    console.warn('Web Audio bound on gesture:', err);
  }
}

/**
 * Set Audio Boost Factor (1.0 = 100%, 3.0 = 300%)
 */
function setAudioBoost(factor) {
  state.audioBoostFactor = factor;
  if (!audioCtx) initWebAudio();
  if (audioGainNode && audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audioGainNode.gain.setValueAtTime(factor, audioCtx.currentTime);
  }
  
  const percentText = `${Math.round(factor * 100)}%`;
  elements.boostText.textContent = percentText;
  
  if (factor > 1.0) {
    elements.boostBadge.classList.add('boosted');
  } else {
    elements.boostBadge.classList.remove('boosted');
  }
  
  showToast(`Volume Boost: ${percentText}`);
  localStorage.setItem(STORAGE_KEYS.AUDIO_BOOST, factor);
}

// ==========================================================================
// AMBIENT GLOW BACKLIGHT CONTROLLER
// ==========================================================================
function setupAmbientGlow() {
  const canvas = elements.ambientCanvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  canvas.width = 64;
  canvas.height = 36;

  function renderAmbient() {
    if (state.ambientEnabled && state.isPlaying && state.activeEngine === 'html5') {
      if (elements.html5Video.readyState >= 2) {
        try {
          ctx.drawImage(elements.html5Video, 0, 0, canvas.width, canvas.height);
        } catch (e) {
          // Cross-origin fallback
        }
      }
    }
    ambientRaf = requestAnimationFrame(renderAmbient);
  }

  ambientRaf = requestAnimationFrame(renderAmbient);
}

function toggleAmbientGlow(forceState) {
  state.ambientEnabled = (forceState !== undefined) ? forceState : !state.ambientEnabled;
  if (state.ambientEnabled) {
    elements.ambientWrapper.classList.remove('disabled');
    elements.ambientToggleBtn.classList.remove('off');
    showToast('Ambient Glow Enabled ✨');
  } else {
    elements.ambientWrapper.classList.add('disabled');
    elements.ambientToggleBtn.classList.add('off');
    showToast('Ambient Glow Disabled');
  }
  localStorage.setItem(STORAGE_KEYS.AMBIENT_ENABLED, state.ambientEnabled);
}

// ==========================================================================
// URL PARSER & SMART DETECTOR
// ==========================================================================
function inspectUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // 1. YouTube Detection
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      label: 'YouTube Detected',
      videoId: ytMatch[1],
      url: trimmed,
      title: `YouTube Video (${ytMatch[1]})`,
    };
  }

  // 2. Vimeo Detection
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      label: 'Vimeo Stream',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      url: trimmed,
      title: `Vimeo Stream (${vimeoMatch[1]})`,
    };
  }

  // 3. HLS Stream (.m3u8) - Typical Apna College, LMS, Coursera
  if (trimmed.includes('.m3u8')) {
    return {
      type: 'hls',
      label: 'HLS (.m3u8) Stream',
      url: trimmed,
      title: extractFilenameOrDomain(trimmed, 'HLS Course Stream (.m3u8)'),
    };
  }

  // 4. Direct video file (.mp4, .webm, .ogg, etc.)
  if (trimmed.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i)) {
    return {
      type: 'mp4',
      label: 'Direct MP4 Stream',
      url: trimmed,
      title: extractFilenameOrDomain(trimmed, 'Direct Video Stream'),
    };
  }

  // 5. Iframe embed snippet
  if (trimmed.startsWith('<iframe') || trimmed.includes('/embed/')) {
    let src = trimmed;
    if (trimmed.startsWith('<iframe')) {
      const srcMatch = trimmed.match(/src=["'](.*?)["']/);
      if (srcMatch) src = srcMatch[1];
    }
    return {
      type: 'iframe',
      label: 'LMS Embed Stream',
      embedUrl: src,
      url: trimmed,
      title: 'Course Embedded Stream',
    };
  }

  // 6. Generic web stream
  return {
    type: 'generic',
    label: 'Web Media Stream',
    url: trimmed,
    title: extractFilenameOrDomain(trimmed, 'Web Media Stream'),
  };
}

function updateLiveStreamTag(url) {
  if (!url || !url.trim()) {
    elements.streamTypeTag.classList.add('hidden');
    return;
  }
  const inspection = inspectUrl(url);
  if (inspection && inspection.label) {
    elements.streamTypeLabel.textContent = inspection.label;
    elements.streamTypeTag.classList.remove('hidden');
  } else {
    elements.streamTypeTag.classList.add('hidden');
  }
}

function extractFilenameOrDomain(url, fallback) {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const last = decodeURIComponent(pathParts[pathParts.length - 1]);
      if (last.length > 3) return last;
    }
    return `${fallback} — ${parsed.hostname}`;
  } catch {
    return fallback;
  }
}

/**
 * Universal Loader: Sets up and plays the requested video
 */
function loadUniversalMedia(mediaSource) {
  if (!mediaSource) return;

  const inspection = (typeof mediaSource === 'string') 
    ? inspectUrl(mediaSource) 
    : mediaSource;

  if (!inspection) {
    showToast('⚠️ Please enter a valid video link');
    return;
  }

  resetAllEngines();

  state.currentUrl = inspection.url || inspection.embedUrl;
  state.currentTitle = inspection.title || 'OmniPlayer Media';
  updateMetadataDisplay(inspection);
  updateLiveStreamTag(state.currentUrl);

  switch (inspection.type) {
    case 'youtube':
      loadYouTubeEngine(inspection.videoId);
      break;
    case 'hls':
      loadHlsEngine(inspection.url);
      break;
    case 'mp4':
    case 'generic':
      loadHtml5Engine(inspection.url);
      break;
    case 'iframe':
      loadIframeEngine(inspection.embedUrl);
      break;
    case 'local':
      loadHtml5Engine(inspection.url, true);
      break;
  }

  loadNotesForCurrentMedia();
  addToHistory(inspection);
}

function resetAllEngines() {
  elements.html5Video.pause();
  elements.html5Video.removeAttribute('src');
  elements.html5Video.load();
  elements.html5Video.classList.remove('hidden');

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  elements.youtubeContainer.classList.add('hidden');
  if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
    ytPlayer.stopVideo();
  }

  elements.genericIframe.classList.add('hidden');
  elements.genericIframe.src = 'about:blank';

  state.isPlaying = false;
  state.currentTime = 0;
  state.duration = 0;
  updatePlayPauseUI(false);
  updateProgressBar(0, 0);
  elements.qualityMenuWrapper.style.display = 'none';
  elements.liveBadge.classList.add('hidden');
}

// ==========================================================================
// 1. HTML5 DIRECT & LOCAL ENGINE
// ==========================================================================
function loadHtml5Engine(url, isLocal = false) {
  state.activeEngine = 'html5';
  elements.html5Video.classList.remove('hidden');
  showBuffering(true);

  elements.html5Video.src = url;
  elements.html5Video.playbackRate = state.playbackRate;
  elements.html5Video.volume = state.isMuted ? 0 : state.volume;

  elements.html5Video.play().then(() => {
    state.isPlaying = true;
    updatePlayPauseUI(true);
    showBuffering(false);
    flashCenterIndicator('play');
    initWebAudio();
  }).catch((err) => {
    console.warn('Autoplay waiting for gesture:', err);
    showBuffering(false);
  });
}

// ==========================================================================
// 2. HLS (.m3u8) STREAM ENGINE
// ==========================================================================
function loadHlsEngine(url) {
  state.activeEngine = 'html5';
  elements.html5Video.classList.remove('hidden');
  showBuffering(true);

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });

    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(elements.html5Video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      showBuffering(false);
      populateQualitySelector(data.levels);
      
      elements.html5Video.play().then(() => {
        state.isPlaying = true;
        updatePlayPauseUI(true);
        initWebAudio();
      }).catch(() => {});
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            showToast('⚠️ Stream network reconnecting...');
            hlsInstance.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            showToast('⚠️ Stream recovering...');
            hlsInstance.recoverMediaError();
            break;
          default:
            showToast('⚠️ Stream cannot be played directly due to CORS/auth.');
            hlsInstance.destroy();
            break;
        }
      }
    });
  } else if (elements.html5Video.canPlayType('application/vnd.apple.mpegurl')) {
    elements.html5Video.src = url;
    elements.html5Video.play().catch(() => {});
    showBuffering(false);
  } else {
    showToast('⚠️ HLS streaming is not supported on this browser.');
    showBuffering(false);
  }
}

function populateQualitySelector(levels) {
  if (!levels || levels.length <= 1) {
    elements.qualityMenuWrapper.style.display = 'none';
    return;
  }

  elements.qualityMenuWrapper.style.display = 'block';
  elements.qualityList.innerHTML = '';

  const autoBtn = document.createElement('button');
  autoBtn.className = 'quality-option active';
  autoBtn.dataset.level = '-1';
  autoBtn.textContent = 'Auto (Optimal)';
  autoBtn.addEventListener('click', () => setHlsQuality(-1, 'Auto'));
  elements.qualityList.appendChild(autoBtn);

  levels.forEach((lvl, idx) => {
    const res = lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`;
    const btn = document.createElement('button');
    btn.className = 'quality-option';
    btn.dataset.level = idx;
    btn.textContent = res;
    btn.addEventListener('click', () => setHlsQuality(idx, res));
    elements.qualityList.appendChild(btn);
  });
}

function setHlsQuality(levelIdx, label) {
  if (!hlsInstance) return;
  hlsInstance.currentLevel = levelIdx;
  elements.currentQualityText.textContent = label;
  
  elements.qualityList.querySelectorAll('.quality-option').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.level, 10) === levelIdx);
  });
  
  elements.qualityPopover.classList.remove('open');
  showToast(`Quality: ${label}`);
}

// ==========================================================================
// 3. YOUTUBE IFRAME ENGINE
// ==========================================================================
window.onYouTubeIframeAPIReady = function() {
  ytReady = true;
};

function loadYouTubeEngine(videoId) {
  state.activeEngine = 'youtube';
  elements.html5Video.classList.add('hidden');
  elements.youtubeContainer.classList.remove('hidden');
  showBuffering(true);

  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    ytPlayer.loadVideoById(videoId);
    showBuffering(false);
    return;
  }

  ytPlayer = new YT.Player('youtubePlayerContainer', {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      enablejsapi: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: (e) => {
        showBuffering(false);
        e.target.playVideo();
        state.isPlaying = true;
        updatePlayPauseUI(true);
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          state.isPlaying = true;
          updatePlayPauseUI(true);
          showBuffering(false);
        } else if (e.data === YT.PlayerState.PAUSED) {
          state.isPlaying = false;
          updatePlayPauseUI(false);
        } else if (e.data === YT.PlayerState.BUFFERING) {
          showBuffering(true);
        }
      },
      onError: (e) => {
        showBuffering(false);
        showToast('⚠️ YouTube video embedding restricted or unavailable.');
      }
    }
  });
}

// ==========================================================================
// 4. GENERIC / LMS EMBED IFRAME ENGINE
// ==========================================================================
function loadIframeEngine(embedUrl) {
  state.activeEngine = 'iframe';
  elements.html5Video.classList.add('hidden');
  elements.genericIframe.classList.remove('hidden');
  elements.genericIframe.src = embedUrl;
  showBuffering(false);
  showToast('Playing in Protected Embedded Mode');
}

// ==========================================================================
// PLAYBACK CONTROLS & GESTURES
// ==========================================================================
function togglePlayPause() {
  if (state.activeEngine === 'html5') {
    if (elements.html5Video.paused || elements.html5Video.ended) {
      elements.html5Video.play().then(() => {
        state.isPlaying = true;
        updatePlayPauseUI(true);
        flashCenterIndicator('play');
        initWebAudio();
      }).catch(() => {});
    } else {
      elements.html5Video.pause();
      state.isPlaying = false;
      updatePlayPauseUI(false);
      flashCenterIndicator('pause');
    }
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    const ytState = ytPlayer.getPlayerState();
    if (ytState === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      state.isPlaying = false;
      updatePlayPauseUI(false);
      flashCenterIndicator('pause');
    } else {
      ytPlayer.playVideo();
      state.isPlaying = true;
      updatePlayPauseUI(true);
      flashCenterIndicator('play');
    }
  }
}

function seekRelative(deltaSeconds) {
  if (state.activeEngine === 'html5') {
    const target = Math.max(0, Math.min(elements.html5Video.duration || 0, elements.html5Video.currentTime + deltaSeconds));
    elements.html5Video.currentTime = target;
    showToast(`${deltaSeconds > 0 ? '+' : ''}${deltaSeconds}s`);
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    const cur = ytPlayer.getCurrentTime();
    ytPlayer.seekTo(cur + deltaSeconds, true);
    showToast(`${deltaSeconds > 0 ? '+' : ''}${deltaSeconds}s`);
  }
}

function showRipple(direction) {
  const el = direction === 'left' ? elements.rippleLeft : elements.rippleRight;
  if (!el) return;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 450);
}

function handleMediaContainerClick(e) {
  // If clicked inside controls bar or popovers, do nothing
  if (e.target.closest('.omni-controls-overlay') || e.target.closest('.dropdown-popover') || e.target.closest('.modal-backdrop')) {
    return;
  }

  const rect = elements.mediaContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;

  if (clickTimeout) {
    // Double click detected!
    clearTimeout(clickTimeout);
    clickTimeout = null;

    if (clickX < width * 0.38) {
      // Left side double click: rewind 10s
      seekRelative(-10);
      showRipple('left');
    } else if (clickX > width * 0.62) {
      // Right side double click: forward 10s
      seekRelative(10);
      showRipple('right');
    } else {
      // Center double click: toggle fullscreen
      toggleFullscreen();
    }
  } else {
    // Single click: wait 220ms before toggling play/pause
    clickTimeout = setTimeout(() => {
      clickTimeout = null;
      togglePlayPause();
    }, 220);
  }
}

function seekToPercentage(pct) {
  if (state.activeEngine === 'html5' && elements.html5Video.duration) {
    elements.html5Video.currentTime = elements.html5Video.duration * (pct / 100);
    showToast(`Seek to ${pct}%`);
  }
}

function setPlaybackSpeed(rate) {
  state.playbackRate = rate;
  if (state.activeEngine === 'html5') {
    elements.html5Video.playbackRate = rate;
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    ytPlayer.setPlaybackRate(rate);
  }
  
  elements.currentSpeedText.textContent = `${rate}x`;
  elements.badgeSpeed.textContent = `${rate}x`;
  elements.speedOptions.forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === rate);
  });
  elements.speedPopover.classList.remove('open');
  showToast(`Speed: ${rate}x`);
}

function setVolume(val) {
  const clamped = Math.max(0, Math.min(1, val));
  state.volume = clamped;
  state.isMuted = (clamped === 0);
  
  elements.volumeSlider.value = clamped;
  if (state.activeEngine === 'html5') {
    elements.html5Video.volume = clamped;
    elements.html5Video.muted = state.isMuted;
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    ytPlayer.setVolume(clamped * 100);
  }
  updateVolumeUI();
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  if (state.activeEngine === 'html5') {
    elements.html5Video.muted = state.isMuted;
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    if (state.isMuted) ytPlayer.mute();
    else ytPlayer.unMute();
  }
  updateVolumeUI();
  showToast(state.isMuted ? 'Muted' : 'Unmuted');
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    elements.playerWrapper.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function toggleTheatreMode() {
  state.theatreMode = !state.theatreMode;
  elements.playerLayout.classList.toggle('theatre-mode', state.theatreMode);
  showToast(state.theatreMode ? 'Cinema Theatre Mode' : 'Standard View');
}

async function togglePictureInPicture() {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (elements.html5Video !== document.pictureInPictureElement) {
      await elements.html5Video.requestPictureInPicture();
    }
  } catch (err) {
    showToast('⚠️ Picture-in-Picture not supported');
  }
}

function captureScreenshot() {
  if (state.activeEngine !== 'html5' || !elements.html5Video.videoWidth) {
    showToast('⚠️ Screenshot works with direct/HLS streams');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = elements.html5Video.videoWidth;
  canvas.height = elements.html5Video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(elements.html5Video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `OmniPlayer-Snapshot-${formatTimecode(elements.html5Video.currentTime).replace(':', '-')}.png`;
    a.click();
    showToast('📸 HD Frame Snapshot Saved!');
  }, 'image/png');
}

// ==========================================================================
// STUDY NOTES SYSTEM
// ==========================================================================
function getCurrentTime() {
  if (state.activeEngine === 'html5') {
    return elements.html5Video.currentTime || 0;
  } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    return ytPlayer.getCurrentTime() || 0;
  }
  return 0;
}

function getNotesStorageKey() {
  return `${STORAGE_KEYS.NOTES_PREFIX}${encodeURIComponent(state.currentUrl || 'default')}`;
}

function loadNotesForCurrentMedia() {
  const key = getNotesStorageKey();
  try {
    const raw = localStorage.getItem(key);
    state.currentNotes = raw ? JSON.parse(raw) : [];
  } catch {
    state.currentNotes = [];
  }
  renderNotesList();
  renderTimelineBookmarks();
}

function saveNotesForCurrentMedia() {
  const key = getNotesStorageKey();
  localStorage.setItem(key, JSON.stringify(state.currentNotes));
  renderNotesList();
  renderTimelineBookmarks();
}

function addNote() {
  const text = elements.noteTextInput.value.trim();
  if (!text) return;

  const timestamp = getCurrentTime();
  const newNote = {
    id: Date.now(),
    timestamp: timestamp,
    timecode: formatTimecode(timestamp),
    text: text,
    createdAt: new Date().toLocaleTimeString(),
  };

  state.currentNotes.push(newNote);
  state.currentNotes.sort((a, b) => a.timestamp - b.timestamp);
  saveNotesForCurrentMedia();

  elements.noteTextInput.value = '';
  showToast(`Note saved at ${newNote.timecode}`);
}

function deleteNote(id) {
  state.currentNotes = state.currentNotes.filter(n => n.id !== id);
  saveNotesForCurrentMedia();
  showToast('Note deleted');
}

function seekToNote(timestamp) {
  if (state.activeEngine === 'html5') {
    elements.html5Video.currentTime = timestamp;
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    ytPlayer.seekTo(timestamp, true);
  }
  showToast(`Jumped to note at ${formatTimecode(timestamp)}`);
}

function renderNotesList() {
  elements.notesCount.textContent = state.currentNotes.length;
  if (state.currentNotes.length === 0) {
    elements.notesList.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
        <p>No notes for this video yet.</p>
        <span>Add timestamped notes while studying lectures!</span>
      </div>
    `;
    return;
  }

  elements.notesList.innerHTML = state.currentNotes.map(n => `
    <div class="note-item" data-id="${n.id}">
      <span class="note-stamp" onclick="window.seekToNote(${n.timestamp})">${n.timecode}</span>
      <div class="note-content">${escapeHtml(n.text)}</div>
      <button class="note-delete-btn" onclick="window.deleteNote(${n.id})" title="Delete Note">✕</button>
    </div>
  `).join('');
}

function renderTimelineBookmarks() {
  elements.bookmarkDotsContainer.innerHTML = '';
  if (!state.duration || state.currentNotes.length === 0) return;

  state.currentNotes.forEach(n => {
    const pct = (n.timestamp / state.duration) * 100;
    const dot = document.createElement('div');
    dot.className = 'bookmark-dot';
    dot.style.left = `${pct}%`;
    dot.title = `[${n.timecode}] ${n.text}`;
    elements.bookmarkDotsContainer.appendChild(dot);
  });
}

function exportNotesAsMarkdown() {
  if (state.currentNotes.length === 0) {
    showToast('⚠️ No notes to export');
    return;
  }

  let md = `# Lecture Notes — ${state.currentTitle}\n`;
  md += `**Stream Source:** ${state.currentUrl}\n`;
  md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
  md += `| Timestamp | Note |\n|:---:|:---|\n`;

  state.currentNotes.forEach(n => {
    md += `| \`${n.timecode}\` | ${n.text} |\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Lecture-Notes-${state.currentTitle.replace(/[^\w-]/g, '_')}.md`;
  a.click();
  showToast('Notes downloaded as Markdown 📝');
}

window.seekToNote = seekToNote;
window.deleteNote = deleteNote;

// ==========================================================================
// WATCH HISTORY & RECENT STREAM MANAGEMENT
// ==========================================================================
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_HISTORY);
    state.history = raw ? JSON.parse(raw) : [];
  } catch {
    state.history = [];
  }
  renderHistoryList();
}

function addToHistory(item) {
  state.history = state.history.filter(h => h.url !== item.url);
  state.history.unshift({
    url: item.url,
    title: item.title,
    type: item.type,
    timestamp: new Date().toLocaleDateString(),
  });
  state.history = state.history.slice(0, 15);
  localStorage.setItem(STORAGE_KEYS.RECENT_HISTORY, JSON.stringify(state.history));
  renderHistoryList();
}

function renderHistoryList() {
  if (state.history.length === 0) {
    elements.historyList.innerHTML = `
      <div class="empty-placeholder">
        <p>No recently played streams.</p>
      </div>
    `;
    return;
  }

  elements.historyList.innerHTML = state.history.map(h => `
    <div class="history-item" data-url="${escapeHtml(h.url)}">
      <div class="history-icon">▶</div>
      <div class="history-info">
        <span class="history-title">${escapeHtml(h.title)}</span>
        <span class="history-sub"><span>${h.type.toUpperCase()}</span> • <span>${h.timestamp}</span></span>
      </div>
    </div>
  `).join('');

  elements.historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('data-url');
      loadUniversalMedia(url);
    });
  });
}

function clearAllHistory() {
  state.history = [];
  localStorage.removeItem(STORAGE_KEYS.RECENT_HISTORY);
  renderHistoryList();
  showToast('History Cleared');
}

// ==========================================================================
// UI UPDATES & HELPERS
// ==========================================================================
function updatePlayPauseUI(playing) {
  if (playing) {
    elements.iconPlay.classList.add('hidden');
    elements.iconPause.classList.remove('hidden');
    elements.btnPlayPause.title = 'Pause (Space / K)';
  } else {
    elements.iconPlay.classList.remove('hidden');
    elements.iconPause.classList.add('hidden');
    elements.btnPlayPause.title = 'Play (Space / K)';
  }
}

function updateVolumeUI() {
  if (state.isMuted || state.volume === 0) {
    elements.iconVolHigh.classList.add('hidden');
    elements.iconVolMuted.classList.remove('hidden');
  } else {
    elements.iconVolHigh.classList.remove('hidden');
    elements.iconVolMuted.classList.add('hidden');
  }
}

function updateProgressBar(currentTime, duration) {
  if (isUserSeeking) return;
  state.currentTime = currentTime;
  state.duration = duration;

  elements.currentTime.textContent = formatTimecode(currentTime);
  elements.currentNoteTimestamp.textContent = formatTimecode(currentTime);

  if (duration && !isNaN(duration) && duration !== Infinity) {
    elements.durationTime.textContent = formatTimecode(duration);
    const progressPct = (currentTime / duration) * 100;
    elements.timelineProgress.style.width = `${progressPct}%`;
  } else {
    elements.durationTime.textContent = '--:--';
    elements.timelineProgress.style.width = '0%';
  }

  if (elements.html5Video.buffered && elements.html5Video.buffered.length > 0 && duration) {
    const end = elements.html5Video.buffered.end(elements.html5Video.buffered.length - 1);
    const bufPct = (end / duration) * 100;
    elements.timelineBuffer.style.width = `${bufPct}%`;
  }
}

function formatTimecode(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function flashCenterIndicator(iconType) {
  const icon = elements.centerIndicator.querySelector('svg');
  if (iconType === 'play') {
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  } else {
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
  }
  elements.centerIndicator.classList.add('flash');
  setTimeout(() => elements.centerIndicator.classList.remove('flash'), 300);
}

function showBuffering(loading) {
  elements.bufferingSpinner.classList.toggle('active', loading);
}

let toastTimer = null;
function showToast(msg) {
  clearTimeout(toastTimer);
  elements.playerToast.textContent = msg;
  elements.playerToast.classList.add('active');
  toastTimer = setTimeout(() => {
    elements.playerToast.classList.remove('active');
  }, 2000);
}

function updateMetadataDisplay(meta) {
  elements.videoTitle.textContent = meta.title;
  elements.badgeSource.textContent = meta.type.toUpperCase();
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function resetIdleTimer() {
  elements.playerWrapper.classList.remove('user-idle');
  clearTimeout(idleTimer);
  if (state.isPlaying) {
    idleTimer = setTimeout(() => {
      elements.playerWrapper.classList.add('user-idle');
    }, 2800);
  }
}

// ==========================================================================
// EVENT LISTENERS BINDINGS
// ==========================================================================
function bindEvents() {
  // Theme Toggle Button
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // Play / Pause & Double-click Gestures on Video Stage
  elements.btnPlayPause.addEventListener('click', togglePlayPause);
  elements.mediaContainer.addEventListener('click', handleMediaContainerClick);

  elements.html5Video.addEventListener('timeupdate', () => {
    updateProgressBar(elements.html5Video.currentTime, elements.html5Video.duration);
  });

  elements.html5Video.addEventListener('loadedmetadata', () => {
    updateProgressBar(elements.html5Video.currentTime, elements.html5Video.duration);
    renderTimelineBookmarks();
    if (elements.html5Video.videoWidth) {
      elements.badgeRes.textContent = `${elements.html5Video.videoHeight}p`;
    }
  });

  elements.html5Video.addEventListener('waiting', () => showBuffering(true));
  elements.html5Video.addEventListener('playing', () => {
    showBuffering(false);
    state.isPlaying = true;
    updatePlayPauseUI(true);
  });
  elements.html5Video.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayPauseUI(false);
  });

  // Rewind & Forward Buttons
  elements.btnRewind10.addEventListener('click', () => seekRelative(-10));
  elements.btnForward10.addEventListener('click', () => seekRelative(10));

  // Volume
  elements.volumeSlider.addEventListener('input', (e) => setVolume(parseFloat(e.target.value)));
  elements.btnMute.addEventListener('click', toggleMute);

  // 300% Boost Pill (100% -> 200% -> 300% -> 100%)
  elements.boostBadge.addEventListener('click', () => {
    if (state.audioBoostFactor === 1.0) setAudioBoost(2.0);
    else if (state.audioBoostFactor === 2.0) setAudioBoost(3.0);
    else setAudioBoost(1.0);
  });

  // 60FPS Silky Smooth Timeline Scrubbing
  let isScrubbing = false;

  function performScrub(e) {
    const rect = elements.timelineTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    elements.timelineProgress.style.width = `${pos * 100}%`;
    if (state.duration) {
      const targetSec = pos * state.duration;
      elements.currentTime.textContent = formatTimecode(targetSec);
      elements.tooltipTime.textContent = formatTimecode(targetSec);
      elements.timelineTooltip.style.left = `${pos * 100}%`;
      if (state.activeEngine === 'html5') {
        elements.html5Video.currentTime = targetSec;
      } else if (state.activeEngine === 'youtube' && ytPlayer) {
        ytPlayer.seekTo(targetSec, true);
      }
    }
  }

  elements.timelineContainer.addEventListener('mousemove', (e) => {
    if (!isScrubbing) {
      const rect = elements.timelineTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (state.duration) {
        const hoverSec = pos * state.duration;
        elements.tooltipTime.textContent = formatTimecode(hoverSec);
        elements.timelineTooltip.style.left = `${pos * 100}%`;
      }
    }
  });

  elements.timelineContainer.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    isUserSeeking = true;
    performScrub(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isScrubbing) {
      performScrub(e);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isScrubbing) {
      isScrubbing = false;
      setTimeout(() => { isUserSeeking = false; }, 60);
    }
  });

  // Speed Popover
  elements.btnSpeedMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.speedPopover.classList.toggle('open');
    elements.qualityPopover.classList.remove('open');
  });

  elements.speedOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      setPlaybackSpeed(parseFloat(btn.dataset.speed));
    });
  });

  // Quality Popover
  elements.btnQualityMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.qualityPopover.classList.toggle('open');
    elements.speedPopover.classList.remove('open');
  });

  window.addEventListener('click', () => {
    elements.speedPopover.classList.remove('open');
    elements.qualityPopover.classList.remove('open');
  });

  // Theatre, Fullscreen, PiP, Screenshot
  elements.btnTheatre.addEventListener('click', toggleTheatreMode);
  elements.btnFullscreen.addEventListener('click', toggleFullscreen);
  elements.btnPip.addEventListener('click', togglePictureInPicture);
  elements.btnScreenshot.addEventListener('click', captureScreenshot);

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    elements.iconEnterFs.classList.toggle('hidden', isFs);
    elements.iconExitFs.classList.toggle('hidden', !isFs);
  });

  // Ambient Glow Toggle
  elements.ambientToggleBtn.addEventListener('click', () => toggleAmbientGlow());

  // Search URL Bar & Live Stream Detection
  elements.videoUrlInput.addEventListener('input', (e) => {
    updateLiveStreamTag(e.target.value);
  });

  elements.btnLoadUrl.addEventListener('click', () => {
    const url = elements.videoUrlInput.value.trim();
    if (url) loadUniversalMedia(url);
  });
  elements.videoUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const url = elements.videoUrlInput.value.trim();
      if (url) loadUniversalMedia(url);
    }
  });

  // Paste from Clipboard Button
  elements.btnPasteClipboard.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        elements.videoUrlInput.value = text.trim();
        updateLiveStreamTag(text.trim());
        loadUniversalMedia(text.trim());
        showToast('Link pasted & loaded!');
      } else {
        showToast('Clipboard is empty');
      }
    } catch (err) {
      elements.videoUrlInput.focus();
      showToast('Press Cmd+V / Ctrl+V to paste');
    }
  });

  // Local File Upload
  elements.localFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      loadUniversalMedia({
        type: 'local',
        url: localUrl,
        title: file.name,
      });
      showToast(`Loaded: ${file.name}`);
    }
  });

  // Subtitles File Upload
  elements.subtitlesFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const subUrl = URL.createObjectURL(file);
      elements.subtitlesTrack.src = subUrl;
      showToast(`Subtitles loaded: ${file.name}`);
    }
  });

  // Share / Copy Link
  elements.btnCopyLink.addEventListener('click', () => {
    if (state.currentUrl) {
      navigator.clipboard.writeText(state.currentUrl).then(() => {
        showToast('Link copied to clipboard! 📋');
      }).catch(() => {});
    }
  });

  // Drag & Drop onto Player
  elements.playerWrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dragDropOverlay.classList.add('active');
  });
  elements.playerWrapper.addEventListener('dragleave', (e) => {
    if (!elements.playerWrapper.contains(e.relatedTarget)) {
      elements.dragDropOverlay.classList.remove('active');
    }
  });
  elements.playerWrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dragDropOverlay.classList.remove('active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const localUrl = URL.createObjectURL(file);
      loadUniversalMedia({
        type: 'local',
        url: localUrl,
        title: file.name,
      });
      showToast(`Playing dropped file: ${file.name}`);
    }
  });

  // Study Notes
  elements.btnAddNote.addEventListener('click', addNote);
  elements.noteTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addNote();
  });
  elements.btnExportNotes.addEventListener('click', exportNotesAsMarkdown);

  // Tabs Switcher
  elements.sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.sidebarTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      elements.tabContentNotes.classList.toggle('active', target === 'notes');
      elements.tabContentHistory.classList.toggle('active', target === 'history');
    });
  });

  elements.btnClearHistory.addEventListener('click', clearAllHistory);

  // Modals
  elements.btnGuideModal.addEventListener('click', () => elements.modalGuide.classList.remove('hidden'));
  elements.btnCloseGuide.addEventListener('click', () => elements.modalGuide.classList.add('hidden'));
  elements.modalGuide.addEventListener('click', (e) => {
    if (e.target === elements.modalGuide) elements.modalGuide.classList.add('hidden');
  });

  elements.btnShortcutsModal.addEventListener('click', () => elements.modalShortcuts.classList.remove('hidden'));
  elements.btnCloseShortcuts.addEventListener('click', () => elements.modalShortcuts.classList.add('hidden'));
  elements.modalShortcuts.addEventListener('click', (e) => {
    if (e.target === elements.modalShortcuts) elements.modalShortcuts.classList.add('hidden');
  });

  // Controls Idle tracking
  elements.playerWrapper.addEventListener('mousemove', resetIdleTimer);
  elements.playerWrapper.addEventListener('mouseleave', () => {
    if (state.isPlaying) elements.playerWrapper.classList.add('user-idle');
  });

  // Master Keyboard Shortcuts
  window.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  if (activeTag === 'input' || activeTag === 'textarea') return;

  switch (e.key.toLowerCase()) {
    case ' ':
    case 'k':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'arrowleft':
    case 'j':
      e.preventDefault();
      seekRelative(-10);
      showRipple('left');
      break;
    case 'arrowright':
    case 'l':
      e.preventDefault();
      seekRelative(10);
      showRipple('right');
      break;
    case 'arrowup':
      e.preventDefault();
      setVolume(state.volume + 0.1);
      break;
    case 'arrowdown':
      e.preventDefault();
      setVolume(state.volume - 0.1);
      break;
    case 'm':
      e.preventDefault();
      toggleMute();
      break;
    case 'f':
      e.preventDefault();
      toggleFullscreen();
      break;
    case 't':
      e.preventDefault();
      toggleTheatreMode();
      break;
    case 'p':
      e.preventDefault();
      togglePictureInPicture();
      break;
    case 's':
      e.preventDefault();
      captureScreenshot();
      break;
    case 'n':
      e.preventDefault();
      elements.noteTextInput.focus();
      break;
    case 'b':
      e.preventDefault();
      elements.boostBadge.click();
      break;
    default:
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        seekToPercentage(parseInt(e.key, 10) * 10);
      }
      break;
  }
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
function initApp() {
  bindEvents();
  setupAmbientGlow();
  loadHistory();

  // Load saved theme
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  setTheme(savedTheme);

  // Load saved preferences
  const savedAmbient = localStorage.getItem(STORAGE_KEYS.AMBIENT_ENABLED);
  if (savedAmbient !== null) {
    toggleAmbientGlow(savedAmbient === 'true');
  }

  const savedBoost = localStorage.getItem(STORAGE_KEYS.AUDIO_BOOST);
  if (savedBoost !== null) {
    setAudioBoost(parseFloat(savedBoost));
  }

  // Pre-load default demo stream
  loadUniversalMedia('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
