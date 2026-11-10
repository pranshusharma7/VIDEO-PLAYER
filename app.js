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
  PLAYBACK_POSITIONS: 'omni_playback_positions',
  CUSTOM_EMBED_TEMPLATE: 'omni_embed_template',
};

const state = {
  theme: 'dark', // 'dark' | 'light'
  activeEngine: 'html5', // 'html5' | 'youtube' | 'iframe' | 'cinema'
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
  currentYoutubeId: '',
  currentNotes: [],
  history: [],
  // A-B Loop State
  loopA: null,
  loopB: null,
  loopActive: false,
  // Video Filter & Shaders
  activeFilter: 'normal',
  // Smart Resume
  pendingResumeTime: 0,
  // Movie Embed Server
  embedServerTemplate: 'https://nxsha.space/embed/movie/{id}',
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
  youtubeWrapper: document.getElementById('youtubeWrapper'),
  youtubeContainer: document.getElementById('youtubePlayerContainer'),
  youtubeShield: document.getElementById('youtubeShield'),
  videoEndOverlay: document.getElementById('videoEndOverlay'),
  endVideoTitle: document.getElementById('endVideoTitle'),
  btnReplayVideo: document.getElementById('btnReplayVideo'),
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
  
  // Search Bar, Stream Tag & Movie Search
  videoUrlInput: document.getElementById('videoUrlInput'),
  streamTypeTag: document.getElementById('streamTypeTag'),
  streamTypeLabel: document.getElementById('streamTypeLabel'),
  movieSearchDropdown: document.getElementById('movieSearchDropdown'),
  movieResultsList: document.getElementById('movieResultsList'),
  movieResultsTitle: document.getElementById('movieResultsTitle'),
  btnCloseMovieResults: document.getElementById('btnCloseMovieResults'),
  btnBrowseMovies: document.getElementById('btnBrowseMovies'),
  movieFilterBar: document.getElementById('movieFilterBar'),
  playerHeroSplash: document.getElementById('playerHeroSplash'),
  btnPasteClipboard: document.getElementById('btnPasteClipboard'),
  btnLoadUrl: document.getElementById('btnLoadUrl'),
  localFileInput: document.getElementById('localFileInput'),
  
  // Scrubber & Timeline
  timelineContainer: document.getElementById('timelineContainer'),
  timelineTrack: document.getElementById('timelineTrack'),
  timelineProgress: document.getElementById('timelineProgress'),
  timelineBuffer: document.getElementById('timelineBuffer'),
  timelineLoopRange: document.getElementById('timelineLoopRange'),
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
  
  // A-B Loop Button
  btnLoop: document.getElementById('btnLoop'),
  loopBadgeText: document.getElementById('loopBadgeText'),

  // Video Filters & Shaders
  btnFilterMenu: document.getElementById('btnFilterMenu'),
  filterPopover: document.getElementById('filterPopover'),
  filterOptions: document.querySelectorAll('.filter-option'),

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
  
  // Smart Resume Banner
  resumeBanner: document.getElementById('resumeBanner'),
  resumeTimeText: document.getElementById('resumeTimeText'),
  btnResumeYes: document.getElementById('btnResumeYes'),
  btnResumeNo: document.getElementById('btnResumeNo'),

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

  // DRM Modal
  modalDrm: document.getElementById('modalDrm'),
  btnCloseDrm: document.getElementById('btnCloseDrm'),
  btnLaunchHotstarPopout: document.getElementById('btnLaunchHotstarPopout'),
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
let ytThumbnailImg = null;

function updateYouTubeAmbientGlow(videoId) {
  if (!videoId) return;
  ytThumbnailImg = new Image();
  ytThumbnailImg.crossOrigin = 'anonymous';
  ytThumbnailImg.onload = () => {
    if (state.ambientEnabled) {
      try {
        const canvas = elements.ambientCanvas;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(ytThumbnailImg, 0, 0, canvas.width, canvas.height);
      } catch (e) {}
    }
  };
  ytThumbnailImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function setupAmbientGlow() {
  const canvas = elements.ambientCanvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  canvas.width = 64;
  canvas.height = 36;

  function renderAmbient() {
    if (state.ambientEnabled && state.isPlaying) {
      if (state.activeEngine === 'html5' && elements.html5Video.readyState >= 2) {
        try {
          ctx.drawImage(elements.html5Video, 0, 0, canvas.width, canvas.height);
        } catch (e) {
          // Cross-origin fallback
        }
      } else if (state.activeEngine === 'youtube' && ytThumbnailImg && ytThumbnailImg.complete) {
        try {
          ctx.drawImage(ytThumbnailImg, 0, 0, canvas.width, canvas.height);
        } catch (e) {}
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

  // 3. Cinema Movie Embed Server (Nxsha, Vidsrc, 2Embed, etc.)
  if (trimmed.includes('nxsha.space') || trimmed.includes('/embed/movie/') || trimmed.includes('/embed/tv/')) {
    let src = trimmed;
    if (trimmed.startsWith('<iframe')) {
      const srcMatch = trimmed.match(/src=["'](.*?)["']/);
      if (srcMatch) src = srcMatch[1];
    }
    const idMatch = src.match(/embed\/(?:movie|tv)\/([a-zA-Z0-9_-]+)/i);
    const id = idMatch ? idMatch[1] : '';
    return {
      type: 'cinema',
      label: '🎬 Cinema Movie Stream',
      embedUrl: src,
      url: trimmed,
      title: id ? `Movie Stream (ID: ${id})` : 'Cinema Movie Stream',
    };
  }

  // 4. JioHotstar / JioCinema / DRM Stream Detection
  if (trimmed.match(/(?:hotstar\.com|jiocinema\.com|jiohotstar\.com)/i)) {
    return {
      type: 'drm',
      label: '🔒 JioHotstar (DRM)',
      url: trimmed,
      title: 'JioHotstar Stream (DRM Encrypted)',
    };
  }

  // 5. HLS Stream (.m3u8) - Typical Apna College, LMS, Coursera
  if (trimmed.includes('.m3u8')) {
    return {
      type: 'hls',
      label: 'HLS (.m3u8) Stream',
      url: trimmed,
      title: extractFilenameOrDomain(trimmed, 'HLS Course Stream (.m3u8)'),
    };
  }

  // 6. Direct video file (.mp4, .webm, .ogg, etc.)
  if (trimmed.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i)) {
    return {
      type: 'mp4',
      label: 'Direct MP4 Stream',
      url: trimmed,
      title: extractFilenameOrDomain(trimmed, 'Direct Video Stream'),
    };
  }

  // 7. Generic Iframe embed snippet
  if (trimmed.startsWith('<iframe') || trimmed.includes('/embed/')) {
    let src = trimmed;
    if (trimmed.startsWith('<iframe')) {
      const srcMatch = trimmed.match(/src=["'](.*?)["']/);
      if (srcMatch) src = srcMatch[1];
    }
    return {
      type: 'iframe',
      label: 'Embedded Web Stream',
      embedUrl: src,
      url: trimmed,
      title: 'Embedded Web Stream',
    };
  }

  // 8. Generic web stream
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

  // Handle DRM Protected Streams
  if (inspection.type === 'drm') {
    state.currentUrl = inspection.url;
    elements.modalDrm.classList.remove('hidden');
    showToast('🔒 JioHotstar DRM stream detected');
    return;
  }

  resetAllEngines();

  if (elements.playerHeroSplash) {
    elements.playerHeroSplash.classList.add('hidden');
  }

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
    case 'cinema':
    case 'iframe':
      loadIframeEngine(inspection.embedUrl || inspection.url);
      break;
    case 'local':
      loadHtml5Engine(inspection.url, true);
      break;
  }

  loadNotesForCurrentMedia();
  addToHistory(inspection);
  checkAndPromptResume(state.currentUrl);
}

function resetAllEngines() {
  stopYouTubeTicker();
  elements.playerWrapper.classList.remove('cinema-iframe-mode');
  elements.controlsOverlay.classList.remove('hidden');
  elements.html5Video.pause();
  elements.html5Video.removeAttribute('src');
  elements.html5Video.load();
  elements.html5Video.classList.remove('hidden');

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  elements.youtubeWrapper.classList.add('hidden');
  elements.videoEndOverlay.classList.add('hidden');
  if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
    try {
      ytPlayer.stopVideo();
    } catch (e) {}
  }

  elements.genericIframe.classList.add('hidden');
  elements.genericIframe.src = 'about:blank';
  const serverSelector = document.getElementById('cinemaServerSelector');
  if (serverSelector) serverSelector.classList.add('hidden');
  state.currentCinemaMedia = null;

  state.isPlaying = false;
  state.currentTime = 0;
  state.duration = 0;
  updatePlayPauseUI(false);
  updateProgressBar(0, 0);
  elements.qualityMenuWrapper.style.display = 'none';
  elements.liveBadge.classList.add('hidden');
  if (elements.playerHeroSplash) {
    elements.playerHeroSplash.classList.remove('hidden');
  }
}

// ==========================================================================
// 1. HTML5 DIRECT & LOCAL ENGINE
// ==========================================================================
function loadHtml5Engine(url, isLocal = false) {
  state.activeEngine = 'html5';
  elements.playerWrapper.classList.remove('cinema-iframe-mode');
  elements.controlsOverlay.classList.remove('hidden');
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
  elements.playerWrapper.classList.remove('cinema-iframe-mode');
  elements.controlsOverlay.classList.remove('hidden');
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
// 3. YOUTUBE IFRAME ENGINE (PURE CUSTOM CONTROLS & ULTRA-SMOOTH SYNC)
// ==========================================================================
let ytProgressTicker = null;

window.onYouTubeIframeAPIReady = function() {
  ytReady = true;
};

function loadYouTubeEngine(videoId) {
  state.activeEngine = 'youtube';
  state.currentYoutubeId = videoId;
  elements.playerWrapper.classList.remove('cinema-iframe-mode');
  elements.controlsOverlay.classList.remove('hidden');
  elements.html5Video.classList.add('hidden');
  elements.youtubeWrapper.classList.remove('hidden');
  elements.videoEndOverlay.classList.add('hidden');
  showBuffering(true);

  // If YouTube IFrame API script is still downloading, wait gracefully
  if (typeof YT === 'undefined' || !YT.Player) {
    const checkInterval = setInterval(() => {
      if (typeof YT !== 'undefined' && YT.Player) {
        clearInterval(checkInterval);
        loadYouTubeEngine(videoId);
      }
    }, 150);
    return;
  }

  fetchYouTubeMetadata(videoId);
  updateYouTubeAmbientGlow(videoId);

  // Fast switch if player already instantiated
  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById({
        videoId: videoId,
        startSeconds: 0,
      });
      state.isPlaying = true;
      updatePlayPauseUI(true);
      showBuffering(false);
      startYouTubeTicker();
      updateYouTubeQualities();
      return;
    } catch (e) {
      console.warn('Re-initializing YouTube player:', e);
    }
  }

  // Create clean cinema-grade player: ALL native YouTube controls & overlays stripped!
  ytPlayer = new YT.Player('youtubePlayerContainer', {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,            // HIDE ALL NATIVE YOUTUBE CONTROLS
      disablekb: 1,           // Disable YouTube shortcuts to grant 100% authority to OmniPlayer
      fs: 0,                  // Hide YouTube native fullscreen button
      iv_load_policy: 3,      // Disable annotations and popups
      modestbranding: 1,      // Strips YouTube branding
      rel: 0,                 // Do not show unrelated videos
      playsinline: 1,         // Inline playback
      enablejsapi: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: (e) => {
        showBuffering(false);
        e.target.playVideo();
        state.isPlaying = true;
        updatePlayPauseUI(true);

        const dur = e.target.getDuration() || 0;
        if (dur > 0) {
          state.duration = dur;
          elements.durationTime.textContent = formatTimecode(dur);
          updateProgressBar(0, dur);
        }

        startYouTubeTicker();
        updateYouTubeQualities();
        fetchYouTubeMetadata(videoId);
        updateYouTubeAmbientGlow(videoId);
      },
      onStateChange: (e) => {
        handleYouTubeStateChange(e);
      },
      onPlaybackQualityChange: (e) => {
        if (e.data) {
          elements.badgeRes.textContent = `${e.data}`;
        }
      },
      onError: (e) => {
        showBuffering(false);
        handleYouTubeError(e.data);
      }
    }
  });
}

function handleYouTubeStateChange(e) {
  const dur = (ytPlayer && typeof ytPlayer.getDuration === 'function') ? ytPlayer.getDuration() : 0;
  if (dur > 0) {
    state.duration = dur;
    elements.durationTime.textContent = formatTimecode(dur);
  }

  if (e.data === YT.PlayerState.PLAYING) {
    state.isPlaying = true;
    updatePlayPauseUI(true);
    showBuffering(false);
    elements.videoEndOverlay.classList.add('hidden');
    startYouTubeTicker();
    updateYouTubeQualities();

    // Sync speed and volume
    if (state.playbackRate !== 1.0 && typeof ytPlayer.setPlaybackRate === 'function') {
      ytPlayer.setPlaybackRate(state.playbackRate);
    }
    if (typeof ytPlayer.setVolume === 'function') {
      ytPlayer.setVolume(state.isMuted ? 0 : Math.round(state.volume * 100));
    }
  } else if (e.data === YT.PlayerState.PAUSED) {
    state.isPlaying = false;
    updatePlayPauseUI(false);
    stopYouTubeTicker();
    if (typeof ytPlayer.getCurrentTime === 'function') {
      updateProgressBar(ytPlayer.getCurrentTime(), state.duration);
    }
  } else if (e.data === YT.PlayerState.BUFFERING) {
    showBuffering(true);
  } else if (e.data === YT.PlayerState.ENDED) {
    state.isPlaying = false;
    updatePlayPauseUI(false);
    stopYouTubeTicker();
    updateProgressBar(state.duration, state.duration);
    // Display custom sleek Replay screen to completely block YouTube related video grid!
    elements.endVideoTitle.textContent = state.currentTitle;
    elements.videoEndOverlay.classList.remove('hidden');
    showToast('YouTube Video Finished');
  }
}

function startYouTubeTicker() {
  stopYouTubeTicker();
  ytProgressTicker = setInterval(() => {
    if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
      try {
        const cur = ytPlayer.getCurrentTime() || 0;
        const dur = ytPlayer.getDuration() || state.duration || 0;
        if (dur > 0 && (!state.duration || Math.abs(state.duration - dur) > 1)) {
          state.duration = dur;
        }

        updateProgressBar(cur, dur);

        // Smooth buffer bar tracking
        if (typeof ytPlayer.getVideoLoadedFraction === 'function' && dur > 0) {
          const loaded = ytPlayer.getVideoLoadedFraction() || 0;
          elements.timelineBuffer.style.width = `${Math.min(100, loaded * 100)}%`;
        }
      } catch (err) {
        // Safe catch during fast switching
      }
    }
  }, 100); // 10 times a second for 60fps liquid feel
}

function stopYouTubeTicker() {
  if (ytProgressTicker) {
    clearInterval(ytProgressTicker);
    ytProgressTicker = null;
  }
}

function updateYouTubeQualities() {
  if (!ytPlayer || typeof ytPlayer.getAvailableQualityLevels !== 'function') return;
  const levels = ytPlayer.getAvailableQualityLevels();
  if (!levels || levels.length <= 1) {
    elements.qualityMenuWrapper.style.display = 'none';
    return;
  }

  elements.qualityMenuWrapper.style.display = 'block';
  elements.qualityList.innerHTML = '';

  const qualityLabels = {
    highres: '4K / HighRes',
    hd2160: '4K UHD',
    hd1440: '1440p QHD',
    hd1080: '1080p FHD',
    hd720: '720p HD',
    large: '480p',
    medium: '360p',
    small: '240p',
    tiny: '144p',
    auto: 'Auto (Optimal)'
  };

  const currentQuality = (typeof ytPlayer.getPlaybackQuality === 'function') 
    ? ytPlayer.getPlaybackQuality() 
    : 'auto';

  elements.currentQualityText.textContent = qualityLabels[currentQuality] || 'Auto';

  levels.forEach(lvl => {
    const label = qualityLabels[lvl] || lvl;
    const btn = document.createElement('button');
    btn.className = `quality-option ${lvl === currentQuality ? 'active' : ''}`;
    btn.dataset.ytQuality = lvl;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      ytPlayer.setPlaybackQuality(lvl);
      elements.currentQualityText.textContent = label;
      elements.qualityList.querySelectorAll('.quality-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      elements.qualityPopover.classList.remove('open');
      showToast(`YouTube Quality: ${label}`);
    });
    elements.qualityList.appendChild(btn);
  });
}

async function fetchYouTubeMetadata(videoId) {
  if (!videoId) return;
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.title) {
        state.currentTitle = data.title;
        elements.videoTitle.textContent = data.title;
        elements.badgeSource.textContent = data.author_name ? `YouTube • ${data.author_name}` : 'YouTube';
      }
    }
  } catch (e) {
    try {
      const res2 = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.title) {
          state.currentTitle = data2.title;
          elements.videoTitle.textContent = data2.title;
          elements.badgeSource.textContent = data2.author_name ? `YouTube • ${data2.author_name}` : 'YouTube';
        }
      }
    } catch (e2) {}
  }
}

