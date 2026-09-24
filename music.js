/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — music.js
   Real Retro Cassette Player with swipe gestures
═══════════════════════════════════════════════ */
const $ = s => document.querySelector(s);

// Musiqilər yalnız admin paneldən əlavə olunur.
const DEFAULT_TRACKS = [];

let tracks = [];
let currentIndex = 0;
const audio = $('#audio');
const cassette = $('#cassette');
const stage = $('#stage');
const prevCassette = $('#prevCassette');
const nextCassette = $('#nextCassette');

// ── FORMAT TIME ─────────────────────────────
function fmt(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

// ── TOAST ───────────────────────────────────
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

// ── RENDER CASSETTE ──────────────────────────
function render() {
  if (!tracks.length) {
    $('#trackName').textContent = 'Hələ musiqi əlavə edilməyib';
    $('#artistLabel').textContent = 'Admin paneldən musiqi əlavə edin';
    $('#cover').src = 'assets/bow.png';
    if (audio) { audio.removeAttribute('src'); audio.load(); }
    if ($('#prevTitle')) $('#prevTitle').textContent = '—';
    if ($('#nextTitle')) $('#nextTitle').textContent = '—';
    return;
  }
  const t = tracks[currentIndex];
  if (!t) return;

  $('#trackName').textContent = t.title;
  $('#artistLabel').textContent = t.artist || 'Duman';
  $('#cover').src = t.cover_url || 'assets/bow.png';
  
  if (audio.src !== t.audio_url) {
    audio.src = t.audio_url || '';
  }

  // Side cassettes titles
  const prev = tracks[(currentIndex - 1 + tracks.length) % tracks.length];
  const next = tracks[(currentIndex + 1) % tracks.length];
  
  const prevTitle = $('#prevTitle');
  const nextTitle = $('#nextTitle');
  if (prevTitle && prev) prevTitle.textContent = prev.title;
  if (nextTitle && next) nextTitle.textContent = next.title;
}

// ── CHANGE TRACK ─────────────────────────────
let isChanging = false;
function change(dir) {
  if (!tracks.length || isChanging) return;
  isChanging = true;
  const wasPlaying = !audio.paused;
  
  cassette.classList.remove('enter-pop');
  cassette.classList.add(dir > 0 ? 'exit-left' : 'exit-right');
  
  setTimeout(() => {
    currentIndex = (currentIndex + dir + tracks.length) % tracks.length;
    cassette.classList.remove('exit-left', 'exit-right');
    void cassette.offsetWidth; // reflow
    cassette.classList.add('enter-pop');
    render();
    
    if (wasPlaying) {
      audio.play().then(() => {
        cassette.classList.add('playing');
        $('#playBtn').textContent = '⏸';
      }).catch(() => {});
    }
    isChanging = false;
  }, 260);
}

// Click on side cassettes to change track
prevCassette?.addEventListener('click', () => change(-1));
nextCassette?.addEventListener('click', () => change(1));

// ── PLAY/PAUSE ───────────────────────────────
$('#playBtn').onclick = () => {
  if (!tracks.length) { toast('Hələ musiqi yoxdur'); return; }
  if (audio.paused) {
    audio.play().then(() => {
      cassette.classList.add('playing');
      $('#playBtn').textContent = '⏸';
    }).catch(() => {
      // Simulate playback if browser blocks autoplay or format unsupported
      cassette.classList.add('playing');
      $('#playBtn').textContent = '⏸';
      toast('Musiqi çalınır 🎵');
    });
  } else {
    audio.pause();
    cassette.classList.remove('playing');
    $('#playBtn').textContent = '▶';
  }
};

audio.onplay = () => {
  cassette.classList.add('playing');
  $('#playBtn').textContent = '⏸';
};

audio.onpause = () => {
  cassette.classList.remove('playing');
  $('#playBtn').textContent = '▶';
};

audio.onended = () => change(1);

// ── PROGRESS ────────────────────────────────
audio.ontimeupdate = () => {
  $('#currentTime').textContent = fmt(audio.currentTime);
  $('#duration').textContent = fmt(audio.duration || 180);
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  const seekEl = $('#seek');
  if (seekEl && !seekEl.matches(':active')) seekEl.value = pct;
};

$('#seek').oninput = e => {
  if (audio.duration) {
    audio.currentTime = (e.target.value / 100) * audio.duration;
  }
};

$('#prevBtn').onclick = () => change(-1);
$('#nextBtn').onclick = () => change(1);

// ── SWIPE GESTURES (TOUCH & MOUSE) ───────────
let touchStartX = 0, touchStartY = 0, isSwiping = false;

stage.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isSwiping = false;
}, { passive: true });

stage.addEventListener('touchmove', e => {
  const dx = Math.abs(e.touches[0].clientX - touchStartX);
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (dx > dy && dx > 8) isSwiping = true;
}, { passive: true });

stage.addEventListener('touchend', e => {
  if (!isSwiping) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) change(dx < 0 ? 1 : -1);
  isSwiping = false;
});

// Pointer drag fallback for desktop / mouse
let mouseStartX = 0, isDragging = false;
stage.addEventListener('mousedown', e => {
  mouseStartX = e.clientX;
  isDragging = true;
});

stage.addEventListener('mouseup', e => {
  if (!isDragging) return;
  const dx = e.clientX - mouseStartX;
  if (Math.abs(dx) > 50) change(dx < 0 ? 1 : -1);
  isDragging = false;
});

stage.addEventListener('mouseleave', () => { isDragging = false; });

// ── OPEN SONG BY TITLE (from test page or ticket) ──
function openSongByTitle(title) {
  if (!title) return;
  const tNorm = title.toLowerCase().trim();
  const idx = tracks.findIndex(t =>
    t.title.toLowerCase().includes(tNorm) || tNorm.includes(t.title.toLowerCase())
  );
  if (idx >= 0) {
    currentIndex = idx;
    render();
    audio.play().catch(() => {});
  }
}

// ── LOAD TRACKS FROM API ─────────────────────
async function initPlaylist() {
  try {
    const res = await fetch('/api/public');
    if (res.ok) {
      const data = await res.json();
      if (data.music && data.music.length > 0) {
        tracks = data.music;
      }
    }
  } catch (err) {
    // Boş siyahı saxlanılır; saxta/fallback musiqi göstərilmir
  }

  render();

  // Check URL param ?song=...
  const params = new URLSearchParams(location.search);
  const songParam = params.get('song');
  if (songParam) {
    openSongByTitle(decodeURIComponent(songParam));
  }
}

initPlaylist();