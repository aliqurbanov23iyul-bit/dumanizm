/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — test.js
   "Sənin Duman Mahnın Hansıdır?" Quiz
═══════════════════════════════════════════════ */

const SONGS = [
  {
    title: 'Senden Daha Güzel',
    desc: 'Sən romantik, dərinlikli və həssassan. Sevdinmi tam sevərsən, konsertdə hər kəslə bir ağızdan oxuyarsan!',
    cover: 'assets/bow.png',
    query: 'Senden Daha Güzel'
  },
  {
    title: 'Aman Aman',
    desc: 'Enerjili, çılğın və azad ruhlusan! Konsertdə ilk cərgədə tullanan və bütün gücü ilə qışqıran sənsən.',
    cover: 'assets/kitty-running.png',
    query: 'Aman Aman'
  },
  {
    title: 'Köprüaltı',
    desc: 'Nostaljik və xəyalpərəstsən. Dumanın ən səmimi, köhnə küçə və gənclik ruhu sənin içində yaşayır.',
    cover: 'assets/kitty-sitting.png',
    query: 'Koprualti'
  },
  {
    title: 'Kırmış Kalbini',
    desc: 'Hissiyyatlı və bir qədər sirli amma çox güclüsən. Rock balladları sənin ruhunu ifadə edir.',
    cover: 'assets/kitty-peek.png',
    query: 'Kirmis Kalbini'
  },
  {
    title: 'Elleri Ellerime',
    desc: 'Əyləncəli, şirin və sevgidolu Hello Kitty enerjisi! Gülüşünlə bütün Diva Crew-nu coşdurursan.',
    cover: 'assets/kitty-wave.png',
    query: 'Elleri Ellerime'
  },
];

const QUESTIONS = [
  {
    q: 'Konsert gecəsi nə geyinərsən?',
    opts: [
      { text: '🎀 Çəhrayı Hello Kitty detalları + qara çəkmələr', song: 0 },
      { text: '⚡ Dəri ceket, rahat krosovka — tam tullanmağa hazır', song: 1 },
      { text: '🎸 Vintage köynək və retro jeans', song: 2 },
      { text: '🖤 Qara oversize hudi və sirli vibe', song: 3 },
      { text: '✨ Parıltılı aksesuarlar və rəngli bow', song: 4 },
    ]
  },
  {
    q: 'Duman konsertə çıxanda ilk reaksiyan nə olar?',
    opts: [
      { text: 'Gözlərim dolur, amma sevincdən gülümsəyirəm', song: 0 },
      { text: 'İlk akkordda var gücümlə qışqırıram!', song: 1 },
      { text: 'Gözlərimi yumub gitaranın səsini dinləyirəm', song: 2 },
      { text: 'Siqaret tüstüsü kimi səhnəyə fokuslanıram', song: 3 },
      { text: 'Yanımda kim varsa qucaqlayıram', song: 4 },
    ]
  },
  {
    q: 'Gecə saat 02:00-da hansı əhvalda olursan?',
    opts: [
      { text: 'Romantik xəyallarda, köhnə mesajları oxuyuram', song: 0 },
      { text: 'Hələ də yatmıram, qulaqlıqda mahnı dinləyirəm', song: 1 },
      { text: 'Pəncərədən Bakının küləyinə və gecəsinə baxıram', song: 2 },
      { text: 'Dərin düşüncələrdə, bir az kədərli amma rahat', song: 3 },
      { text: 'Dostlara komik Kitty memləri göndərirəm', song: 4 },
    ]
  },
  {
    q: 'Əgər Kaan Tangöze səhnədən sənə baxıb nəsə desəydi:',
    opts: [
      { text: '"Səndən daha gözəlini görmədim"', song: 0 },
      { text: '"Aman aman, enerjiniz əladır!"', song: 1 },
      { text: '"Köhnə günləri unutmadıq..."', song: 2 },
      { text: '"Qəlbin qırılsa da, oxumağa davam et"', song: 3 },
      { text: '"Gəl bura, əllərini əllərimə ver!"', song: 4 },
    ]
  },
  {
    q: 'Diva Uğur konsertdə hansı mahnıda səhnəyə çıxsın?',
    opts: [
      { text: 'Senden Daha Güzel — bütün zal birlikdə oxuyanda', song: 0 },
      { text: 'Aman Aman — hamı tullananda', song: 1 },
      { text: 'Köprüaltı — akustik gitar solo ilə', song: 2 },
      { text: 'Kırmış Kalbini — dramatik tonda', song: 3 },
      { text: 'Elleri Ellerime — Kitty bowları havaya qalxanda', song: 4 },
    ]
  },
  {
    q: 'Hello Kitty × Duman konsertində sənin rolun:',
    opts: [
      { text: 'Bütün mahnıların sözlərini əzbər bilən romantik', song: 0 },
      { text: 'Qrupun ən enerjili fanatı', song: 1 },
      { text: 'Köhnə Duman kasetlərini toplayan kolleksiyaçı', song: 2 },
      { text: 'Kənarda sakitcə ritmi tutan sirli aşiq', song: 3 },
      { text: 'Diva Crew stikerlərini paylayan can', song: 4 },
    ]
  }
];