function handleYouTubeError(code) {
  let msg = '⚠️ YouTube stream error occurred.';
  if (code === 101 || code === 150) {
    msg = '⚠️ The video creator does not permit third-party embeds.';
    showToast(msg);
    if (state.currentUrl) {
      setTimeout(() => {
        if (confirm('This YouTube video disables embedding on custom players. Open directly on YouTube?')) {
          window.open(state.currentUrl, '_blank');
        }
      }, 600);
    }
    return;
  } else if (code === 100) {
    msg = '⚠️ Video not found or has been removed.';
  } else if (code === 2) {
    msg = '⚠️ Invalid YouTube video ID.';
  }
  showToast(msg);
}

// ==========================================================================
// 4. GENERIC & CINEMA EMBED IFRAME ENGINE
// ==========================================================================
function loadIframeEngine(embedUrl) {
  state.activeEngine = 'iframe';
  // Cinema Iframe Mode: Hide ALL OmniPlayer controls so the movie website's native controls are 100% active and unblocked
  elements.playerWrapper.classList.add('cinema-iframe-mode');
  elements.controlsOverlay.classList.add('hidden');
  elements.html5Video.classList.add('hidden');
  elements.youtubeWrapper.classList.add('hidden');
  elements.genericIframe.classList.remove('hidden');
  elements.genericIframe.src = embedUrl;
  showBuffering(false);

  if (embedUrl.includes('nxsha.space') || embedUrl.includes('embed/movie') || embedUrl.includes('embed/tv')) {
    showToast('🍿 Movie Streaming — Website Controls Active');
    elements.badgeSource.textContent = 'CINEMA 1080p';
    elements.badgeRes.textContent = 'FULL HD';
  } else {
    showToast('Playing in Protected Embedded Mode');
  }
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
    const ytState = (typeof ytPlayer.getPlayerState === 'function') ? ytPlayer.getPlayerState() : -1;
    if (ytState === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      state.isPlaying = false;
      updatePlayPauseUI(false);
      flashCenterIndicator('pause');
      stopYouTubeTicker();
    } else {
      ytPlayer.playVideo();
      state.isPlaying = true;
      updatePlayPauseUI(true);
      flashCenterIndicator('play');
      startYouTubeTicker();
    }
  }
}

