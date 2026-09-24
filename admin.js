/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — admin.js
   Full admin panel with accept/reject/delete
═══════════════════════════════════════════════ */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
let token = sessionStorage.getItem('divaAdmin') || '';
let currentFilter = 'all';
let allData = null;

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}

function toast(msg, type = 'ok') {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.style.background = type === 'err' ? '#c0392b' : '#1a1015';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

async function api(url, opt = {}) {
  opt.headers = { ...(opt.headers || {}), 'x-admin-password': token };
  const r = await fetch(url, opt);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function updateStats(data) {
  const apps = data.applications || [];
  const pending = apps.filter(a => a.status === 'pending' || !a.status).length;
  const accepted = apps.filter(a => a.status === 'accepted').length;
  const rejected = apps.filter(a => a.status === 'rejected').length;
  const crew = apps.filter(a => a.crew_id).length;
  $('#statTotal').textContent = apps.length;
  $('#statPending').textContent = pending;
  $('#statAccepted').textContent = accepted;
  $('#statRejected').textContent = rejected;
  $('#statCrew').textContent = crew;
  $('#statMusic').textContent = (data.music || []).length;
}

function renderApplications(apps) {
  const list = $('#applicationList');
  if (!list) return;
  const filtered = currentFilter === 'all' ? apps : apps.filter(a => {
    const s = a.status || 'pending';
    return s === currentFilter;
  });
  if (!filtered.length) {
    list.innerHTML = '<p style="opacity:.5;padding:12px 0">Bu kategoriyada anket yoxdur.</p>';
    return;
  }
  list.innerHTML = filtered.map(x => {
    const status = x.status || 'pending';
    const badgeClass = status === 'accepted' ? 'badge-accepted' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
    const badgeText = status === 'accepted' ? 'Qəbul' : status === 'rejected' ? 'Rədd' : 'Gözləyən';
    const crewBadge = x.crew_id ? `<span class="app-badge crew-badge">DIVA CREW #${String(x.crew_id).padStart(3,'0')}</span>` : '';
    return `
      <div class="app-row" id="app-${x.id}">
        <div class="app-info">
          <b>${esc(x.name)} &bull; ${esc(String(x.age))}</b>
          <small>&#9834; ${esc(x.favorite_song)}</small>
          <small class="app-phone">📞 ${esc(x.phone || 'Nömrə yoxdur')}</small>
          <div class="app-badges">
            <span class="app-badge ${badgeClass}">${badgeText}</span>
            ${crewBadge}
            <span class="app-badge" style="background:#eee">${new Date(x.created_at).toLocaleDateString('az-AZ')}</span>
          </div>
        </div>
        <div class="app-actions">
          ${status !== 'accepted' ? `<button class="btn-accept" onclick="acceptApp(${x.id})">&#10003; Qəbul</button>` : ''}
          ${status !== 'rejected' ? `<button class="btn-reject" onclick="rejectApp(${x.id})">&#10007; Rədd</button>` : ''}
          <button class="btn-delete" onclick="deleteApp(${x.id})">Sil</button>
          ${x.crew_id ? `
            <button style="background:#ffe9f1;color:#1a1015;font-size:11px;border:2px solid var(--ink);border-radius:14px;padding:6px 8px;font-weight:800;cursor:pointer" onclick="viewTicket(${x.id})">Biletə bax 🎀</button>
            <button style="background:#ffffff;color:#1a1015;font-size:11px;border:2px solid var(--ink);border-radius:14px;padding:6px 8px;font-weight:800;cursor:pointer" onclick="copyTicketLink(${x.id})">Link kopyala 📋</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderMusic(music) {
  const list = $('#musicList');
  if (!list) return;
  if (!music.length) {
    list.innerHTML = '<p style="opacity:.5;padding:12px 0">Playlist boşdur.</p>';
    return;
  }
  list.innerHTML = music.map(x => `
    <div class="music-row" id="mus-${x.id}">
      <img class="music-thumb" src="${esc(x.cover_url) || 'assets/bow.png'}" onerror="this.src='assets/bow.png'" alt="cover">
      <div class="music-info">
        <b>${esc(x.title)}</b>
        <small>${esc(x.artist || 'Duman')} &bull; Sıra: ${x.position || 0}</small>
      </div>
      <div class="music-actions">
        <button onclick="deleteMusic(${x.id})">Sil</button>
      </div>
    </div>
  `).join('');
}

async function load() {
  try {
    const d = await api('/api/admin');
    allData = d;
    $('#loginBox').hidden = true;
    $('#dashboard').hidden = false;
    updateStats(d);
    renderApplications(d.applications || []);
    renderMusic(d.music || []);
    const content = d.content || {};
    ['hero_title','hero_text','rules'].forEach(k => {
      const el = $(`#contentForm [name="${k}"]`);
      if (el && content[k]) el.value = content[k];
    });
  } catch {
    sessionStorage.removeItem('divaAdmin');
    $('#loginBox').hidden = false;
    $('#dashboard').hidden = true;
  }
}

// Login
$('#loginBtn').onclick = () => {
  token = $('#adminPassword').value.trim();
  if (!token) { toast('Şifrə daxil et', 'err'); return; }
  sessionStorage.setItem('divaAdmin', token);
  load();
};
$('#adminPassword').addEventListener('keydown', e => { if(e.key === 'Enter') $('#loginBtn').click(); });
$('#logout').onclick = () => {
  sessionStorage.removeItem('divaAdmin');
  location.reload();
};

// Tabs
$$('.admin-tab-btn[data-tab]').forEach(b => b.onclick = () => {
  $$('.admin-tab-btn[data-tab],.tab-pane').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $(`#tab-${b.dataset.tab}`)?.classList.add('active');
});

// Filter buttons
$$('[data-filter]').forEach(b => b.onclick = () => {
  $$('[data-filter]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  currentFilter = b.dataset.filter;
  if (allData) renderApplications(allData.applications || []);
});

// Accept application
window.acceptApp = async id => {
  try {
    await api('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acceptApplication', id })
    });
    toast('Qəbul edildi! Crew bileti yaradıldı 🎀');
    load();
  } catch { toast('Xəta baş verdi', 'err'); }
};

