/* No dependencies. The editable words and photo paths live in config.js. */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const storageKey = 'little-love-letter-v1';
  const defaults = window.LOVE_LETTER;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const discovered = new Set();
  const pendingPhotos = new Map();
  let gift = loadGift();
  let audioContext;
  let musicTimer;
  let noteIndex = 0;
  let playing = false;
  let dialogOpener;

  // Read only the known fields, so stale or malformed saved settings cannot break the gift.
  function normalizeGift(value) {
    const text = (item, fallback, limit) => typeof item === 'string' && item.trim() ? item.trim().slice(0, limit) : fallback;
    return {
      recipient: text(value?.recipient, defaults.recipient, 40),
      dedication: text(value?.dedication, defaults.dedication, 200),
      finalMessage: text(value?.finalMessage, defaults.finalMessage, 1500),
      signature: text(value?.signature, defaults.signature, 100),
      memories: defaults.memories.map((fallback, index) => {
        const item = value?.memories?.[index];
        const photo = typeof item?.photo === 'string' && /^(assets\/|data:image\/(jpeg|png|webp);base64,)/.test(item.photo) ? item.photo : fallback.photo;
        return { photo, position: text(item?.position, fallback.position, 40), alt: text(item?.alt, fallback.alt, 160), caption: text(item?.caption, fallback.caption, 70), title: text(item?.title, fallback.title, 60), message: text(item?.message, fallback.message, 300) };
      })
    };
  }

  function loadGift() {
    try { return normalizeGift(JSON.parse(localStorage.getItem(storageKey)) || defaults); }
    catch { return normalizeGift(defaults); }
  }

  function renderGift() {
    discovered.clear();
    $('#progress-hearts').replaceChildren(...gift.memories.map(() => {
      const heart = document.createElement('span');
      heart.textContent = '♡';
      return heart;
    }));
    document.querySelectorAll('.memory').forEach((memory) => memory.remove());
    $('#dedication').textContent = gift.dedication;
    $('#final-salutation').textContent = `${gift.recipient},`;
    $('#final-message').textContent = gift.finalMessage;
    $('#signature').textContent = gift.signature;

    gift.memories.forEach((memory, index) => {
      const article = document.createElement('article');
      article.className = 'memory';
      article.innerHTML = `<button class="heart-button" type="button" aria-pressed="false" aria-controls="note-${index}">
        <span class="heart-face"><img class="heart-image" draggable="false" width="900" height="900"><span class="photo-wash"></span><span class="photo-hint" aria-hidden="true"><span>♡</span> A LITTLE LOVE INSIDE</span><span class="heart-note" id="note-${index}" aria-hidden="true"><span class="note-number" aria-hidden="true">♡</span><span class="note-title"></span><span class="note-copy"></span></span></span>
        <svg class="heart-outline" viewBox="0 0 1 1" aria-hidden="true"><path d="M.5,.19 C.29,-.035 .015,.07 .015,.30 C.015,.52 .29,.75 .5,.94 C.71,.75 .985,.52 .985,.30 C.985,.07 .71,-.035 .5,.19Z"/><path class="inner-outline" d="M.5,.19 C.29,-.035 .015,.07 .015,.30 C.015,.52 .29,.75 .5,.94 C.71,.75 .985,.52 .985,.30 C.985,.07 .71,-.035 .5,.19Z"/></svg>
        </button><p class="memory-caption"><span class="caption-number">0${index + 1}</span><span class="caption-divider"></span><span class="caption-text"></span></p>`;
      const button = article.querySelector('button');
      const photo = article.querySelector('img');
      photo.src = memory.photo;
      photo.alt = memory.alt;
      photo.style.objectPosition = memory.position;
      photo.addEventListener('error', () => { photo.hidden = true; }, { once: true });
      article.querySelector('.note-title').textContent = memory.title;
      article.querySelector('.note-copy').textContent = memory.message;
      article.querySelector('.caption-text').textContent = memory.caption;
      button.setAttribute('aria-label', `Open love note ${index + 1}: ${memory.caption}`);
      button.addEventListener('click', (event) => toggleNote(button, index, event));
      $('#heart-gallery').append(article);
    });
    updateProgress();
    requestAnimationFrame(fitNotes);
  }

  // Keep the whole message inside the wide part of the heart at every screen size.
  function fitNotes() {
    document.querySelectorAll('.heart-button').forEach((button) => {
      const note = button.querySelector('.heart-note');
      const copy = button.querySelector('.note-copy');
      copy.style.fontSize = '';
      let size = parseFloat(getComputedStyle(copy).fontSize);
      while (note.offsetTop + note.offsetHeight > button.clientHeight * .63 && size > 9) {
        size -= .25;
        copy.style.fontSize = `${size}px`;
      }
    });
  }
  window.addEventListener('resize', () => requestAnimationFrame(fitNotes));
  document.fonts?.ready.then(fitNotes);

  function toggleNote(button, index, event) {
    const opening = !button.classList.contains('is-open');
    button.classList.toggle('is-open', opening);
    button.setAttribute('aria-pressed', String(opening));
    button.setAttribute('aria-label', `${opening ? 'Show photo' : 'Open love note'} ${index + 1}: ${gift.memories[index].caption}`);
    button.querySelector('.heart-note').setAttribute('aria-hidden', String(!opening));
    button.querySelector('img').setAttribute('aria-hidden', String(opening));
    if (opening) {
      discovered.add(index);
      const rect = button.getBoundingClientRect();
      burst(event.detail ? event.clientX : rect.x + rect.width / 2, event.detail ? event.clientY : rect.y + rect.height / 2, 12);
      updateProgress();
    }
  }

  function updateProgress() {
    $('#progress-text').textContent = `${discovered.size} of ${gift.memories.length} little love notes discovered`;
    [...$('#progress-hearts').children].forEach((heart, index) => {
      heart.classList.toggle('found', discovered.has(index));
      heart.textContent = discovered.has(index) ? '♥' : '♡';
    });
    const complete = discovered.size === gift.memories.length;
    $('#final-trigger').disabled = !complete;
    $('#final-trigger-text').textContent = complete ? 'Open your love letter' : 'One more thing, just for you…';
    $('#lock-icon').textContent = complete ? '→' : '⌑';
    $('#unlock-hint').textContent = complete ? 'Every little note. One big truth: I love you. ♥' : 'Open every heart to find your last surprise.';
  }

  function burst(x, y, count) {
    if (reducedMotion.matches) return;
    for (let index = 0; index < count; index++) {
      const heart = document.createElement('span');
      heart.className = 'burst-heart';
      heart.textContent = index % 3 ? '♥' : '♡';
      const angle = Math.random() * Math.PI * 2;
      const distance = 45 + Math.random() * 125;
      const vars = { x: `${x}px`, y: `${y}px`, dx: `${Math.cos(angle) * distance}px`, dy: `${Math.sin(angle) * distance - 75}px`, rotation: `${Math.random() * 100 - 50}deg`, size: `${10 + Math.random() * 17}px`, duration: `${1 + Math.random() * .8}s`, color: ['#ba5f7c', '#df9cb4', '#b193bd'][index % 3] };
      Object.entries(vars).forEach(([key, value]) => heart.style.setProperty(`--${key}`, value));
      $('#burst-layer').append(heart);
      heart.addEventListener('animationend', () => heart.remove(), { once: true });
    }
  }

  function openDialog(dialog, opener) {
    dialogOpener = opener;
    dialog.showModal();
  }
  function closeDialog(dialog) { dialog.close(); }
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog); } });
    dialog.addEventListener('close', () => { if (dialogOpener && !dialogOpener.disabled) dialogOpener.focus({ preventScroll: true }); });
  });
  document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));
  $('#final-trigger').addEventListener('click', () => openDialog($('#final-dialog'), $('#final-trigger')));
  $('#replay-button').addEventListener('click', () => {
    closeDialog($('#final-dialog'));
    renderGift();
    $('.heart-button').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
    $('.heart-button').focus({ preventScroll: true });
  });

  // A quiet, original music-box melody. Audio starts only after a deliberate click.
 // Your background song.