function seekRelative(deltaSeconds) {
  if (state.activeEngine === 'html5') {
    const target = Math.max(0, Math.min(elements.html5Video.duration || 0, elements.html5Video.currentTime + deltaSeconds));
    elements.html5Video.currentTime = target;
    showToast(`${deltaSeconds > 0 ? '+' : ''}${deltaSeconds}s`);
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    const cur = (typeof ytPlayer.getCurrentTime === 'function') ? ytPlayer.getCurrentTime() : 0;
    const dur = (typeof ytPlayer.getDuration === 'function') ? ytPlayer.getDuration() : state.duration || 0;
    const target = Math.max(0, Math.min(dur || Infinity, cur + deltaSeconds));
    ytPlayer.seekTo(target, true);
    updateProgressBar(target, dur);
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
  // If in cinema iframe mode, website controls handle 100% of user clicks
  if (state.activeEngine === 'iframe') {
    return;
  }

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
  } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getDuration === 'function') {
    const dur = ytPlayer.getDuration() || state.duration || 0;
    if (dur > 0) {
      const target = dur * (pct / 100);
      ytPlayer.seekTo(target, true);
      updateProgressBar(target, dur);
      showToast(`Seek to ${pct}%`);
    }
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
  if (state.activeEngine === 'html5') {
    if (!elements.html5Video.videoWidth) {
      showToast('⚠️ Video frame not ready');
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
  } else if (state.activeEngine === 'youtube' && state.currentYoutubeId) {
    const curTime = formatTimecode(getCurrentTime()).replace(':', '-');
    const imgUrl = `https://img.youtube.com/vi/${state.currentYoutubeId}/maxresdefault.jpg`;
    
    fetch(imgUrl).then(res => {
      if (!res.ok) throw new Error('fallback');
      return res.blob();
    }).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `YouTube-HD-${state.currentYoutubeId}-${curTime}.jpg`;
      a.click();
      showToast('📸 YouTube HD Snapshot Saved!');
    }).catch(() => {
      window.open(imgUrl, '_blank');
      showToast('📸 YouTube HD Snapshot Opened!');
    });
  } else {
    showToast('⚠️ Snapshot works with direct streams & YouTube');
  }
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

  checkAndExecuteLoop(currentTime);
  if (Math.floor(currentTime) % 4 === 0) {
    savePlaybackPosition(state.currentUrl, currentTime, duration, state.currentTitle);
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
  if (meta.type === 'youtube') {
    elements.badgeRes.textContent = 'Auto HD';
  }
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function resetIdleTimer() {
  if (state.activeEngine === 'iframe') {
    elements.playerWrapper.classList.remove('user-idle');
    return;
  }
  elements.playerWrapper.classList.remove('user-idle');
  clearTimeout(idleTimer);
  if (state.isPlaying) {
    idleTimer = setTimeout(() => {
      elements.playerWrapper.classList.add('user-idle');
    }, 2800);
  }
}

// ==========================================================================
// 1. MOVIE SEARCH ENGINE (TMDB + NXSHA CINEMA EMBED)
// ==========================================================================
const TMDB_API_KEY = 'b6fbc7f4f313bd3955e777398de83713';
let movieSearchDebounceTimer = null;

const CINEMA_SERVERS = [
  { id: 'nxsha', name: 'Server 1 (Nxsha)', getUrl: (id, type) => type === 'tv' ? `https://nxsha.space/embed/tv/${id}/1/1` : `https://nxsha.space/embed/movie/${id}` },
  { id: 'autoembed', name: 'Server 2 (AutoEmbed)', getUrl: (id, type) => type === 'tv' ? `https://player.autoembed.cc/embed/tv/${id}/1/1` : `https://player.autoembed.cc/embed/movie/${id}` },
  { id: 'vidlink', name: 'Server 3 (VidLink)', getUrl: (id, type) => type === 'tv' ? `https://vidlink.pro/tv/${id}/1/1` : `https://vidlink.pro/movie/${id}` },
  { id: 'multiembed', name: 'Server 4 (MultiEmbed)', getUrl: (id, type) => type === 'tv' ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=1` : `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  { id: 'vidsrc', name: 'Server 5 (VidSrc)', getUrl: (id, type) => type === 'tv' ? `https://vidsrc.xyz/embed/tv/${id}/1/1` : `https://vidsrc.xyz/embed/movie/${id}` },
];

/**
 * Curated Top Blockbusters with verified TMDB posters and metadata
 * Displayed instantly when user clicks the search input or clears search text.
 */
const CURATED_RECOMMENDED_MOVIES = [
  {
    id: 550,
    title: 'Fight Club',
    release_date: '1999-10-15',
    vote_average: 8.4,
    media_type: 'movie',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    overview: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and forms an underground fight club.'
  },
  {
    id: 157336,
    title: 'Interstellar',
    release_date: '2014-11-05',
    vote_average: 8.4,
    media_type: 'movie',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.'
  },
  {
    id: 27205,
    title: 'Inception',
    release_date: '2010-07-15',
    vote_average: 8.4,
    media_type: 'movie',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    overview: 'Cobb steals information from targets by entering their dreams. He is given a chance to have his criminal record erased by implanting an idea into a CEO’s mind.'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    release_date: '2008-07-16',
    vote_average: 8.5,
    media_type: 'movie',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    overview: 'Batman raises the stakes in his war on crime. With Lt. Jim Gordon and Harvey Dent, Batman sets out to dismantle the criminal organizations plaguing Gotham.'
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    release_date: '2023-07-19',
    vote_average: 8.1,
    media_type: 'movie',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II with the Manhattan Project.'
  },
  {
    id: 299534,
    title: 'Avengers: Endgame',
    release_date: '2019-04-24',
    vote_average: 8.3,
    media_type: 'movie',
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    overview: 'After devastating events by Thanos, the universe is left in ruins. The surviving Avengers assemble once more to undo the chaos.'
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    release_date: '2023-05-31',
    vote_average: 8.4,
    media_type: 'movie',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.'
  },
  {
    id: 76600,
    title: 'Avatar: The Way of Water',
    release_date: '2022-12-14',
    vote_average: 7.7,
    media_type: 'movie',
    poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    overview: 'Jake Sully lives with his newfound family on Pandora. When a familiar threat returns, he must work with Neytiri and the Na\'vi to protect their home.'
  },
  {
    id: 1396,
    title: 'Breaking Bad',
    first_air_date: '2008-01-20',
    vote_average: 8.9,
    media_type: 'tv',
    poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    overview: 'A chemistry teacher diagnosed with terminal cancer teams up with a former student to manufacture and sell crystal meth to secure his family’s future.'
  },
  {
    id: 1399,
    title: 'Game of Thrones',
    first_air_date: '2011-04-17',
    vote_average: 8.4,
    media_type: 'tv',
    poster_path: '/1XS1oqL89opfnbLl8WnZY1qv138.jpg',
    overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.'
  }
];

let activeMovieFilter = 'all';
let lastLoadedMovies = CURATED_RECOMMENDED_MOVIES;
let lastSearchQuery = '';

function applyMovieFilter(filterType) {
  activeMovieFilter = filterType;
  if (elements.movieFilterBar) {
    elements.movieFilterBar.querySelectorAll('.movie-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filterType);
    });
  }

  let filtered = [...lastLoadedMovies];
  if (filterType === 'movie') {
    filtered = filtered.filter(m => (m.media_type || 'movie') === 'movie');
  } else if (filterType === 'tv') {
    filtered = filtered.filter(m => m.media_type === 'tv');
  } else if (filterType === 'top') {
    filtered = filtered.filter(m => (m.vote_average || 0) >= 8.3);
  }

  renderMovieCardsOnly(filtered, lastSearchQuery);
}

function showRecommendedMovies() {
  lastLoadedMovies = CURATED_RECOMMENDED_MOVIES;
  lastSearchQuery = '';
  elements.movieResultsTitle.textContent = '🔥 Recommended Blockbusters — Click to Stream';
  elements.movieSearchDropdown.classList.remove('hidden');
  applyMovieFilter(activeMovieFilter);
}

async function searchMovies(query, autoPlayExact = false) {
  if (!query || query.trim().length < 2) {
    showRecommendedMovies();
    return;
  }

  const cleanQuery = query.trim();
  elements.movieResultsTitle.textContent = `🎬 Searching movies for "${cleanQuery}"...`;
  elements.movieSearchDropdown.classList.remove('hidden');
  elements.movieResultsList.innerHTML = `
    <div style="padding: 28px; text-align: center; color: var(--text-dim); font-size: 0.88rem;">
      <div class="spinner-ring" style="width: 28px; height: 28px; margin: 0 auto 12px;"></div>
      Searching high-definition movie catalog...
    </div>
  `;

  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanQuery)}&include_adult=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('TMDB multi-search failed');
    const data = await res.json();
    
    let results = (data.results || []).filter(item => 
      item.media_type === 'movie' || item.media_type === 'tv' || (!item.media_type && (item.title || item.name))
    );

    if (results.length === 0) {
      const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanQuery)}&include_adult=false`;
      const movieRes = await fetch(movieUrl);
      if (movieRes.ok) {
        const movieData = await movieRes.json();
        results = movieData.results || [];
      }
    }

    if (results.length > 0) {
      const qLower = cleanQuery.toLowerCase();
      // Prioritize exact match to index 0
      results.sort((a, b) => {
        const titleA = ((a.title || a.name || '')).toLowerCase().trim();
        const titleB = ((b.title || b.name || '')).toLowerCase().trim();
        const exactA = titleA === qLower ? 1 : 0;
        const exactB = titleB === qLower ? 1 : 0;
        if (exactA !== exactB) return exactB - exactA;
        const startsA = titleA.startsWith(qLower) ? 1 : 0;
        const startsB = titleB.startsWith(qLower) ? 1 : 0;
        if (startsA !== startsB) return startsB - startsA;
        return (b.vote_count || 0) - (a.vote_count || 0);
      });

      renderMovieSearchResults(results.slice(0, 8), cleanQuery);

      if (autoPlayExact && results.length > 0) {
        const top = results[0];
        const topTitle = (top.title || top.name || '').toLowerCase().trim();
        if (topTitle === qLower) {
          const year = (top.release_date || top.first_air_date || '').substring(0, 4);
          playMovieByTmdbId(top.id, `${top.title || top.name} (${year})`, top.media_type || 'movie');
        }
      }
    } else {
      elements.movieResultsList.innerHTML = `
        <div style="padding: 28px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
          No movies found for "<strong>${escapeHtml(cleanQuery)}</strong>". Please check the spelling.
        </div>
      `;
    }
  } catch (err) {
    tryFallbackMovieSearch(cleanQuery, autoPlayExact);
  }
}

async function tryFallbackMovieSearch(query, autoPlayExact = false) {
  try {
    const cleanQ = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const firstChar = cleanQ.charAt(0) || 'a';
    const fallbackUrl = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${encodeURIComponent(query)}.json`;
    const res = await fetch(fallbackUrl);
    if (!res.ok) throw new Error('Fallback failed');
    const data = await res.json();
    if (data.d && data.d.length > 0) {
      const items = data.d.filter(item => item.id && (item.q === 'feature' || item.q === 'TV series' || !item.q));
      renderImdbSearchResults(items.slice(0, 8), query);
      return;
    }
  } catch (e) {}

  elements.movieResultsList.innerHTML = `
    <div style="padding: 24px; text-align: center; color: var(--text-secondary); font-size: 0.88rem;">
      Could not connect to movie catalog. Check your internet connection.
    </div>
  `;
}