// Reject application
window.rejectApp = async id => {
  try {
    await api('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rejectApplication', id })
    });
    toast('Rədd edildi.');
    load();
  } catch { toast('Xəta baş verdi', 'err'); }
};

// Delete application
window.deleteApp = async id => {
  if (!confirm('Bu anketi silmək istəyirsinizmi?')) return;
  try {
    await api('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteApplication', id })
    });
    toast('Silindi.');
    load();
  } catch { toast('Xəta baş verdi', 'err'); }
};

// View ticket
window.viewTicket = id => {
  window.open(`/ticket.html?id=${id}`, '_blank');
};

// Copy ticket link
window.copyTicketLink = async id => {
  const url = `${window.location.origin}/ticket.html?id=${id}`;
  try {
    await navigator.clipboard.writeText(url);
    toast('Bilet linki kopyalandı! 📋');
  } catch {
    toast(url);
  }
};

// Delete music
window.deleteMusic = async id => {
  if (!confirm('Bu musiqini silmək istəyirsinizmi?')) return;
  try {
    await api('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteMusic', id })
    });
    toast('Musiqi silindi.');
    load();
  } catch { toast('Xəta baş verdi', 'err'); }
};

// Cloudinary upload
const CLOUDINARY_CLOUD_NAME = 'sz6wlckf';
const CLOUDINARY_UPLOAD_PRESET = 'duman_music';

async function uploadToCloudinary(file, resourceType = 'auto') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  fd.append('folder', 'dumanizm');
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: fd
  });
  const data = await r.json();
  if (!r.ok || !data.secure_url) throw new Error(data.error?.message || 'Cloudinary yükləmə xətası');
  return data.secure_url;
}

// Add music form
$('#musicForm').onsubmit = async e => {
  e.preventDefault();
  const btn = e.submitter || e.target.querySelector('button');
  const audioFile = $('#audioFile')?.files?.[0];
  const coverFile = $('#coverFile')?.files?.[0];
  if (!audioFile) { toast('MP3 faylı seçin', 'err'); return; }

  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = 'Yüklənir...';
  try {
    toast('MP3 Cloudinary-yə yüklənir... 🎵');
    const audioUrl = await uploadToCloudinary(audioFile, 'video');
    let coverUrl = '';
    if (coverFile) {
      toast('Cover şəkli yüklənir... 🖼️');
      coverUrl = await uploadToCloudinary(coverFile, 'image');
    }

    const fd = new FormData(e.target);
    const payload = {
      action: 'addMusic',
      title: fd.get('title'),
      artist: fd.get('artist') || 'Duman',
      position: fd.get('position') || 0,
      audio_url: audioUrl,
      cover_url: coverUrl
    };
    await api('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    e.target.reset();
    e.target.querySelector('[name=artist]').value = 'Duman';
    toast('Musiqi əlavə edildi 🎵');
    load();
  } catch (err) {
    toast('Xəta: ' + (err.message || 'Yükləmə alınmadı'), 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
};

// Content form
$('#contentForm').onsubmit = async e => {
  e.preventDefault();
  try {
    await api('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'content', ...Object.fromEntries(new FormData(e.target)) })
    });
    toast('Yazılar yadda saxlanıldı ✓');
  } catch { toast('Xəta baş verdi', 'err'); }
};

if (token) load();