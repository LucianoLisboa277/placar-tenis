(function () {
  'use strict';
  var E = window.Engine;
  var $ = function (id) { return document.getElementById(id); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var K = { auth: 'placar:auth', settings: 'placar:settings', cur: 'placar:cur', hist: 'placar:hist', vk: 'placar:vk', vver: 'placar:vver' };
  var VOICE_NAME = { F: 'Feminina', M: 'Masculina' };

  var settings = Object.assign({ voice: 'F', volume: 0.9, mute: false, cfg: E.normCfg({}) }, LS.get(K.settings, {}));
  settings.cfg = E.normCfg(settings.cfg);
  function saveSettings() { LS.set(K.settings, settings); }

  /* ---------- telas ---------- */
  var SCREENS = ['login', 'home', 'wizard', 'history', 'game'];
  var current = '';
  function show(name) {
    current = name;
    SCREENS.forEach(function (s) { $(s).hidden = s !== name; });
    closeModal();
    updateRotate();
    if (name !== 'game') releaseWake();
  }

  /* ---------- acesso (login e senha) ---------- */
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function unhex(h) { var a = new Uint8Array(h.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }
  function b64(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
  function unb64(t) { var s = atob(t), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  /* uma derivação PBKDF2 gera 64 bytes: os 32 primeiros conferem o acesso, os 32 últimos abrem a chave das vozes */
  function derive(login, pass, salt, iter) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(login.trim().toLowerCase() + '\u0000' + pass.trim().toLowerCase()), 'PBKDF2', false, ['deriveBits'])
      .then(function (key) { return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(salt), iterations: iter }, key, 512); })
      .then(function (bits) { var u = new Uint8Array(bits); return { h: hex(u.slice(0, 32)), wk: u.slice(32) }; });
  }
  function unwrapKey(wk, wrapped) {
    var d = unb64(wrapped);
    return crypto.subtle.importKey('raw', wk, 'AES-GCM', false, ['decrypt'])
      .then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: d.slice(0, 12) }, key, d.slice(12)); })
      .then(function (ab) { return b64(new Uint8Array(ab)); });
  }
  function accessList() { var a = window.PLACAR_ACCESS || {}; return { iter: a.iter || 150000, users: a.users || [] }; }
  function authOk() {
    var tok = LS.get(K.auth, null), a = accessList();
    return !!tok && a.users.some(function (u) { return u.hash === tok; });
  }
  function doLogin() {
    var u = $('loginUser').value, p = $('loginPass').value, a = accessList(), err = $('loginErr');
    err.textContent = '';
    if (!window.crypto || !crypto.subtle) { err.textContent = 'Abra o link com https para entrar.'; return; }
    if (!u.trim() || !p) { err.textContent = 'Preencha login e senha.'; return; }
    $('loginBtn').disabled = true;
    Promise.all(a.users.map(function (x) { return derive(u, p, x.salt, a.iter).then(function (d) { return d.h === x.hash ? { h: d.h, wk: d.wk, x: x } : null; }); }))
      .then(function (r) {
        var ok = r.filter(Boolean)[0];
        if (!ok) { err.textContent = 'Login ou senha incorretos.'; return; }
        var done = function (vk) { if (vk) LS.set(K.vk, vk); LS.set(K.auth, ok.h); $('loginPass').value = ''; start(); };
        if (ok.x.wrapped) return unwrapKey(ok.wk, ok.x.wrapped).then(done);
        done(null);
      })
      .catch(function () { err.textContent = 'Não foi possível conferir o acesso neste aparelho.'; })
      .then(function () { $('loginBtn').disabled = false; });
  }

  /* ---------- armazenamento das vozes (IndexedDB) ---------- */
  var db = null;
  function openDb() {
    if (db) return Promise.resolve(db);
    return new Promise(function (res, rej) {
      var r = indexedDB.open('placar-vozes', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('faixas'); };
      r.onsuccess = function () { db = r.result; res(db); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idb(mode, fn) {
    return openDb().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction('faixas', mode), st = tx.objectStore('faixas'), out = fn(st);
        tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function idbPut(key, buf) { return idb('readwrite', function (st) { st.put(buf, key); }); }
  function idbGet(key) { return idb('readonly', function (st) { return st.get(key); }); }
  function idbKeys() { return idb('readonly', function (st) { return st.getAllKeys(); }); }
  function idbDelPrefix(prefix) {
    return idbKeys().then(function (keys) {
      return idb('readwrite', function (st) { keys.forEach(function (k) { if (String(k).indexOf(prefix) === 0) st.delete(k); }); });
    });
  }

  /* quais faixas existem por voz: { F: {1:true,...}, M: {...} } */
  var have = { F: {}, M: {} };
  function refreshHave() {
    return idbKeys().then(function (keys) {
      have = { F: {}, M: {} };
      keys.forEach(function (k) { var m = /^([FM]):(\d+)$/.exec(k); if (m) have[m[1]][+m[2]] = true; });
    }).catch(function () {});
  }
  function missing(v) { var out = []; for (var n = 1; n <= 28; n++) if (!have[v][n]) out.push(n); return out; }
  function countHave(v) { return 28 - missing(v).length; }


  /* ---------- vozes embutidas no app (criptografadas), baixadas depois do login ---------- */
  var sync = { running: false, done: 0, total: 0, fail: 0 };
  function pad3(n) { return String(n).padStart(3, '0'); }
  function syncText() {
    if (sync.running) return 'Baixando as vozes: ' + sync.done + ' de ' + sync.total + '.';
    if (sync.fail) return 'Não foi possível baixar ' + sync.fail + ' faixas. Confira a internet e toque em Baixar vozes de novo.';
    return '';
  }
  function notifySync() {
    var t = syncText();
    var sl = $('syncLine'); if (sl) sl.textContent = t || 'Vozes em dia neste aparelho.';
    if (current === 'home') renderHome();
  }
  function syncVoices(force) {
    var a = window.PLACAR_ACCESS || {}, vk = LS.get(K.vk, null);
    if (!vk || !a.voicesVersion || sync.running) return Promise.resolve();
    var redo = !!force || LS.get(K.vver, '') !== a.voicesVersion, jobs = [];
    ['F', 'M'].forEach(function (v) { for (var n = 1; n <= 28; n++) if (redo || !have[v][n]) jobs.push([v, n]); });
    if (!jobs.length) { LS.set(K.vver, a.voicesVersion); return Promise.resolve(); }
    sync = { running: true, done: 0, total: jobs.length, fail: 0 };
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    notifySync();
    return crypto.subtle.importKey('raw', unb64(vk), 'AES-GCM', false, ['decrypt']).then(function (key) {
      var idx = 0;
      function worker() {
        if (idx >= jobs.length) return Promise.resolve();
        var j = jobs[idx++], v = j[0], n = j[1];
        return fetch('voices/' + v + '/' + pad3(n) + '.bin', { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
          .then(function (ab) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(ab.slice(0, 12)) }, key, ab.slice(12)); })
          .then(function (plain) { delete bufCache[v + ':' + n]; return idbPut(v + ':' + n, plain); })
          .catch(function () { sync.fail++; })
          .then(function () { sync.done++; var sl = $('syncLine'); if (sl) sl.textContent = syncText(); if (current === 'home') $('homeVoice').textContent = syncText(); return worker(); });
      }
      return Promise.all([worker(), worker(), worker(), worker()]);
    }).catch(function () { sync.fail = sync.total; })
      .then(refreshHave)
      .then(function () {
        sync.running = false;
        if (!sync.fail) LS.set(K.vver, a.voicesVersion);
        notifySync(); preload();
        refreshStep();
      });
  }

  /* ---------- áudio ---------- */
  var ctx = null, gain = null, bufCache = {}, playToken = 0, currentSrc = null;
  var played = [];
  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); gain = ctx.createGain(); gain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    gain.gain.value = settings.mute ? 0 : settings.volume;
    return ctx;
  }
  function getBuffer(v, n) {
    var key = v + ':' + n;
    if (bufCache[key]) return Promise.resolve(bufCache[key]);
    return idbGet(key).then(function (ab) {
      if (!ab) return null;
      return decode(ab.slice(0)).then(function (b) { bufCache[key] = b; return b; });
    }).catch(function () { return null; });
  }
  function decode(ab) {
    return new Promise(function (res, rej) {
      var c = ensureCtx(); if (!c) return rej(new Error('sem audio'));
      var p = c.decodeAudioData(ab, res, rej);
      if (p && p.catch) p.catch(rej);
    });
  }
  function stopAudio() { playToken++; if (currentSrc) { try { currentSrc.onended = null; currentSrc.stop(); } catch (e) {} currentSrc = null; } }
  function playTracks(list) {
    if (!list || !list.length) return;
    var tok = ++playToken, v = settings.voice;
    if (currentSrc) { try { currentSrc.onended = null; currentSrc.stop(); } catch (e) {} currentSrc = null; }
    played.push({ voice: v, tracks: list.slice(), at: Date.now() });
    if (played.length > 200) played.shift();
    if (!ensureCtx()) return;
    var i = 0;
    (function next() {
      if (tok !== playToken || i >= list.length) return;
      var n = list[i++];
      getBuffer(v, n).then(function (buf) {
        if (tok !== playToken) return;
        if (!buf) { next(); return; }   /* faixa ausente: silêncio */
        var src = ctx.createBufferSource(); src.buffer = buf; src.connect(gain);
        src.onended = function () { if (tok === playToken) setTimeout(next, 120); };
        currentSrc = src; src.start();
      });
    })();
  }
  function preload() {
    var v = settings.voice;
    for (var n = 1; n <= 28; n++) if (have[v][n]) getBuffer(v, n);
  }

  /* importar arquivos de voz: o número da faixa vem do começo do nome (001.mp3 a 028.mp3) */
  function importFiles(v, files) {
    files = Array.prototype.slice.call(files || []);
    var done = 0, ignored = [], bad = [], ok = 0;
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    ensureCtx();
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        var m = /^(\d{1,3})(?!\d)/.exec(f.name.replace(/^.*[\\/]/, ''));
        var n = m ? parseInt(m[1], 10) : 0;
        if (n < 1 || n > 28) { ignored.push(f.name); return; }
        return f.arrayBuffer().then(function (ab) {
          return decode(ab.slice(0)).then(function (b) {
            return idbPut(v + ':' + n, ab).then(function () { bufCache[v + ':' + n] = b; ok++; });
          });
        }).catch(function () { bad.push(f.name); });
      }).then(function () { done++; var el = $('impProgress'); if (el) el.textContent = 'Lendo ' + done + ' de ' + files.length + '...'; });
    });
    return chain.then(refreshHave).then(function () { return { ok: ok, ignored: ignored, bad: bad }; });
  }

  function trackList(arr) { return arr.map(function (n) { return String(n).padStart(3, '0') + ' ' + E.TRACKS[n]; }).join(', '); }

  /* ---------- modal ---------- */
  function openModal(html) { var m = $('modal'); m.innerHTML = '<div class="card">' + html + '</div>'; m.hidden = false; return m; }
  function closeModal() { var m = $('modal'); m.hidden = true; m.innerHTML = ''; }
  function confirmBox(text, yes, cb) {
    var m = openModal('<p>' + text + '</p><div class="opts two"><button class="btn" id="cNo">Cancelar</button><button class="btn primary" id="cYes">' + yes + '</button></div>');
    m.querySelector('#cNo').onclick = closeModal;
    m.querySelector('#cYes').onclick = function () { closeModal(); cb(); };
  }

  /* ---------- tela inicial ---------- */
  function resumable() {
    var cur = LS.get(K.cur, null);
    return cur && cur.s && cur.s.phase && cur.s.phase !== 'fim' ? cur : null;
  }
  function renderHome() {
    var f = countHave('F'), m = countHave('M');
    $('homeVoice').textContent = syncText() || ('Vozes neste aparelho: feminina ' + f + '/28, masculina ' + m + '/28.');
    $('homeResume').hidden = !resumable();
    show('home');
  }
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; $('homeInstall').hidden = false; });
  $('homeInstall').onclick = function () { if (installEvt) { installEvt.prompt(); installEvt = null; $('homeInstall').hidden = true; } };

  /* ---------- assistente de configuração ---------- */
  var STEPS = ['Vozes', 'Formato da partida', 'Vantagem', 'Aquecimento', 'Intervalos', 'Primeiro saque', 'Resumo'];
  var step = 0, wizOnly = false, draft = null;

  function openWizard(startAt, only) { draft = E.normCfg(settings.cfg); step = startAt || 0; wizOnly = !!only; show('wizard'); renderStep(); }
  function optBtns(name, items, val) {
    return items.map(function (it) {
      return '<button class="btn opt' + (String(it.v) === String(val) ? ' sel' : '') + '" data-name="' + name + '" data-v="' + it.v + '">' + it.t + (it.s ? '<small>' + it.s + '</small>' : '') + '</button>';
    }).join('');
  }
  function stepper(name, val, min, max, stp, fmt) {
    return '<div class="stepper"><button class="btn" data-step="' + name + '" data-d="-' + stp + '" aria-label="Diminuir">-</button><span class="val" id="v_' + name + '">' + fmt(val) + '</span><button class="btn" data-step="' + name + '" data-d="' + stp + '" aria-label="Aumentar">+</button></div>';
  }
  function fmtSec(s) { return s >= 60 ? Math.floor(s / 60) + ' min' + (s % 60 ? ' ' + (s % 60) + ' s' : '') : s + ' s'; }
  var LIM = { heatSec: [5, 900, 5], brkChangeSec: [5, 600, 5], brkSetSec: [5, 900, 5] };

  function voicesHtml() {
    var v = settings.voice, miss = missing(v);
    var st = countHave(v) === 28
      ? '<div class="status">Voz ' + VOICE_NAME[v].toLowerCase() + ': 28 de 28 faixas carregadas.</div>'
      : '<div class="status warn">Voz ' + VOICE_NAME[v].toLowerCase() + ': ' + countHave(v) + ' de 28 faixas. Faixas que faltam ficam em silêncio.' +
        '<div class="miss">Faltam: ' + trackList(miss) + '</div></div>';
    return '<div class="group"><span class="lbl">Voz usada na partida</span><div class="opts two">' +
      optBtns('voice', [{ v: 'F', t: 'Feminina', s: countHave('F') + '/28' }, { v: 'M', t: 'Masculina', s: countHave('M') + '/28' }], v) + '</div></div>' +
      st +
      '<div class="status" id="syncLine">' + (syncText() || 'Vozes em dia neste aparelho.') + '</div>' +
      (LS.get(K.vk, null) ? '<button class="btn" id="syncAgain" style="width:100%;margin-bottom:12px">Baixar vozes de novo</button>' :
        '<div class="status warn">Para baixar as vozes, saia da conta e entre de novo.<button class="btn" id="syncRelog" style="width:100%;margin-top:8px">Sair e entrar de novo</button></div>') +
      '<details class="group"><summary class="muted">Carregar arquivos próprios (opcional)</summary>' +
      '<input id="impFiles" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" multiple hidden>' +
      '<button class="btn" id="impBtn" style="width:100%;margin-top:8px">Escolher MP3 da voz ' + VOICE_NAME[v].toLowerCase() + '</button>' +
      '<p id="impProgress" class="muted"></p><p id="impResult" class="muted"></p></details>' +
      '<div class="group"><span class="lbl">Volume</span><input id="volRange" type="range" min="0" max="100" value="' + Math.round(settings.volume * 100) + '"></div>' +
      '<div class="opts two"><button class="btn" id="impTest">Ouvir faixa 027</button><button class="btn" id="impClear">Remover vozes salvas</button></div>' +
      '<p id="persist" class="muted"></p>';
  }
  function bindVoices(root) {
    root.querySelector('#impBtn').onclick = function () { root.querySelector('#impFiles').click(); };
    var sa = root.querySelector('#syncAgain'); if (sa) sa.onclick = function () { syncVoices(true); };
    var sr = root.querySelector('#syncRelog'); if (sr) sr.onclick = function () { LS.del(K.auth); LS.del(K.vk); show('login'); };
    root.querySelector('#impFiles').onchange = function (e) {
      var files = e.target.files, v = settings.voice;
      if (!files || !files.length) return;
      root.querySelector('#impProgress').textContent = 'Lendo ' + files.length + ' arquivos...';
      importFiles(v, files).then(function (r) {
        e.target.value = '';
        refreshStep();
        var msg = r.ok + ' faixas salvas.';
        if (r.ignored.length) msg += ' Ignorados (nome sem número de 001 a 028): ' + r.ignored.join(', ') + '.';
        if (r.bad.length) msg += ' Não foi possível ler: ' + r.bad.join(', ') + '.';
        var el = $('impResult'); if (el) el.textContent = msg;
        var pg = $('impProgress'); if (pg) pg.textContent = '';
      });
    };
    root.querySelector('#volRange').oninput = function (e) { settings.volume = e.target.value / 100; saveSettings(); if (gain) gain.gain.value = settings.mute ? 0 : settings.volume; };
    root.querySelector('#impTest').onclick = function () { ensureCtx(); playTracks([27]); };
    root.querySelector('#impClear').onclick = function () {
      confirmBox('Remover as vozes salvas neste aparelho? Você terá que carregar os MP3 de novo.', 'Remover', function () {
        idbDelPrefix('').then(function () { bufCache = {}; return refreshHave(); }).then(function () { refreshStep(); });
      });
    };
    root.querySelectorAll('[data-name="voice"]').forEach(function (b) {
      b.onclick = function () { settings.voice = b.getAttribute('data-v'); saveSettings(); stopAudio(); refreshStep(); preload(); };
    });
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(function (p) {
        var el = $('persist'); if (el) el.textContent = p ? 'Armazenamento persistente ativo neste aparelho.' : 'O Chrome ainda não marcou o armazenamento como persistente. As vozes ficam salvas, mas o Chrome pode apagá-las se faltar espaço.';
      });
    }
  }
  function refreshStep() { if (current === 'wizard') renderStep(true); }

  function renderStep(keepScroll) {
    var c = draft, body = $('wizBody'), h = '';
    $('wizTitle').textContent = STEPS[step];
    $('wizDots').innerHTML = STEPS.map(function (_, i) { return '<i class="' + (i === step ? 'on' : '') + '"></i>'; }).join('');
    $('wizBack').style.visibility = step === 0 || wizOnly ? 'hidden' : 'visible';
    $('wizNext').textContent = wizOnly ? 'Concluído' : step === STEPS.length - 1 ? 'Iniciar partida' : 'Próximo';
    $('wizNext').classList.toggle('accent', step === STEPS.length - 1 && !wizOnly);
    if (step === 0) h = voicesHtml();
    else if (step === 1) {
      h = '<div class="group"><span class="lbl">Partida</span><div class="opts three">' + optBtns('sets', [{ v: 1, t: '1 set' }, { v: 2, t: 'Melhor de 3' }, { v: 3, t: 'Melhor de 5' }], c.sets) + '</div></div>' +
        '<div class="group"><span class="lbl">Set</span><div class="opts two">' + optBtns('games', [{ v: 6, t: '6 games', s: 'oficial, tie-break em 6 a 6' }, { v: 4, t: '4 games', s: 'rápido, tie-break em 3 a 3' }], c.games) + '</div></div>' +
        '<div class="group"><span class="lbl">Tie-break</span><div class="opts two">' + optBtns('tbPoints', [{ v: 7, t: '7 pontos' }, { v: 10, t: '10 pontos' }], c.tbPoints) + '</div></div>' +
        (c.sets > 1 ? '<div class="group"><span class="lbl">Set decisivo</span><div class="opts two">' + optBtns('superTb', [{ v: 1, t: 'Super tie-break', s: '10 pontos no lugar do set' }, { v: 0, t: 'Set completo' }], c.superTb ? 1 : 0) + '</div></div>' : '');
    } else if (step === 2) {
      h = '<div class="opts two">' + optBtns('noAd', [{ v: 0, t: 'Com vantagem', s: 'deuce e vantagem' }, { v: 1, t: 'Sem vantagem', s: 'ponto de ouro no 40 a 40' }], c.noAd ? 1 : 0) + '</div>';
    } else if (step === 3) {
      h = '<div class="opts two">' + optBtns('heat', [{ v: 1, t: 'Com aquecimento' }, { v: 0, t: 'Sem aquecimento' }], c.heat ? 1 : 0) + '</div>' +
        (c.heat ? '<div class="group" style="margin-top:16px"><span class="lbl">Duração</span>' + stepper('heatSec', c.heatSec, 5, 900, 5, fmtSec) + '</div>' : '');
    } else if (step === 4) {
      h = '<div class="group"><span class="lbl">Troca de lado (a cada game ímpar, menos o primeiro)</span><div class="opts two">' +
        optBtns('brkChange', [{ v: 1, t: 'Com intervalo' }, { v: 0, t: 'Sem intervalo' }], c.brkChange ? 1 : 0) + '</div>' +
        (c.brkChange ? stepper('brkChangeSec', c.brkChangeSec, 5, 600, 5, fmtSec) : '') + '</div>' +
        '<div class="group"><span class="lbl">Entre sets</span><div class="opts two">' +
        optBtns('brkSet', [{ v: 1, t: 'Com intervalo' }, { v: 0, t: 'Sem intervalo' }], c.brkSet ? 1 : 0) + '</div>' +
        (c.brkSet ? stepper('brkSetSec', c.brkSetSec, 5, 900, 5, fmtSec) : '') + '</div>';
    } else if (step === 5) {
      h = '<div class="opts two">' + optBtns('firstServe', [{ v: 0, t: 'Esquerda', s: 'lado azul' }, { v: 1, t: 'Direita', s: 'lado amarelo' }], c.firstServe) + '</div>';
    } else {
      h = '<div class="sum">' +
        row('Partida', c.sets === 1 ? '1 set' : c.sets === 2 ? 'Melhor de 3' : 'Melhor de 5') +
        row('Set', c.games + ' games, tie-break de ' + c.tbPoints + ' pontos' + (c.sets > 1 ? (c.superTb ? ', super tie-break no decisivo' : ', set decisivo completo') : '')) +
        row('Pontos', c.noAd ? 'Sem vantagem' : 'Com vantagem') +
        row('Aquecimento', c.heat ? fmtSec(c.heatSec) : 'Sem') +
        row('Troca de lado', c.brkChange ? fmtSec(c.brkChangeSec) : 'Sem intervalo') +
        row('Entre sets', c.brkSet ? fmtSec(c.brkSetSec) : 'Sem intervalo') +
        row('Primeiro saque', c.firstServe ? 'Direita (amarelo)' : 'Esquerda (azul)') +
        row('Voz', VOICE_NAME[settings.voice] + ', ' + countHave(settings.voice) + ' de 28 faixas') + '</div>';
    }
    var y = body.parentNode.scrollTop;
    body.innerHTML = h;
    if (step === 0) bindVoices(body);
    body.querySelectorAll('[data-name]').forEach(function (b) {
      if (b.getAttribute('data-name') === 'voice') return;
      b.onclick = function () {
        var n = b.getAttribute('data-name'), v = b.getAttribute('data-v');
        draft[n] = (n === 'noAd' || n === 'heat' || n === 'brkChange' || n === 'brkSet' || n === 'superTb') ? v === '1' : +v;
        draft = E.normCfg(draft); renderStep();
      };
    });
    body.querySelectorAll('[data-step]').forEach(function (b) {
      b.onclick = function () {
        var n = b.getAttribute('data-step'), l = LIM[n], d = +b.getAttribute('data-d');
        draft[n] = Math.max(l[0], Math.min(l[1], draft[n] + d));
        $('v_' + n).textContent = fmtSec(draft[n]);
      };
    });
    if (keepScroll) body.parentNode.scrollTop = y;
  }
  function row(a, b) { return '<div><span>' + a + '</span><b>' + b + '</b></div>'; }

  $('wizNext').onclick = function () {
    settings.cfg = E.normCfg(draft); saveSettings();
    if (wizOnly) { renderHome(); return; }
    if (step < STEPS.length - 1) { step++; renderStep(); $('wizard').scrollTop = 0; return; }
    startMatch();
  };
  $('wizBack').onclick = function () { if (step > 0) { settings.cfg = E.normCfg(draft); step--; renderStep(); } };
  $('wizHome').onclick = function () { settings.cfg = E.normCfg(draft); saveSettings(); renderHome(); };

  /* ---------- jogo ---------- */
  var S = null, lastSay = 0, lastTick = 0, ticker = null, lastSave = 0, saved = false, lastTap = [0, 0];
  var wake = null;

  function startMatch() {
    ensureCtx(); preload();
    S = E.reset(settings.cfg); lastSay = S.sayId; saved = false;
    persist(true);
    enterGame();
  }
  function persist(force) {
    if (!S) return;
    var now = Date.now();
    if (!force && now - lastSave < 4000) return;
    lastSave = now; LS.set(K.cur, { cfg: S.cfg, s: S, savedAt: now });
  }
  function enterGame() {
    show('game');
    requestFullscreenLandscape();
    requestWake();
    lastTick = performance.now();
    if (!ticker) ticker = setInterval(onTick, 250);
    renderGame();
  }
  function leaveGame() { persist(true); show(resumable() ? 'home' : 'home'); renderHome(); }

  function requestFullscreenLandscape() {
    try {
      var el = document.documentElement;
      if (!document.fullscreenElement && el.requestFullscreen) {
        el.requestFullscreen({ navigationUI: 'hide' }).then(function () {
          if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {});
        }).catch(function () {});
      } else if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {});
    } catch (e) {}
  }
  function requestWake() {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (l) { wake = l; l.addEventListener('release', function () { wake = null; }); }).catch(function () {});
  }
  function releaseWake() { if (wake) { try { wake.release(); } catch (e) {} wake = null; } }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && current === 'game') { requestWake(); lastTick = performance.now(); } });

  function onTick() {
    if (current !== 'game' || !S) return;
    var now = performance.now(), dt = (now - lastTick) / 1000; lastTick = now;
    if (dt > 0 && S.phase !== 'fim') { E.tick(S, dt); }
    afterChange(false);
  }
  function afterChange(forceSave) {
    if (S.sayId !== lastSay) { lastSay = S.sayId; playTracks(S.tracks); }
    if (S.phase === 'fim' && !saved) { saved = true; addHistory(); persist(true); }
    else persist(forceSave);
    renderGame();
  }

  function renderGame() {
    if (!S) return;
    var v = E.view(S);
    $('gClock').textContent = v.clock;
    $('gKind').textContent = v.paused ? v.clockKind + ' (pausado)' : v.clockKind;
    $('gMsg').textContent = S.msg || '';
    var pL = $('ptsL'), pR = $('ptsR');
    pL.textContent = v.game[0]; pR.textContent = v.game[1];
    pL.classList.toggle('ad', v.game[0] === 'AD'); pR.classList.toggle('ad', v.game[1] === 'AD');
    $('sideL').classList.toggle('serving', v.serve === 0 && S.phase !== 'fim');
    $('sideR').classList.toggle('serving', v.serve === 1 && S.phase !== 'fim');
    ['L', 'R'].forEach(function (k, i) {
      $('sets' + k).innerHTML = '<span class="sw">Sets ' + v.sets[i] + '</span>' + v.cols.map(function (c) { return '<span class="chip' + (c.current ? ' cur' : '') + '">' + c.g[i] + '</span>'; }).join('');
    });
    var a = $('gAction'), ph = S.phase;
    a.hidden = ph === 'jogo' || ph === 'fim';
    a.textContent = ph === 'ocioso' ? (S.cfg.heat ? 'Iniciar aquecimento' : 'Iniciar partida') : ph === 'aquecimento' ? 'Iniciar partida' : 'Pular intervalo';
    $('gPause').textContent = S.paused ? 'Continuar' : 'Pausa';
    $('gPause').disabled = ph === 'ocioso' || ph === 'fim';
    $('gUndo').disabled = !S.history.length || ph === 'ocioso';
    $('gPaused').hidden = !(S.paused && ph !== 'fim');
    var end = $('gEnd');
    if (ph === 'fim') {
      var w = S.winner;
      end.hidden = false;
      end.innerHTML = '<h2>Vitória ' + (w === 0 ? 'da esquerda (azul)' : 'da direita (amarelo)') + '</h2><div class="score">' + scoreStr(S.sets, 0) + '</div><div class="muted">Duração ' + E.mmss(S.clock) + '</div>' +
        '<div class="opts two" style="min-width:min(520px,90vw)"><button class="btn" id="eUndo">Desfazer último ponto</button><button class="btn primary" id="eNew">Nova partida</button></div><button class="btn ghost" id="eHome">Voltar ao início</button>';
      $('eUndo').onclick = function () { E.undo(S); saved = false; removeLastHistory(); afterChange(true); };
      $('eNew').onclick = function () { LS.del(K.cur); openWizard(1); };
      $('eHome').onclick = function () { LS.del(K.cur); renderHome(); };
    } else end.hidden = true;
  }
  function scoreStr(sets) { return sets.map(function (g) { return g[0] + '-' + g[1]; }).join('  '); }

  function tap(side) {
    if (!S || current !== 'game') return;
    var now = Date.now();
    if (now - lastTap[side] < 220) return;
    lastTap[side] = now;
    ensureCtx();
    var before = S.history.length;
    E.point(S, side);
    if (S.history.length !== before && navigator.vibrate) navigator.vibrate(20);
    afterChange(true);
  }
  $('sideL').addEventListener('click', function () { tap(0); });
  $('sideR').addEventListener('click', function () { tap(1); });
  $('gAction').onclick = function () { ensureCtx(); E.press(S); afterChange(true); };
  $('gPause').onclick = function () { E.togglePause(S); lastTick = performance.now(); afterChange(true); };
  $('gUndo').onclick = function () { E.undo(S); afterChange(true); };

  $('gMenu').onclick = function () {
    var v = settings.voice;
    var m = openModal('<h2>Menu</h2>' +
      '<div class="group" style="margin-top:14px"><span class="lbl">Voz</span><div class="opts two">' +
      optBtns('mvoice', [{ v: 'F', t: 'Feminina', s: countHave('F') + '/28' }, { v: 'M', t: 'Masculina', s: countHave('M') + '/28' }], v) + '</div></div>' +
      (countHave(v) < 28 ? '<div class="status warn">Faltam ' + (28 - countHave(v)) + ' faixas nesta voz. <div class="miss">' + trackList(missing(v)) + '</div></div>' : '') +
      '<div class="group"><span class="lbl">Volume</span><input id="mVol" type="range" min="0" max="100" value="' + Math.round(settings.volume * 100) + '"></div>' +
      '<div class="opts two" style="margin-bottom:10px"><button class="btn' + (settings.mute ? ' sel' : '') + '" id="mMute">' + (settings.mute ? 'Som desligado' : 'Desligar som') + '</button><button class="btn" id="mTest">Ouvir faixa 027</button></div>' +
      '<div class="stack"><button class="btn" id="mHome">Sair da partida (fica salva)</button><button class="btn" id="mReset">Zerar e configurar nova partida</button><button class="btn ghost" id="mClose">Fechar</button></div>' +
      '<p class="muted" id="mWake"></p>');
    $('mWake').textContent = 'wakeLock' in navigator ? '' : 'Este navegador não mantém a tela acesa. Ajuste o tempo de tela do aparelho.';
    m.querySelectorAll('[data-name="mvoice"]').forEach(function (b) {
      b.onclick = function () { settings.voice = b.getAttribute('data-v'); saveSettings(); stopAudio(); preload(); $('gMenu').onclick(); };
    });
    $('mVol').oninput = function (e) { settings.volume = e.target.value / 100; saveSettings(); if (gain) gain.gain.value = settings.mute ? 0 : settings.volume; };
    $('mMute').onclick = function () { settings.mute = !settings.mute; saveSettings(); if (gain) gain.gain.value = settings.mute ? 0 : settings.volume; $('gMenu').onclick(); };
    $('mTest').onclick = function () { ensureCtx(); playTracks([27]); };
    $('mClose').onclick = closeModal;
    $('mHome').onclick = function () { closeModal(); leaveGame(); };
    $('mReset').onclick = function () { confirmBox('Zerar a partida atual? O placar e o relógio serão apagados.', 'Zerar', function () { LS.del(K.cur); S = null; openWizard(1); }); };
  };

  function resume() {
    var cur = resumable(); if (!cur) return;
    S = cur.s; S.cfg = E.normCfg(S.cfg); lastSay = S.sayId; saved = false;
    if (S.phase !== 'ocioso') { S.paused = true; S.msg = 'Partida retomada. Toque em Continuar.'; S.tracks = []; }
    preload(); enterGame();
  }
  $('homeResume').onclick = function () { ensureCtx(); resume(); };

  /* ---------- histórico ---------- */
  function addHistory() {
    var h = LS.get(K.hist, []);
    h.unshift({ id: Date.now(), ts: Date.now(), desc: E.describe(S.cfg), sets: S.sets, winner: S.winner, dur: Math.round(S.clock), cfg: S.cfg });
    LS.set(K.hist, h.slice(0, 200));
  }
  function removeLastHistory() { var h = LS.get(K.hist, []); h.shift(); LS.set(K.hist, h); }
  function renderHistory() {
    var h = LS.get(K.hist, []), el = $('histList');
    el.innerHTML = h.length ? h.map(function (m) {
      var d = new Date(m.ts), ds = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return '<div class="hist-item"><div class="top"><span>' + ds + '</span><span>' + E.mmss(m.dur) + '</span></div><div class="score">' + scoreStr(m.sets) + '</div><div><span class="tag ' + (m.winner === 0 ? 'blue' : 'yellow') + '">Vitória ' + (m.winner === 0 ? 'azul' : 'amarelo') + '</span> <span class="muted">' + m.desc + '</span></div></div>';
    }).join('') : '<p class="muted">Nenhuma partida terminada ainda.</p>';
    show('history');
  }
  $('histBack').onclick = renderHome;
  $('histClear').onclick = function () { confirmBox('Apagar todo o histórico deste aparelho?', 'Apagar', function () { LS.del(K.hist); renderHistory(); }); };

  /* ---------- botões da tela inicial ---------- */
  $('homeNew').onclick = function () { if (resumable()) { confirmBox('Existe uma partida em andamento. Começar uma nova apaga essa partida.', 'Nova partida', function () { LS.del(K.cur); openWizard(0); }); } else openWizard(0); };
  $('homeVoices').onclick = function () { openWizard(0, true); };
  $('homeHistory').onclick = renderHistory;
  $('homeLogout').onclick = function () { LS.del(K.auth); LS.del(K.vk); show('login'); };
  $('loginBtn').onclick = doLogin;
  $('loginPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });

  /* ---------- orientação ---------- */
  function updateRotate() { $('rotate').hidden = !(current === 'game' && window.innerHeight > window.innerWidth); }
  window.addEventListener('resize', updateRotate);
  window.addEventListener('orientationchange', updateRotate);
  window.addEventListener('pagehide', function () { persist(true); });

  /* ---------- início ---------- */
  function start() {
    refreshHave().then(function () {
      var cur = resumable();
      if (cur) { ensureCtxLazy(); resume(); } else renderHome();
      syncVoices(false);
    });
  }
  function ensureCtxLazy() { /* o áudio só liga no primeiro toque (regra do navegador) */ }
  if (authOk()) start(); else show('login');

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  window.__placar = { sync: function () { return sync; }, state: function () { return S; }, played: function () { return played; }, have: function () { return have; }, settings: function () { return settings; } };
})();
