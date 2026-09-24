/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — ticket.js
   Digital Crew Ticket viewer, PNG exporter & sharing
═══════════════════════════════════════════════ */
const $ = s => document.querySelector(s);

let currentTicketData = {
  name: 'Diva Uğur',
  favorite_song: 'Senden Daha Güzel',
  crew_id: 1,
  status: 'accepted'
};

function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function generateBarcode(el, code) {
  if (!el) return;
  const heights = [16, 26, 14, 22, 18, 28, 12, 24, 20, 26, 15, 24, 18, 28, 14, 22];
  el.innerHTML = heights.map((h, i) => {
    const w = (i % 3 === 0) ? 3 : (i % 2 === 0 ? 2 : 1.5);
    return `<div class="barcode-line" style="width:${w}px;height:${h}px"></div>`;
  }).join('');
  const label = $('#barcodeCode');
  if (label) label.textContent = code || 'DIVA-2026-001';
}

function populateTicket(data) {
  currentTicketData = data;
  const crewStr = `#${String(data.crew_id || 1).padStart(3, '0')}`;
  
  $('#ticketGreeting').textContent = data.name;
  $('#tName').textContent = data.name;
  $('#tSong').textContent = data.favorite_song;
  $('#tCrewId').textContent = crewStr;
  
  const code = `DIVA-CREW-${String(data.crew_id || 1).padStart(3, '0')}`;
  generateBarcode($('#barcodeEl'), code);
  
  $('#ticketLoading').style.display = 'none';
  $('#ticketError').style.display = 'none';
  const content = $('#ticketContent');
  content.style.display = 'flex';
}

