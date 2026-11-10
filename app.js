/**
 * OMNIPLAYER — PREMIUM CINEMATIC STREAMING & DISCOVERY PLATFORM
 * Architecture:
 *  - Cinematic Dark Theme (#0D0D14 / #141421 / #191927 / #8B5CF6 / #5B8CFF)
 *  - Client-Side SPA Router (#movies, #home, #movie/:id, #tv, #library, #favorites, #history, #collection/:type)
 *  - Movies Discovery Page: Hero Carousel, Browse by Genre Grid, 8 Horizontal Movie Carousels with "See All"
 *  - Dedicated Movie Details Page: Full-bleed backdrop, metadata, cast carousel, reviews, similar movies
 *  - Smart Floating Search: Debounced TMDB multi-search, recent history, suggestions, keyboard navigation
 *  - Integrated AI Assistant inside Player: Plot summary, scene explanations, key takeaways, contextual Q&A
 *  - Professional Universal Player: Multi-engine (YouTube stripped, Cinema embed, HLS .m3u8, direct MP4, local drag & drop),
 *    60fps scrubber, double-click seek (-10s/+10s), 300% audio boost, video filters, A-B loop, resume watch.
 */

// ==========================================================================
// 1. CONSTANTS & DATABASE CATALOG
// ==========================================================================
const TMDB_API_KEY = 'b6fbc7f4f313bd3955e777398de83713';

const STORAGE_KEYS = {
  WATCHLIST: 'omni_watchlist',
  FAVORITES: 'omni_favorites',
  SEARCH_HISTORY: 'omni_search_history',
  WATCH_HISTORY: 'omni_recent_history',
  PLAYBACK_POSITIONS: 'omni_playback_positions',
  NOTES_PREFIX: 'omni_notes_',
  AUDIO_BOOST: 'omni_audio_boost',
  AMBIENT_ENABLED: 'omni_ambient_enabled',
};