const song = new Audio('assets/music.mp3');
song.loop = true;
song.volume = 1; // 0 = silent, 1 = full volume

$('#music-button').addEventListener('click', async () => {
  const button = $('#music-button');
  button.disabled = true;

  try {
    if (playing) {
      song.pause();
      playing = false;
    } else {
      await song.play();
      playing = true;
    }

    button.setAttribute('aria-pressed', String(playing));
    $('#music-label').textContent =
      playing ? 'Sound on' : 'Sound off';
  } catch {
    $('#music-label').textContent = 'Tap to retry';
  } finally {
    button.disabled = false;
  }
});

// Start the song with the first click or tap.
document.addEventListener('click', (event) => {
  if (event.target.closest?.('#music-button')) return;

  if (!playing && !$('#music-button').disabled) {
    $('#music-button').click();
  }
}, { once: true });
  // Personalization is entirely local. Exported config.js can travel with the gift.
  $('#personalize-button').addEventListener('click', () => {
    pendingPhotos.clear();
    $('#recipient').value = gift.recipient;
    $('#final-copy').value = gift.finalMessage;
    $('#sign-off').value = gift.signature;
    $('#editor-status').textContent = '';
    $('#photo-fields').replaceChildren();
    gift.memories.forEach((memory, index) => {
      const field = document.createElement('div');
      field.className = 'photo-field';
      field.innerHTML = `<label class="field-label" for="photo-${index}">Heart 0${index + 1} · Photo & love note</label><div class="photo-field-header"><img class="photo-preview" alt="Current photo for heart ${index + 1}"><input id="photo-${index}" type="file" accept="image/jpeg,image/png,image/webp"></div><textarea id="message-${index}" aria-label="Love note ${index + 1}" rows="3" maxlength="300" required></textarea>`;
      field.querySelector('img').src = memory.photo;
      field.querySelector('textarea').value = memory.message;
      field.querySelector('input').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const promise = preparePhoto(file).then((url) => { field.querySelector('img').src = url; return url; });
        pendingPhotos.set(index, promise);
        promise.catch((error) => { pendingPhotos.delete(index); event.target.value = ''; $('#editor-status').textContent = error.message; });
      });
      $('#photo-fields').append(field);
    });
    openDialog($('#editor-dialog'), $('#personalize-button'));
  });

  async function preparePhoto(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Please choose a JPG, PNG, or WebP photo.');
    if (file.size > 15 * 1024 * 1024) throw new Error('Choose a photo smaller than 15 MB.');
    const source = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = source;
      await img.decode();
      const scale = Math.min(1, 1100 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', .85);
    } catch { throw new Error('That photo could not be opened. Try a different JPG or PNG.'); }
    finally { URL.revokeObjectURL(source); }
  }

  async function collectSettings() {
    if (!$('#personalize-form').reportValidity()) return null;
    const next = structuredClone(gift);
    next.recipient = $('#recipient').value.trim() || defaults.recipient;
    next.finalMessage = $('#final-copy').value.trim() || defaults.finalMessage;
    next.signature = $('#sign-off').value.trim() || defaults.signature;
    for (let index = 0; index < next.memories.length; index++) {
      next.memories[index].message = $(`#message-${index}`).value.trim() || defaults.memories[index].message;
      if (pendingPhotos.has(index)) {
        next.memories[index].photo = await pendingPhotos.get(index);
        next.memories[index].alt = `A favorite photo of ${next.recipient}`;
        next.memories[index].position = '50% 50%';
      }
    }
    return normalizeGift(next);
  }

  $('#personalize-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.submitter;
    button.disabled = true;
    try {
      const settings = await collectSettings();
      if (!settings) return;
      gift = settings;
      renderGift();
      try { localStorage.setItem(storageKey, JSON.stringify(gift)); $('#editor-status').textContent = 'Saved on this device. Your love letter is ready. ♡'; }
      catch { $('#editor-status').textContent = 'Your preview is ready. Browser storage is full or unavailable; download settings to keep your changes.'; }
    } catch (error) { $('#editor-status').textContent = error.message; }
    finally { button.disabled = false; }
  });
  $('#download-config').addEventListener('click', async () => {
    try {
      const settings = await collectSettings();
      if (!settings) return;
      const blob = new Blob([`/* Your personalized love letter. Replace dist/config.js with this file. */\nwindow.LOVE_LETTER = ${JSON.stringify(settings, null, 2)};\n`], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'config.js';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      $('#editor-status').textContent = 'Settings downloaded. Replace the website’s config.js with this file before sharing.';
    } catch (error) { $('#editor-status').textContent = error.message; }
  });

  if (!reducedMotion.matches) {
    for (let index = 0; index < 28; index++) {
      const particle = document.createElement('i');
      particle.className = 'particle';
      const vars = { x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, size: `${2 + Math.random() * 3}px`, duration: `${2 + Math.random() * 4}s`, delay: `${-Math.random() * 6}s` };
      Object.entries(vars).forEach(([key, value]) => particle.style.setProperty(`--${key}`, value));
      $('#particles').append(particle);
    }
  }
  renderGift();
})();