async function loadTicket() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || params.get('crew') || params.get('crew_id');
  const nameParam = params.get('name');
  const songParam = params.get('song');

  if (nameParam && songParam) {
    populateTicket({
      name: decodeURIComponent(nameParam),
      favorite_song: decodeURIComponent(songParam),
      crew_id: parseInt(id) || 1,
      status: 'accepted'
    });
    return;
  }

  if (!id) {
    // Check local storage for recent application
    const saved = localStorage.getItem('diva_user_ticket');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        populateTicket(parsed);
        return;
      } catch (e) {}
    }
    // Default demo ticket so page is never broken
    populateTicket({
      name: 'Diva Qonağı',
      favorite_song: 'Senden Daha Güzel',
      crew_id: 1,
      status: 'accepted'
    });
    return;
  }

  try {
    const r = await fetch(`/api/ticket?id=${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error('Not found');
    const data = await r.json();
    populateTicket(data);
  } catch (err) {
    // Check fallback
    const saved = localStorage.getItem('diva_user_ticket');
    if (saved) {
      try {
        populateTicket(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    // Fallback preview
    populateTicket({
      name: 'Diva Fan',
      favorite_song: 'Aman Aman',
      crew_id: parseInt(id) || 1,
      status: 'accepted'
    });
  }
}

// ── EXPORT TICKET TO CANVAS AND DOWNLOAD PNG ──
function downloadTicketImage() {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#1c0519');
  bgGrad.addColorStop(0.5, '#2e0a29');
  bgGrad.addColorStop(1, '#150314');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Sparkles/stars
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  for (let i = 0; i < 40; i++) {
    const sx = Math.sin(i * 99) * width;
    const sy = Math.cos(i * 37) * height;
    ctx.fillRect(Math.abs(sx), Math.abs(sy), (i % 3) + 2, (i % 3) + 2);
  }

  // Ticket Outer Box
  const cardX = 80;
  const cardY = 70;
  const cardW = 640;
  const cardH = 960;
  const cardRadius = 32;

  // Shadow
  ctx.fillStyle = '#ff2678';
  ctx.beginPath();
  ctx.roundRect(cardX + 12, cardY + 14, cardW, cardH, cardRadius);
  ctx.fill();

  // White Card body
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1a1015';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();
  ctx.stroke();

  // Clip inside ticket
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.clip();

  // Ticket Top Header (Pink Gradient)
  const topH = 260;
  const topGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + topH);
  topGrad.addColorStop(0, '#ff4f91');
  topGrad.addColorStop(1, '#ff2678');
  ctx.fillStyle = topGrad;
  ctx.fillRect(cardX, cardY, cardW, topH);

  // Top header text
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '900 18px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('★ OFFICIAL DIVA CREW PASS ★', cardX + cardW / 2, cardY + 54);

  // "DUMAN" Band Name
  ctx.fillStyle = '#1a1015';
  ctx.font = '900 88px "Baloo 2", sans-serif';
  ctx.fillText('DUMAN', cardX + cardW / 2 + 3, cardY + 155);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('DUMAN', cardX + cardW / 2, cardY + 152);

  // Date & Venue
  ctx.fillStyle = '#fff8e8';
  ctx.font = '800 22px "DM Sans", sans-serif';
  ctx.fillText('14 NOYABR · 20:00 · BAKI', cardX + cardW / 2, cardY + 205);

  ctx.restore();

  // Dashed Cut Line
  const cutY = cardY + topH;
  ctx.strokeStyle = '#1a1015';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(cardX, cutY);
  ctx.lineTo(cardX + cardW, cutY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Notches (cutout circles)
  ctx.fillStyle = '#220820';
  ctx.strokeStyle = '#1a1015';
  ctx.lineWidth = 6;
  // Left notch
  ctx.beginPath();
  ctx.arc(cardX, cutY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right notch
  ctx.beginPath();
  ctx.arc(cardX + cardW, cutY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Middle Content
  ctx.textAlign = 'left';
  
  // AD (Name)
  ctx.fillStyle = '#77666d';
  ctx.font = '900 16px "DM Sans", sans-serif';
  ctx.fillText('AD / CREW ÜZVÜ', cardX + 50, cutY + 60);
  ctx.fillStyle = '#1a1015';
  ctx.font = '900 32px "Baloo 2", sans-serif';
  ctx.fillText(currentTicketData.name || 'Diva Qonağı', cardX + 50, cutY + 98);

  // TARIX & SAAT
  ctx.fillStyle = '#77666d';
  ctx.font = '900 16px "DM Sans", sans-serif';
  ctx.fillText('TARİX & SAAT', cardX + 380, cutY + 60);
  ctx.fillStyle = '#1a1015';
  ctx.font = '900 26px "Baloo 2", sans-serif';
  ctx.fillText('14 NOY · 20:00', cardX + 380, cutY + 98);

  // CREW ID BOX
  const boxY = cutY + 130;
  const boxW = cardW - 100;
  const boxH = 110;
  ctx.fillStyle = '#fff5f8';
  ctx.strokeStyle = '#ffd6e5';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cardX + 50, boxY, boxW, boxH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff4f91';
  ctx.font = '900 16px "DM Sans", sans-serif';
  ctx.fillText('DIVA CREW ID', cardX + cardW / 2, boxY + 36);

  ctx.fillStyle = '#ff2678';
  ctx.font = '900 54px "Baloo 2", sans-serif';
  const crewFormatted = `#${String(currentTicketData.crew_id || 1).padStart(3, '0')}`;
  ctx.fillText(crewFormatted, cardX + cardW / 2, boxY + 92);

  // FAVORİ DUMAN MAHNISI
  const songY = boxY + 160;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#77666d';
  ctx.font = '900 16px "DM Sans", sans-serif';
  ctx.fillText('FAVORİ DUMAN MAHNISI', cardX + 50, songY);

  ctx.fillStyle = '#1a1015';
  ctx.font = '900 28px "Baloo 2", sans-serif';
  ctx.fillText(`♫ ${currentTicketData.favorite_song || 'Senden Daha Güzel'}`, cardX + 50, songY + 38);

  // Bottom Divider
  const botY = songY + 80;
  ctx.strokeStyle = '#ffd6e5';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cardX + 40, botY);
  ctx.lineTo(cardX + cardW - 40, botY);
  ctx.stroke();

  // Footer / Barcode
  ctx.fillStyle = '#77666d';
  ctx.font = '900 15px "DM Sans", sans-serif';
  ctx.fillText('HELLO KITTY × DUMAN', cardX + 50, botY + 45);
  ctx.fillStyle = '#ff4f91';
  ctx.font = '900 20px "Baloo 2", sans-serif';
  ctx.fillText('DIVA VIP CONCERT PASS 🎀', cardX + 50, botY + 75);

  // Draw barcode lines on Canvas
  const barStartX = cardX + 380;
  const barY = botY + 25;
  ctx.fillStyle = '#1a1015';
  const barHeights = [40, 55, 35, 50, 42, 60, 32, 54, 45, 58, 38, 52, 44, 60, 36, 50];
  barHeights.forEach((h, i) => {
    const bw = (i % 3 === 0) ? 5 : (i % 2 === 0 ? 3 : 2);
    ctx.fillRect(barStartX + i * 11, barY + (60 - h), bw, h);
  });
  ctx.font = '700 12px monospace';
  ctx.fillText(`DIVA-${String(currentTicketData.crew_id || 1).padStart(3, '0')}`, barStartX + 10, barY + 78);

  // Download Trigger
  try {
    const link = document.createElement('a');
    link.download = `diva-crew-ticket-${currentTicketData.name.replace(/\s+/g, '-').toLowerCase()}-${crewFormatted}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('Bilet şəkli endirildi! 📸');
  } catch (err) {
    toast('Şəkil yaradılarkən xəta baş verdi');
  }
}

// ── EVENT LISTENERS ──
$('#downloadTicketBtn')?.addEventListener('click', downloadTicketImage);

$('#copyLinkBtn')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast('Bilet linki kopyalandı! 📋');
  } catch (e) {
    toast('Link kopyalanmadı');
  }
});

$('#shareBtn')?.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Diva Crew Konsert Biletim! 🎀',
        text: `14 Noyabr Duman konserti üçün Diva Crew #${String(currentTicketData.crew_id || 1).padStart(3, '0')} biletim hazırdır!`,
        url: window.location.href
      });
    } catch (e) {}
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Bilet linki kopyalandı! 📋');
    } catch (e) {}
  }
});

loadTicket();