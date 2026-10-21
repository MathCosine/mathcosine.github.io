/* the /write/ page: builds a diary file or a locked block, and hands it to github */
(function () {
  'use strict';

  var MC = window.MC, S = window.SITE || {};
  var form = document.getElementById('writer');
  if (!form || !MC) return;
  function $(id) { return document.getElementById(id); }

  var mode = 'diary';
  var editing = null;
  if (/[?&]edit=1/.test(location.search)) {
    try { editing = JSON.parse(sessionStorage.getItem(MC.EDIT)); } catch (e) { editing = null; }
  }

  // moods
  var moods = ['', 'happy', 'sleepy', 'grumpy', 'curious', 'hungry'];
  $('w-moods').innerHTML = moods.map(function (m, i) {
    var id = 'mood-' + (m || 'none');
    return '<input type="radio" name="mood" id="' + id + '" value="' + m + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<label for="' + id + '"><span class="mood">' + (m ? MC.moodFace(m) : '<svg viewBox="0 0 36 32"><ellipse class="mood-none" cx="18" cy="17" rx="12" ry="10.5"/></svg>') + '</span>' + (m || 'none') + '</label>';
  }).join('');

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  $('w-date').value = today();

  // prefill from an "edit" link
  if (editing) {
    setMode(editing.kind === 'block' ? 'block' : 'diary');
    $('w-body').value = editing.body || '';
    if (editing.kind === 'block') $('w-name').value = editing.name || '';
    else {
      $('w-title').value = editing.title || '';
      if (editing.date) $('w-date').value = editing.date;
      var r = form.querySelector('input[name="mood"][value="' + (editing.mood || '') + '"]');
      if (r) r.checked = true;
    }
    document.querySelector('.page-title').textContent = 'edit this';
  }

  var known = MC.saved();
  if (known.length) $('w-pw').value = known[0];

  // switching between diary entry / locked block
  document.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.dataset.mode); });
  });
  function setMode(m) {
    mode = m;
    document.querySelectorAll('.seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === m)); });
    document.querySelectorAll('.only-diary').forEach(function (el) { el.hidden = m !== 'diary'; });
    document.querySelectorAll('.only-block').forEach(function (el) { el.hidden = m !== 'block'; });
    syncPw();
  }
  setMode(mode);

  function locking() { return mode === 'block' || $('w-lock').checked; }

  // only ask for the password twice if it's one we haven't seen work before
  function syncPw() {
    var on = locking();
    document.querySelector('.pw-fields').hidden = !on;
    $('w-pw2-wrap').hidden = !on || MC.saved().indexOf($('w-pw').value) !== -1;
  }
  $('w-lock').addEventListener('change', syncPw);
  $('w-pw').addEventListener('input', syncPw);
  syncPw();

  // live preview
  var t;
  function preview() {
    clearTimeout(t);
    t = setTimeout(function () {
      var box = $('w-preview');
      box.innerHTML = $('w-body').value.trim() ? MC.render($('w-body').value) : '';
      MC.typeset(box);
    }, 250);
  }
  $('w-body').addEventListener('input', preview);
  preview();

  function slug(s) {
    return String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 40);
  }
  function rand(n) {
    var a = crypto.getRandomValues(new Uint8Array(n)), abc = 'abcdefghijkmnpqrstuvwxyz23456789', s = '';
    for (var i = 0; i < n; i++) s += abc[a[i] % abc.length];
    return s;
  }
  function gh(kind, path) { return 'https://github.com/' + S.repo + '/' + kind + '/' + S.branch + '/' + path; }
  function err(msg) { $('w-err').textContent = msg; $('w-err').hidden = !msg; }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    err('');
    var body = $('w-body').value.replace(/\s+$/, '') + '\n';
    var pw = $('w-pw').value;
    var lockIt = locking();

    if (!body.trim()) return err('write something first :3');
    if (lockIt && !pw) return err('it needs a password.');
    if (lockIt && !$('w-pw2-wrap').hidden && pw !== $('w-pw2').value) return err("the two passwords don't match.");

    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      if (mode === 'diary') await makeEntry(body, pw, lockIt);
      else await makeBlock(body, pw);
      if (lockIt) { MC.remember(pw, false); syncPw(); }
    } catch (x) {
      err('something went wrong: ' + x.message);
    }
    btn.disabled = false;
  });

  async function makeEntry(body, pw, lockIt) {
    var title = $('w-title').value.trim();
    var date = $('w-date').value || today();
    var mood = (form.querySelector('input[name="mood"]:checked') || {}).value || '';
    var text, name;
    if (lockIt) {
      var blob = await MC.lock({ title: title, mood: mood, body: body }, pw, S.salt);
      text = '---\ndate: ' + date + '\nsecret: "' + blob + '"\n---\n';
      name = date + '-' + rand(4) + '.md';   // random name, so the title stays secret
    } else {
      text = '---\ntitle: ' + JSON.stringify(title || 'untitled') + '\ndate: ' + date + (mood ? '\nmood: ' + mood : '') + '\n---\n\n' + body;
      name = date + '-' + (slug(title) || 'entry') + '.md';
    }

    if (editing && editing.kind === 'diary' && editing.file) {
      show(text,
        'replace everything in <code>' + editing.file + '</code> with this:',
        gh('edit', editing.file), 'open the file on github',
        'on github: select all the text in the file, paste this over it, then press <b>commit changes</b>.');
    } else {
      var newUrl = 'https://github.com/' + S.repo + '/new/' + S.branch + '/_diary?filename=' + encodeURIComponent(name) + '&value=' + encodeURIComponent(text);
      var fits = newUrl.length < 7500;
      show(text,
        'this goes in a new file: <code>_diary/' + name + '</code>',
        fits ? newUrl : 'https://github.com/' + S.repo + '/new/' + S.branch + '/_diary?filename=' + encodeURIComponent(name),
        fits ? 'save it on github' : 'make the file on github',
        fits ? 'the button opens github with everything filled in. just press <b>commit changes</b>. it shows up here in a minute or two.'
             : "it's a long one, so github can't take it straight from the link. press <b>copy</b>, then the button, paste it in, and press <b>commit changes</b>.");
    }
  }

  async function makeBlock(body, pw) {
    var name = $('w-name').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!name) throw new Error('give the block a name (letters, numbers, dashes).');
    var blob = await MC.lock({ body: body }, pw, S.salt);
    var line = name + ': "' + blob + '"';
    show(line,
      'this line goes in <code>_data/locked.yml</code>:',
      gh('edit', '_data/locked.yml'), 'open locked.yml on github',
      'on github: if there is already a line starting with <code>' + name + ':</code>, replace that whole line. otherwise add this as a new line at the bottom. then press <b>commit changes</b>.' +
      (editing ? '' : '<br>to show a new block on a page, add <code>{% include locked.html name="' + name + '" %}</code> to it (or list it under <code>locked:</code> at the top of index.md).'));
  }

  function show(text, where, url, label, help) {
    $('w-where').innerHTML = where;
    $('w-file').textContent = text;
    $('w-gh').href = url;
    $('w-gh').textContent = label;
    $('w-help').innerHTML = help;
    $('w-out').hidden = false;
    $('w-out').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  $('w-copy').addEventListener('click', async function () {
    var b = this;
    try {
      await navigator.clipboard.writeText($('w-file').textContent);
      b.textContent = 'copied! :3';
    } catch (e) {
      var range = document.createRange();
      range.selectNodeContents($('w-file'));
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      b.textContent = 'press ctrl/cmd + c';
    }
    setTimeout(function () { b.textContent = 'copy'; }, 1800);
  });
})();
