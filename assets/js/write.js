/* the /write/ page: scrambles a locked block and hands the line to github */
(function () {
  'use strict';

  var MC = window.MC, S = window.SITE || {};
  var form = document.getElementById('writer');
  if (!form || !MC) return;
  function $(id) { return document.getElementById(id); }

  var editing = null;
  if (/[?&]edit=1/.test(location.search)) {
    try { editing = JSON.parse(sessionStorage.getItem(MC.EDIT)); } catch (e) { editing = null; }
  }

  // prefill from an "edit" link
  if (editing) {
    $('w-body').value = editing.body || '';
    $('w-name').value = editing.name || '';
    document.querySelector('.page-title').textContent = 'edit this';
  }

  var known = MC.saved();
  if (known.length) $('w-pw').value = known[0];

  // only ask for the password twice if it's one we haven't seen work before
  function syncPw() {
    $('w-pw2-wrap').hidden = MC.saved().indexOf($('w-pw').value) !== -1;
  }
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

  function err(msg) { $('w-err').textContent = msg; $('w-err').hidden = !msg; }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    err('');
    var body = $('w-body').value.replace(/\s+$/, '') + '\n';
    var pw = $('w-pw').value;
    var name = $('w-name').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!name) return err('give the block a name (letters, numbers, dashes).');
    if (!body.trim()) return err('write something first :3');
    if (!pw) return err('it needs a password.');
    if (!$('w-pw2-wrap').hidden && pw !== $('w-pw2').value) return err("the two passwords don't match.");

    var btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      var blob = await MC.lock({ body: body }, pw, S.salt);
      MC.remember(pw, false);
      syncPw();
      show(name + ': "' + blob + '"', name);
    } catch (x) {
      err('something went wrong: ' + x.message);
    }
    btn.disabled = false;
  });

  function show(line, name) {
    $('w-where').innerHTML = 'this line goes in <code>_data/locked.yml</code>:';
    $('w-file').textContent = line;
    $('w-gh').href = 'https://github.com/' + S.repo + '/edit/' + S.branch + '/_data/locked.yml';
    $('w-gh').textContent = 'open locked.yml on github';
    $('w-help').innerHTML = 'on github: if there is already a line starting with <code>' + name + ':</code>, replace that whole line. ' +
      'otherwise add this as a new line at the bottom. then press <b>commit changes</b>.' +
      (editing ? '' : '<br>to show a new block on a page, list it under <code>locked:</code> at the top of index.md, or put <code>{% include locked.html name="' + name + '" %}</code> in any page.');
    $('w-out').hidden = false;
    $('w-out').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  $('w-copy').addEventListener('click', async function () {
    var b = this;
    try {
      await navigator.clipboard.writeText($('w-file').textContent);
      b.textContent = 'copied! <3';
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
