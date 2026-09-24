/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — test.js
   "Sənin Duman Mahnın Hansıdır?" Quiz
═══════════════════════════════════════════════ */

const SONGS = [
  {
    title: 'Senden Daha Güzel',
    desc: 'Sən romantik, dərinlikli və həssassan. Sevdinmi tam sevərsən, konsertdə hər kəslə bir ağızdan oxuyarsan!',
    cover: 'assets/bow.png',
    query: 'Senden Daha Guzel'
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

// Share result button
$('#shareResultBtn')?.addEventListener('click', async () => {
  if (!currentWinnerSong) return;
  const shareText = `Mənim Duman mahnım çıxdı: "${currentWinnerSong.title}" 🎀 Sən də testdən keç və Diva Crew-ya qoşul!`;
  const shareUrl = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Mənim Duman Mahnım 🎀',
        text: shareText,
        url: shareUrl
      });
      return;
    } catch (e) {}
  }

  try {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast('Nəticə linki kopyalandı! 🎀');
  } catch (e) {
    toast(`Nəticən: ${currentWinnerSong.title}`);
  }
});