function renderMovieSearchResults(movies, cleanQuery) {
  lastLoadedMovies = movies || [];
  lastSearchQuery = cleanQuery || '';
  if (cleanQuery) {
    elements.movieResultsTitle.textContent = `🎬 Exact Results for "${cleanQuery}" — Click to Stream`;
  } else {
    elements.movieResultsTitle.textContent = `🎬 Recommended Blockbusters — Click to Stream`;
  }
  
  applyMovieFilter(activeMovieFilter);
}

function renderMovieCardsOnly(movies, cleanQuery) {
  const qLower = (cleanQuery || '').toLowerCase().trim();
  if (movies.length === 0) {
    elements.movieResultsList.innerHTML = `
      <div style="padding: 28px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
        No titles found in this category. Click <strong>"🔥 All Trending"</strong> to see all.
      </div>
    `;
    return;
  }

  elements.movieResultsList.innerHTML = movies.map(m => {
    const title = m.title || m.name || m.l || 'Untitled';
    const isExact = qLower && title.toLowerCase().trim() === qLower;
    const mediaType = m.media_type === 'tv' ? 'tv' : 'movie';
    const typeLabel = mediaType === 'tv' ? '📺 TV SERIES' : '🎬 MOVIE';
    const poster = m.poster_path 
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
      : ((m.i && m.i.imageUrl) ? m.i.imageUrl : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&fit=crop');
    const year = (m.release_date || m.first_air_date || m.y || 'N/A').toString().substring(0, 4);
    const rating = m.vote_average ? m.vote_average.toFixed(1) : (m.y ? '8.2' : '8.0');
    const overview = m.overview 
      ? (m.overview.substring(0, 120) + '...') 
      : (m.s ? `Cast: ${m.s}` : 'Stream immediately in 4K Ultra HD with multiple audio tracks.');

    return `
      <div class="movie-search-item ${isExact ? 'exact-match-item' : ''}" data-id="${m.id}" data-title="${escapeHtml(title)}" data-year="${year}" data-type="${mediaType}">
        <div class="movie-poster-wrap">
          <img class="movie-item-poster" src="${poster}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&fit=crop'" />
          <span class="poster-rating-pill">★ ${rating}</span>
        </div>
        <div class="movie-item-content">
          <div class="movie-item-title-row">
            <span class="movie-item-title">${escapeHtml(title)}</span>
            ${isExact ? '<span class="exact-match-badge"><span class="pulse-emerald"></span> Exact Match</span>' : ''}
            <span class="movie-year-tag">${year}</span>
            <span class="media-type-badge ${mediaType}">${typeLabel}</span>
            <span class="hd-quality-badge">4K ULTRA HD</span>
          </div>
          <p class="movie-item-overview">${escapeHtml(overview)}</p>
        </div>
        <div class="movie-action-wrap">
          <button class="movie-play-pill" type="button" title="Stream ${escapeHtml(title)} now">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Stream ${mediaType === 'tv' ? 'Series' : 'Movie'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  elements.movieResultsList.querySelectorAll('.movie-search-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const title = item.dataset.title;
      const year = item.dataset.year;
      const type = item.dataset.type || 'movie';
      playMovieByTmdbId(id, `${title} (${year})`, type);
    });
  });
}

function renderImdbSearchResults(items, cleanQuery) {
  lastLoadedMovies = items.map(it => ({
    id: it.id,
    title: it.l,
    media_type: 'movie',
    y: it.y,
    s: it.s,
    i: it.i
  }));
  lastSearchQuery = cleanQuery || '';
  elements.movieResultsTitle.textContent = `🎬 Exact Results for "${cleanQuery}" — Click to Stream`;
  applyMovieFilter(activeMovieFilter);
}

function playMovieByTmdbId(id, fullTitle, type = 'movie') {
  elements.movieSearchDropdown.classList.add('hidden');
  elements.videoUrlInput.value = fullTitle;

  state.currentCinemaMedia = {
    id: id,
    title: fullTitle,
    type: type,
    server: 'nxsha'
  };

  const embedUrl = type === 'tv'
    ? `https://nxsha.space/embed/tv/${id}/1/1`
    : `https://nxsha.space/embed/movie/${id}`;
  
  loadUniversalMedia({
    type: 'cinema',
    embedUrl: embedUrl,
    url: embedUrl,
    title: fullTitle,
  });

  renderCinemaServerSelector();
  showToast(`🍿 Streaming: ${fullTitle}`);
}

function renderCinemaServerSelector() {
  const container = document.getElementById('cinemaServerSelector');
  const pillsBox = document.getElementById('cinemaServerPills');
  if (!container || !pillsBox || !state.currentCinemaMedia) return;

  container.classList.remove('hidden');
  pillsBox.innerHTML = CINEMA_SERVERS.map(srv => {
    const isActive = (state.currentCinemaMedia.server === srv.id);
    return `
      <button class="server-pill ${isActive ? 'active' : ''}" data-server="${srv.id}" type="button">
        ${escapeHtml(srv.name)}
      </button>
    `;
  }).join('');

  pillsBox.querySelectorAll('.server-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const serverId = btn.dataset.server;
      switchCinemaServer(serverId);
    });
  });
}

