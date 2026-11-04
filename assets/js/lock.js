/* password locks for the locked blocks.
   a lock looks like v1.<salt>.<iv>.<data> (base64). the data is AES-GCM,
   the key comes from the password via PBKDF2-SHA256, so the repo only ever
   holds scrambled text. */
(function () {
  'use strict';

  var ITERATIONS = 600000;
  var STORE = 'mc-passwords';
  var EDIT = 'mc-edit';
  var te = new TextEncoder();
  var td = new TextDecoder();
  var keys = {};

  function toB64(buf) {
    var bytes = new Uint8Array(buf), s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  function fromB64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function getKey(password, salt) {
    var id = salt + ' ' + password;
    if (!keys[id]) {
      keys[id] = crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey'])
        .then(function (base) {
          return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: fromB64(salt), iterations: ITERATIONS, hash: 'SHA-256' },
            base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        });
    }
    return keys[id];
  }

  async function lock(data, password, salt) {
    salt = salt || toB64(crypto.getRandomValues(new Uint8Array(16)));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var key = await getKey(password, salt);
    var out = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, te.encode(JSON.stringify(data)));
    return ['v1', salt, toB64(iv), toB64(out)].join('.');
  }

  async function unlock(blob, password) {
    var p = String(blob || '').trim().split('.');
    if (p.length !== 4 || p[0] !== 'v1') throw new Error('not a lock');
    var key = await getKey(password, p[1]);
    var out = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(p[2]) }, key, fromB64(p[3]));
    return JSON.parse(td.decode(out));
  }

  async function tryAll(blob, passwords) {
    for (var i = 0; i < passwords.length; i++) {
      try { return { data: await unlock(blob, passwords[i]), password: passwords[i] }; } catch (e) { /* next */ }
    }
    return null;
  }

  // passwords that worked, kept for this tab (or this device, if asked)
  function readStore(name) {
    try { return JSON.parse(window[name].getItem(STORE)) || []; } catch (e) { return []; }
  }
  function writeStore(name, list) {
    try { window[name].setItem(STORE, JSON.stringify(list)); } catch (e) { /* private mode */ }
  }
  function saved() {
    var all = readStore('sessionStorage').concat(readStore('localStorage'));
    return all.filter(function (p, i) { return p && all.indexOf(p) === i; });
  }
  function remember(password, forever) {
    var list = [password].concat(readStore('sessionStorage').filter(function (p) { return p !== password; }));
    writeStore('sessionStorage', list);
    if (forever) writeStore('localStorage', [password].concat(readStore('localStorage').filter(function (p) { return p !== password; })));
    document.documentElement.classList.add('is-owner');
  }
  function forget() {
    try { sessionStorage.removeItem(STORE); } catch (e) { /* nothing to forget */ }
    try { localStorage.removeItem(STORE); } catch (e) { /* nothing to forget */ }
  }

  // markdown -> html, keeping $math$ away from the markdown parser
  var MATH = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$(?!\s)[^$\n]+?(?<!\s)\$/g;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function render(md) {
    var stash = [];
    var src = String(md || '').replace(MATH, function (m) { stash.push(m); return 'MCMATH' + (stash.length - 1) + 'END'; });
    var html = window.marked ? window.marked.parse(src) : '<p>' + esc(src).replace(/\n/g, '<br>') + '</p>';
    return html.replace(/MCMATH(\d+)END/g, function (_, i) { return esc(stash[+i]); });
  }

  var MATH_OPTS = {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  };
  function typeset(el) {
    if (window.renderMathInElement) window.renderMathInElement(el, MATH_OPTS);
    else window.addEventListener('load', function () { if (window.renderMathInElement) window.renderMathInElement(el, MATH_OPTS); }, { once: true });
  }

  function writeUrl(edit) {
    try { sessionStorage.setItem(EDIT, JSON.stringify(edit)); } catch (e) { /* the write page will just start empty */ }
    return (window.SITE ? window.SITE.base : '') + '/write/?edit=1';
  }

  // ── opening things on the page ──

  function showBlock(el, data) {
    var box = el.querySelector('.locked-content');
    box.innerHTML = render(data.body);
    var tools = document.createElement('p');
    tools.className = 'locked-tools';
    tools.innerHTML = '<a class="edit-it">edit</a><button class="linkish lock-again" type="button">lock again</button>';
    tools.querySelector('.edit-it').href = writeUrl({ kind: 'block', name: el.dataset.block, body: data.body });
    tools.querySelector('.edit-it').addEventListener('click', function () { writeUrl({ kind: 'block', name: el.dataset.block, body: data.body }); });
    box.appendChild(tools);
    typeset(box);
  }

  async function openAll(passwords) {
    var opened = 0;
    var items = document.querySelectorAll('[data-blob]:not(.is-open)');
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      if (!el.dataset.blob) continue;
      var r = await tryAll(el.dataset.blob, passwords);
      if (!r) continue;
      opened++;
      el.classList.add('is-open');
      wake(el, function (target, data) { return function () { showBlock(target, data); }; }(el, r.data));
    }
    return opened;
  }

  function wake(el, then) {
    el.classList.add('is-waking');
    setTimeout(function () {
      el.querySelector('.locked-cover').hidden = true;
      el.querySelector('.locked-content').hidden = false;
      then();
    }, 650);
  }

  function hookForms() {
    document.querySelectorAll('.locked form.unlock').forEach(function (form) {
      var box = form.closest('.locked');
      var input = form.querySelector('input[type="password"]');
      var button = form.querySelector('button');
      var msg = form.querySelector('.unlock-msg');
      if (!box.dataset.blob) {
        msg.textContent = 'nothing is locked in here yet.';
        input.disabled = button.disabled = true;
        return;
      }
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var pw = input.value;
        if (!pw) return;
        button.disabled = true;
        var was = button.textContent;
        button.textContent = 'waking…';
        box.classList.remove('is-wrong');
        var opened = await openAll([pw]);
        button.disabled = false;
        button.textContent = was;
        if (opened) {
          remember(pw, false);
          input.value = '';
        } else {
          void box.offsetWidth;
          box.classList.add('is-wrong');
          msg.textContent = ['nope, still asleep.', 'not quite. try again?', 'hmm, wrong one :('][Math.floor(Math.random() * 3)];
          input.select();
        }
      });
    });
    document.addEventListener('click', function (e) {
      if (e.target.closest('.lock-again')) { forget(); location.reload(); }
    });
  }

  window.MC = { lock: lock, unlock: unlock, saved: saved, remember: remember, forget: forget, render: render, typeset: typeset, EDIT: EDIT };

  hookForms();
  var known = saved();
  if (known.length) {
    document.documentElement.classList.add('is-owner');
    openAll(known);
  }
})();
