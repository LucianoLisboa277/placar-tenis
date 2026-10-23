/* Motor de regras do placar de tênis. Sem dependência de tela, testável em Node.
   Lados: 0 = esquerda (azul), 1 = direita (amarelo).
   Faixas de áudio 001 a 038: ver TRACKS. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var NAMES = ['esquerda', 'direita'];
  var TRACKS = {
    1: 'Love-All', 2: 'Love-15', 3: 'Love-30', 4: 'Love-40', 5: '15-Love', 6: '15-All', 7: '15-30', 8: '15-40',
    9: '30-Love', 10: '30-15', 11: '30-All', 12: '30-40', 13: '40-Love', 14: '40-15', 15: '40-30', 16: 'Deuce',
    17: 'Advantage In', 18: 'Advantage Out', 19: 'Game', 20: 'Game and Set', 21: 'Game, Set and Match',
    22: 'Set Point In', 23: 'Set Point Out', 24: 'Match Point In', 25: 'Match Point Out', 26: 'Tie-break', 27: 'Time', 28: 'Change Ends',
    29: 'Let', 30: 'Warning', 31: 'Foot fault', 32: 'Out', 33: 'Quiet, please', 34: 'Double fault', 35: 'Code violation', 36: 'Point penalty', 37: 'Time violation', 38: 'Play'
  };
  var SCORE_TRACK = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]; /* [sacador][recebedor] */
  var SCORE = ['zero', 'quinze', 'trinta', 'quarenta'];

  var DEFAULTS = {
    sets: 2,          /* sets para vencer: 1 = um set, 2 = melhor de 3, 3 = melhor de 5 */
    games: 6,         /* 6 oficial, 4 rápido */
    tbPoints: 7,      /* pontos do tie-break normal: 7 ou 10 */
    superTb: true,    /* super tie-break (10) no lugar do set decisivo */
    noAd: false,      /* true = sem vantagem (ponto de ouro) */
    heat: true, heatSec: 30,
    brkChange: true, brkChangeSec: 60,
    brkSet: true, brkSetSec: 90,
    firstServe: 0
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function say(s, text, tracks) { s.msg = text; s.tracks = tracks || []; s.sayId = (s.sayId || 0) + 1; }
  function int(v, d, lo, hi) { v = parseInt(v, 10); if (isNaN(v)) v = d; return Math.max(lo, Math.min(hi, v)); }

  function normCfg(cfg) {
    cfg = cfg || {};
    var c = {};
    c.sets = [1, 2, 3].indexOf(+cfg.sets) >= 0 ? +cfg.sets : DEFAULTS.sets;
    c.games = +cfg.games === 4 ? 4 : 6;
    c.tbPoints = +cfg.tbPoints === 10 ? 10 : 7;
    c.superTb = cfg.superTb === undefined ? DEFAULTS.superTb : !!cfg.superTb;
    c.noAd = !!cfg.noAd;
    c.heat = cfg.heat === undefined ? DEFAULTS.heat : !!cfg.heat;
    c.heatSec = int(cfg.heatSec, DEFAULTS.heatSec, 5, 3600);
    c.brkChange = cfg.brkChange === undefined ? DEFAULTS.brkChange : !!cfg.brkChange;
    c.brkChangeSec = int(cfg.brkChangeSec, DEFAULTS.brkChangeSec, 5, 3600);
    c.brkSet = cfg.brkSet === undefined ? DEFAULTS.brkSet : !!cfg.brkSet;
    c.brkSetSec = int(cfg.brkSetSec, DEFAULTS.brkSetSec, 5, 3600);
    c.firstServe = +cfg.firstServe === 1 ? 1 : 0;
    c.tbAt = c.games === 6 ? 6 : 3;   /* empate em games que dispara o tie-break */
    return c;
  }

  function reset(cfg) {
    var c = normCfg(cfg);
    var s = {
      phase: 'ocioso', paused: false, cfg: c,
      clock: 0, started: false, heatLeft: 0, brkLeft: 0, brkKind: '',
      pts: [0, 0], sets: [[0, 0]], tbScores: [], setIdx: 0, wonSets: [0, 0],
      tb: false, tbTarget: 7, superTb: false, tbFirst: 0,
      serve: c.firstServe, winner: -1, history: [], future: [], sayId: 0, tracks: [], msg: ''
    };
    say(s, 'Placar pronto.', []);
    return s;
  }

  function label(s, p, q) {
    if (s.tb) return String(p);
    if (!s.cfg.noAd && p >= 3 && q >= 3) { if (p === q) return '40'; return p > q ? 'AD' : '40'; }
    return ['0', '15', '30', '40'][Math.min(p, 3)];
  }

  function gameEnded(s, np, side) {
    var o = 1 - side;
    if (s.tb) return np[side] >= s.tbTarget && np[side] - np[o] >= 2;
    if (s.cfg.noAd) return np[side] >= 4;
    return np[side] >= 4 && np[side] - np[o] >= 2;
  }
  function setEndsWith(s, side) {   /* se 'side' ganhar um game, fecha o set? */
    if (s.tb) return true;
    var o = 1 - side, g = s.sets[s.setIdx], gn = g[side] + 1;
    return gn >= s.cfg.games && gn - g[o] >= 2;
  }

  /* o que acontece se 'side' ganhar o próximo ponto: 0 nada, 1 game, 2 set, 3 partida */
  function outcome(s, side) {
    var np = s.pts.slice(); np[side]++;
    if (!gameEnded(s, np, side)) return 0;
    if (!setEndsWith(s, side)) return 1;
    return s.wonSets[side] + 1 >= s.cfg.sets ? 3 : 2;
  }

  function callText(s) {
    var sv = s.serve, rv = 1 - sv;
    if (s.tb) return s.pts[sv] === s.pts[rv] ? s.pts[sv] + ' iguais' : s.pts[sv] + ' a ' + s.pts[rv];
    var p = s.pts[0], q = s.pts[1];
    if (p >= 3 && q >= 3) {
      if (p === q) return s.cfg.noAd ? 'Iguais, ponto decisivo' : 'Iguais';
      return 'Vantagem ' + NAMES[p > q ? 0 : 1];
    }
    var a = SCORE[Math.min(s.pts[sv], 3)], b = SCORE[Math.min(s.pts[rv], 3)];
    if (a === b) return a === 'zero' ? 'Zero a zero' : cap(a) + ' iguais';
    return cap(a) + ', ' + b;
  }
  function scoreTrack(s) {
    if (s.tb) return [];
    var sv = s.serve, rv = 1 - sv, p = s.pts[sv], q = s.pts[rv];
    if (p >= 3 && q >= 3) { if (p === q) return [16]; return [p > q ? 17 : 18]; }
    return [SCORE_TRACK[Math.min(p, 3)][Math.min(q, 3)]];
  }

  function startMatchClock(s) { s.phase = 'jogo'; s.paused = false; s.started = true; }

  function startBreak(s, kind) {
    var sec = kind === 'set' ? s.cfg.brkSetSec : s.cfg.brkChangeSec;
    s.phase = 'intervalo'; s.brkKind = kind; s.brkLeft = sec; s.paused = false;
  }

  /* botão PARTIDA: inicia aquecimento ou partida, pula aquecimento ou intervalo */
  function press(s) {
    if (s.phase === 'ocioso') {
      if (s.cfg.heat) { s.phase = 'aquecimento'; s.heatLeft = s.cfg.heatSec; s.paused = false; say(s, 'Aquecimento iniciado.', []); }
      else { startMatchClock(s); say(s, 'Partida iniciada. Saque ' + NAMES[s.serve] + '.', [27]); }
    } else if (s.phase === 'aquecimento') {
      startMatchClock(s); say(s, 'Partida iniciada. Saque ' + NAMES[s.serve] + '.', [27]);
    } else if (s.phase === 'intervalo') {
      s.phase = 'jogo'; s.brkLeft = 0; s.paused = false;
      say(s, 'Intervalo encerrado. Saque ' + NAMES[s.serve] + '.', [27]);
    }
    return s;
  }

  function newSetOrSuper(s, announceTracks, text) {
    /* decide se o próximo set é o super tie-break */
    var c = s.cfg;
    s.setIdx++;
    s.sets.push([0, 0]);
    if (c.superTb && c.sets > 1 && s.wonSets[0] === c.sets - 1 && s.wonSets[1] === c.sets - 1) {
      s.tb = true; s.superTb = true; s.tbTarget = 10; s.tbFirst = s.serve;
      announceTracks.push(26); text += ' Super tie-break.';
    }
    return text;
  }

  function gameWon(s, side) {
    var c = s.cfg, i = s.setIdx, o = 1 - side;
    var wasTb = s.tb, wasSuper = s.superTb;
    if (wasTb) { if (!s.tbScores) s.tbScores = []; s.tbScores[i] = s.pts.slice(); }
    s.sets[i][side]++; s.pts = [0, 0];
    var g = s.sets[i], setWon = false;
    if (wasTb) setWon = true;
    else if (g[side] >= c.games && g[side] - g[o] >= 2) setWon = true;
    else if (g[0] === c.tbAt && g[1] === c.tbAt) {
      s.tb = true; s.superTb = false; s.tbTarget = c.tbPoints; s.tbFirst = 1 - s.serve; s.serve = 1 - s.serve;
      say(s, 'Game ' + NAMES[side] + '. Tie-break.', [19, 26]); return;
    }
    if (!setWon) {
      s.serve = 1 - s.serve;
      var total = g[0] + g[1], change = total % 2 === 1;
      var tr = [19]; if (change) tr.push(28);
      var text = 'Game ' + NAMES[side] + '. ' + g[0] + ' a ' + g[1] + '. Saque ' + NAMES[s.serve] + (change ? '. Troca de lado.' : '.');
      if (change && total > 1 && c.brkChange) startBreak(s, 'troca');
      say(s, text, tr); return;
    }
    /* set encerrado */
    s.tb = false; s.superTb = false; s.wonSets[side]++;
    if (s.wonSets[side] >= c.sets) {
      s.phase = 'fim'; s.winner = side;
      say(s, 'Jogo, set e partida ' + NAMES[side] + '.', [21]); return;
    }
    s.serve = wasTb ? 1 - s.tbFirst : 1 - s.serve;
    if (wasTb && !wasSuper) { /* depois do tie-break, o saque segue a rotação normal */ }
    var tracks = [20], txt = 'Game e set ' + NAMES[side] + '.';
    txt = newSetOrSuper(s, tracks, txt);
    txt += ' Saque ' + NAMES[s.serve] + '.';
    if (c.brkSet) startBreak(s, 'set');
    say(s, txt, tracks);
  }

  var SNAP_KEYS = ['pts', 'sets', 'tbScores', 'setIdx', 'wonSets', 'tb', 'superTb', 'tbTarget', 'tbFirst', 'serve', 'phase', 'winner', 'brkLeft', 'brkKind'];
  function snap(s) { var o = {}; SNAP_KEYS.forEach(function (k) { o[k] = s[k]; }); return clone(o); }
  function restore(s, h) { Object.keys(h).forEach(function (k) { s[k] = clone(h[k]); }); }

  function point(s, side) {
    if (s.phase !== 'jogo' || s.paused) {
      if (s.phase === 'ocioso') say(s, 'Aperte INICIAR antes de marcar pontos.', []);
      else if (s.phase === 'aquecimento') say(s, 'Em aquecimento. Aperte INICIAR PARTIDA.', []);
      else if (s.phase === 'intervalo') say(s, 'Intervalo em andamento. Aperte PULAR INTERVALO.', []);
      else if (s.paused) say(s, 'Partida pausada.', []);
      return s;
    }
    s.history.push(snap(s)); s.future = [];
    if (s.history.length > 300) s.history.shift();
    var o = 1 - side;
    s.pts[side]++;
    if (gameEnded(s, s.pts, side)) { gameWon(s, side); return s; }
    if (s.tb) {
      var tot = s.pts[0] + s.pts[1];
      s.serve = (s.tbFirst + Math.floor((tot + 1) / 2)) % 2;
    }
    var tracks = scoreTrack(s), text = callText(s);
    var best = Math.max(outcome(s, 0), outcome(s, 1));
    if (best >= 2) {  /* ponto de set ou de partida: In = quem saca, Out = quem recebe */
      var serverHolds = outcome(s, s.serve) === best;
      tracks.push((best === 3 ? 24 : 22) + (serverHolds ? 0 : 1));
      text += (best === 3 ? '. Match point' : '. Set point') + (serverHolds ? ' (sacador)' : ' (recebedor)');
    }
    if (s.tb && (s.pts[0] + s.pts[1]) % 6 === 0) {
      tracks.push(28); text += '. Troca de lado.';
      if (s.cfg.brkChange) startBreak(s, 'troca');
    }
    say(s, text, tracks);
    return s;
  }

  function undo(s) {
    if (!s.history.length) { say(s, 'Nada para desfazer.', []); return s; }
    if (!s.future) s.future = [];
    s.future.push(snap(s));
    var h = s.history.pop(); restore(s, h);
    s.paused = false;
    say(s, 'Último ponto desfeito.', []); return s;
  }

  function redo(s) {
    if (!s.future || !s.future.length) { say(s, 'Nada para refazer.', []); return s; }
    s.history.push(snap(s));
    var h = s.future.pop(); restore(s, h);
    s.paused = false;
    say(s, 'Ponto refeito.', []); return s;
  }

  /* situação do próximo ponto, para o texto de status: match, set, break, tb, stb ou set normal */
  function situation(s) {
    if (s.phase !== 'jogo' || s.paused) return { kind: 'none', n: s.setIdx + 1 };
    var best = Math.max(outcome(s, 0), outcome(s, 1));
    if (best === 3) return { kind: 'match', n: s.setIdx + 1 };
    if (best === 2) return { kind: 'set', n: s.setIdx + 1 };
    if (!s.tb && outcome(s, 1 - s.serve) >= 1) return { kind: 'break', n: s.setIdx + 1 };
    if (s.tb) return { kind: s.superTb ? 'stb' : 'tb', n: s.setIdx + 1 };
    return { kind: 'set-n', n: s.setIdx + 1 };
  }

  /* encerrar antes do fim (desistência ou W.O.): 'winner' é o lado que vence */
  function endEarly(s, winner) {
    s.phase = 'fim'; s.winner = winner === 1 ? 1 : 0; s.paused = false; s.brkLeft = 0;
    say(s, 'Partida encerrada.', []); return s;
  }

  /* define quem saca agora (lado 0 ou 1), também dentro do tie-break */
  function setServe(s, side) {
    side = +side === 1 ? 1 : 0;
    if (s.tb) { var tot = s.pts[0] + s.pts[1]; s.tbFirst = (((side - Math.floor((tot + 1) / 2)) % 2) + 2) % 2; }
    s.serve = side; say(s, 'Saque ' + NAMES[side] + '.', []); return s;
  }

  function setDone(c, g) {   /* este set, com este placar de games, já terminou? */
    var hi = Math.max(g[0], g[1]), lo = Math.min(g[0], g[1]);
    return (hi >= c.games && hi - lo >= 2) || (hi === c.tbAt + 1 && lo === c.tbAt);
  }

  /* corrige o placar: spec = { sets: [[a,b],...] (o último é o set em andamento), pts: [a,b] (contagem de pontos), serve? } */
  function correct(s, spec) {
    var c = s.cfg, n = spec.sets.length;
    s.history.push(snap(s)); s.future = [];
    if (s.history.length > 300) s.history.shift();
    s.sets = spec.sets.map(function (g) { return [int(g[0], 0, 0, 99), int(g[1], 0, 0, 99)]; });
    var done = (s.phase === 'fim' || setDone(c, s.sets[n - 1])) ? n : n - 1;
    s.wonSets = [0, 0];
    for (var k = 0; k < done; k++) { if (s.sets[k][0] > s.sets[k][1]) s.wonSets[0]++; else if (s.sets[k][1] > s.sets[k][0]) s.wonSets[1]++; }
    s.pts = [int(spec.pts[0], 0, 0, 99), int(spec.pts[1], 0, 0, 99)];
    var wasFim = s.phase === 'fim';
    if (s.wonSets[0] >= c.sets) { s.phase = 'fim'; s.winner = 0; s.tb = false; s.superTb = false; }
    else if (s.wonSets[1] >= c.sets) { s.phase = 'fim'; s.winner = 1; s.tb = false; s.superTb = false; }
    else {
      if (wasFim) { s.phase = 'jogo'; s.winner = -1; s.paused = false; }
      if (done === n) { s.sets.push([0, 0]); s.pts = [0, 0]; s.tb = false; s.superTb = false; }
      if (c.superTb && c.sets > 1 && s.wonSets[0] === c.sets - 1 && s.wonSets[1] === c.sets - 1 && s.sets[s.sets.length - 1][0] + s.sets[s.sets.length - 1][1] === 0) {
        s.tb = true; s.superTb = true; s.tbTarget = 10; s.tbFirst = s.serve;
      } else if (!s.superTb) {
        var g = s.sets[s.sets.length - 1];
        if (g[0] === c.tbAt && g[1] === c.tbAt) { s.tb = true; s.tbTarget = c.tbPoints; s.tbFirst = s.serve; } else s.tb = false;
      }
    }
    s.setIdx = s.sets.length - 1;
    if (spec.serve === 0 || spec.serve === 1) setServe(s, spec.serve);
    say(s, 'Placar corrigido.', []); return s;
  }

  function togglePause(s) {
    if (s.phase === 'jogo' || s.phase === 'aquecimento' || s.phase === 'intervalo') {
      s.paused = !s.paused; say(s, s.paused ? 'Relógio pausado.' : 'Relógio retomado.', []);
    }
    return s;
  }

  function tick(s, dt) {  /* dt em segundos */
    /* relógio da partida: corre do início do jogo até o fim, inclusive em pausa e nos intervalos */
    var run = s.started !== undefined ? s.started : (s.phase === 'jogo' || s.phase === 'intervalo' || s.clock > 0);
    if (run && s.phase !== 'fim' && s.phase !== 'ocioso' && s.phase !== 'aquecimento') s.clock += dt;
    if (s.paused) return s;
    if (s.phase === 'aquecimento') {
      s.heatLeft -= dt;
      if (s.heatLeft <= 0) { s.heatLeft = 0; startMatchClock(s); say(s, 'Aquecimento encerrado. Partida iniciada. Saque ' + NAMES[s.serve] + '.', [27]); }
    } else if (s.phase === 'intervalo') {
      s.brkLeft -= dt;
      if (s.brkLeft <= 0) { s.brkLeft = 0; s.phase = 'jogo'; say(s, 'Intervalo encerrado. Saque ' + NAMES[s.serve] + '.', [27]); }
    }
    return s;
  }

  function two(n) { n = Math.max(0, Math.min(99, n)); return (n < 10 ? '0' : '') + n; }
  function mmss(sec) { sec = Math.max(0, Math.floor(sec)); return two(Math.floor(sec / 60)) + ':' + two(sec % 60); }
  /* tempo de partida: só horas e minutos (h:mm) */
  function hhmm(sec) { sec = Math.max(0, Math.floor(sec)); var m = Math.floor(sec / 60); return Math.floor(m / 60) + ':' + two(m % 60); }

  /* dados para a tela */
  function view(s) {
    var g0 = label(s, s.pts[0], s.pts[1]), g1 = label(s, s.pts[1], s.pts[0]);
    var from = Math.max(0, s.sets.length - 3), cols = [];
    for (var k = from; k < s.sets.length; k++) cols.push({ n: k + 1, g: s.sets[k].slice(), current: k === s.setIdx && s.phase !== 'fim' });
    var clockStr, clockKind = 'partida';
    if (s.phase === 'aquecimento') { clockStr = mmss(Math.ceil(s.heatLeft)); clockKind = 'aquecimento'; }
    else if (s.phase === 'intervalo') { clockStr = mmss(Math.ceil(s.brkLeft)); clockKind = s.brkKind === 'set' ? 'intervalo entre sets' : 'troca de lado'; }
    else clockStr = mmss(s.clock);
    return { game: [g0, g1], sets: s.wonSets.slice(), cols: cols, serve: s.serve, clock: clockStr, clockKind: clockKind,
      tb: s.tb, superTb: s.superTb, phase: s.phase, paused: s.paused, winner: s.winner };
  }

  function describe(c) {
    c = normCfg(c);
    return (c.sets === 1 ? '1 set' : c.sets === 2 ? 'Melhor de 3' : 'Melhor de 5') + ', set de ' + c.games + ' games, ' +
      (c.noAd ? 'sem vantagem' : 'com vantagem') + ', tie-break de ' + c.tbPoints +
      (c.superTb && c.sets > 1 ? ', super tie-break no set decisivo' : '');
  }

  return { TRACKS: TRACKS, DEFAULTS: DEFAULTS, normCfg: normCfg, reset: reset, press: press, point: point, undo: undo,
    togglePause: togglePause, tick: tick, view: view, describe: describe, mmss: mmss, hhmm: hhmm, outcome: outcome,
    redo: redo, situation: situation, endEarly: endEarly, setServe: setServe, correct: correct };
});