function switchCinemaServer(serverId) {
  if (!state.currentCinemaMedia) return;
  const srv = CINEMA_SERVERS.find(s => s.id === serverId);
  if (!srv) return;

  state.currentCinemaMedia.server = serverId;
  const newUrl = srv.getUrl(state.currentCinemaMedia.id, state.currentCinemaMedia.type);
  elements.genericIframe.src = newUrl;
  renderCinemaServerSelector();
  showToast(`Switched to ${srv.name}`);
}

// ==========================================================================
// 2. A-B LOOP REPEATER SYSTEM
// ==========================================================================
function setLoopPointA() {
  const cur = getCurrentTime();
  state.loopA = cur;
  state.loopActive = false;
  elements.btnLoop.classList.remove('loop-active');
  elements.btnLoop.classList.add('loop-point-a');
  elements.loopBadgeText.textContent = `A: ${formatTimecode(cur)}`;
  elements.timelineLoopRange.classList.add('hidden');
  showToast(`Loop Point A set at ${formatTimecode(cur)}. Press ] to set Point B`);
}

function setLoopPointB() {
  const cur = getCurrentTime();
  if (state.loopA === null) {
    setLoopPointA();
    return;
  }

  if (cur <= state.loopA) {
    showToast('⚠️ Point B must be ahead of Point A');
    return;
  }

  state.loopB = cur;
  state.loopActive = true;
  elements.btnLoop.classList.remove('loop-point-a');
  elements.btnLoop.classList.add('loop-active');
  elements.loopBadgeText.textContent = `Loop 🔁`;

  updateTimelineLoopUI();
  showToast(`🔁 A-B Loop Active: ${formatTimecode(state.loopA)} - ${formatTimecode(state.loopB)}`);
}