const $ = s => document.querySelector(s);
let answers = [];
let currentQ = 0;
let currentWinnerSong = null;

function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function renderProgressBar() {
  const bar = $('#testProgressBar');
  if (!bar) return;
  bar.innerHTML = QUESTIONS.map((_, i) =>
    `<div class="test-prog-dot ${i <= currentQ ? 'done' : ''}"></div>`
  ).join('');
  const label = $('#testProgLabel');
  if (label) label.textContent = `${currentQ + 1} / ${QUESTIONS.length}`;
}

function renderQuestion() {
  const wrap = $('#questionWrap');
  if (!wrap) return;
  const q = QUESTIONS[currentQ];
  
  wrap.innerHTML = `
    <div class="test-question-card" style="animation: stepIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both">
      <div class="test-q-number">SUAL ${currentQ + 1} / ${QUESTIONS.length}</div>
      <div class="test-question">${q.q}</div>
      <div class="test-options">
        ${q.opts.map((o, i) =>
          `<button class="test-opt" data-song="${o.song}" data-idx="${i}">${o.text}</button>`
        ).join('')}
      </div>
    </div>
  `;
  renderProgressBar();

  wrap.querySelectorAll('.test-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.test-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      answers.push(parseInt(btn.dataset.song));
      
      setTimeout(() => {
        currentQ++;
        if (currentQ >= QUESTIONS.length) {
          showResult();
        } else {
          renderQuestion();
        }
      }, 350);
    });
  });
}

function showResult() {
  const tally = {};
  answers.forEach(s => tally[s] = (tally[s] || 0) + 1);
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const winnerIndex = sorted.length ? parseInt(sorted[0][0]) : 0;
  const song = SONGS[winnerIndex] || SONGS[0];
  currentWinnerSong = song;

  $('#testQuiz').style.display = 'none';
  const resultEl = $('#testResult');
  resultEl.classList.add('show');

  $('#resultCover').src = song.cover;
  $('#resultSong').textContent = song.title;
  $('#resultDesc').textContent = song.desc;

  // Listen button opens music.html with song parameter
  $('#listenBtn').onclick = () => {
    location.href = `music.html?song=${encodeURIComponent(song.title)}`;
  };
}

// Start test button
$('#startTestBtn')?.addEventListener('click', () => {
  answers = [];
  currentQ = 0;
  $('#testIntro').style.display = 'none';
  $('#testQuiz').style.display = 'block';
  renderQuestion();
});

