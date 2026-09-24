/* ═══════════════════════════════════════════════
   DUMAN x HELLO KITTY V2 — join.js
   Step-by-step form
═══════════════════════════════════════════════ */
const $ = s => document.querySelector(s);

let currentStep = 0;
const formData = {};

function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

function updateProgress(step) {
  document.querySelectorAll('.step-dot').forEach((d, i) => {
    d.classList.toggle('done', i < step);
  });
  const label = $('#stepLabel');
  if (label) label.textContent = `${step + 1} / 4`;
}

function showStep(n) {
  document.querySelectorAll('.step-panel').forEach((p, i) => {
    p.classList.toggle('active', i === n);
  });
  updateProgress(n);
  // Focus first input in step
  const inp = document.querySelector(`#step${n} .field-input`);
  if (inp) setTimeout(() => inp.focus(), 350);
}

function validate(step) {
  if (step === 0) {
    const v = $('#inp-name')?.value.trim();
    if (!v) { toast('Adini daxil et'); return false; }
    if (v.length < 2) { toast('Ad cox qisadir'); return false; }
    formData.name = v;
    return true;
  }
  if (step === 1) {
    const v = parseInt($('#inp-age')?.value);
    if (!v || v < 14 || v > 99) { toast('Yashi duzgun daxil et (14-99)'); return false; }
    formData.age = v;
    return true;
  }
  if (step === 2) {
    const v = $('#inp-song')?.value.trim();
    if (!v) { toast('Sevdiyin mahnini yaz'); return false; }
    formData.favorite_song = v;
    return true;
  }
  if (step === 3) {
    const v = $('#inp-phone')?.value.trim();
    if (!v || v.length < 6) { toast('Nomreni duzgun daxil et'); return false; }
    formData.phone = v;
    return true;
  }
  return true;
}

// Next buttons
[0,1,2].forEach(i => {
  $(`#next${i}`)?.addEventListener('click', () => {
    if (!validate(i)) return;
    currentStep = i + 1;
    showStep(currentStep);
  });
});

// Back buttons
[1,2,3].forEach(i => {
  $(`#back${i}`)?.addEventListener('click', () => {
    currentStep = i - 1;
    showStep(currentStep);
  });
});

// Enter key navigation
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (currentStep < 3) {
    const nextBtn = $(`#next${currentStep}`);
    if (nextBtn) nextBtn.click();
  }
});

// Submit
$('#submitBtn')?.addEventListener('click', async () => {
  if (!validate(3)) return;

  const btn = $('#submitBtn');
  btn.disabled = true;
  btn.textContent = 'Gonderilir... 🎀';

  try {
    const r = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const resData = await r.json().catch(() => ({}));
    if (!r.ok && r.status !== 404) {
      throw new Error(resData.error || 'Xəta baş verdi');
    }
    // Save to localStorage for instant ticket preview
    localStorage.setItem('diva_user_ticket', JSON.stringify({
      name: formData.name,
      favorite_song: formData.favorite_song,
      crew_id: resData.crew_id || 1,
      status: 'pending'
    }));
    // Show success
    $('#stepFormWrap').style.display = 'none';
    const success = $('#joinSuccess');
    if (success) {
      success.classList.add('show');
      success.style.display = 'block';
    }
  } catch (err) {
    localStorage.setItem('diva_user_ticket', JSON.stringify({
      name: formData.name,
      favorite_song: formData.favorite_song,
      crew_id: 1,
      status: 'pending'
    }));
    $('#stepFormWrap').style.display = 'none';
    const success = $('#joinSuccess');
    if (success) {
      success.classList.add('show');
      success.style.display = 'block';
    }
  }
});

// Init
showStep(0);