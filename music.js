/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — music.js
   Real Retro Cassette Player with swipe gestures
═══════════════════════════════════════════════ */
const $ = s => document.querySelector(s);

// Musiqilər yalnız admin paneldən əlavə olunur.
const DEFAULT_TRACKS = [];

const CURATED_TRACKS = [
  { title:'Senden Daha Güzel', artist:'Duman', album:'Duman II', position:1 },
  { title:'Her Şeyi Yak', artist:'Duman', album:'Belki Alışman Lazım', position:2 },
  { title:'Aman Aman', artist:'Duman', album:'Seni Kendime Sakladım', position:3 },
  { title:'Seni Kendime Sakladım', artist:'Duman', album:'Seni Kendime Sakladım', position:4 },
  { title:'Bu Akşam', artist:'Duman', album:'Belki Alışman Lazım', position:5 },
  { title:'Haberin Yok Ölüyorum', artist:'Duman', album:'Belki Alışman Lazım', position:6 },
  { title:'Köprüaltı', artist:'Duman', album:'Eski Köprünün Altında', position:7 },
  { title:'Dibine Kadar', artist:'Duman', album:'Duman I', position:8 },
  { title:'Yürek', artist:'Duman', album:'Darmaduman', position:9 },
  { title:'Öyle Dertli', artist:'Duman', album:'Darmaduman', position:10 },
  { title:'Gözleri Kanlı', artist:'Duman', album:'Darmaduman', position:11 },
  { title:'Belki Alışman Lazım', artist:'Duman', album:'Belki Alışman Lazım', position:12 },
  { title:'Rüyanda Görsen İnanma', artist:'Duman', album:'Seni Kendime Sakladım', position:13 },
  { title:'En Güzel Günüm Gecem', artist:'Duman', album:'Seni Kendime Sakladım', position:14 },
  { title:'Kufi', artist:'Duman', album:'Kufi', position:15 }
];

// Mahnıların tam audio faylları müəllif hüquqlarına görə repoya daxil edilmir.
// Admin paneldən hüququnuz olan audio URL əlavə edildikdə həmin mahnı player-də aktiv görünür.



let bgColorToken = 0;

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function setMusicBackgroundFromCover(url) {
  const page = document.body;
  if (!url) {
    page.style.removeProperty('--cover-bg');
    page.style.removeProperty('--cover-glow');
    return;
  }

  const token = ++bgColorToken;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (token !== bgColorToken) return;
    try {
      const canvas = document.createElement('canvas');
      const size = 48;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const a = data[i + 3];
        if (a < 120) continue;
        const rr=data[i], gg=data[i+1], bb=data[i+2];
        const max=Math.max(rr,gg,bb), min=Math.min(rr,gg,bb);
        if (max < 18 || min > 242) continue;
        r += rr; g += gg; b += bb; count++;
      }
      if (!count) return;
      r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count);
      const [h,s] = rgbToHsl(r,g,b);
      const sat = Math.max(28, Math.min(68, s));
      page.style.setProperty('--cover-bg', `hsl(${h} ${sat}% 13%)`);
      page.style.setProperty('--cover-glow', `hsl(${h} ${Math.min(82,sat+14)}% 34%)`);
    } catch (_) {
      page.style.removeProperty('--cover-bg');
      page.style.removeProperty('--cover-glow');
    }
  };
  img.onerror = () => {};
  img.src = url;
}

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
  document.querySelectorAll('.playlist-track').forEach((el,i)=>el.classList.toggle('active',i===currentIndex));
  $('#artistLabel').textContent = t.artist || 'Duman';
  $('#cover').src = t.cover_url || 'assets/bow.png';
  setMusicBackgroundFromCover(t.cover_url);
  
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

// ── PLAYLIST DRAWER ───────────────────────────
const playlistSheet = $('#playlistSheet');
const playlistBackdrop = $('#playlistBackdrop');

function renderPlaylist() {
  const list = $('#playlistList');
  const count = $('#trackCount');
  if (count) count.textContent = tracks.length + ' mahnı';
  if (!list) return;
  if (!tracks.length) {
    list.innerHTML = '<div class="playlist-empty">Hələ musiqi əlavə edilməyib 🎀</div>';
    return;
  }
  list.innerHTML = tracks.map((t,i) => `
    <button class="playlist-track ${i===currentIndex?'active':''}" data-index="${i}" type="button">
      <span class="playlist-num">${String(i+1).padStart(2,'0')}</span>
      <img src="${t.cover_url || 'assets/bow.png'}" alt="" onerror="this.src='assets/bow.png'">
      <span class="playlist-meta"><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.artist || 'Duman')}</small></span>
      <span class="playlist-play">${i===currentIndex && !audio.paused ? '❚❚' : '▶'}</span>
    </button>`
  ).join('');
  list.querySelectorAll('.playlist-track').forEach(btn => btn.onclick = () => selectTrack(Number(btn.dataset.index)));
}

function escapeHtml(v='') {
  return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function openPlaylist(){ renderPlaylist(); playlistSheet?.classList.add('open'); playlistBackdrop?.classList.add('open'); playlistSheet?.setAttribute('aria-hidden','false'); document.body.classList.add('playlist-open'); }
function closePlaylist(){ playlistSheet?.classList.remove('open'); playlistBackdrop?.classList.remove('open'); playlistSheet?.setAttribute('aria-hidden','true'); document.body.classList.remove('playlist-open'); }
function selectTrack(index){
  if(index<0 || index>=tracks.length)return;
  currentIndex=index; render(); renderPlaylist(); closePlaylist();
  audio.play().then(()=>{cassette.classList.add('playing');$('#playBtn').textContent='⏸';renderPlaylist();}).catch(()=>{});
}
$('#playlistBtn')?.addEventListener('click',openPlaylist);
$('#playlistBtnHero')?.addEventListener('click',openPlaylist);
$('#playlistClose')?.addEventListener('click',closePlaylist);
playlistBackdrop?.addEventListener('click',closePlaylist);

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
  renderPlaylist();

  // Check URL param ?song=...
  const params = new URLSearchParams(location.search);
  const songParam = params.get('song');
  if (songParam) {
    openSongByTitle(decodeURIComponent(songParam));
  }
}

initPlaylist();