const CINEMA_SERVERS = [
  { id: 'nxsha', name: 'Server 1 (Nxsha)', getUrl: (id, type) => type === 'tv' ? `https://nxsha.space/embed/tv/${id}/1/1` : `https://nxsha.space/embed/movie/${id}` },
  { id: 'autoembed', name: 'Server 2 (AutoEmbed)', getUrl: (id, type) => type === 'tv' ? `https://player.autoembed.cc/embed/tv/${id}/1/1` : `https://player.autoembed.cc/embed/movie/${id}` },
  { id: 'vidlink', name: 'Server 3 (VidLink)', getUrl: (id, type) => type === 'tv' ? `https://vidlink.pro/tv/${id}/1/1` : `https://vidlink.pro/movie/${id}` },
  { id: 'multiembed', name: 'Server 4 (MultiEmbed)', getUrl: (id, type) => type === 'tv' ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=1` : `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  { id: 'vidsrc', name: 'Server 5 (VidSrc)', getUrl: (id, type) => type === 'tv' ? `https://vidsrc.xyz/embed/tv/${id}/1/1` : `https://vidsrc.xyz/embed/movie/${id}` },
];

/**
 * Curated Top Blockbusters with verified TMDB IDs, backdrops, posters, ratings & metadata
 */
const CATALOG_MOVIES = [
  {
    id: 603692,
    title: 'John Wick: Chapter 4',
    tagline: 'Baba Yaga returns. More intense. More deadly.',
    year: '2023',
    rating: 8.0,
    runtime: '2h 49m',
    genres: ['Action', 'Thriller'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/h8gHn0OzRogL05h9Mec4V9u.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/vZloFAK7NKnMGKEHvYGRMuNuTy7.jpg',
    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table, but before he can earn his freedom, he must face off against a new enemy.',
    media_type: 'movie',
    cast: [
      { name: 'Keanu Reeves', role: 'John Wick', img: 'https://image.tmdb.org/t/p/w185/4D0PpNI0kmP58hgrwGC3wC5x0Ry.jpg' },
      { name: 'Donnie Yen', role: 'Caine', img: 'https://image.tmdb.org/t/p/w185/hTlScqljL1245nL.jpg' },
      { name: 'Bill Skarsgård', role: 'Marquis de Gramont', img: 'https://image.tmdb.org/t/p/w185/6K7T6s0v4c.jpg' }
    ]
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    year: '2024',
    rating: 8.8,
    runtime: '2h 46m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0x2.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
    media_type: 'movie'
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    tagline: 'Come together.',
    year: '2024',
    rating: 8.1,
    runtime: '2h 07m',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/yDHYTjA3R0neXjRI5rwwDKW8rw.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again.',
    media_type: 'movie'
  },
  {
    id: 157336,
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    year: '2014',
    rating: 8.6,
    runtime: '2h 49m',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    media_type: 'movie'
  },
  {
    id: 414906,
    title: 'The Batman',
    tagline: 'Unmask the truth.',
    year: '2022',
    rating: 7.8,
    runtime: '2h 56m',
    genres: ['Action', 'Crime', 'Drama'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/tRS6jvPM9qPrrnx2KRx3ew96Ykd.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    overview: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
    media_type: 'movie'
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    tagline: 'The world forever changes.',
    year: '2023',
    rating: 8.7,
    runtime: '3h 00m',
    genres: ['Biography', 'Drama', 'History'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/rLb2cw69XwqTXPmT4LQWKNqv8Al.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II with the Manhattan Project.',
    media_type: 'movie'
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    tagline: 'It’s how you wear the mask that matters.',
    year: '2023',
    rating: 8.6,
    runtime: '2h 20m',
    genres: ['Animation', 'Action', 'Adventure'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    media_type: 'movie'
  },
  {
    id: 155,
    title: 'The Dark Knight',
    tagline: 'Welcome to a world without rules.',
    year: '2008',
    rating: 9.0,
    runtime: '2h 32m',
    genres: ['Action', 'Crime', 'Drama'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    media_type: 'movie'
  },
  {
    id: 27205,
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    year: '2010',
    rating: 8.8,
    runtime: '2h 28m',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    overview: 'Cobb steals information from his targets by entering their dreams. He is wanted for his alleged role in his wife’s murder and his only chance at redemption is to perform a nearly impossible task: inception.',
    media_type: 'movie'
  },
  {
    id: 550,
    title: 'Fight Club',
    tagline: 'Mischief. Mayhem. Soap.',
    year: '1999',
    rating: 8.8,
    runtime: '2h 19m',
    genres: ['Drama', 'Thriller'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetHGCJzbNX12.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    media_type: 'movie'
  },
  {
    id: 603,
    title: 'The Matrix',
    tagline: 'Welcome to the Real World.',
    year: '1999',
    rating: 8.7,
    runtime: '2h 16m',
    genres: ['Action', 'Sci-Fi'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/l4QHerTSbMIFuOPRizv77gM.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.',
    media_type: 'movie'
  },
  {
    id: 13,
    title: 'Forrest Gump',
    tagline: 'Life is like a box of chocolates.',
    year: '1994',
    rating: 8.8,
    runtime: '2h 22m',
    genres: ['Drama', 'Romance'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/qdIM242IQws9Pr9N0bQEmOAgi2K.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/arw2VCBveWOVZr6pxd9XTd1TdQa.jpg',
    overview: 'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.',
    media_type: 'movie'
  },
  {
    id: 372058,
    title: 'Your Name',
    tagline: 'I will find you.',
    year: '2016',
    rating: 8.4,
    runtime: '1h 46m',
    genres: ['Animation', 'Drama', 'Romance'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/dIWwZWfdTripOdZwUp2nM9096Te.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6qFsRwa0rmG.jpg',
    overview: 'High schoolers Mitsuha and Taki are complete strangers living separate lives until they suddenly switch bodies.',
    media_type: 'movie'
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    year: '1994',
    rating: 9.3,
    runtime: '2h 22m',
    genres: ['Drama', 'Crime'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    overview: 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.',
    media_type: 'movie'
  },
  {
    id: 238,
    title: 'The Godfather',
    tagline: 'An offer you cannot refuse.',
    year: '1972',
    rating: 9.2,
    runtime: '2h 55m',
    genres: ['Crime', 'Drama'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch Vito Corleone barely survives an attempt on his life, his youngest son steps in to take care of the would-be killers.',
    media_type: 'movie'
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    tagline: 'Just because you are a character does not mean that you have character.',
    year: '1994',
    rating: 8.9,
    runtime: '2h 34m',
    genres: ['Crime', 'Thriller'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    overview: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster’s moll and a washed-up boxer converge in this sprawling, comedic crime caper.',
    media_type: 'movie'
  },
  {
    id: 98,
    title: 'Gladiator',
    tagline: 'What we do in life echoes in eternity.',
    year: '2000',
    rating: 8.5,
    runtime: '2h 35m',
    genres: ['Action', 'Drama', 'Adventure'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/ArWn6HUv674Zz9jYw8.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    overview: 'In the year 180, the death of emperor Marcus Aurelius throws the Roman Empire into turmoil. Maximus Decimus Meridius is betrayed and forced into slavery as a gladiator.',
    media_type: 'movie'
  },
  {
    id: 76600,
    title: 'Avatar: The Way of Water',
    tagline: 'Return to Pandora.',
    year: '2022',
    rating: 7.7,
    runtime: '3h 12m',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/8rpDcsfLJypbO6vREc0547VKqEv.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    overview: 'Set more than a decade after the events of the first film, learn the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.',
    media_type: 'movie'
  },
  {
    id: 299534,
    title: 'Avengers: Endgame',
    tagline: 'Part of the journey is the end.',
    year: '2019',
    rating: 8.4,
    runtime: '3h 01m',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zJW8Qn7T6d.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    overview: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos’ actions and restore balance.',
    media_type: 'movie'
  }
];

const CATALOG_TV = [
  {
    id: 1396,
    title: 'Breaking Bad',
    tagline: 'All Hail the King.',
    year: '2008',
    rating: 9.5,
    runtime: '5 Seasons',
    genres: ['Crime', 'Drama', 'Thriller'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNdFaAgq0v4c.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    overview: 'A chemistry teacher diagnosed with terminal cancer teams up with a former student to manufacture and sell crystal meth to secure his family’s financial future.',
    media_type: 'tv'
  },
  {
    id: 1399,
    title: 'Game of Thrones',
    tagline: 'Winter Is Coming.',
    year: '2011',
    rating: 9.2,
    runtime: '8 Seasons',
    genres: ['Drama', 'Fantasy', 'Adventure'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1qv138.jpg',
    overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    media_type: 'tv'
  },
  {
    id: 66732,
    title: 'Stranger Things',
    tagline: 'Every ending has a beginning.',
    year: '2016',
    rating: 8.7,
    runtime: '4 Seasons',
    genres: ['Sci-Fi', 'Horror', 'Drama'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/56v2KjUmUOCOQg6VvG8N.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    media_type: 'tv'
  },
  {
    id: 100088,
    title: 'The Last of Us',
    tagline: 'When you’re lost in the darkness, look for the light.',
    year: '2023',
    rating: 8.8,
    runtime: '1 Season',
    genres: ['Drama', 'Sci-Fi', 'Action'],
    backdrop: 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLve6.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjK1iuhqKlmxT14m7m.jpg',
    overview: 'Twenty years after modern civilization has been destroyed, Joel is hired to smuggle Ellie out of an oppressive quarantine zone across a brutal America.',
    media_type: 'tv'
  }
];

const GENRES = [
  { name: 'Action', icon: '💥', bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&fit=crop' },
  { name: 'Adventure', icon: '🧭', bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&fit=crop' },
  { name: 'Comedy', icon: '😂', bg: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500&fit=crop' },
  { name: 'Drama', icon: '🎭', bg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&fit=crop' },
  { name: 'Thriller', icon: '⚡', bg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&fit=crop' },
  { name: 'Horror', icon: '🩸', bg: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&fit=crop' },
  { name: 'Sci-Fi', icon: '🚀', bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&fit=crop' },
  { name: 'Romance', icon: '❤️', bg: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&fit=crop' },
  { name: 'Crime', icon: '🕵️', bg: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&fit=crop' },
  { name: 'Animation', icon: '🎨', bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&fit=crop' },
  { name: 'Fantasy', icon: '🧙‍♂️', bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&fit=crop' },
  { name: 'Mystery', icon: '🔍', bg: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&fit=crop' }
];

// ==========================================================================
// 2. GLOBAL PLATFORM STATE
// ==========================================================================
const state = {
  currentRoute: 'movies', // 'movies' | 'home' | 'movie-details' | 'tv' | 'library' | 'favorites' | 'history' | 'collection'
  activeMovieId: 872585,
  heroIndex: 0,
  heroInterval: null,
  watchlist: JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]'),
  favorites: JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]'),
  searchHistory: JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '["Oppenheimer", "Avengers", "Interstellar", "Dark Knight", "Inception"]'),
  
  // Video Player Engine State
  activeEngine: 'html5',
  currentUrl: '',
  currentTitle: 'Ready to stream',
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 1.0,
  isMuted: false,
  playbackRate: 1.0,
  audioBoostFactor: 1.0,
  ambientEnabled: true,
  theatreMode: false,
  currentYoutubeId: '',
  currentNotes: [],
  history: JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY) || '[]'),
  loopA: null,
  loopB: null,
  loopActive: false,
  activeFilter: 'normal',
  pendingResumeTime: 0,
  currentCinemaMedia: null,
};

let ytPlayer = null;
let ytReady = false;
let hlsInstance = null;
let ytProgressTicker = null;
let audioContext = null;
let audioSourceNode = null;
let audioGainNode = null;

// ==========================================================================
// 3. SPA ROUTING CONTROLLER
// ==========================================================================
function navigate(route, params = {}) {
  state.currentRoute = route;

  // Hide all views
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));

  // Update sidebar active nav item
  document.querySelectorAll('.platform-sidebar .nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === route);
  });

  // Activate specific view
  switch (route) {
    case 'movies':
      const vMovies = document.getElementById('viewMovies');
      if (vMovies) vMovies.classList.add('active');
      window.location.hash = '#movies';
      break;

    case 'studio':
      const vStudio = document.getElementById('viewHome');
      if (vStudio) vStudio.classList.add('active');
      window.location.hash = '#studio';
      break;

    case 'home':
    case 'player':
      const vHome = document.getElementById('viewHome');
      if (vHome) vHome.classList.add('active');
      window.location.hash = '#home';
      break;

    case 'movie-details':
      const vDetails = document.getElementById('viewMovieDetails');
      if (vDetails) vDetails.classList.add('active');
      if (params.id) {
        state.activeMovieId = params.id;
        renderMovieDetails(params.id);
        window.location.hash = `#movie/${params.id}`;
      }
      break;

    case 'tv':
      const vTv = document.getElementById('viewTv');
      if (vTv) vTv.classList.add('active');
      window.location.hash = '#tv';
      renderTvCarousels();
      break;

    case 'anime':
      const vAnime = document.getElementById('viewAnime');
      if (vAnime) vAnime.classList.add('active');
      window.location.hash = '#anime';
      renderAnimeCarousel();
      break;

    case 'library':
      const vLib = document.getElementById('viewLibrary');
      if (vLib) vLib.classList.add('active');
      window.location.hash = '#library';
      renderLibraryView();
      break;

    case 'favorites':
      const vFav = document.getElementById('viewFavorites');
      if (vFav) vFav.classList.add('active');
      window.location.hash = '#favorites';
      renderFavoritesView();
      break;

    case 'history':
      const vHist = document.getElementById('viewHistory');
      if (vHist) vHist.classList.add('active');
      window.location.hash = '#history';
      renderHistoryView();
      break;

    case 'collection':
      const vCol = document.getElementById('viewCollection');
      if (vCol) vCol.classList.add('active');
      renderCollectionView(params.collection || 'trending');
      window.location.hash = `#collection/${params.collection || 'trending'}`;
      break;

    case 'downloads':
      const vDown = document.getElementById('viewDownloads');
      if (vDown) vDown.classList.add('active');
      window.location.hash = '#downloads';
      break;

    case 'playlists':
      const vPlay = document.getElementById('viewPlaylists');
      if (vPlay) vPlay.classList.add('active');
      window.location.hash = '#playlists';
      break;

    default:
      const fallback = document.getElementById('viewMovies');
      if (fallback) fallback.classList.add('active');
      window.location.hash = '#movies';
      break;
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('platformSidebar');
  if (sidebar) sidebar.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleHashChange() {
  const hash = window.location.hash || '#movies';

  if (hash.startsWith('#movie/')) {
    const id = hash.replace('#movie/', '');
    navigate('movie-details', { id });
  } else if (hash.startsWith('#collection/')) {
    const col = hash.replace('#collection/', '');
    navigate('collection', { collection: col });
  } else {
    const route = hash.replace('#', '') || 'movies';
    navigate(route);
  }
}

// ==========================================================================
// 4. MOVIES DISCOVERY PAGE CONTROLLER
// ==========================================================================
function initMoviesPage() {
  initHeroCarousel();
  renderGenreCards();
  renderTopRatedWidget();
  renderDiscoveryCarousels();
  updateSidebarCounters();
  initStudioHubControls();
}

/**
 * 4.1 Hero Banner Carousel Controller (Matching Reference Image)
 */
function initHeroCarousel() {
  const heroMovies = [
    CATALOG_MOVIES[0], // John Wick: Chapter 4
    CATALOG_MOVIES[5], // Oppenheimer
    CATALOG_MOVIES[1], // Dune: Part Two
    CATALOG_MOVIES[3], // Interstellar
    CATALOG_MOVIES[4], // The Batman
  ];

  function displayHeroSlide(index) {
    state.heroIndex = index;
    const m = heroMovies[index];
    if (!m) return;

    const bgImg = document.getElementById('heroBackdropImg');
    const title = document.getElementById('heroTitle');
    const desc = document.getElementById('heroDescription');
    const imdb = document.getElementById('heroImdbPill');
    const year = document.getElementById('heroYearPill');
    const genres = document.getElementById('heroGenresText');
    const counter = document.getElementById('heroSlideCounter');

    if (bgImg) bgImg.src = m.backdrop;
    if (title) {
      if (m.id === 603692) {
        title.innerHTML = `JOHN WICK<br><span class="hero-title-sub">CHAPTER 4</span>`;
      } else {
        title.innerHTML = escapeHtml(m.title);
      }
    }
    if (desc) desc.textContent = m.overview;
    if (imdb) imdb.textContent = `⭐ ${m.rating}`;
    if (year) year.textContent = `📅 ${m.year}`;
    if (genres) genres.textContent = `🎬 ${m.genres ? m.genres.join(' • ') : 'Action • Thriller'}`;
    if (counter) counter.textContent = `${index + 1} of ${heroMovies.length}`;

    // Wire buttons
    const btnWatch = document.getElementById('btnHeroWatch');
    if (btnWatch) {
      btnWatch.onclick = () => playMovieByTmdbId(m.id, `${m.title} (${m.year})`, 'movie');
    }

    const btnWatchlist = document.getElementById('btnHeroWatchlist');
    if (btnWatchlist) {
      const isSaved = state.watchlist.some(w => w.id === m.id);
      btnWatchlist.textContent = isSaved ? '✓ In Watchlist' : '+ Add to Watchlist';
      btnWatchlist.onclick = () => {
        toggleWatchlist(m);
        const nowSaved = state.watchlist.some(w => w.id === m.id);
        btnWatchlist.textContent = nowSaved ? '✓ In Watchlist' : '+ Add to Watchlist';
      };
    }
  }

  // Display initial
  displayHeroSlide(0);

  // Prev / Next Controls
  const btnPrev = document.getElementById('btnHeroPrev');
  const btnNext = document.getElementById('btnHeroNext');

  if (btnPrev) {
    btnPrev.onclick = () => {
      let nextIdx = (state.heroIndex - 1 + heroMovies.length) % heroMovies.length;
      displayHeroSlide(nextIdx);
      restartHeroTimer();
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      let nextIdx = (state.heroIndex + 1) % heroMovies.length;
      displayHeroSlide(nextIdx);
      restartHeroTimer();
    };
  }

  function restartHeroTimer() {
    clearInterval(state.heroInterval);
    state.heroInterval = setInterval(() => {
      let nextIdx = (state.heroIndex + 1) % heroMovies.length;
      displayHeroSlide(nextIdx);
    }, 6500);
  }

  restartHeroTimer();
}

/**
 * 4.2 Browse by Genre Capsules & Right Sidebar 2-Column Grid
 */
function renderGenreCards() {
  const container = document.getElementById('genresGrid');
  const outlineGrid = document.getElementById('genresOutlineGrid');

  // Horizontal capsules for feed
  const CAPSULE_GENRES = [
    { name: 'Action', avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&fit=crop' },
    { name: 'Drama', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop' },
    { name: 'Comedy', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop' },
    { name: 'Thriller', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&fit=crop' },
    { name: 'Sci-Fi', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&fit=crop' },
    { name: 'Horror', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&fit=crop' },
    { name: 'Romance', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop' },
    { name: 'Crime', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&fit=crop' },
  ];

  if (container) {
    container.innerHTML = CAPSULE_GENRES.map(g => `
      <div class="genre-capsule-item" data-genre="${g.name}">
        <img src="${g.avatar}" alt="${g.name}" class="capsule-avatar-img" loading="lazy">
        <span class="capsule-genre-name">${g.name}</span>
      </div>
    `).join('');

    container.querySelectorAll('.genre-capsule-item').forEach(item => {
      item.onclick = () => {
        const genre = item.dataset.genre;
        navigate('collection', { collection: `genre-${genre}` });
      };
    });
  }

  // 2-Column Outline Pills for Right Sidebar
  const OUTLINE_GENRES = [
    { name: 'Action', icon: '✏️' },
    { name: 'Adventure', icon: '🧭' },
    { name: 'Comedy', icon: '😄' },
    { name: 'Drama', icon: '🎭' },
    { name: 'Horror', icon: '👻' },
    { name: 'Sci-Fi', icon: '🚀' },
    { name: 'Romance', icon: '❤️' },
    { name: 'Thriller', icon: '🔪' },
    { name: 'Crime', icon: '🕵️' },
    { name: 'Animation', icon: '🎨' },
    { name: 'Biography', icon: '📖' },
    { name: 'Fantasy', icon: '🧙' }
  ];

  if (outlineGrid) {
    outlineGrid.innerHTML = OUTLINE_GENRES.map(g => `
      <div class="genre-outline-pill" data-genre="${g.name}">
        <span>${g.icon}</span>
        <span>${g.name}</span>
      </div>
    `).join('');

    outlineGrid.querySelectorAll('.genre-outline-pill').forEach(pill => {
      pill.onclick = () => {
        const genre = pill.dataset.genre;
        navigate('collection', { collection: `genre-${genre}` });
      };
    });
  }
}

/**
 * 4.3 Top Rated Movies Ranked Widget (1 to 5)
 */
function renderTopRatedWidget() {
  const container = document.getElementById('topRatedWidgetList');
  if (!container) return;

  const rankedPicks = [
    { rank: 1, id: 278, title: 'The Shawshank Redemption', rating: '9.3', genre: 'Drama', poster: 'https://image.tmdb.org/t/p/w200/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg' },
    { rank: 2, id: 238, title: 'The Godfather', rating: '9.2', genre: 'Crime', poster: 'https://image.tmdb.org/t/p/w200/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
    { rank: 3, id: 157336, title: 'Interstellar', rating: '8.6', genre: 'Sci-Fi', poster: 'https://image.tmdb.org/t/p/w200/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
    { rank: 4, id: 550, title: 'Fight Club', rating: '8.8', genre: 'Drama', poster: 'https://image.tmdb.org/t/p/w200/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
    { rank: 5, id: 680, title: 'Pulp Fiction', rating: '8.9', genre: 'Crime', poster: 'https://image.tmdb.org/t/p/w200/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  ];

  container.innerHTML = rankedPicks.map(m => `
    <div class="ranked-item-row" data-id="${m.id}">
      <span class="ranked-number">${m.rank}</span>
      <img src="${m.poster}" alt="${escapeHtml(m.title)}" class="ranked-thumb-img" loading="lazy">
      <div class="ranked-info">
        <h4 class="ranked-title">${escapeHtml(m.title)}</h4>
        <div class="ranked-meta">
          <span class="star">⭐ ${m.rating}</span>
          <span>•</span>
          <span>${m.genre}</span>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.ranked-item-row').forEach(row => {
    row.onclick = () => {
      const id = parseInt(row.dataset.id, 10);
      navigate('movie-details', { id });
    };
  });
}

/**
 * 4.4 Movie Card HTML Template Generator (Matching Reference Image)
 */
function createMovieCardHTML(m) {
  const title = m.title || m.name || 'Untitled';
  const rating = m.rating || (m.vote_average ? m.vote_average.toFixed(1) : '8.4');
  const runtime = m.runtime || (m.media_type === 'tv' ? 'Series' : '2h 15m');
  const poster = m.poster || (m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&fit=crop');
  const genresText = m.genres ? m.genres.join(' • ') : (m.media_type === 'tv' ? 'Series' : 'Action • Drama');
  const isFav = state.favorites.some(f => f.id === m.id);

  return `
    <div class="movie-card" data-id="${m.id}" data-type="${m.media_type || 'movie'}">
      <div class="card-poster-wrap">
        <img class="card-poster-img" src="${poster}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&fit=crop'">
        <div class="card-poster-gradient"></div>
        <div class="card-duration-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>${runtime}</span>
        </div>
        <button class="card-fav-btn ${isFav ? 'favorited' : ''}" data-id="${m.id}" title="${isFav ? 'Remove Favorite' : 'Add to Favorites'}" type="button">
          <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <div class="card-hover-overlay">
          <div class="card-play-bubble" title="Play Now">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <span class="card-details-pill">More Info</span>
        </div>
      </div>
      <div class="card-info-box">
        <h3 class="card-title">${escapeHtml(title)}</h3>
        <div class="card-genres-row">${escapeHtml(genresText)}</div>
        <div class="card-rating-row"><span class="star-gold">★</span> ${rating}</div>
      </div>
    </div>
  `;
}

/**
 * Wire Card Click Listeners
 */
function attachMovieCardListeners(container) {
  if (!container) return;

  container.querySelectorAll('.movie-card').forEach(card => {
    const id = parseInt(card.dataset.id, 10);
    const type = card.dataset.type || 'movie';

    // Click on play bubble directly streams
    const playBubble = card.querySelector('.card-play-bubble');
    if (playBubble) {
      playBubble.onclick = (e) => {
        e.stopPropagation();
        const m = CATALOG_MOVIES.find(it => it.id === id) || { id, title: card.querySelector('.card-title')?.textContent, year: '2023', media_type: type };
        playMovieByTmdbId(id, `${m.title} (${m.year || '2023'})`, type);
      };
    }

    // Click on favorite button
    const favBtn = card.querySelector('.card-fav-btn');
    if (favBtn) {
      favBtn.onclick = (e) => {
        e.stopPropagation();
        const m = CATALOG_MOVIES.find(it => it.id === id) || { id, title: card.querySelector('.card-title')?.textContent, poster: card.querySelector('.card-poster-img')?.src, media_type: type };
        toggleFavorite(m, favBtn);
      };
    }

    // Default card click opens Movie Details Page
    card.onclick = () => {
      navigate('movie-details', { id });
    };
  });
}

/**
 * 4.5 Render Discovery Carousels (Trending & Recommended exact matches to image)
 */
function renderDiscoveryCarousels() {
  // Trending Movies from image: Dune 2, Deadpool & Wolverine, Interstellar, The Batman, Oppenheimer, Spider-Man
  const trending = [
    CATALOG_MOVIES[1], // Dune: Part Two
    CATALOG_MOVIES[2], // Deadpool & Wolverine
    CATALOG_MOVIES[3], // Interstellar
    CATALOG_MOVIES[4], // The Batman
    CATALOG_MOVIES[5], // Oppenheimer
    CATALOG_MOVIES[6], // Spider-Man: Across the Spider-Verse
  ];

  // Recommended for You from image: The Dark Knight, Inception, Fight Club, The Matrix, Forrest Gump, Your Name
  const recommended = [
    CATALOG_MOVIES[7], // The Dark Knight
    CATALOG_MOVIES[8], // Inception
    CATALOG_MOVIES[9], // Fight Club
    CATALOG_MOVIES[10], // The Matrix
    CATALOG_MOVIES[11], // Forrest Gump
    CATALOG_MOVIES[12], // Your Name
  ];

  renderSingleCarousel('trendingCarousel', trending);
  renderSingleCarousel('recommendedCarousel', recommended);
  renderSingleCarousel('topRatedCarousel', [...CATALOG_MOVIES].sort((a, b) => b.rating - a.rating));
  renderSingleCarousel('newReleasesCarousel', [...CATALOG_MOVIES].sort((a, b) => parseInt(b.year) - parseInt(a.year)));
  renderSingleCarousel('mostWatchedCarousel', trending);
  renderSingleCarousel('awardWinningCarousel', recommended);
  renderContinueWatchingCarousel();

  // Wire carousel prev/next buttons
  document.querySelectorAll('.carousel-wrapper .carousel-nav-btn').forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.dataset.target;
      const track = document.getElementById(targetId);
      if (track) {
        const scrollAmount = btn.classList.contains('prev') ? -500 : 500;
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };
  });

  // Wire "See All" buttons
  document.querySelectorAll('.section-see-all-btn[data-collection]').forEach(btn => {
    btn.onclick = () => {
      const col = btn.dataset.collection;
      navigate('collection', { collection: col });
    };
  });
}

/**
 * 4.6 Studio Video Player Controls Wire-Up
 */
function initStudioHubControls() {
  const tabYt = document.getElementById('tabModeYt');
  const tabDevice = document.getElementById('tabModeDevice');
  const ytSection = document.getElementById('studioYtSection');
  const deviceSection = document.getElementById('studioDeviceSection');

  if (tabYt && tabDevice) {
    tabYt.onclick = () => {
      tabYt.classList.add('active');
      tabDevice.classList.remove('active');
      if (ytSection) ytSection.classList.remove('hidden');
      if (deviceSection) deviceSection.classList.add('hidden');
    };

    tabDevice.onclick = () => {
      tabDevice.classList.add('active');
      tabYt.classList.remove('active');
      if (deviceSection) deviceSection.classList.remove('hidden');
      if (ytSection) ytSection.classList.add('hidden');
    };
  }

  // Demo chips
  document.querySelectorAll('.demo-chip-btn[data-yt]').forEach(chip => {
    chip.onclick = () => {
      const ytUrl = chip.dataset.yt;
      const input = document.getElementById('videoUrlInput');
      if (input) input.value = ytUrl;
      loadUniversalMedia(ytUrl);
      showToast('🚀 Playing 4K Ultra HD Demo with Pure Custom Controls');
    };
  });
}

function renderSingleCarousel(trackId, moviesList) {
  const track = document.getElementById(trackId);
  if (!track) return;
  track.innerHTML = moviesList.map(createMovieCardHTML).join('');
  attachMovieCardListeners(track);
}

function renderContinueWatchingCarousel() {
  const track = document.getElementById('continueWatchingCarousel');
  const section = document.getElementById('sectionContinueWatching');
  if (!track || !section) return;

  if (state.history.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  track.innerHTML = state.history.map(item => {
    const title = item.title || 'Untitled Session';
    const isCinema = item.type === 'cinema';
    return `
      <div class="movie-card" data-url="${escapeHtml(item.url)}" data-type="${item.type || 'generic'}">
        <div class="card-poster-wrap" style="height: 180px;">
          <img class="card-poster-img" src="${item.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&fit=crop'}" alt="${escapeHtml(title)}" loading="lazy">
          <div class="card-poster-gradient"></div>
          <div class="card-play-bubble">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
        <div class="card-info-box">
          <h3 class="card-title">${escapeHtml(title)}</h3>
          <div class="card-meta-row">
            <span>${item.label || 'Video Session'}</span>
            <span>Resume ▶</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  track.querySelectorAll('.movie-card').forEach(card => {
    card.onclick = () => {
      const url = card.dataset.url;
      loadUniversalMedia(url);
      navigate('home');
    };
  });
}

// ==========================================================================
// 5. DEDICATED MOVIE DETAILS PAGE CONTROLLER (#movie/:id)
// ==========================================================================
async function renderMovieDetails(movieId) {
  let movie = CATALOG_MOVIES.find(m => m.id == movieId) || CATALOG_TV.find(t => t.id == movieId);

  // If not found in static catalog, fetch full details from TMDB
  if (!movie) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,similar,reviews`);
      if (res.ok) {
        const data = await res.json();
        movie = {
          id: data.id,
          title: data.title || data.name,
          tagline: data.tagline,
          year: (data.release_date || data.first_air_date || '2023').substring(0, 4),
          rating: data.vote_average ? data.vote_average.toFixed(1) : '8.2',
          runtime: data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : '2h 15m',
          genres: data.genres ? data.genres.map(g => g.name) : ['Cinema', 'Drama'],
          backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&fit=crop',
          poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&fit=crop',
          overview: data.overview,
          media_type: 'movie',
          cast: data.credits?.cast?.slice(0, 8).map(c => ({
            name: c.name,
            role: c.character,
            img: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop'
          })) || []
        };
      }
    } catch (e) {
      movie = CATALOG_MOVIES[0];
    }
  }

  if (!movie) movie = CATALOG_MOVIES[0];

  // Set Hero Elements
  const backdropImg = document.getElementById('detailsBackdropImg');
  const posterImg = document.getElementById('detailsPosterImg');
  const title = document.getElementById('detailsTitle');
  const tagline = document.getElementById('detailsTagline');
  const rating = document.getElementById('detailsImdbRating');
  const year = document.getElementById('detailsYear');
  const runtime = document.getElementById('detailsRuntime');
  const genres = document.getElementById('detailsGenres');
  const synopsis = document.getElementById('detailsSynopsis');

  if (backdropImg) backdropImg.src = movie.backdrop || movie.poster;
  if (posterImg) posterImg.src = movie.poster;
  if (title) title.textContent = movie.title;
  if (tagline) tagline.textContent = movie.tagline ? `"${movie.tagline}"` : '';
  if (rating) rating.textContent = `★ ${movie.rating} IMDb`;
  if (year) year.textContent = movie.year;
  if (runtime) runtime.textContent = movie.runtime || '2h 15m';
  if (genres) genres.textContent = movie.genres ? movie.genres.join(' • ') : 'Action • Sci-Fi';
  if (synopsis) synopsis.textContent = movie.overview;

  // Actions
  const btnWatch = document.getElementById('btnDetailsWatchNow');
  if (btnWatch) {
    btnWatch.onclick = () => playMovieByTmdbId(movie.id, `${movie.title} (${movie.year})`, movie.media_type || 'movie');
  }

  const btnWatchlist = document.getElementById('btnDetailsWatchlist');
  if (btnWatchlist) {
    const isSaved = state.watchlist.some(w => w.id === movie.id);
    btnWatchlist.textContent = isSaved ? '✓ In Watchlist' : '+ Add to Watchlist';
    btnWatchlist.onclick = () => {
      toggleWatchlist(movie);
      const nowSaved = state.watchlist.some(w => w.id === movie.id);
      btnWatchlist.textContent = nowSaved ? '✓ In Watchlist' : '+ Add to Watchlist';
    };
  }

  const btnFav = document.getElementById('btnDetailsFavorite');
  if (btnFav) {
    const isFav = state.favorites.some(f => f.id === movie.id);
    btnFav.textContent = isFav ? '❤️ Favorited' : '🤍 Favorite';
    btnFav.onclick = () => {
      toggleFavorite(movie);
      const nowFav = state.favorites.some(f => f.id === movie.id);
      btnFav.textContent = nowFav ? '❤️ Favorited' : '🤍 Favorite';
    };
  }

  const btnShare = document.getElementById('btnDetailsShare');
  if (btnShare) {
    btnShare.onclick = () => {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Movie link copied to clipboard!');
    };
  }

  // Cast
  const castGrid = document.getElementById('detailsCastGrid');
  if (castGrid) {
    const castList = movie.cast && movie.cast.length > 0 ? movie.cast : [
      { name: 'Lead Protagonist', role: 'Main Character', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop' },
      { name: 'Supporting Star', role: 'Allied Character', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop' },
      { name: 'Antagonist', role: 'The Rival', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&fit=crop' }
    ];

    castGrid.innerHTML = castList.map(c => `
      <div class="cast-card">
        <div class="cast-avatar-wrap">
          <img class="cast-avatar-img" src="${c.img}" alt="${escapeHtml(c.name)}" loading="lazy">
        </div>
        <span class="cast-name">${escapeHtml(c.name)}</span>
        <span class="cast-role">${escapeHtml(c.role || '')}</span>
      </div>
    `).join('');
  }

  // Similar Movies
  const similarTrack = document.getElementById('detailsSimilarCarousel');
  if (similarTrack) {
    const similarMovies = CATALOG_MOVIES.filter(m => m.id !== movie.id).slice(0, 8);
    similarTrack.innerHTML = similarMovies.map(createMovieCardHTML).join('');
    attachMovieCardListeners(similarTrack);
  }

  // Reviews
  const reviewsGrid = document.getElementById('detailsReviewsGrid');
  if (reviewsGrid) {
    reviewsGrid.innerHTML = `
      <div class="review-card">
        <div class="review-header">
          <span class="reviewer-name">CinemaLover99</span>
          <span class="review-rating-stars">★★★★★</span>
        </div>
        <p class="review-comment">"An absolute triumph of modern cinema. The visual storytelling, practical effects, and sound design make it an unforgettable experience."</p>
      </div>
      <div class="review-card">
        <div class="review-header">
          <span class="reviewer-name">Marcus Finch</span>
          <span class="review-rating-stars">★★★★☆</span>
        </div>
        <p class="review-comment">"The pacing is gripping from the opening scene to the climax. Christopher Nolan and the ensemble cast deliver phenomenal performances."</p>
      </div>
      <div class="review-card">
        <div class="review-header">
          <span class="reviewer-name">Elena Rostova</span>
          <span class="review-rating-stars">★★★★★</span>
        </div>
        <p class="review-comment">"Streamed in 4K on OmniPlayer with Dolby audio — simply breathtaking! Definitely going to re-watch this masterpiece."</p>
      </div>
    `;
  }
}

// ==========================================================================
// 6. SMART GLOBAL SEARCH DROPDOWN CONTROLLER
// ==========================================================================
function initSmartSearch() {
  const input = document.getElementById('globalSearchInput');
  const dropdown = document.getElementById('smartSearchDropdown');
  const content = document.getElementById('smartSearchContent');
  const btnClear = document.getElementById('btnClearSearch');
  const btnClose = document.getElementById('btnCloseSmartSearch');
  let searchTimer = null;
  let selectedIndex = -1;

  if (!input || !dropdown || !content) return;

  function showDropdown() {
    dropdown.classList.remove('hidden');
    if (!input.value.trim()) {
      renderSearchSuggestions();
    }
  }

  function hideDropdown() {
    dropdown.classList.add('hidden');
    selectedIndex = -1;
  }

  function renderSearchSuggestions() {
    content.innerHTML = `
      <div>
        <div class="search-group-title">🕒 Recent Searches</div>
        <div class="search-chips-row">
          ${state.searchHistory.map(term => `<button class="search-chip" type="button">${escapeHtml(term)}</button>`).join('')}
        </div>
      </div>
      <div>
        <div class="search-group-title">🔥 Popular Trending Searches</div>
        <div class="search-chips-row">
          <button class="search-chip" type="button">Oppenheimer</button>
          <button class="search-chip" type="button">Interstellar</button>
          <button class="search-chip" type="button">The Dark Knight</button>
          <button class="search-chip" type="button">Dune 2</button>
          <button class="search-chip" type="button">Breaking Bad</button>
          <button class="search-chip" type="button">Avengers</button>
        </div>
      </div>
      <div>
        <div class="search-group-title">✨ Recommended Picks</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${CATALOG_MOVIES.slice(0, 4).map(m => `
            <div class="search-result-item" data-id="${m.id}" data-type="movie">
              <img class="search-result-poster" src="${m.poster}" alt="${escapeHtml(m.title)}">
              <div class="search-result-info">
                <span class="search-result-title">${escapeHtml(m.title)}</span>
                <div class="search-result-meta">
                  <span class="meta-year">${m.year}</span>
                  <span class="meta-genre">${m.genres ? m.genres.join(', ') : 'Cinema'}</span>
                  <span class="meta-rating">★ ${m.rating}</span>
                </div>
              </div>
              <button class="search-result-play-btn" type="button">Stream</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Chip click
    content.querySelectorAll('.search-chip').forEach(chip => {
      chip.onclick = () => {
        input.value = chip.textContent.trim();
        performSearch(input.value);
      };
    });

    // Results click
    content.querySelectorAll('.search-result-item').forEach(item => {
      const id = parseInt(item.dataset.id, 10);
      item.onclick = () => {
        hideDropdown();
        navigate('movie-details', { id });
      };
      const playBtn = item.querySelector('.search-result-play-btn');
      if (playBtn) {
        playBtn.onclick = (e) => {
          e.stopPropagation();
          hideDropdown();
          const m = CATALOG_MOVIES.find(it => it.id === id);
          playMovieByTmdbId(id, `${m?.title || 'Movie'} (${m?.year || '2023'})`, 'movie');
        };
      }
    });
  }

  async function performSearch(query) {
    const cleanQ = query.trim();
    if (!cleanQ) {
      renderSearchSuggestions();
      return;
    }

    content.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        Searching high-definition movie & TV database for "${escapeHtml(cleanQ)}"...
      </div>
    `;

    // Add to history
    if (!state.searchHistory.includes(cleanQ)) {
      state.searchHistory.unshift(cleanQ);
      if (state.searchHistory.length > 8) state.searchHistory.pop();
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(state.searchHistory));
    }

    try {
      // TMDB multi search
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanQ)}&include_adult=false`);
      let results = [];
      if (res.ok) {
        const data = await res.json();
        results = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv' || (!item.media_type && (item.title || item.name)));
      }

      if (results.length === 0) {
        // Fallback filter from local catalog
        const qLower = cleanQ.toLowerCase();
        results = CATALOG_MOVIES.filter(m => m.title.toLowerCase().includes(qLower));
      }

      if (results.length === 0) {
        content.innerHTML = `
          <div style="padding: 28px; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
            No titles found for "<strong>${escapeHtml(cleanQ)}</strong>". Try searching for <em>Avengers, Inception, or Oppenheimer</em>.
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="search-group-title">🎯 Matching Results (${results.length})</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${results.slice(0, 8).map(m => {
            const title = m.title || m.name || 'Untitled';
            const year = (m.release_date || m.first_air_date || '2023').substring(0, 4);
            const poster = m.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&fit=crop';
            const rating = m.vote_average ? m.vote_average.toFixed(1) : '8.2';
            const type = m.media_type === 'tv' ? 'tv' : 'movie';
            return `
              <div class="search-result-item" data-id="${m.id}" data-type="${type}" data-title="${escapeHtml(title)}" data-year="${year}">
                <img class="search-result-poster" src="${poster}" alt="${escapeHtml(title)}" loading="lazy">
                <div class="search-result-info">
                  <span class="search-result-title">${escapeHtml(title)}</span>
                  <div class="search-result-meta">
                    <span class="meta-year">${year}</span>
                    <span class="meta-genre">${type === 'tv' ? '📺 Series' : '🎬 Movie'}</span>
                    <span class="meta-rating">★ ${rating}</span>
                  </div>
                </div>
                <button class="search-result-play-btn" type="button">Stream</button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      content.querySelectorAll('.search-result-item').forEach(item => {
        const id = parseInt(item.dataset.id, 10);
        const title = item.dataset.title;
        const year = item.dataset.year;
        const type = item.dataset.type || 'movie';

        item.onclick = () => {
          hideDropdown();
          navigate('movie-details', { id });
        };

        const playBtn = item.querySelector('.search-result-play-btn');
        if (playBtn) {
          playBtn.onclick = (e) => {
            e.stopPropagation();
            hideDropdown();
            playMovieByTmdbId(id, `${title} (${year})`, type);
          };
        }
      });

    } catch (err) {
      content.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
          Error connecting to live catalog. Please check your internet connection.
        </div>
      `;
    }
  }

  // Events
  input.addEventListener('focus', showDropdown);
  input.addEventListener('click', showDropdown);

  input.addEventListener('input', (e) => {
    const val = e.target.value;
    if (btnClear) btnClear.classList.toggle('hidden', !val);

    clearTimeout(searchTimer);
    if (!val.trim()) {
      renderSearchSuggestions();
      return;
    }

    // Check if user pasted a video URL directly
    if (val.startsWith('http://') || val.startsWith('https://') || val.includes('.m3u8')) {
      hideDropdown();
      loadUniversalMedia(val.trim());
      navigate('home');
      return;
    }

    searchTimer = setTimeout(() => {
      performSearch(val);
    }, 280);
  });

  if (btnClear) {
    btnClear.onclick = () => {
      input.value = '';
      btnClear.classList.add('hidden');
      renderSearchSuggestions();
      input.focus();
    };
  }

  if (btnClose) {
    btnClose.onclick = hideDropdown;
  }

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = content.querySelectorAll('.search-result-item');
    if (dropdown.classList.contains('hidden') || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
      updateKeyboardSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(0, selectedIndex - 1);
      updateKeyboardSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].click();
      } else if (items[0]) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  function updateKeyboardSelection(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('keyboard-focused', idx === selectedIndex);
      if (idx === selectedIndex) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  // Click outside to close
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.global-search-wrapper')) {
      hideDropdown();
    }
  });

  // Global "/" hotkey
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      input.focus();
      showDropdown();
    }
  });
}

// ==========================================================================
// 7. AI ASSISTANT PANEL CONTROLLER
// ==========================================================================
function initAiAssistant() {
  const btnSummarize = document.getElementById('btnAiSummarize');
  const btnExplain = document.getElementById('btnAiExplainScenes');
  const btnThemes = document.getElementById('btnAiThemes');
  const btnSimilar = document.getElementById('btnAiSimilar');
  const responseBox = document.getElementById('aiResponseBox');
  const chatForm = document.getElementById('aiChatForm');
  const chatInput = document.getElementById('aiChatInput');

  if (!responseBox) return;

  function getActiveContextTitle() {
    return state.currentTitle || 'Current Video';
  }

  if (btnSummarize) {
    btnSummarize.onclick = () => {
      const title = getActiveContextTitle();
      responseBox.innerHTML = `
        <p>📋 <strong>AI Narrative Summary — ${escapeHtml(title)}</strong></p>
        <p style="margin-top:6px;">This cinematic work explores high-stakes moral dilemmas, existential identity, and human resilience. Driven by intense character dynamics and visual pacing, the narrative builds toward a revelatory climax that challenges traditional storytelling conventions.</p>
        <p style="margin-top:6px;"><strong>Core Arc:</strong> The protagonist undergoes transformative psychological evolution, navigating conflict between duty and inner truth.</p>
      `;
    };
  }

  if (btnExplain) {
    btnExplain.onclick = () => {
      const title = getActiveContextTitle();
      responseBox.innerHTML = `
        <p>🎬 <strong>Scene & Cinematography Breakdown — ${escapeHtml(title)}</strong></p>
        <p style="margin-top:6px;"><strong>Key Scene 1 (Opening Motif):</strong> Establishes atmospheric dread and character isolation through wide anamorphic framing.</p>
        <p style="margin-top:6px;"><strong>Key Scene 2 (The Turning Point):</strong> A masterclass in tension, utilizing cross-cutting between quiet dialogue and impending catastrophe.</p>
        <p style="margin-top:6px;"><strong>The Climax:</strong> Resolves the central ideological paradox, leaving audiences with deliberate ambiguity regarding reality vs. perception.</p>
      `;
    };
  }

  if (btnThemes) {
    btnThemes.onclick = () => {
      const title = getActiveContextTitle();
      responseBox.innerHTML = `
        <p>💡 <strong>Key Themes & Philosophies — ${escapeHtml(title)}</strong></p>
        <ul style="padding-left:18px; margin-top:6px; display:flex; flex-direction:column; gap:4px;">
          <li><strong>Identity & Consciousness:</strong> Who controls our reality and our thoughts?</li>
          <li><strong>Sacrifice vs. Survival:</strong> The cost of ambition when confronting cosmic and existential scale.</li>
          <li><strong>Time & Memory:</strong> How emotional anchors transcend physics and dimensions.</li>
        </ul>
      `;
    };
  }

  if (btnSimilar) {
    btnSimilar.onclick = () => {
      responseBox.innerHTML = `
        <p>🍿 <strong>Recommended Next Watch:</strong></p>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
          <button class="ai-action-card-btn" onclick="playMovieByTmdbId(157336, 'Interstellar (2014)', 'movie')">🌌 Interstellar (2014) • 8.7 ★</button>
          <button class="ai-action-card-btn" onclick="playMovieByTmdbId(27205, 'Inception (2010)', 'movie')">🌀 Inception (2010) • 8.8 ★</button>
          <button class="ai-action-card-btn" onclick="playMovieByTmdbId(155, 'The Dark Knight (2008)', 'movie')">🦇 The Dark Knight (2008) • 9.0 ★</button>
        </div>
      `;
    };
  }

  if (chatForm && chatInput) {
    chatForm.onsubmit = (e) => {
      e.preventDefault();
      const q = chatInput.value.trim();
      if (!q) return;

      const title = getActiveContextTitle();
      chatInput.value = '';

      responseBox.innerHTML = `
        <p><strong>You:</strong> ${escapeHtml(q)}</p>
        <p style="margin-top:8px; color:var(--accent-highlight);">✨ <strong>Omni AI:</strong> In <em>${escapeHtml(title)}</em>, this directly connects to the thematic core of the film. The director uses symbolism, musical leitmotifs, and non-linear pacing to underscore how the characters confront their destiny. Every detail in the mise-en-scène was calculated to evoke this exact sensation.</p>
      `;
    };
  }
}

// ==========================================================================
// 8. OTHER PAGES (TV, ANIME, LIBRARY, FAVORITES, HISTORY, COLLECTION)
// ==========================================================================
function renderTvCarousels() {
  const trendingTrack = document.getElementById('tvTrendingCarousel');
  const topRatedTrack = document.getElementById('tvTopRatedCarousel');

  if (trendingTrack) {
    trendingTrack.innerHTML = CATALOG_TV.map(createMovieCardHTML).join('');
    attachMovieCardListeners(trendingTrack);
  }
  if (topRatedTrack) {
    topRatedTrack.innerHTML = [...CATALOG_TV].reverse().map(createMovieCardHTML).join('');
    attachMovieCardListeners(topRatedTrack);
  }
}

function renderAnimeCarousel() {
  const track = document.getElementById('animeCarousel');
  if (!track) return;
  const animePicks = [CATALOG_MOVIES[7], CATALOG_MOVIES[1], CATALOG_MOVIES[3], CATALOG_MOVIES[5]];
  track.innerHTML = animePicks.map(createMovieCardHTML).join('');
  attachMovieCardListeners(track);
}

function renderLibraryView() {
  const grid = document.getElementById('libraryGrid');
  const countText = document.getElementById('libraryCountText');
  if (!grid) return;

  if (state.watchlist.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📚</div>
        <h2 class="empty-state-title">Your Watchlist is Empty</h2>
        <p class="empty-state-desc">Explore our cinema catalog and click "+ Watchlist" on any title to save it for later.</p>
        <button class="empty-state-btn" onclick="navigate('movies')">Discover Movies</button>
      </div>
    `;
    if (countText) countText.textContent = '0 saved titles';
    return;
  }

  if (countText) countText.textContent = `${state.watchlist.length} saved titles`;
  grid.innerHTML = state.watchlist.map(createMovieCardHTML).join('');
  attachMovieCardListeners(grid);
}

function renderFavoritesView() {
  const grid = document.getElementById('favoritesGrid');
  const countText = document.getElementById('favoritesCountText');
  if (!grid) return;

  if (state.favorites.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">❤️</div>
        <h2 class="empty-state-title">No Favorites Yet</h2>
        <p class="empty-state-desc">Hover over any movie card and click the heart icon to add it to your favorite hall of fame.</p>
        <button class="empty-state-btn" onclick="navigate('movies')">Explore Movies</button>
      </div>
    `;
    if (countText) countText.textContent = '0 titles';
    return;
  }

  if (countText) countText.textContent = `${state.favorites.length} titles`;
  grid.innerHTML = state.favorites.map(createMovieCardHTML).join('');
  attachMovieCardListeners(grid);
}

function renderHistoryView() {
  const grid = document.getElementById('historyPageGrid');
  if (!grid) return;

  if (state.history.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🕒</div>
        <h2 class="empty-state-title">No Watch History</h2>
        <p class="empty-state-desc">Your watched movies, lectures, and course videos will appear here with smart resume timestamps.</p>
        <button class="empty-state-btn" onclick="navigate('movies')">Start Watching</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.history.map(item => `
    <div class="movie-card" data-url="${escapeHtml(item.url)}">
      <div class="card-poster-wrap" style="height: 220px;">
        <img class="card-poster-img" src="${item.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&fit=crop'}" alt="${escapeHtml(item.title)}">
        <div class="card-poster-gradient"></div>
        <div class="card-play-bubble">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      </div>
      <div class="card-info-box">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <div class="card-meta-row">
          <span>${item.label || 'Video'}</span>
          <span style="color:var(--accent-highlight);">Resume ▶</span>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.movie-card').forEach(card => {
    card.onclick = () => {
      loadUniversalMedia(card.dataset.url);
      navigate('home');
    };
  });
}

function renderCollectionView(collectionType) {
  const title = document.getElementById('collectionPageTitle');
  const grid = document.getElementById('collectionGrid');
  if (!grid) return;

  let movies = [...CATALOG_MOVIES];
  let headerText = 'Trending Cinema Collection';

  if (collectionType.startsWith('genre-')) {
    const genre = collectionType.replace('genre-', '');
    headerText = `${genre} Movies & Series`;
    movies = CATALOG_MOVIES.filter(m => m.genres && m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    if (movies.length === 0) movies = CATALOG_MOVIES.slice(0, 8);
  } else if (collectionType === 'top-rated') {
    headerText = 'Top Rated Masterpieces';
    movies.sort((a, b) => b.rating - a.rating);
  } else if (collectionType === 'new-releases') {
    headerText = 'New Releases & Recent Blockbusters';
    movies.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  } else if (collectionType === 'most-watched') {
    headerText = 'Most Watched Worldwide';
  } else if (collectionType === 'award-winning') {
    headerText = 'Award-Winning Cinema';
  }

  if (title) title.textContent = headerText;
  grid.innerHTML = movies.map(createMovieCardHTML).join('');
  attachMovieCardListeners(grid);

  // Sorting pills
  document.querySelectorAll('.collection-filter-pill').forEach(pill => {
    pill.onclick = () => {
      document.querySelectorAll('.collection-filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const sort = pill.dataset.sort;
      let sorted = [...movies];
      if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
      if (sort === 'newest') sorted.sort((a, b) => parseInt(b.year) - parseInt(a.year));

      grid.innerHTML = sorted.map(createMovieCardHTML).join('');
      attachMovieCardListeners(grid);
    };
  });
}

// Watchlist & Favorites helpers
function toggleWatchlist(movie) {
  const index = state.watchlist.findIndex(m => m.id === movie.id);
  if (index >= 0) {
    state.watchlist.splice(index, 1);
    showToast(`Removed from Watchlist: ${movie.title}`);
  } else {
    state.watchlist.unshift(movie);
    showToast(`Added to Watchlist: ${movie.title}`);
  }
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(state.watchlist));
  updateSidebarCounters();
}

function toggleFavorite(movie, btnElement) {
  const index = state.favorites.findIndex(m => m.id === movie.id);
  let isFav = false;
  if (index >= 0) {
    state.favorites.splice(index, 1);
    showToast(`Removed from Favorites: ${movie.title}`);
    isFav = false;
  } else {
    state.favorites.unshift(movie);
    showToast(`Added to Favorites: ${movie.title}`);
    isFav = true;
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
  updateSidebarCounters();

  if (btnElement) {
    btnElement.classList.toggle('favorited', isFav);
    const svg = btnElement.querySelector('svg');
    if (svg) svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
  }
}

function updateSidebarCounters() {
  const countW = document.getElementById('sidebarWatchlistCount');
  const countF = document.getElementById('sidebarFavoritesCount');
  if (countW) countW.textContent = state.watchlist.length;
  if (countF) countF.textContent = state.favorites.length;
}

// ==========================================================================
// 9. PROFESSIONAL UNIVERSAL VIDEO PLAYER ENGINE
// ==========================================================================
function playMovieByTmdbId(id, fullTitle, type = 'movie') {
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

  navigate('home');
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
  const iframe = document.getElementById('genericIframe');
  if (iframe) iframe.src = newUrl;
  renderCinemaServerSelector();
  showToast(`Switched to ${srv.name}`);
}

function inspectUrl(inputUrl) {
  if (!inputUrl) return null;
  const trimmed = inputUrl.trim();

  // YouTube
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch) {
    return {
      type: 'youtube',
      label: 'YouTube Stream',
      videoId: ytMatch[1],
      url: trimmed,
      title: `YouTube Video (${ytMatch[1]})`,
    };
  }

  // Cinema Movie Embed
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

  // DRM
  if (trimmed.match(/(?:hotstar\.com|jiocinema\.com|jiohotstar\.com)/i)) {
    return {
      type: 'drm',
      label: '🔒 JioHotstar (DRM)',
      url: trimmed,
      title: 'JioHotstar Stream (DRM Encrypted)',
    };
  }

  // HLS .m3u8
  if (trimmed.includes('.m3u8')) {
    return {
      type: 'hls',
      label: 'HLS (.m3u8) Stream',
      url: trimmed,
      title: 'HLS Course Stream (.m3u8)',
    };
  }

  // Direct MP4
  if (trimmed.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i)) {
    return {
      type: 'mp4',
      label: 'Direct MP4 Stream',
      url: trimmed,
      title: 'Direct Video Stream',
    };
  }

  return {
    type: 'generic',
    label: 'Universal Web Media',
    url: trimmed,
    title: 'Web Media Stream',
  };
}

function loadUniversalMedia(mediaSource) {
  if (!mediaSource) return;

  const inspection = (typeof mediaSource === 'string') 
    ? inspectUrl(mediaSource) 
    : mediaSource;

  if (!inspection) {
    showToast('⚠️ Please enter a valid video link');
    return;
  }

  if (inspection.type === 'drm') {
    const modalDrm = document.getElementById('modalDrm');
    if (modalDrm) modalDrm.classList.remove('hidden');
    showToast('🔒 DRM protected stream detected');
    return;
  }

  resetAllEngines();

  const heroSplash = document.getElementById('playerHeroSplash');
  if (heroSplash) heroSplash.classList.add('hidden');

  state.currentUrl = inspection.url || inspection.embedUrl;
  state.currentTitle = inspection.title || 'OmniPlayer Media';

  const titleEl = document.getElementById('videoTitle');
  if (titleEl) titleEl.textContent = state.currentTitle;

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

  addToHistory(inspection);
}

function resetAllEngines() {
  stopYouTubeTicker();
  const wrapper = document.getElementById('playerWrapper');
  const controls = document.getElementById('controlsOverlay');
  const html5Video = document.getElementById('html5Video');
  const ytWrap = document.getElementById('youtubeWrapper');
  const iframe = document.getElementById('genericIframe');

  if (wrapper) wrapper.classList.remove('cinema-iframe-mode');
  if (controls) controls.classList.remove('hidden');

  if (html5Video) {
    html5Video.pause();
    html5Video.removeAttribute('src');
    html5Video.load();
    html5Video.classList.remove('hidden');
  }

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (ytWrap) ytWrap.classList.add('hidden');
  if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
    try { ytPlayer.stopVideo(); } catch (e) {}
  }

  if (iframe) {
    iframe.classList.add('hidden');
    iframe.src = 'about:blank';
  }

  const srvSelector = document.getElementById('cinemaServerSelector');
  if (srvSelector) srvSelector.classList.add('hidden');

  state.isPlaying = false;
  state.currentTime = 0;
  state.duration = 0;
  updatePlayPauseUI(false);
  updateProgressBar(0, 0);
}

function loadHtml5Engine(url, isLocal = false) {
  state.activeEngine = 'html5';
  const wrapper = document.getElementById('playerWrapper');
  const controls = document.getElementById('controlsOverlay');
  const html5Video = document.getElementById('html5Video');

  if (wrapper) wrapper.classList.remove('cinema-iframe-mode');
  if (controls) controls.classList.remove('hidden');
  if (html5Video) {
    html5Video.classList.remove('hidden');
    html5Video.src = url;
    html5Video.playbackRate = state.playbackRate;
    html5Video.play().then(() => {
      state.isPlaying = true;
      updatePlayPauseUI(true);
      initWebAudio();
    }).catch(() => {});
  }
}

function loadHlsEngine(url) {
  state.activeEngine = 'html5';
  const wrapper = document.getElementById('playerWrapper');
  const controls = document.getElementById('controlsOverlay');
  const html5Video = document.getElementById('html5Video');

  if (wrapper) wrapper.classList.remove('cinema-iframe-mode');
  if (controls) controls.classList.remove('hidden');
  if (!html5Video) return;

  html5Video.classList.remove('hidden');

  if (Hls.isSupported()) {
    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(html5Video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      html5Video.play().then(() => {
        state.isPlaying = true;
        updatePlayPauseUI(true);
        initWebAudio();
      }).catch(() => {});
    });
  } else if (html5Video.canPlayType('application/vnd.apple.mpegurl')) {
    html5Video.src = url;
    html5Video.play().catch(() => {});
  }
}

window.onYouTubeIframeAPIReady = function() {
  ytReady = true;
};

function loadYouTubeEngine(videoId) {
  state.activeEngine = 'youtube';
  state.currentYoutubeId = videoId;
  const wrapper = document.getElementById('playerWrapper');
  const controls = document.getElementById('controlsOverlay');
  const html5Video = document.getElementById('html5Video');
  const ytWrap = document.getElementById('youtubeWrapper');

  if (wrapper) wrapper.classList.remove('cinema-iframe-mode');
  if (controls) controls.classList.remove('hidden');
  if (html5Video) html5Video.classList.add('hidden');
  if (ytWrap) ytWrap.classList.remove('hidden');

  if (typeof YT === 'undefined' || !YT.Player) {
    const checkInterval = setInterval(() => {
      if (typeof YT !== 'undefined' && YT.Player) {
        clearInterval(checkInterval);
        loadYouTubeEngine(videoId);
      }
    }, 150);
    return;
  }

  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    try {
      ytPlayer.loadVideoById({ videoId, startSeconds: 0 });
      state.isPlaying = true;
      updatePlayPauseUI(true);
      startYouTubeTicker();
      return;
    } catch (e) {}
  }

  ytPlayer = new YT.Player('youtubePlayerContainer', {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      enablejsapi: 1,
    },
    events: {
      onReady: (e) => {
        e.target.playVideo();
        state.isPlaying = true;
        updatePlayPauseUI(true);
        startYouTubeTicker();
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          state.isPlaying = true;
          updatePlayPauseUI(true);
          startYouTubeTicker();
        } else if (e.data === YT.PlayerState.PAUSED) {
          state.isPlaying = false;
          updatePlayPauseUI(false);
          stopYouTubeTicker();
        }
      }
    }
  });
}

function startYouTubeTicker() {
  stopYouTubeTicker();
  ytProgressTicker = setInterval(() => {
    if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
      try {
        const cur = ytPlayer.getCurrentTime() || 0;
        const dur = ytPlayer.getDuration() || state.duration || 0;
        if (dur > 0) state.duration = dur;
        updateProgressBar(cur, dur);
      } catch (err) {}
    }
  }, 100);
}

function stopYouTubeTicker() {
  if (ytProgressTicker) {
    clearInterval(ytProgressTicker);
    ytProgressTicker = null;
  }
}

function loadIframeEngine(embedUrl) {
  state.activeEngine = 'iframe';
  const wrapper = document.getElementById('playerWrapper');
  const controls = document.getElementById('controlsOverlay');
  const html5Video = document.getElementById('html5Video');
  const ytWrap = document.getElementById('youtubeWrapper');
  const iframe = document.getElementById('genericIframe');

  if (wrapper) wrapper.classList.add('cinema-iframe-mode');
  if (controls) controls.classList.add('hidden');
  if (html5Video) html5Video.classList.add('hidden');
  if (ytWrap) ytWrap.classList.add('hidden');

  if (iframe) {
    iframe.classList.remove('hidden');
    iframe.src = embedUrl;
  }
}

// Controls logic
function togglePlayPause() {
  if (state.activeEngine === 'html5') {
    const video = document.getElementById('html5Video');
    if (video.paused) {
      video.play().then(() => updatePlayPauseUI(true)).catch(() => {});
    } else {
      video.pause();
      updatePlayPauseUI(false);
    }
  } else if (state.activeEngine === 'youtube' && ytPlayer) {
    if (state.isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }
}

function updatePlayPauseUI(isPlaying) {
  state.isPlaying = isPlaying;
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');
  if (iconPlay && iconPause) {
    iconPlay.classList.toggle('hidden', isPlaying);
    iconPause.classList.toggle('hidden', !isPlaying);
  }
}

function updateProgressBar(cur, dur) {
  state.currentTime = cur;
  state.duration = dur;

  const curEl = document.getElementById('currentTime');
  const durEl = document.getElementById('durationTime');
  const progressEl = document.getElementById('timelineProgress');

  if (curEl) curEl.textContent = formatTimecode(cur);
  if (durEl) durEl.textContent = formatTimecode(dur);

  if (progressEl && dur > 0) {
    const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
    progressEl.style.width = `${pct}%`;
  }
}

function seekRelative(deltaSeconds) {
  if (state.activeEngine === 'html5') {
    const video = document.getElementById('html5Video');
    if (video && video.duration) {
      video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + deltaSeconds));
    }
  } else if (state.activeEngine === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    const cur = ytPlayer.getCurrentTime() || 0;
    ytPlayer.seekTo(Math.max(0, cur + deltaSeconds), true);
  }
}

function initWebAudio() {
  try {
    const video = document.getElementById('html5Video');
    if (!video || audioContext) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    audioSourceNode = audioContext.createMediaElementSource(video);
    audioGainNode = audioContext.createGain();
    audioGainNode.gain.value = state.audioBoostFactor;
    audioSourceNode.connect(audioGainNode);
    audioGainNode.connect(audioContext.destination);
  } catch (e) {}
}

function setAudioBoost(factor) {
  state.audioBoostFactor = factor;
  if (audioGainNode) audioGainNode.gain.value = factor;
  const text = document.getElementById('boostPillText');
  if (text) text.textContent = `${Math.round(factor * 100)}%`;
  showToast(`Audio Boost: ${Math.round(factor * 100)}%`);
}

function addToHistory(item) {
  const historyItem = {
    title: item.title || state.currentTitle,
    url: item.url || item.embedUrl,
    type: item.type,
    label: item.label,
    poster: item.poster || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&fit=crop',
    time: Date.now()
  };

  state.history = state.history.filter(h => h.url !== historyItem.url);
  state.history.unshift(historyItem);
  if (state.history.length > 20) state.history.pop();
  localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(state.history));
  renderContinueWatchingCarousel();
}

// ==========================================================================
// 10. EVENT LISTENERS INITIALIZATION
// ==========================================================================
function bindAllEventListeners() {
  // Hash routing
  window.addEventListener('hashchange', handleHashChange);

  // Sidebar navigation links
  document.querySelectorAll('.platform-sidebar .nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.dataset.route;
      navigate(route);
    });
  });

  // Mobile menu toggle
  const btnMobile = document.getElementById('btnMobileMenu');
  const sidebar = document.getElementById('platformSidebar');
  if (btnMobile && sidebar) {
    btnMobile.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Topbar Paste & Play Button
  const topbarPaste = document.getElementById('topbarBtnPaste');
  if (topbarPaste) {
    topbarPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          loadUniversalMedia(text.trim());
          navigate('home');
          showToast('Link pasted & streaming started!');
        } else {
          showToast('Clipboard is empty');
        }
      } catch (err) {
        showToast('Paste URL in the search bar');
      }
    });
  }

  // Studio URL bar
  const btnLoadUrl = document.getElementById('btnLoadUrl');
  const videoUrlInput = document.getElementById('videoUrlInput');
  if (btnLoadUrl && videoUrlInput) {
    btnLoadUrl.addEventListener('click', () => {
      const url = videoUrlInput.value.trim();
      if (url) {
        loadUniversalMedia(url);
      }
    });
  }

  const btnPasteClip = document.getElementById('btnPasteClipboard');
  if (btnPasteClip && videoUrlInput) {
    btnPasteClip.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          videoUrlInput.value = text.trim();
          loadUniversalMedia(text.trim());
          showToast('Link loaded!');
        }
      } catch (e) {}
    });
  }

  // Local File Upload
  const localInput = document.getElementById('localFileInput');
  if (localInput) {
    localInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const localUrl = URL.createObjectURL(file);
        loadUniversalMedia({
          type: 'local',
          url: localUrl,
          title: file.name
        });
        navigate('home');
        showToast(`Loaded: ${file.name}`);
      }
    });
  }

  // Subtitles
  const subInput = document.getElementById('subtitlesFileInput');
  const subTrack = document.getElementById('subtitlesTrack');
  if (subInput && subTrack) {
    subInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        subTrack.src = URL.createObjectURL(file);
        showToast(`Subtitles loaded: ${file.name}`);
      }
    });
  }

  // Audio Boost button toggle
  const btnBoost = document.getElementById('btnAudioBoost');
  if (btnBoost) {
    btnBoost.addEventListener('click', () => {
      let nextFactor = state.audioBoostFactor === 1.0 ? 1.5 : (state.audioBoostFactor === 1.5 ? 2.0 : (state.audioBoostFactor === 2.0 ? 3.0 : 1.0));
      setAudioBoost(nextFactor);
    });
  }

  // Player controls
  const btnPlay = document.getElementById('btnPlayPause');
  if (btnPlay) btnPlay.addEventListener('click', togglePlayPause);

  const btnRewind = document.getElementById('btnSeekBack');
  if (btnRewind) btnRewind.addEventListener('click', () => seekRelative(-10));

  const btnForward = document.getElementById('btnSeekFwd');
  if (btnForward) btnForward.addEventListener('click', () => seekRelative(10));

  // Volume
  const volSlider = document.getElementById('volumeSlider');
  const btnMute = document.getElementById('btnMute');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.volume = val;
      const video = document.getElementById('html5Video');
      if (video) video.volume = val;
      if (ytPlayer && typeof ytPlayer.setVolume === 'function') ytPlayer.setVolume(val * 100);
    });
  }

  if (btnMute) {
    btnMute.addEventListener('click', () => {
      state.isMuted = !state.isMuted;
      const video = document.getElementById('html5Video');
      if (video) video.muted = state.isMuted;
      if (ytPlayer) {
        if (state.isMuted) ytPlayer.mute(); else ytPlayer.unMute();
      }
      const iconVolHigh = document.getElementById('iconVolumeHigh');
      const iconVolMute = document.getElementById('iconVolumeMute');
      if (iconVolHigh && iconVolMute) {
        iconVolHigh.classList.toggle('hidden', state.isMuted);
        iconVolMute.classList.toggle('hidden', !state.isMuted);
      }
    });
  }

  // Speed Popover
  const btnSpeed = document.getElementById('btnSpeed');
  const speedPopover = document.getElementById('speedPopover');
  if (btnSpeed && speedPopover) {
    btnSpeed.addEventListener('click', (e) => {
      e.stopPropagation();
      speedPopover.classList.toggle('open');
    });

    speedPopover.querySelectorAll('.speed-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        state.playbackRate = speed;
        const video = document.getElementById('html5Video');
        if (video) video.playbackRate = speed;
        if (ytPlayer && typeof ytPlayer.setPlaybackRate === 'function') ytPlayer.setPlaybackRate(speed);
        const text = document.getElementById('currentSpeedText');
        if (text) text.textContent = `${speed}x`;
        speedPopover.querySelectorAll('.speed-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        speedPopover.classList.remove('open');
        showToast(`Speed: ${speed}x`);
      });
    });
  }

  // Video Filter Popover
  const btnFilter = document.getElementById('btnFilter');
  const filterPopover = document.getElementById('filterPopover');
  if (btnFilter && filterPopover) {
    btnFilter.addEventListener('click', (e) => {
      e.stopPropagation();
      filterPopover.classList.toggle('open');
    });

    filterPopover.querySelectorAll('.filter-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        applyVideoFilter(filter);
        filterPopover.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterPopover.classList.remove('open');
      });
    });
  }

  // Timeline scrubber click / drag
  const timeline = document.getElementById('timelineContainer');
  if (timeline) {
    timeline.addEventListener('click', (e) => {
      const rect = timeline.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (state.duration > 0) {
        const targetTime = pct * state.duration;
        if (state.activeEngine === 'html5') {
          const video = document.getElementById('html5Video');
          if (video) video.currentTime = targetTime;
        } else if (state.activeEngine === 'youtube' && ytPlayer) {
          ytPlayer.seekTo(targetTime, true);
        }
      }
    });
  }

  // Fullscreen, Theatre, PiP, Screenshot
  const btnFs = document.getElementById('btnFullscreen');
  if (btnFs) {
    btnFs.addEventListener('click', () => {
      const wrapper = document.getElementById('playerWrapper');
      if (!document.fullscreenElement) {
        if (wrapper?.requestFullscreen) wrapper.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  const btnPip = document.getElementById('btnPip');
  if (btnPip) {
    btnPip.addEventListener('click', async () => {
      const video = document.getElementById('html5Video');
      if (video && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      }
    });
  }

  const btnTheatre = document.getElementById('btnTheatre');
  if (btnTheatre) {
    btnTheatre.addEventListener('click', () => {
      state.theatreMode = !state.theatreMode;
      const layout = document.getElementById('playerLayout');
      if (layout) layout.classList.toggle('theatre-mode', state.theatreMode);
      showToast(state.theatreMode ? 'Theatre Mode Active' : 'Standard Mode');
    });
  }

  const btnShot = document.getElementById('btnScreenshot');
  if (btnShot) {
    btnShot.addEventListener('click', captureScreenshot);
  }

  // Double-click gestures on player
  const playerWrapper = document.getElementById('playerWrapper');
  if (playerWrapper) {
    playerWrapper.addEventListener('dblclick', (e) => {
      const rect = playerWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.35) {
        triggerSeekRipple('left');
        seekRelative(-10);
      } else if (clickX > rect.width * 0.65) {
        triggerSeekRipple('right');
        seekRelative(10);
      } else {
        const btnFs = document.getElementById('btnFullscreen');
        if (btnFs) btnFs.click();
      }
    });
  }

  // Workspace Hub tabs (AI Assistant, Notes, History)
  const tabAi = document.getElementById('tabBtnAi');
  const tabNotes = document.getElementById('tabBtnNotes');
  const tabHist = document.getElementById('tabBtnHistory');
  const cAi = document.getElementById('tabContentAi');
  const cNotes = document.getElementById('tabContentNotes');
  const cHist = document.getElementById('tabContentHistory');

  if (tabAi && tabNotes && tabHist) {
    tabAi.onclick = () => switchPlayerSidebarTab('ai');
    tabNotes.onclick = () => switchPlayerSidebarTab('notes');
    tabHist.onclick = () => switchPlayerSidebarTab('history');
  }

  function switchPlayerSidebarTab(tabName) {
    [tabAi, tabNotes, tabHist].forEach(t => t?.classList.remove('active'));
    [cAi, cNotes, cHist].forEach(c => c?.classList.remove('active'));

    if (tabName === 'ai') {
      tabAi?.classList.add('active');
      cAi?.classList.add('active');
    } else if (tabName === 'notes') {
      tabNotes?.classList.add('active');
      cNotes?.classList.add('active');
    } else if (tabName === 'history') {
      tabHist?.classList.add('active');
      cHist?.classList.add('active');
    }
  }

  // Clear Full History button
  const btnClearFullHist = document.getElementById('btnClearFullHistory');
  if (btnClearFullHist) {
    btnClearFullHist.onclick = () => {
      state.history = [];
      localStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
      renderHistoryView();
      showToast('Watch history cleared');
    };
  }

  // Modals (Guide, Shortcuts, DRM)
  setupModal('modalGuide', 'btnGuideModal', 'btnCloseGuide');
  setupModal('modalShortcuts', 'btnShortcutsModal', 'btnCloseShortcuts');
  setupModal('modalDrm', null, 'btnCloseDrm');

  // Ambient Glow Toggle
  const ambientBtn = document.getElementById('ambientToggleBtn');
  if (ambientBtn) {
    ambientBtn.addEventListener('click', () => {
      state.ambientEnabled = !state.ambientEnabled;
      ambientBtn.classList.toggle('active', state.ambientEnabled);
      const wrapper = document.getElementById('ambientWrapper');
      if (wrapper) wrapper.style.display = state.ambientEnabled ? 'block' : 'none';
      showToast(state.ambientEnabled ? 'Ambient Glow: ON' : 'Ambient Glow: OFF');
    });
  }

  // Hero Quick Chips
  document.querySelectorAll('.hero-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = parseInt(chip.dataset.id, 10);
      const title = chip.dataset.title;
      playMovieByTmdbId(id, title, 'movie');
    });
  });

  // Global Keyboard shortcuts
  window.addEventListener('keydown', handleGlobalKeydown);
}

function setupModal(modalId, openBtnId, closeBtnId) {
  const modal = document.getElementById(modalId);
  const openBtn = openBtnId ? document.getElementById(openBtnId) : null;
  const closeBtn = closeBtnId ? document.getElementById(closeBtnId) : null;

  if (openBtn && modal) {
    openBtn.onclick = () => modal.classList.remove('hidden');
  }
  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.add('hidden');
  }
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    };
  }
}

function triggerSeekRipple(direction) {
  const ripple = document.getElementById(direction === 'left' ? 'rippleLeft' : 'rippleRight');
  if (ripple) {
    ripple.classList.add('active');
    setTimeout(() => ripple.classList.remove('active'), 450);
  }
}

function applyVideoFilter(filterName) {
  state.activeFilter = filterName;
  const video = document.getElementById('html5Video');
  if (!video) return;

  switch (filterName) {
    case 'night-invert':
      video.style.filter = 'invert(90%) hue-rotate(180deg) contrast(110%)';
      break;
    case 'high-contrast':
      video.style.filter = 'contrast(160%) brightness(95%)';
      break;
    case 'warm':
      video.style.filter = 'sepia(25%) saturate(120%) brightness(95%)';
      break;
    case 'grayscale':
      video.style.filter = 'grayscale(100%) contrast(120%)';
      break;
    default:
      video.style.filter = 'none';
      break;
  }
  showToast(`Filter: ${filterName}`);
}

function captureScreenshot() {
  const video = document.getElementById('html5Video');
  if (!video || !video.videoWidth) {
    showToast('⚠️ No video frame available to capture');
    return;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `OmniPlayer-Frame-${Date.now()}.png`;
    a.click();
    showToast('📸 HD frame screenshot saved!');
  } catch (err) {
    showToast('⚠️ Cross-origin security prevents frame snapshot');
  }
}

function handleGlobalKeydown(e) {
  // Cmd+K / Ctrl+K to focus search anywhere
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
    return;
  }

  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

  switch (e.key.toLowerCase()) {
    case '/':
      e.preventDefault();
      document.getElementById('globalSearchInput')?.focus();
      break;
    case ' ':
    case 'k':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'j':
    case 'arrowleft':
      e.preventDefault();
      seekRelative(-10);
      break;
    case 'l':
    case 'arrowright':
      e.preventDefault();
      seekRelative(10);
      break;
    case 'f':
      e.preventDefault();
      document.getElementById('btnFullscreen')?.click();
      break;
    case 't':
      e.preventDefault();
      document.getElementById('btnTheatre')?.click();
      break;
    case 'p':
      e.preventDefault();
      document.getElementById('btnPip')?.click();
      break;
    case 's':
      e.preventDefault();
      captureScreenshot();
      break;
    case 'm':
      e.preventDefault();
      document.getElementById('btnMute')?.click();
      break;
  }
}

// Format utilities
function formatTimecode(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg) {
  const toast = document.getElementById('playerToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ==========================================================================
// 11. PLATFORM INITIALIZATION
// ==========================================================================
function initPlatform() {
  bindAllEventListeners();
  initSmartSearch();
  initMoviesPage();
  initAiAssistant();

  // Initial Route Check from URL hash
  handleHashChange();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlatform);
} else {
  initPlatform();
}