// Retry button
$('#retryBtn')?.addEventListener('click', () => {
  answers = [];
  currentQ = 0;
  $('#testResult').classList.remove('show');
  $('#testIntro').style.display = 'block';
  $('#testQuiz').style.display = 'none';
  $('#resultSong').textContent = '—';
  $('#resultDesc').textContent = '—';
});

async function createResultImage() {
  if (!currentWinnerSong) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0,0,1080,1920);
  grad.addColorStop(0,'#190916'); grad.addColorStop(.48,'#4a1237'); grad.addColorStop(1,'#ff4f91');
  ctx.fillStyle=grad; ctx.fillRect(0,0,1080,1920);
  ctx.fillStyle='rgba(255,255,255,.06)';
  for(let i=0;i<28;i++){ctx.beginPath();ctx.arc((i*173)%1080,(i*311)%1920,4+(i%4)*2,0,Math.PI*2);ctx.fill();}

  ctx.textAlign='center';
  ctx.fillStyle='#ffd6e5'; ctx.font='700 34px sans-serif'; ctx.fillText('DIVA CLUB • DUMAN TESTİ',540,150);
  ctx.fillStyle='#ffffff'; ctx.font='900 74px sans-serif'; ctx.fillText('MƏNİM DUMAN MAHNIM',540,260);

  const cover = new Image();
  cover.crossOrigin='anonymous';
  await new Promise(resolve=>{cover.onload=resolve;cover.onerror=resolve;cover.src=currentWinnerSong.cover;});
  if(cover.complete && cover.naturalWidth){
    ctx.save(); ctx.beginPath(); ctx.roundRect(190,360,700,700,55); ctx.clip();
    ctx.drawImage(cover,190,360,700,700); ctx.restore();
  } else {
    ctx.fillStyle='#ffd6e5'; ctx.roundRect(190,360,700,700,55); ctx.fill();
  }

  ctx.fillStyle='#ff8fba'; ctx.font='800 34px sans-serif'; ctx.fillText('DUMAN',540,1150);
  ctx.fillStyle='#ffffff'; ctx.font='900 76px sans-serif';
  const title=currentWinnerSong.title.length>20?currentWinnerSong.title.slice(0,20)+'…':currentWinnerSong.title;
  ctx.fillText(title,540,1250);

  ctx.fillStyle='rgba(255,255,255,.82)'; ctx.font='500 34px sans-serif';
  const words=currentWinnerSong.desc.split(' '); let line='', y=1340;
  for(const word of words){const test=line+word+' ';if(ctx.measureText(test).width>820){ctx.fillText(line.trim(),540,y);line=word+' ';y+=52;}else line=test;}
  if(line)ctx.fillText(line.trim(),540,y);

  ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(140,1640);ctx.lineTo(940,1640);ctx.stroke();
  ctx.fillStyle='#ffffff';ctx.font='800 32px sans-serif';ctx.fillText('🎀 DIVA CREW  •  14 NOYABR  •  DUMAN',540,1720);
  ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='600 26px sans-serif';ctx.fillText('Sən də testi keç və öz Duman mahnını tap',540,1790);
  return new Promise(resolve=>canvas.toBlob(resolve,'image/png',.95));
}

async function shareResultImage() {
  const blob=await createResultImage();
  if(!blob)return;
  const file=new File([blob],'menim-duman-mahnim.png',{type:'image/png'});
  const shareText=`Mənim Duman mahnım: "${currentWinnerSong.title}" 🎀`;
  if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
    try{await navigator.share({title:'Mənim Duman Mahnım',text:shareText,files:[file]});return;}catch(e){if(e.name==='AbortError')return;}
  }
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='menim-duman-mahnim.png';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('Paylaşım şəkli hazırdır 📸');
}

$('#shareResultBtn')?.addEventListener('click', shareResultImage);
$('#downloadResultBtn')?.addEventListener('click', async()=>{
  const blob=await createResultImage(); if(!blob)return;
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='menim-duman-mahnim.png';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('Nəticə şəkli yadda saxlanıldı 🎀');
});