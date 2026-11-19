// ---------------------------------------------------------------------------
// Navigation, footer year, section numbering
// ---------------------------------------------------------------------------
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
function closeMenu() {
  nav?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Show a nav link only when the section it points to is visible (used by the Case studies section).
document.querySelectorAll('[data-requires]').forEach(link => {
  const target = document.getElementById(link.dataset.requires);
  link.hidden = !target || target.hidden;
});

// Number the section labels in order, skipping any hidden section, so the numbers never have gaps.
[...document.querySelectorAll('.section-kicker[data-title]')]
  .filter(kicker => !kicker.closest('[hidden]'))
  .forEach((kicker, index) => {
    kicker.textContent = String(index + 1).padStart(2, '0') + ' / ' + kicker.dataset.title;
  });

// ---------------------------------------------------------------------------
// Live availability.
// Reads the rows in the Contact section (data-days / data-windows), so the visible
// schedule and the live status always come from the same place.
// ---------------------------------------------------------------------------
(function availability() {
  const rows = [...document.querySelectorAll('#schedule .schedule-list li')];
  if (!rows.length) return;

  const TZ = 'Asia/Manila'; // Philippine Time, UTC+8, no daylight saving
  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const schedule = {}; // day number (0 = Sunday) -> [[startHour, endHour], ...]
  rows.forEach(row => {
    const days = row.dataset.days.split(',').map(Number);
    const windows = row.dataset.windows.split(',').map(w => w.split('-').map(Number));
    days.forEach(day => { schedule[day] = windows; });
  });

  function manilaNow(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(date);
    const get = type => parts.find(p => p.type === type).value;
    return { day: DAY_SHORT.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  }
  const isOpen = now => (schedule[now.day] || []).some(([start, end]) => now.minutes >= start * 60 && now.minutes < end * 60);
  function nextStart(now) {
    for (let offset = 0; offset <= 7; offset++) {
      const day = (now.day + offset) % 7;
      for (const [start] of (schedule[day] || [])) {
        if (offset > 0 || start * 60 > now.minutes) return { offset, day, hour: start };
      }
    }
    return null;
  }
  const formatHour = h => (((h + 11) % 12) + 1) + ':00 ' + (h % 24 < 12 ? 'AM' : 'PM');

  function update() {
    const date = new Date();
    const now = manilaNow(date);
    const open = isOpen(now);

    const badge = document.getElementById('availability');
    const text = document.getElementById('availabilityText');
    if (badge && text) {
      badge.dataset.state = open ? 'open' : 'away';
      if (open) {
        text.textContent = 'Available now · Philippine Time (UTC+8)';
      } else {
        const next = nextStart(now);
        const when = next ? (next.offset === 0 ? 'today' : next.offset === 1 ? 'tomorrow' : DAY_LONG[next.day]) : '';
        text.textContent = next ? 'Next available ' + when + ' at ' + formatHour(next.hour) + ' PHT' : 'Open to remote opportunities · Philippine Time (UTC+8)';
      }
    }

    rows.forEach(row => row.classList.toggle('is-today', row.dataset.days.split(',').map(Number).includes(now.day)));

    const line = document.getElementById('scheduleNow');
    if (line) {
      const fmt = zone => new Intl.DateTimeFormat('en-US', { ...(zone ? { timeZone: zone } : {}), weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
      line.textContent = 'Philippine Time now: ' + fmt(TZ) + '  ·  Your time: ' + fmt();
    }
  }
  update();
  setInterval(update, 60000);
})();

// ---------------------------------------------------------------------------
// Searchable Micro1 certified-skill cards
// ---------------------------------------------------------------------------
const skillSearch = document.getElementById('skillSearch');
const skillCards = [...document.querySelectorAll('.certified-card')];
const noSkillResults = document.getElementById('noSkillResults');
skillSearch?.addEventListener('input', () => {
  const term = skillSearch.value.trim().toLowerCase();
  let visible = 0;
  skillCards.forEach(card => {
    const match = card.textContent.toLowerCase().includes(term);
    card.hidden = !match;
    if (match) visible++;
  });
  if (noSkillResults) noSkillResults.hidden = visible !== 0;
});

// ---------------------------------------------------------------------------
// Annotation Lab: tabs
// ---------------------------------------------------------------------------
const tabs = [...document.querySelectorAll('.lab-tab')];
const panels = [...document.querySelectorAll('.demo-panel')];
function activateTab(name) {
  tabs.forEach(tab => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panels.forEach(panel => {
    const active = panel.dataset.panel === name;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  tab.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      activateTab(tabs[next].dataset.tab);
    }
  });
});
activateTab('video');

// ---------------------------------------------------------------------------
// Annotation Lab: cases (choose -> write your reasoning -> reveal the model answer)
// Each .case in index.html carries its own content: the correct choice has data-ok="true",
// every choice has data-why (the feedback), and the case has data-model (the model answer).
// ---------------------------------------------------------------------------
const labCases = [...document.querySelectorAll('.case')];
const labScore = document.getElementById('labScore');
const labState = new Map();

function updateScore() {
  let right = 0, answered = 0;
  labState.forEach(state => {
    if (state.answered) { answered++; if (state.firstTryCorrect) right++; }
  });
  labScore.textContent = 'FIRST-TRY SCORE ' + right + ' / ' + labCases.length + (answered === labCases.length ? ' · COMPLETE' : '');
}

function buildJustify(caseEl, id) {
  const host = caseEl.querySelector('.task-question');
  const box = document.createElement('div');
  box.className = 'justify';
  box.innerHTML =
    '<label class="j-label" for="j-' + id + '">Write your justification <span>(1–2 sentences · stays in your browser)</span></label>' +
    '<textarea id="j-' + id + '" rows="3" maxlength="400" placeholder="Cite what you can see or hear, and separate evidence from assumptions."></textarea>' +
    '<div class="selfcheck" role="group" aria-label="Self-check">' +
    '<label><input type="checkbox"> Cited specific evidence</label>' +
    '<label><input type="checkbox"> Separated evidence from assumption</label>' +
    '<label><input type="checkbox"> Named the rubric or source text</label></div>' +
    '<button type="button" class="reveal-btn" aria-expanded="false">Reveal model answer</button>' +
    '<div class="model" hidden><span class="demo-label">MODEL ANSWER</span><p></p></div>';
  box.querySelector('.model p').textContent = caseEl.dataset.model;
  const reveal = box.querySelector('.reveal-btn');
  const model = box.querySelector('.model');
  reveal.addEventListener('click', () => {
    model.hidden = !model.hidden;
    reveal.setAttribute('aria-expanded', String(!model.hidden));
    reveal.textContent = model.hidden ? 'Reveal model answer' : 'Hide model answer';
  });
  host.appendChild(box);
}

labCases.forEach(caseEl => {
  const id = caseEl.dataset.case;
  labState.set(id, { answered: false, firstTryCorrect: false });
  const choices = [...caseEl.querySelectorAll('.choice')];
  const feedback = caseEl.querySelector('.feedback');
  choices.forEach(button => button.addEventListener('click', () => {
    const ok = button.dataset.ok === 'true';
    choices.forEach(b => { b.classList.remove('selected', 'correct', 'incorrect'); b.setAttribute('aria-pressed', 'false'); });
    button.classList.add('selected', ok ? 'correct' : 'incorrect');
    button.setAttribute('aria-pressed', 'true');
    feedback.textContent = (ok ? 'Correct. ' : 'Not quite. ') + button.dataset.why;
    feedback.classList.toggle('is-wrong', !ok);
    const state = labState.get(id);
    if (!state.answered) {
      state.answered = true;
      state.firstTryCorrect = ok;
      updateScore();
      buildJustify(caseEl, id);
    }
  }));
});

document.getElementById('labReset')?.addEventListener('click', () => {
  labCases.forEach(caseEl => {
    caseEl.querySelectorAll('.choice').forEach(b => { b.classList.remove('selected', 'correct', 'incorrect'); b.removeAttribute('aria-pressed'); });
    const feedback = caseEl.querySelector('.feedback');
    feedback.textContent = '';
    feedback.classList.remove('is-wrong');
    caseEl.querySelector('.justify')?.remove();
    labState.set(caseEl.dataset.case, { answered: false, firstTryCorrect: false });
  });
  updateScore();
});
updateScore();

// ---------------------------------------------------------------------------
// Optional real media for the Lab.
// Each .media-slot names a file in assets/lab/. If the file exists it is shown (a video or
// image replaces the drawn placeholder; audio is added under it). If the file is missing,
// nothing changes and the built-in placeholder stays, so the page never shows a broken player.
// ---------------------------------------------------------------------------
document.querySelectorAll('.media-slot[data-src]').forEach(slot => {
  const type = slot.dataset.media;
  let element;
  const show = () => {
    slot.classList.add('has-media');
    if (slot.dataset.mode === 'append') slot.appendChild(element); else slot.prepend(element);
  };
  if (type === 'image') {
    element = new Image();
    element.alt = slot.dataset.alt || '';
    element.onload = show;
    element.src = slot.dataset.src;
  } else if (type === 'audio' || type === 'video') {
    element = document.createElement(type);
    element.controls = true;
    element.preload = 'metadata';
    element.setAttribute('aria-label', slot.dataset.label || type);
    if (type === 'video') {
      element.playsInline = true;
      if (slot.dataset.poster) element.poster = slot.dataset.poster;
    }
    element.addEventListener('loadedmetadata', show, { once: true });
    element.src = slot.dataset.src;
  }
});