function clearLoop() {
  state.loopA = null;
  state.loopB = null;
  state.loopActive = false;
  elements.btnLoop.classList.remove('loop-point-a', 'loop-active');
  elements.loopBadgeText.textContent = `A-B`;
  elements.timelineLoopRange.classList.add('hidden');
  showToast('Loop Cleared');
}

function toggleLoop() {
  if (state.loopActive) {
    clearLoop();
  } else if (state.loopA !== null) {
    setLoopPointB();
  } else {
    setLoopPointA();
  }
}

function updateTimelineLoopUI() {
  if (!state.loopActive || state.loopA === null || state.loopB === null || !state.duration) {
    elements.timelineLoopRange.classList.add('hidden');
    return;
  }
  const leftPct = (state.loopA / state.duration) * 100;
  const widthPct = ((state.loopB - state.loopA) / state.duration) * 100;
  elements.timelineLoopRange.style.left = `${leftPct}%`;
  elements.timelineLoopRange.style.width = `${widthPct}%`;
  elements.timelineLoopRange.classList.remove('hidden');
}

function checkAndExecuteLoop(curTime) {
  if (state.loopActive && state.loopA !== null && state.loopB !== null) {
    if (curTime >= state.loopB) {
      if (state.activeEngine === 'html5') {
        elements.html5Video.currentTime = state.loopA;
      } else if (state.activeEngine === 'youtube' && ytPlayer) {
        ytPlayer.seekTo(state.loopA, true);
      }
    }
  }
}

