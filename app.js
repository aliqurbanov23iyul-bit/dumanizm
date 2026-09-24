/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — app.js (index page)
═══════════════════════════════════════════════ */
const $ = s => document.querySelector(s);

// ── LOADER ──────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => $('#loader')?.classList.add('hide'), 1100);
});

// ── LOCKSCREEN (swipe-up unlock) ──────────────
(function initLockscreen() {
  const lock = $('#lockscreen');
  if (!lock) return;

  // Generate stars
  const starsEl = $('#lockStars');
  if (starsEl) {
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('div');
      s.className = 'lock-star';
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${1.5+Math.random()*2.5}s;--del:${Math.random()*2}s`;
      starsEl.appendChild(s);
    }
  }

  if (localStorage.getItem('divaUnlocked')) {
    lock.classList.add('unlocked');
    return;
  }

  let startY = 0, isDragging = false;
  const threshold = 80;

  function unlock() {
    localStorage.setItem('divaUnlocked', '1');
    lock.classList.add('unlocked');
  }

  lock.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  lock.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dy = startY - e.touches[0].clientY;
    if (dy > 5) {
      const isDesktop = window.innerWidth >= 600;
      lock.style.transform = isDesktop ? `translate(-50%, ${-dy}px)` : `translateY(${-dy}px)`;
    }
  }, { passive: true });

  lock.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    const dy = startY - e.changedTouches[0].clientY;
    if (dy > threshold) {
      unlock();
    } else {
      lock.style.transform = '';
    }
  });

  // Also allow click on swipe hint or anywhere on lockscreen
  $('#swipeHint')?.addEventListener('click', unlock);
  lock.addEventListener('click', e => {
    if (e.target.closest('#swipeHint') || e.clientY > window.innerHeight * 0.65) {
      unlock();
    }
  });
})();

// ── COUNTDOWN ──────────────────────────────────
function tick() {
  const now = new Date();
  const yr = now.getMonth() > 10 || (now.getMonth() === 10 && now.getDate() > 14)
    ? now.getFullYear() + 1 : now.getFullYear();
  const target = new Date(yr, 10, 14, 20, 0, 0);
  const diff = target - now;
  const v = diff > 0
    ? [Math.floor(diff/864e5), Math.floor(diff/36e5)%24, Math.floor(diff/6e4)%60, Math.floor(diff/1e3)%60]
    : [0,0,0,0];
  document.querySelectorAll('#countdown b').forEach((el, i) => {
    const s = el.querySelector('small').outerHTML;
    el.innerHTML = String(v[i]).padStart(2, '0') + s;
  });
}
tick(); setInterval(tick, 1000);

// ── FLOATERS ──────────────────────────────────
setInterval(() => {
  const x = document.createElement('span');
  x.textContent = ['♡','★','🎀','✦','♪','🌸'][Math.floor(Math.random()*6)];
  x.style.cssText = `left:${Math.random()*100}%;font-size:${12+Math.random()*18}px;animation-duration:${5+Math.random()*6}s`;
  $('#floaters')?.appendChild(x);
  setTimeout(() => x.remove(), 11000);
}, 900);

// ── SCROLL REVEAL ──────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

// ── PUBLIC API (hero content + rules) ──────────
fetch('/api/public').then(r => r.ok ? r.json() : null).then(d => {
  if (!d) return;
  if (d.content?.hero_title) {
    const el = $('#heroTitle');
    if (el) el.innerHTML = d.content.hero_title;
  }
  if (d.content?.hero_text) {
    const el = $('#heroText');
    if (el) el.textContent = d.content.hero_text;
  }
  if (d.content?.rules) {
    const el = $('#rules');
    if (el) {
      el.innerHTML = d.content.rules.split('\n').filter(Boolean).map((r, i) =>
        `<div class="rule-card"><span class="rule-num">${String(i+1).padStart(2,'0')}</span><p>${r.replace(/[<>]/g,'')}</p></div>`
      ).join('');
    }
  }
}).catch(() => {});

// ── KITTY HUNT ─────────────────────────────────
(function initKittyHunt() {
  const TOTAL = 5;
  const STORAGE_KEY = 'kittyHuntFound';
  const found = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

  const indicator = $('#kittyIndicator');
  const countEl = $('#kittyCount');
  const foundToast = $('#kittyFoundToast');
  const winOverlay = $('#kittyWin');

  function updateUI() {
    if (countEl) countEl.textContent = `${found.size}/${TOTAL}`;
    if (indicator) {
      indicator.classList.add('bump');
      setTimeout(() => indicator.classList.remove('bump'), 400);
    }
  }

  function showFoundToast(n) {
    if (!foundToast) return;
    foundToast.textContent = `KITTY TAPILDI 🎀 ${n}/${TOTAL}`;
    foundToast.classList.add('show');
    setTimeout(() => foundToast.classList.remove('show'), 2500);
  }

  function showWin() {
    if (!winOverlay) return;
    winOverlay.classList.add('show');
    startConfetti();
  }

  function saveFound() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...found]));
  }

  function spawnSparkles(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const icons = ['🎀', '✨', '⭐', '💖', '🎵'];
    for (let i = 0; i < 6; i++) {
      const sp = document.createElement('span');
      sp.textContent = icons[i % icons.length];
      sp.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        font-size: 20px;
        pointer-events: none;
        z-index: 9999;
        transition: transform .7s cubic-bezier(.2,.8,.2,1), opacity .7s;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(sp);
      const angle = (i / 6) * Math.PI * 2;
      const dist = 50 + Math.random() * 30;
      requestAnimationFrame(() => {
        sp.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 20}px) scale(1.3) rotate(${Math.random() * 60 - 30}deg)`;
        sp.style.opacity = '0';
      });
      setTimeout(() => sp.remove(), 750);
    }
  }

  function onKittyClick(id, kittyEl) {
    if (found.has(id)) return;
    found.add(id);
    saveFound();
    kittyEl.classList.add('found');
    spawnSparkles(kittyEl);
    updateUI();
    showFoundToast(found.size);
    if (found.size >= TOTAL) setTimeout(showWin, 800);
  }

  // Place hidden kitties in the page
  const placements = [
    { id: 'k1', parent: '.hero', top: '15%', right: '-10px', img: 'kitty-peek.png' },
    { id: 'k2', parent: '.count-section', top: '10px', left: '8px', img: 'kitty-sitting.png' },
    { id: 'k3', parent: '#rulesSection', bottom: '10px', right: '5px', img: 'kitty-gacha.png' },
    { id: 'k4', parent: '.tease-card.dark-bg', top: '8px', left: '8px', img: 'kitty-running.png' },
    { id: 'k5', parent: '.tease-card.acid-bg', bottom: '8px', left: '10px', img: 'kitty-wave.png' },
  ];

  placements.forEach(({ id, parent, img, ...pos }) => {
    const parentEl = $(parent);
    if (!parentEl) return;
    const k = document.createElement('img');
    k.src = `assets/${img}`;
    k.alt = 'Gizli Kitty';
    k.className = 'hidden-kitty' + (found.has(id) ? ' found' : '');
    Object.assign(k.style, pos);
    k.addEventListener('click', () => onKittyClick(id, k));
    parentEl.style.position = 'relative';
    parentEl.appendChild(k);
  });

  updateUI();

  // Indicator click
  indicator?.addEventListener('click', () => {
    if (found.size >= TOTAL) {
      showWin();
    } else {
      window.toast(`Diva Kitty Hunt: ${found.size}/5 tapıldı! Səhifəni axtar 🎀`);
    }
  });

  // Win overlay close
  $('#winClose')?.addEventListener('click', () => {
    winOverlay?.classList.remove('show');
  });

  // Confetti with Bows & Stars
  function startConfetti() {
    const canvas = $('#confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const types = ['rect', 'star', 'bow'];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      type: types[Math.floor(Math.random() * types.length)],
      size: 10 + Math.random() * 12,
      color: ['#ff4f91', '#fff36b', '#ff2678', '#ffffff', '#ffd6e5', '#f5c842'][Math.floor(Math.random() * 6)],
      vy: 2 + Math.random() * 3.5,
      vx: (Math.random() - 0.5) * 2.5,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 6,
    }));

    function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    function drawBow(cx, cy, size, color) {
      ctx.fillStyle = color;
      // Left loop
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx - size, cy - size * 0.7, cx - size, cy + size * 0.7, cx, cy);
      ctx.fill();
      // Right loop
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx + size, cy - size * 0.7, cx + size, cy + size * 0.7, cx, cy);
      ctx.fill();
      // Knot
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    let frame;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.rotV;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);

        if (p.type === 'star') {
          drawStar(0, 0, 5, p.size * 0.7, p.size * 0.35, p.color);
        } else if (p.type === 'bow') {
          drawBow(0, 0, p.size * 0.6, p.color);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
        }
        ctx.restore();
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => cancelAnimationFrame(frame), 6000);
  }
})();

// ── TOAST HELPER ──────────────────────────────
window.toast = function(msg, dur=2000) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
};