// ==========================================================================
// 3. VIDEO FILTERS & EYE-CARE SHADERS
// ==========================================================================
function setVideoFilter(filterName) {
  state.activeFilter = filterName;
  elements.mediaContainer.dataset.filter = filterName;
  
  elements.filterOptions.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.filter === filterName);
  });

  elements.filterPopover.classList.remove('open');
  const labels = {
    normal: '✨ Normal (Filters Cleared)',
    'night-invert': '🌙 Night Invert: Dark Presentation Slides Mode',
    'high-contrast': '💡 High Contrast: Enhanced Blackboard Readability',
    warm: '👓 Warm Eye-Care: Blue Light Reduction',
    grayscale: '⬛ Monochrome Mode',
  };
  showToast(labels[filterName] || `Filter: ${filterName}`);
}

function toggleNightInvert() {
  const target = (state.activeFilter === 'night-invert') ? 'normal' : 'night-invert';
  setVideoFilter(target);
}

// ==========================================================================
// 4. SMART RESUME WATCH (REMEMBER PLAYBACK PROGRESS)
// ==========================================================================
function getPlaybackPositions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYBACK_POSITIONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePlaybackPosition(url, time, duration, title) {
  if (!url || !time || time < 10) return;
  if (duration && time >= duration - 15) {
    const positions = getPlaybackPositions();
    delete positions[url];
    localStorage.setItem(STORAGE_KEYS.PLAYBACK_POSITIONS, JSON.stringify(positions));
    return;
  }
  const positions = getPlaybackPositions();
  positions[url] = {
    time: Math.floor(time),
    duration: Math.floor(duration || 0),
    title: title || 'Media',
    updatedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEYS.PLAYBACK_POSITIONS, JSON.stringify(positions));
}

function checkAndPromptResume(url) {
  if (!url) return;
  elements.resumeBanner.classList.add('hidden');
  const positions = getPlaybackPositions();
  const saved = positions[url];
  if (saved && saved.time > 10) {
    state.pendingResumeTime = saved.time;
    elements.resumeTimeText.textContent = formatTimecode(saved.time);
    elements.resumeBanner.classList.remove('hidden');

    setTimeout(() => {
      elements.resumeBanner.classList.add('hidden');
    }, 10000);
  }
}

function applyResumePosition() {
  if (state.pendingResumeTime > 0) {
    const target = state.pendingResumeTime;
    elements.resumeBanner.classList.add('hidden');
    if (state.activeEngine === 'html5') {
      elements.html5Video.currentTime = target;
      elements.html5Video.play();
    } else if (state.activeEngine === 'youtube' && ytPlayer) {
      ytPlayer.seekTo(target, true);
      ytPlayer.playVideo();
    }
    showToast(`▶ Resumed playback from ${formatTimecode(target)}`);
    state.pendingResumeTime = 0;
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
    const dur = state.duration || (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getDuration === 'function' ? ytPlayer.getDuration() : 0);
    if (dur > 0) {
      state.duration = dur;
      const targetSec = pos * dur;
      elements.currentTime.textContent = formatTimecode(targetSec);
      elements.tooltipTime.textContent = formatTimecode(targetSec);
      elements.timelineTooltip.style.left = `${pos * 100}%`;
      if (state.activeEngine === 'html5') {
        elements.html5Video.currentTime = targetSec;
      } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.seekTo === 'function') {
        ytPlayer.seekTo(targetSec, true);
      }
    }
  }

  elements.timelineContainer.addEventListener('mousemove', (e) => {
    if (!isScrubbing) {
      const rect = elements.timelineTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const dur = state.duration || (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getDuration === 'function' ? ytPlayer.getDuration() : 0);
      if (dur > 0) {
        const hoverSec = pos * dur;
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
    elements.filterPopover.classList.remove('open');
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
    elements.filterPopover.classList.remove('open');
  });

  // A-B Loop Button
  elements.btnLoop.addEventListener('click', toggleLoop);

  // Video Filter Menu Popover
  elements.btnFilterMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.filterPopover.classList.toggle('open');
    elements.speedPopover.classList.remove('open');
    elements.qualityPopover.classList.remove('open');
  });

  elements.filterOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      setVideoFilter(btn.dataset.filter);
    });
  });

  window.addEventListener('click', (e) => {
    elements.speedPopover.classList.remove('open');
    elements.qualityPopover.classList.remove('open');
    elements.filterPopover.classList.remove('open');
    if (!e.target.closest('.search-container')) {
      elements.movieSearchDropdown.classList.add('hidden');
    }
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

  // Search URL Bar & Live Stream / Movie Detection
  elements.videoUrlInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    clearTimeout(movieSearchDebounceTimer);

    if (!val) {
      elements.streamTypeTag.classList.add('hidden');
      showRecommendedMovies();
      return;
    }

    // If input is a URL (starts with http, https, or is an iframe tag)
    if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('<iframe') || val.includes('.m3u8') || val.includes('.mp4')) {
      elements.movieSearchDropdown.classList.add('hidden');
      updateLiveStreamTag(val);
    } else if (val.length >= 2) {
      // User is typing a Movie Name!
      elements.streamTypeLabel.textContent = `🎬 Movie Search: "${val}"`;
      elements.streamTypeTag.classList.remove('hidden');

      movieSearchDebounceTimer = setTimeout(() => {
        searchMovies(val);
      }, 260);
    } else {
      showRecommendedMovies();
      elements.streamTypeTag.classList.add('hidden');
    }
  });

  // When clicking or focusing on the search input, if empty, show curated recommendations immediately
  elements.videoUrlInput.addEventListener('focus', () => {
    const val = elements.videoUrlInput.value.trim();
    if (!val) {
      showRecommendedMovies();
    }
  });

  elements.videoUrlInput.addEventListener('click', () => {
    const val = elements.videoUrlInput.value.trim();
    if (!val && elements.movieSearchDropdown.classList.contains('hidden')) {
      showRecommendedMovies();
    }
  });

  elements.btnLoadUrl.addEventListener('click', () => {
    const url = elements.videoUrlInput.value.trim();
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        loadUniversalMedia(url);
      } else {
        const topItem = elements.movieResultsList.querySelector('.movie-search-item');
        if (topItem && !elements.movieSearchDropdown.classList.contains('hidden')) {
          topItem.click();
        } else {
          searchMovies(url, true);
        }
      }
    }
  });

  let selectedDropdownIndex = -1;

  function updateDropdownSelection() {
    const items = elements.movieResultsList.querySelectorAll('.movie-search-item');
    items.forEach((item, idx) => {
      const isSelected = (idx === selectedDropdownIndex);
      item.classList.toggle('keyboard-focused', isSelected);
      if (isSelected) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  elements.videoUrlInput.addEventListener('keydown', (e) => {
    const items = elements.movieResultsList.querySelectorAll('.movie-search-item');
    const isDropdownVisible = !elements.movieSearchDropdown.classList.contains('hidden') && items.length > 0;

    if (e.key === 'ArrowDown' && isDropdownVisible) {
      e.preventDefault();
      selectedDropdownIndex = Math.min(items.length - 1, selectedDropdownIndex + 1);
      updateDropdownSelection();
      return;
    }

    if (e.key === 'ArrowUp' && isDropdownVisible) {
      e.preventDefault();
      selectedDropdownIndex = Math.max(0, selectedDropdownIndex - 1);
      updateDropdownSelection();
      return;
    }

    if (e.key === 'Escape' && isDropdownVisible) {
      e.preventDefault();
      elements.movieSearchDropdown.classList.add('hidden');
      selectedDropdownIndex = -1;
      return;
    }

    if (e.key === 'Enter') {
      const url = elements.videoUrlInput.value.trim();
      if (url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          loadUniversalMedia(url);
        } else if (isDropdownVisible) {
          if (selectedDropdownIndex >= 0 && selectedDropdownIndex < items.length) {
            items[selectedDropdownIndex].click();
          } else {
            items[0].click();
          }
        } else {
          searchMovies(url, true);
        }
      }
    }
  });

  // Close Movie Search Dropdown button
  elements.btnCloseMovieResults.addEventListener('click', () => {
    elements.movieSearchDropdown.classList.add('hidden');
  });

  // Browse Movies / Recommendations Shortcut Button (Toggles transparent recommendations)
  if (elements.btnBrowseMovies) {
    elements.btnBrowseMovies.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = elements.movieSearchDropdown.classList.contains('hidden');
      if (isHidden) {
        showRecommendedMovies();
      } else {
        elements.movieSearchDropdown.classList.add('hidden');
      }
    });
  }

  // Quick Category Filter Buttons
  if (elements.movieFilterBar) {
    elements.movieFilterBar.querySelectorAll('.movie-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyMovieFilter(btn.dataset.filter);
      });
    });
  }

  // Hero Quick Chips on Player Stage
  document.querySelectorAll('.hero-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.id;
      const title = chip.dataset.title;
      const type = chip.dataset.type || 'movie';
      playMovieByTmdbId(id, title, type);
    });
  });

  // Smart Resume Watch buttons
  elements.btnResumeYes.addEventListener('click', applyResumePosition);
  elements.btnResumeNo.addEventListener('click', () => {
    elements.resumeBanner.classList.add('hidden');
    state.pendingResumeTime = 0;
  });

  // DRM Modal
  elements.btnCloseDrm.addEventListener('click', () => {
    elements.modalDrm.classList.add('hidden');
  });
  elements.btnLaunchHotstarPopout.addEventListener('click', () => {
    if (state.currentUrl) {
      window.open(state.currentUrl, '_blank', 'width=1240,height=720,menubar=no,toolbar=no');
    }
    elements.modalDrm.classList.add('hidden');
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

  // Replay Video button on End Screen
  elements.btnReplayVideo.addEventListener('click', () => {
    elements.videoEndOverlay.classList.add('hidden');
    if (state.activeEngine === 'youtube' && ytPlayer) {
      ytPlayer.seekTo(0, true);
      ytPlayer.playVideo();
    } else if (state.activeEngine === 'html5') {
      elements.html5Video.currentTime = 0;
      elements.html5Video.play();
    }
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

  // In cinema iframe mode, let the movie website handle its own keyboard controls (Space, Arrows, Volume)
  if (state.activeEngine === 'iframe') {
    if (e.key.toLowerCase() === 't') {
      e.preventDefault();
      toggleTheatreMode();
    }
    return;
  }

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
    case ',':
      e.preventDefault();
      seekRelative(-0.04);
      break;
    case '.':
      e.preventDefault();
      seekRelative(0.04);
      break;
    case '[':
      e.preventDefault();
      setLoopPointA();
      break;
    case ']':
      e.preventDefault();
      setLoopPointB();
      break;
    case '\\':
      e.preventDefault();
      clearLoop();
      break;
    case 'i':
      if (e.altKey) {
        e.preventDefault();
        toggleNightInvert();
      }
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
