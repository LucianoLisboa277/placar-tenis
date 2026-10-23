(function () {
  'use strict';
  var E = window.Engine;
  var $ = function (id) { return document.getElementById(id); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var K = { auth: 'placar:auth', settings: 'placar:settings', cur: 'placar:cur', hist: 'placar:hist', vver: 'placar:vver', vidx: 'placar:vidx', gh: 'placar:gh' };
  var TOTAL = 38;   /* faixas por voz: 001 a 028 (placar) e 029 a 038 (chamadas do árbitro) */
  var ICONS = {"mega": "<g> <path d=\"M864.93,370.7l-1.73,1.73c3.93,3.93,3.93,10.29,0,14.21l1.65,1.65c4.87-4.87,4.87-12.72.08-17.59Z\" fill=\"#fff\" /> <path d=\"M869.09,365.99l-1.65,1.65c6.52,6.52,6.52,17.2,0,23.72l1.65,1.65c7.46-7.46,7.46-19.55,0-27.02Z\" fill=\"#fff\" /> <path d=\"M848.36,385.94l12.41,8.56v-30l-12.41,8.56v12.88Z\" fill=\"#fff\" /> <path d=\"M837.76,385.55h2.36l2.2,6.2,2.2-.86-1.88-5.34h3.14v-12.09h-8.01v12.09Z\" fill=\"#fff\" /> </g> ", "sliders": "<g> <rect x=\"778.84\" y=\"8.45\" width=\"3.48\" height=\"28.09\" transform=\"translate(758.07 803.07) rotate(-90)\" fill=\"#fff\" /> <rect x=\"778.84\" y=\"18.45\" width=\"3.48\" height=\"28.09\" transform=\"translate(748.07 813.07) rotate(-90)\" fill=\"#fff\" /> <rect x=\"778.84\" y=\"28.45\" width=\"3.48\" height=\"28.09\" transform=\"translate(738.07 823.07) rotate(-90)\" fill=\"#fff\" /> <rect x=\"771.86\" y=\"17.5\" width=\"3.75\" height=\"10\" fill=\"#fff\" /> <rect x=\"785.5\" y=\"27.5\" width=\"3.75\" height=\"10\" fill=\"#fff\" /> <rect x=\"776.83\" y=\"37.5\" width=\"3.75\" height=\"10\" fill=\"#fff\" /> </g> ", "home": "<g> <polygon points=\"871.63 34.25 857.66 22.14 843.68 34.25 841.38 31.59 857.66 17.5 873.93 31.59 871.63 34.25\" fill=\"#fff\" /> <polygon points=\"857.66 19.82 845.87 30.11 845.87 47.5 852.36 47.5 852.36 36.44 862.95 36.44 862.95 47.5 869.45 47.5 869.45 30.11 857.66 19.82\" fill=\"#fff\" /> </g> ", "remoteball": "<g> <path d=\"M38.69,377.29l-2.24-2.24c-1.71.39-3.05,1.74-3.43,3.45l2.23,2.23h0c.95.95,2.49.95,3.44,0s.95-2.49,0-3.44h0Z\" fill=\"#c9e727\" /> <path d=\"M37.47,374.94s-.05,0-.07,0l1.78,1.78h0c1.25,1.25,1.25,3.27,0,4.52-1.25,1.25-3.27,1.25-4.52,0h0s-1.75-1.75-1.75-1.75c0,2.52,2.04,4.56,4.56,4.56s4.56-2.04,4.56-4.56-2.04-4.56-4.56-4.56Z\" fill=\"#c9e727\" /> </g> ", "remotepill": "<rect x=\"17.47\" y=\"372.25\" width=\"40\" height=\"14.5\" rx=\"6.73\" ry=\"6.73\" transform=\"translate(-342.03 416.97) rotate(-90)\" fill=\"none\" stroke=\"#f6f6f6\" stroke-width=\"3px\" stroke-miterlimit=\"10\" /> ", "undo": "<g> <polygon points=\"343.73 370.98 355.41 362 355.41 379.96 343.73 370.98\" fill=\"#f8f2f6\" /> <path d=\"M379.91,397h-11.33v-6.03h11.33c4.58,0,8.31-3.73,8.31-8.31s-3.73-8.31-8.31-8.31h-26.18v-6.03h26.18c7.91,0,14.34,6.43,14.34,14.34s-6.43,14.34-14.34,14.34Z\" fill=\"#f8f2f6\" /> </g> ", "redo": "<g> <polygon points=\"571.27 370.98 559.59 362 559.59 379.96 571.27 370.98\" fill=\"#f8f2f6\" /> <path d=\"M535.09,397h11.33v-6.03h-11.33c-4.58,0-8.31-3.73-8.31-8.31s3.73-8.31,8.31-8.31h26.18v-6.03h-26.18c-7.91,0-14.34,6.43-14.34,14.34s6.43,14.34,14.34,14.34Z\" fill=\"#f8f2f6\" /> </g> ", "pause": "<g> <rect x=\"446.88\" y=\"364.91\" width=\"6.93\" height=\"32.33\" fill=\"#fff\" /> <rect x=\"461.19\" y=\"364.91\" width=\"6.93\" height=\"32.33\" fill=\"#fff\" /> </g> ", "logo": "<g> <g> <path d=\"M139.81,41.42c0,8.79-6.5,14.67-13.78,14.67-4.2,0-7.67-1.46-10.08-3.98v3.19h-5.82V10.51h5.82v20.22c2.41-2.52,5.88-3.98,10.08-3.98,7.28,0,13.78,5.94,13.78,14.67ZM134.15,41.42c0-5.82-3.98-9.52-9.07-9.52-4.59,0-9.13,3.7-9.13,9.52s4.54,9.52,9.13,9.52c5.1,0,9.07-3.64,9.07-9.52Z\" fill=\"#fff\" /> <path d=\"M164.61,27.42l-.39,5.6c-.45-.06-1.12-.06-1.62-.06-7.06,0-10.53,4.93-10.53,12.54v9.8h-5.82v-27.78h5.82v5.71c2.13-3.7,5.6-6.05,10.58-6.05.67,0,1.23,0,1.96.22Z\" fill=\"#fff\" /> <path d=\"M175.59,43.83v11.48h-5.82V10.51h5.82v28.84l13.05-11.82h7.5l-15.06,13.89,16.13,13.89h-8.06l-13.55-11.48Z\" fill=\"#fff\" /> <path d=\"M207.34,51.95c0,2.02-1.51,3.58-3.64,3.58s-3.7-1.57-3.7-3.58c0-1.9,1.57-3.53,3.7-3.53s3.64,1.62,3.64,3.53Z\" fill=\"#fff\" /> <path d=\"M229.63,12.75c8.4,0,13.94,4.59,13.94,11.76s-5.54,11.87-13.94,11.87h-9.35v18.93h-5.99V12.75h15.34ZM229.63,30.89c4.82,0,7.95-2.41,7.95-6.38s-3.14-6.33-7.95-6.33h-9.35v12.71h9.35Z\" fill=\"#fff\" /> <path d=\"M274.82,41.42c0,8.62-6.72,14.67-14.95,14.67s-15.06-6.05-15.06-14.67,6.72-14.67,15.06-14.67,14.95,6.05,14.95,14.67ZM269.16,41.42c0-5.77-4.26-9.52-9.3-9.52s-9.35,3.75-9.35,9.52,4.2,9.52,9.35,9.52,9.3-3.75,9.3-9.52Z\" fill=\"#fff\" /> <path d=\"M288.32,17.68c0,2.02-1.57,3.53-3.7,3.53s-3.75-1.51-3.75-3.53,1.57-3.7,3.75-3.7,3.7,1.74,3.7,3.7ZM281.71,55.31v-27.78h5.82v27.78h-5.82Z\" fill=\"#fff\" /> <path d=\"M323.37,38.51v16.8h-5.88v-15.62c0-4.54-2.63-7.56-6.61-7.56-4.98,0-8.29,3.36-8.29,10.36v12.82h-5.82v-27.78h5.82v3.42c2.24-2.69,5.49-4.2,9.63-4.2,6.66,0,11.14,4.82,11.14,11.76Z\" fill=\"#fff\" /> <path d=\"M338.88,45.84c0,3.02,1.62,4.76,4.2,4.76,1.46,0,3.25-.56,4.7-1.51l1.74,4.87c-2.58,1.57-4.54,2.13-6.83,2.13-6.1,0-9.63-3.64-9.63-9.8v-13.94h-5.99v-4.82h5.99v-10.75l5.82-1.79v12.54h11.48v4.82h-11.48v13.5Z\" fill=\"#fff\" /> <g> <path d=\"M58.7,23.9L35.98,1.17C18.61,5.12,4.96,18.83,1.11,36.24l22.63,22.63h0c9.66,9.66,25.31,9.66,34.97,0s9.66-25.31,0-34.97h0Z\" fill=\"#fff\" /> <path d=\"M46.29,0c-.25,0-.5.01-.75.02l18.1,18.1h0c12.68,12.68,12.68,33.24,0,45.92-12.68,12.68-33.24,12.68-45.92,0h0S0,46.31,0,46.31c.01,25.56,20.73,46.27,46.29,46.27s46.29-20.72,46.29-46.29S71.85,0,46.29,0Z\" fill=\"#fff\" /> </g> <g> <path d=\"M115.17,75.47v6.26h-1.68v-6.26h-2.32v-1.46h6.31v1.46h-2.32Z\" fill=\"#fff\" /> <path d=\"M131.48,77.89c0,2.24-1.8,3.99-4.06,3.99s-4.06-1.76-4.06-3.99,1.8-4.03,4.06-4.03,4.06,1.79,4.06,4.03ZM129.8,77.89c0-1.42-1.05-2.5-2.38-2.5s-2.38,1.08-2.38,2.5,1.05,2.47,2.38,2.47,2.38-1.06,2.38-2.47Z\" fill=\"#fff\" /> <path d=\"M149.32,74.01c2.46,0,4.11,1.54,4.11,3.86s-1.65,3.86-4.11,3.86h-3.3v-7.72h3.3ZM149.35,80.27c1.45,0,2.4-.97,2.4-2.4s-.94-2.4-2.4-2.4h-1.66v4.8h1.66Z\" fill=\"#fff\" /> <path d=\"M167.85,77.89c0,2.24-1.8,3.99-4.06,3.99s-4.06-1.76-4.06-3.99,1.8-4.03,4.06-4.03,4.06,1.79,4.06,4.03ZM166.16,77.89c0-1.42-1.05-2.5-2.38-2.5s-2.38,1.08-2.38,2.5,1.05,2.47,2.38,2.47,2.38-1.06,2.38-2.47Z\" fill=\"#fff\" /> <path d=\"M188.31,81.73l-.59-1.31h-3.56l-.59,1.31h-1.83l3.64-7.72h1.12l3.64,7.72h-1.83ZM185.95,76.45l-1.14,2.53h2.27l-1.13-2.53Z\" fill=\"#fff\" /> <path d=\"M203.69,81.73h-1.05l-4.59-4.72v4.72h-1.68v-7.72h1.06l4.59,4.83v-4.83h1.67v7.72Z\" fill=\"#fff\" /> <path d=\"M213.87,74.01c2.46,0,4.11,1.54,4.11,3.86s-1.65,3.86-4.11,3.86h-3.3v-7.72h3.3ZM213.9,80.27c1.45,0,2.4-.97,2.4-2.4s-.95-2.4-2.4-2.4h-1.66v4.8h1.66Z\" fill=\"#fff\" /> <path d=\"M238.43,81.73l-.59-1.31h-3.56l-.59,1.31h-1.83l3.64-7.72h1.12l3.64,7.72h-1.83ZM236.08,76.45l-1.14,2.53h2.27l-1.13-2.53Z\" fill=\"#fff\" /> <path d=\"M249.3,81.73h-1.15l-3.52-7.72h1.85l2.25,4.98,2.25-4.98h1.85l-3.53,7.72Z\" fill=\"#fff\" /> <path d=\"M266.52,77.89c0,2.24-1.8,3.99-4.07,3.99s-4.05-1.76-4.05-3.99,1.8-4.03,4.05-4.03,4.07,1.79,4.07,4.03ZM264.83,77.89c0-1.42-1.05-2.5-2.38-2.5s-2.38,1.08-2.38,2.5,1.05,2.47,2.38,2.47,2.38-1.06,2.38-2.47Z\" fill=\"#fff\" /> <path d=\"M273.1,81.73v-7.72h1.68v7.72h-1.68Z\" fill=\"#fff\" /> <path d=\"M284.95,74.01c2.46,0,4.11,1.54,4.11,3.86s-1.65,3.86-4.11,3.86h-3.3v-7.72h3.3ZM284.98,80.27c1.45,0,2.4-.97,2.4-2.4s-.95-2.4-2.4-2.4h-1.66v4.8h1.66Z\" fill=\"#fff\" /> </g> </g> </g> "};
  var I18N = {"pt": {"back": "Voltar", "home": "Início", "cancel": "Cancelar", "close": "Fechar", "apply": "Aplicar", "save": "Salvar", "done": "Concluído", "remove": "Remover", "with": "Com", "without": "Sem", "rot": "Gire o aparelho para a horizontal", "login.title": "Acesso", "login.user": "Usuário", "login.pass": "Senha", "login.enter": "Entrar", "login.restricted": "Acesso restrito a usuários autorizados.", "login.https": "Abra o link com https para entrar.", "login.fill": "Preencha login e senha.", "login.bad": "Login ou senha incorretos.", "login.fail": "Não foi possível conferir o acesso neste aparelho.", "home.new": "Nova partida", "home.newSub": "Configurar e iniciar", "home.resume": "Retomar partida", "home.history": "Histórico", "home.histNone": "Nenhuma partida salva", "home.hist1": "1 partida salva", "home.histN": "{0} partidas salvas", "home.voices": "Idioma e voz", "home.install": "Instalar app no aparelho", "home.logout": "Sair da conta", "home.offline": "brk.Point · funciona offline", "home.newAsk": "Existe uma partida em andamento. Começar uma nova apaga essa partida.", "cfg.title": "Nova partida", "cfg.simple": "Simples", "cfg.double": "Dupla", "cfg.teamA": "Dupla A (em cima)", "cfg.teamB": "Dupla B (embaixo)", "cfg.playerA": "Jogador A (em cima)", "cfg.playerB": "Jogador B (embaixo)", "cfg.optional": "Opcional", "cfg.player": "Jogador {0}", "cfg.serveFirst": "Saca primeiro", "cfg.firstServe": "Primeiro saque", "cfg.format": "Formato", "cfg.match": "Partida", "cfg.set1": "1 set", "cfg.bo3": "Melhor de 3", "cfg.bo5": "Melhor de 5", "cfg.set": "Set", "cfg.games6": "6 games", "cfg.games4": "4 games", "cfg.official": "oficial", "cfg.fast": "rápido", "cfg.tiebreak": "Tie-break", "cfg.pts7": "7 pontos", "cfg.pts10": "10 pontos", "cfg.decisive": "Set decisivo", "cfg.superTb": "Super tie-break", "cfg.superTbSub": "10 pontos", "cfg.fullSet": "Set completo", "cfg.points": "Pontos", "cfg.ad": "Com vantagem", "cfg.noad": "Sem vantagem", "cfg.times": "Tempos", "cfg.warmup": "Aquecimento", "cfg.change": "Troca de lado", "cfg.between": "Entre sets", "cfg.langvoice": "Idioma e voz", "cfg.language": "Idioma (textos e voz)", "cfg.voice": "Voz", "cfg.start": "Iniciar partida", "voice.F": "Feminina", "voice.M": "Masculina", "note.title": "Provisório", "note.voiceEn": "Este idioma ainda não tem vozes: o árbitro fala em {0}.", "sync.running": "Baixando as vozes: {0} de {1}.", "sync.fail": "Não foi possível baixar {0} faixas. Confira a internet e toque em Baixar vozes de novo.", "sync.ok": "Vozes em dia neste aparelho.", "imp.reading": "Lendo {0} de {1}...", "imp.saved": "{0} faixas salvas.", "imp.ignored": "Ignorados (nome sem número de 001 a 038): {0}.", "imp.bad": "Não foi possível ler: {0}.", "v.title": "Idioma e voz", "v.tracks": "{0} de {1} faixas", "v.ready": "Baixadas e prontas para uso offline", "v.missing": "Faltam: {0}", "v.test": "Testar", "v.sync": "Baixar vozes de novo", "v.relog": "Sair e entrar de novo", "v.needRelog": "Para baixar as vozes, saia da conta e entre de novo.", "v.advanced": "Avançado", "v.import": "Importar áudios próprios (MP3)", "v.importBtn": "Escolher MP3 da voz {0}", "v.remove": "Apagar vozes deste aparelho", "v.removeAsk": "Remover as vozes salvas neste aparelho? Você terá que baixar ou carregar de novo.", "v.persistOk": "Armazenamento persistente ativo neste aparelho.", "v.persistNo": "O Chrome ainda não marcou o armazenamento como persistente. As vozes ficam salvas, mas o Chrome pode apagá-las se faltar espaço.", "h.title": "Histórico", "h.none": "Nenhuma partida terminada ainda.", "h.clear": "Apagar tudo", "h.clearAsk": "Apagar todo o histórico deste aparelho?", "h.of": "Partida de {0}", "h.details": "Detalhes", "h.winner": "Vencedor", "h.duration": "Duração", "h.format": "Formato", "h.points": "Pontos", "h.warmup": "Aquecimento", "h.change": "Troca de lado", "h.delete": "Excluir partida", "h.deleted": "Partida excluída.", "h.end": "Fim de partida", "g.ready": "Pronto para iniciar", "g.warmup": "Aquecimento", "g.change": "Troca de lado", "g.between": "Entre sets", "g.paused": "Partida pausada", "g.end": "Fim de partida", "g.match": "Match point", "g.setpoint": "Set point", "g.break": "Break point", "g.tb": "Tie-break", "g.stb": "Super tie-break", "g.setn": "Set {0}", "g.pausedTitle": "Partida pausada", "g.pausedSub": "O tempo de partida continua correndo", "g.resume": "Retomar", "g.winners": "Vencedores", "g.undoLast": "Desfazer último ponto", "g.calls": "Chamadas", "g.undo": "Desfazer", "g.redo": "Refazer", "g.hintStart": "Toque no botão central para iniciar.", "g.hintWarm": "Em aquecimento. Toque no botão central para iniciar a partida.", "g.hintBreak": "Intervalo em andamento. Toque em pular.", "g.hintEnd": "Partida encerrada.", "g.hintPaused": "Partida pausada.", "g.remoteHint": "Controle remoto: o ponto pisca ao receber um botão.", "a.title": "Ajustes", "a.audio": "Áudio e tela", "a.volume": "Volume", "a.langvoice": "Idioma e voz", "a.awake": "Tela sempre acesa", "a.exit": "Sair", "a.saveExit": "Salvar e sair", "a.reset": "Resetar partida", "a.match": "Partida", "a.fixScore": "Corrigir placar", "a.fixNames": "Corrigir nomes", "a.server": "Trocar quem saca", "a.serverNow": "Agora: {0}", "a.breaks": "Cancelar ou reduzir intervalos", "a.breaksSub": "Troca de lado · entre sets: {0}", "a.noBreak": "sem", "a.endEarly": "Encerrar antes do fim", "a.endEarlySub": "Desistência ou W.O.", "c.title": "Corrigir placar", "c.hint": "Ajuste o que estiver errado e toque em Aplicar", "c.set": "Set {0}", "c.points": "Pontos", "c.whoServes": "Quem saca:", "c.applied": "Placar corrigido.", "n.title": "Corrigir nomes", "n.updated": "Nomes atualizados.", "sv.title": "Quem saca agora?", "sv.set": "Sacador: {0}", "b.title": "Intervalos", "b.running": "Em andamento", "b.none": "Nenhum intervalo em andamento", "b.cancel": "Cancelar intervalo", "b.cut": "Reduzir 30 s", "b.next": "Próximos intervalos", "b.cancelled": "Intervalo cancelado.", "b.ended": "Intervalo encerrado.", "r.title": "Resetar partida?", "r.text": "Zera o placar e volta ao início da partida.", "r.warn": "Esta ação não pode ser desfeita.", "r.do": "Resetar", "x.title": "Sair da partida?", "x.text1": "Você pode retomar depois, se salvar.", "x.text2": "A partida terminou e já está no histórico.", "x.save": "Salvar e sair", "x.nosave": "Sair sem salvar", "x.keep": "Continuar jogando", "e.title": "Encerrar antes do fim?", "e.text": "Quem desistiu ou perdeu por W.O.?", "rot.force": "Ver com a tela girada", "login.wait": "Verificando acesso..."}, "en": {"back": "Back", "home": "Home", "cancel": "Cancel", "close": "Close", "apply": "Apply", "save": "Save", "done": "Done", "remove": "Remove", "with": "With", "without": "Without", "rot": "Rotate your device to landscape", "login.title": "Access", "login.user": "User", "login.pass": "Password", "login.enter": "Sign in", "login.restricted": "Access restricted to authorized users.", "login.https": "Open the link with https to sign in.", "login.fill": "Enter your user and password.", "login.bad": "Wrong user or password.", "login.fail": "Could not verify access on this device.", "home.new": "New match", "home.newSub": "Set up and start", "home.resume": "Resume match", "home.history": "History", "home.histNone": "No saved matches", "home.hist1": "1 saved match", "home.histN": "{0} saved matches", "home.voices": "Language and voice", "home.install": "Install app on this device", "home.logout": "Sign out", "home.offline": "brk.Point · works offline", "home.newAsk": "There is a match in progress. Starting a new one erases it.", "cfg.title": "New match", "cfg.simple": "Singles", "cfg.double": "Doubles", "cfg.teamA": "Team A (top)", "cfg.teamB": "Team B (bottom)", "cfg.playerA": "Player A (top)", "cfg.playerB": "Player B (bottom)", "cfg.optional": "Optional", "cfg.player": "Player {0}", "cfg.serveFirst": "Serves first", "cfg.firstServe": "First serve", "cfg.format": "Format", "cfg.match": "Match", "cfg.set1": "1 set", "cfg.bo3": "Best of 3", "cfg.bo5": "Best of 5", "cfg.set": "Set", "cfg.games6": "6 games", "cfg.games4": "4 games", "cfg.official": "official", "cfg.fast": "fast", "cfg.tiebreak": "Tie-break", "cfg.pts7": "7 points", "cfg.pts10": "10 points", "cfg.decisive": "Deciding set", "cfg.superTb": "Super tie-break", "cfg.superTbSub": "10 points", "cfg.fullSet": "Full set", "cfg.points": "Scoring", "cfg.ad": "Advantage", "cfg.noad": "No-ad", "cfg.times": "Timers", "cfg.warmup": "Warm-up", "cfg.change": "Changeover", "cfg.between": "Between sets", "cfg.langvoice": "Language and voice", "cfg.language": "Language (text and voice)", "cfg.voice": "Voice", "cfg.start": "Start match", "voice.F": "Female", "voice.M": "Male", "note.title": "Provisional", "note.voiceEn": "This language has no voices yet: the umpire speaks {0}.", "sync.running": "Downloading voices: {0} of {1}.", "sync.fail": "Could not download {0} tracks. Check your connection and tap Download voices again.", "sync.ok": "Voices up to date on this device.", "imp.reading": "Reading {0} of {1}...", "imp.saved": "{0} tracks saved.", "imp.ignored": "Ignored (name without a number from 001 to 038): {0}.", "imp.bad": "Could not read: {0}.", "v.title": "Language and voice", "v.tracks": "{0} of {1} tracks", "v.ready": "Downloaded and ready for offline use", "v.missing": "Missing: {0}", "v.test": "Test", "v.sync": "Download voices again", "v.relog": "Sign out and back in", "v.needRelog": "To download the voices, sign out and sign back in.", "v.advanced": "Advanced", "v.import": "Import your own audio (MP3)", "v.importBtn": "Choose MP3 files for the {0} voice", "v.remove": "Delete voices from this device", "v.removeAsk": "Remove the voices saved on this device? You will need to download or load them again.", "v.persistOk": "Persistent storage is active on this device.", "v.persistNo": "Chrome has not marked storage as persistent yet. Voices stay saved, but Chrome may delete them if space runs low.", "h.title": "History", "h.none": "No finished matches yet.", "h.clear": "Clear all", "h.clearAsk": "Clear all history on this device?", "h.of": "Match of {0}", "h.details": "Details", "h.winner": "Winner", "h.duration": "Duration", "h.format": "Format", "h.points": "Scoring", "h.warmup": "Warm-up", "h.change": "Changeover", "h.delete": "Delete match", "h.deleted": "Match deleted.", "h.end": "Match over", "g.ready": "Ready to start", "g.warmup": "Warm-up", "g.change": "Changeover", "g.between": "Between sets", "g.paused": "Match paused", "g.end": "Match over", "g.match": "Match point", "g.setpoint": "Set point", "g.break": "Break point", "g.tb": "Tie-break", "g.stb": "Super tie-break", "g.setn": "Set {0}", "g.pausedTitle": "Match paused", "g.pausedSub": "Match time keeps running", "g.resume": "Resume", "g.winners": "Winners", "g.undoLast": "Undo last point", "g.calls": "Calls", "g.undo": "Undo", "g.redo": "Redo", "g.hintStart": "Tap the center button to start.", "g.hintWarm": "Warm-up in progress. Tap the center button to start the match.", "g.hintBreak": "Break in progress. Tap skip.", "g.hintEnd": "Match finished.", "g.hintPaused": "Match paused.", "g.remoteHint": "Remote: the dot blinks when a button is received.", "a.title": "Settings", "a.audio": "Audio and screen", "a.volume": "Volume", "a.langvoice": "Language and voice", "a.awake": "Keep screen on", "a.exit": "Exit", "a.saveExit": "Save and exit", "a.reset": "Reset match", "a.match": "Match", "a.fixScore": "Fix score", "a.fixNames": "Fix names", "a.server": "Change server", "a.serverNow": "Now: {0}", "a.breaks": "Cancel or shorten breaks", "a.breaksSub": "Changeover · between sets: {0}", "a.noBreak": "none", "a.endEarly": "End early", "a.endEarlySub": "Retirement or walkover", "c.title": "Fix score", "c.hint": "Fix what is wrong and tap Apply", "c.set": "Set {0}", "c.points": "Points", "c.whoServes": "Server:", "c.applied": "Score corrected.", "n.title": "Fix names", "n.updated": "Names updated.", "sv.title": "Who serves now?", "sv.set": "Server: {0}", "b.title": "Breaks", "b.running": "In progress", "b.none": "No break in progress", "b.cancel": "Cancel break", "b.cut": "Shorten 30 s", "b.next": "Next breaks", "b.cancelled": "Break cancelled.", "b.ended": "Break ended.", "r.title": "Reset match?", "r.text": "Clears the score and returns to the start of the match.", "r.warn": "This cannot be undone.", "r.do": "Reset", "x.title": "Leave the match?", "x.text1": "You can resume later if you save.", "x.text2": "The match is over and is already in the history.", "x.save": "Save and exit", "x.nosave": "Exit without saving", "x.keep": "Keep playing", "e.title": "End the match early?", "e.text": "Who retired or lost by walkover?", "rot.force": "View rotated", "login.wait": "Checking access..."}, "es": {"back": "Volver", "home": "Inicio", "cancel": "Cancelar", "close": "Cerrar", "apply": "Aplicar", "save": "Guardar", "done": "Listo", "remove": "Quitar", "with": "Con", "without": "Sin", "rot": "Gira el dispositivo a horizontal", "login.title": "Acceso", "login.user": "Usuario", "login.pass": "Contraseña", "login.enter": "Entrar", "login.restricted": "Acceso restringido a usuarios autorizados.", "login.https": "Abre el enlace con https para entrar.", "login.fill": "Escribe usuario y contraseña.", "login.bad": "Usuario o contraseña incorrectos.", "login.fail": "No se pudo comprobar el acceso en este dispositivo.", "home.new": "Nuevo partido", "home.newSub": "Configurar e iniciar", "home.resume": "Reanudar partido", "home.history": "Historial", "home.histNone": "Ningún partido guardado", "home.hist1": "1 partido guardado", "home.histN": "{0} partidos guardados", "home.voices": "Idioma y voz", "home.install": "Instalar la app en el dispositivo", "home.logout": "Cerrar sesión", "home.offline": "brk.Point · funciona sin conexión", "home.newAsk": "Hay un partido en curso. Empezar uno nuevo lo borra.", "cfg.title": "Nuevo partido", "cfg.simple": "Individual", "cfg.double": "Dobles", "cfg.teamA": "Pareja A (arriba)", "cfg.teamB": "Pareja B (abajo)", "cfg.playerA": "Jugador A (arriba)", "cfg.playerB": "Jugador B (abajo)", "cfg.optional": "Opcional", "cfg.player": "Jugador {0}", "cfg.serveFirst": "Saca primero", "cfg.firstServe": "Primer saque", "cfg.format": "Formato", "cfg.match": "Partido", "cfg.set1": "1 set", "cfg.bo3": "Al mejor de 3", "cfg.bo5": "Al mejor de 5", "cfg.set": "Set", "cfg.games6": "6 juegos", "cfg.games4": "4 juegos", "cfg.official": "oficial", "cfg.fast": "rápido", "cfg.tiebreak": "Tie-break", "cfg.pts7": "7 puntos", "cfg.pts10": "10 puntos", "cfg.decisive": "Set decisivo", "cfg.superTb": "Súper tie-break", "cfg.superTbSub": "10 puntos", "cfg.fullSet": "Set completo", "cfg.points": "Puntos", "cfg.ad": "Con ventaja", "cfg.noad": "Sin ventaja", "cfg.times": "Tiempos", "cfg.warmup": "Calentamiento", "cfg.change": "Cambio de lado", "cfg.between": "Entre sets", "cfg.langvoice": "Idioma y voz", "cfg.language": "Idioma (textos y voz)", "cfg.voice": "Voz", "cfg.start": "Iniciar partido", "voice.F": "Femenina", "voice.M": "Masculina", "note.title": "Provisional", "note.voiceEn": "Este idioma aún no tiene voces: el árbitro habla en {0}.", "sync.running": "Descargando las voces: {0} de {1}.", "sync.fail": "No se pudieron descargar {0} pistas. Comprueba la conexión y toca Descargar voces de nuevo.", "sync.ok": "Voces al día en este dispositivo.", "imp.reading": "Leyendo {0} de {1}...", "imp.saved": "{0} pistas guardadas.", "imp.ignored": "Ignorados (nombre sin número de 001 a 038): {0}.", "imp.bad": "No se pudo leer: {0}.", "v.title": "Idioma y voz", "v.tracks": "{0} de {1} pistas", "v.ready": "Descargadas y listas para usar sin conexión", "v.missing": "Faltan: {0}", "v.test": "Probar", "v.sync": "Descargar voces de nuevo", "v.relog": "Salir y volver a entrar", "v.needRelog": "Para descargar las voces, cierra sesión y vuelve a entrar.", "v.advanced": "Avanzado", "v.import": "Importar audios propios (MP3)", "v.importBtn": "Elegir MP3 de la voz {0}", "v.remove": "Borrar las voces de este dispositivo", "v.removeAsk": "¿Quitar las voces guardadas en este dispositivo? Tendrás que descargarlas o cargarlas de nuevo.", "v.persistOk": "Almacenamiento persistente activo en este dispositivo.", "v.persistNo": "Chrome aún no marcó el almacenamiento como persistente. Las voces quedan guardadas, pero Chrome puede borrarlas si falta espacio.", "h.title": "Historial", "h.none": "Aún no hay partidos terminados.", "h.clear": "Borrar todo", "h.clearAsk": "¿Borrar todo el historial de este dispositivo?", "h.of": "Partido del {0}", "h.details": "Detalles", "h.winner": "Ganador", "h.duration": "Duración", "h.format": "Formato", "h.points": "Puntos", "h.warmup": "Calentamiento", "h.change": "Cambio de lado", "h.delete": "Eliminar partido", "h.deleted": "Partido eliminado.", "h.end": "Fin del partido", "g.ready": "Listo para empezar", "g.warmup": "Calentamiento", "g.change": "Cambio de lado", "g.between": "Entre sets", "g.paused": "Partido en pausa", "g.end": "Fin del partido", "g.match": "Punto de partido", "g.setpoint": "Punto de set", "g.break": "Break point", "g.tb": "Tie-break", "g.stb": "Súper tie-break", "g.setn": "Set {0}", "g.pausedTitle": "Partido en pausa", "g.pausedSub": "El tiempo del partido sigue corriendo", "g.resume": "Reanudar", "g.winners": "Ganadores", "g.undoLast": "Deshacer último punto", "g.calls": "Llamadas", "g.undo": "Deshacer", "g.redo": "Rehacer", "g.hintStart": "Toca el botón central para empezar.", "g.hintWarm": "En calentamiento. Toca el botón central para iniciar el partido.", "g.hintBreak": "Descanso en curso. Toca saltar.", "g.hintEnd": "Partido terminado.", "g.hintPaused": "Partido en pausa.", "g.remoteHint": "Mando: el punto parpadea al recibir un botón.", "a.title": "Ajustes", "a.audio": "Audio y pantalla", "a.volume": "Volumen", "a.langvoice": "Idioma y voz", "a.awake": "Pantalla siempre encendida", "a.exit": "Salir", "a.saveExit": "Guardar y salir", "a.reset": "Reiniciar partido", "a.match": "Partido", "a.fixScore": "Corregir marcador", "a.fixNames": "Corregir nombres", "a.server": "Cambiar quién saca", "a.serverNow": "Ahora: {0}", "a.breaks": "Cancelar o reducir descansos", "a.breaksSub": "Cambio de lado · entre sets: {0}", "a.noBreak": "sin", "a.endEarly": "Terminar antes del final", "a.endEarlySub": "Retirada o W.O.", "c.title": "Corregir marcador", "c.hint": "Corrige lo que esté mal y toca Aplicar", "c.set": "Set {0}", "c.points": "Puntos", "c.whoServes": "Saca:", "c.applied": "Marcador corregido.", "n.title": "Corregir nombres", "n.updated": "Nombres actualizados.", "sv.title": "¿Quién saca ahora?", "sv.set": "Saca: {0}", "b.title": "Descansos", "b.running": "En curso", "b.none": "Ningún descanso en curso", "b.cancel": "Cancelar descanso", "b.cut": "Reducir 30 s", "b.next": "Próximos descansos", "b.cancelled": "Descanso cancelado.", "b.ended": "Descanso terminado.", "r.title": "¿Reiniciar el partido?", "r.text": "Pone el marcador a cero y vuelve al inicio del partido.", "r.warn": "Esta acción no se puede deshacer.", "r.do": "Reiniciar", "x.title": "¿Salir del partido?", "x.text1": "Puedes reanudar después si guardas.", "x.text2": "El partido terminó y ya está en el historial.", "x.save": "Guardar y salir", "x.nosave": "Salir sin guardar", "x.keep": "Seguir jugando", "e.title": "¿Terminar antes del final?", "e.text": "¿Quién se retiró o perdió por W.O.?", "rot.force": "Ver girada", "login.wait": "Comprobando acceso..."}};
  var LANG_NAME = { pt: 'Português', en: 'English', es: 'Español' };

  var settings = Object.assign({ voice: 'F', volume: 0.9, mute: false, keepAwake: true, lang: 'pt', names: ['', ''], mode: 'S', dnames: ['', '', '', ''], dfirst: [0, 0], cfg: E.normCfg({}) }, LS.get(K.settings, {}));
  if (!Array.isArray(settings.names) || settings.names.length !== 2) settings.names = ['', ''];
  if (!Array.isArray(settings.dnames) || settings.dnames.length !== 4) settings.dnames = ['', '', '', ''];
  if (!Array.isArray(settings.dfirst) || settings.dfirst.length !== 2) settings.dfirst = [0, 0];
  if (settings.mode !== 'D') settings.mode = 'S';
  if (!I18N[settings.lang]) settings.lang = 'pt';
  settings.cfg = E.normCfg(settings.cfg);
  function saveSettings() { LS.set(K.settings, settings); }

  /* ---------- textos no idioma escolhido ---------- */
  function t(k) {
    var d = I18N[settings.lang] || {}, s = d[k];
    if (s === undefined) s = I18N.pt[k];
    if (s === undefined) return k;
    for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
    return s;
  }
  function esc(x) { return String(x === undefined || x === null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var VOICE_TXT = function (v) { return t(v === 'M' ? 'voice.M' : 'voice.F'); };

  /* ícones simples das telas verticais */
  var UI = {
    home: function (c) { return '<path d="M12 3 L2 12 H5 V21 H10 V15 H14 V21 H19 V12 H22 Z" fill="' + c + '"/>'; },
    back: function (c) { return '<g fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7l7 7"/></g>'; },
    chev: function (c) { return '<g fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7l-7 7"/></g>'; },
    plus: function (c) { return '<g fill="none" stroke="' + c + '" stroke-width="3.2" stroke-linecap="round"><path d="M12 5V19M5 12H19"/></g>'; },
    minus: function (c) { return '<g fill="none" stroke="' + c + '" stroke-width="3.2" stroke-linecap="round"><path d="M5 12H19"/></g>'; },
    x: function (c) { return '<g fill="none" stroke="' + c + '" stroke-width="2.8" stroke-linecap="round"><path d="M6 6L18 18M18 6L6 18"/></g>'; },
    eye: function (c) { return '<g fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c3-5 6-7 10-7s7 2 10 7c-3 5-6 7-10 7s-7-2-10-7z"/><circle cx="12" cy="12" r="3"/></g>'; }
  };
  function ui(n, size, col) { return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' + UI[n](col || '#fff') + '</svg>'; }
  function logoSvg() { return '<svg class="logo" viewBox="0 0 350.36 92.58" role="img" aria-label="brk.Point">' + ICONS.logo + '</svg>'; }
  function pad3(n) { return String(n).padStart(3, '0'); }
  function fmtSec(s) { var m = Math.floor(s / 60), r = s % 60; return (m ? m + ' min' : '') + (m && r ? ' ' : '') + (r || !m ? r + ' s' : ''); }
  function setsStr(sets, tbs) {
    return sets.map(function (g, i) {
      var tb = tbs && tbs[i];
      if (tb) return g[0] + g[1] === 1 ? tb[0] + '-' + tb[1] : g[0] + '-' + g[1] + '(' + Math.min(tb[0], tb[1]) + ')';
      return g[0] + '-' + g[1];
    }).join('  ');
  }
  function fmtLabel(n) { return t(n === 1 ? 'cfg.set1' : n === 2 ? 'cfg.bo3' : 'cfg.bo5'); }

  /* ---------- acesso (login e senha) ---------- */
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function unhex(h) { var a = new Uint8Array(h.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }
  function b64(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
  function unb64(t) { var s = atob(t), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  /* o acesso é conferido por uma derivação PBKDF2 do login e da senha (só os códigos ficam no auth-config.js) */
  function derive(login, pass, salt, iter) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(login.trim().toLowerCase() + '\u0000' + pass.trim().toLowerCase()), 'PBKDF2', false, ['deriveBits'])
      .then(function (key) { return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(salt), iterations: iter }, key, 512); })
      .then(function (bits) { var u = new Uint8Array(bits); return { h: hex(u.slice(0, 32)), wk: u.slice(32) }; });
  }
  function accessList() { var a = window.PLACAR_ACCESS || {}; return { iter: a.iter || 150000, users: a.users || [] }; }
  function authOk() {
    var tok = LS.get(K.auth, null), a = accessList();
    return !!tok && a.users.some(function (u) { return u.hash === tok; });
  }
  function doLogin() {
    var u = $('loginUser').value, p = $('loginPass').value, a = accessList(), err = $('loginErr');
    err.textContent = '';
    if (!window.crypto || !crypto.subtle) { err.textContent = t('login.https'); return; }
    if (!u.trim() || !p) { err.textContent = t('login.fill'); return; }
    $('loginBtn').disabled = true; $('loginBtn').innerHTML = '<span class="spin sm dark" aria-hidden="true"></span> ' + esc(t('login.wait'));
    Promise.all(a.users.map(function (x) { return derive(u, p, x.salt, a.iter).then(function (d) { return d.h === x.hash ? d.h : null; }); }))
      .then(function (r) {
        var ok = r.filter(Boolean)[0];
        if (!ok) { err.textContent = t('login.bad'); return; }
        LS.set(K.auth, ok); $('loginPass').value = ''; start();
      })
      .catch(function () { err.textContent = t('login.fail'); })
      .then(function () { var lb = $('loginBtn'); if (lb) { lb.disabled = false; lb.textContent = t('login.enter'); } });
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
  var VLANGS = ['en', 'pt', 'es'];
  function freshHave() { var h = {}; VLANGS.forEach(function (l) { h[l] = { F: {}, M: {} }; }); return h; }
  var have = freshHave();
  /* guardado no aparelho: inglês mantém a chave antiga (F:1); português e espanhol levam o prefixo do idioma (pt:F:1) */
  function vkey(l, v, n) { return (l === 'en' ? '' : l + ':') + v + ':' + n; }
  function vpath(l, v, n) { return 'voices/' + l + '/' + v + '/' + String(n).padStart(3, '0') + '.mp3'; }
  var vidx = LS.get(K.vidx, null);   /* o que está publicado em voices/index.json: { version, sets: { pt: { F: 38, M: 38 }, ... } } */
  function loadIndex() {
    return fetch('voices/index.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { if (j && j.sets) { vidx = j; LS.set(K.vidx, j); } }).catch(function () {});
  }
  function localHas(l) { return countHave('F', l) + countHave('M', l) > 0; }
  /* faixas publicadas para um idioma e voz: lista de números (ou uma quantidade, de 1 até ela) */
  function setTracks(l, v) {
    var s = vidx && vidx.sets && vidx.sets[l] && vidx.sets[l][v], out = [];
    if (!s) return out;
    if (Array.isArray(s)) return s.filter(function (n) { return n >= 1 && n <= TOTAL; });
    for (var n = 1; n <= Math.min(+s || 0, TOTAL); n++) out.push(n);
    return out;
  }
  function langAvail(l) { return !!(vidx && vidx.sets && vidx.sets[l]) || localHas(l); }
  function effLang() {
    if (langAvail(settings.lang)) return settings.lang;
    var o = ['pt', 'es', 'en']; for (var i = 0; i < o.length; i++) if (langAvail(o[i])) return o[i];
    return 'en';
  }
  function refreshHave() {
    return idbKeys().then(function (keys) {
      have = freshHave();
      keys.forEach(function (k) { var m = /^(?:(pt|es):)?([FM]):(\d+)$/.exec(k); if (m) have[m[1] || 'en'][m[2]][+m[3]] = true; });
    }).catch(function () {});
  }
  function missing(v, l) { l = l || effLang(); var out = []; for (var n = 1; n <= TOTAL; n++) if (!have[l][v][n]) out.push(n); return out; }
  function countHave(v, l) { return TOTAL - missing(v, l).length; }


  /* ---------- vozes embutidas no app (criptografadas), baixadas depois do login ---------- */
  var sync = { running: false, done: 0, total: 0, fail: 0 };
  function pad3(n) { return String(n).padStart(3, '0'); }
  function syncText() {
    if (sync.running) return t('sync.running', sync.done, sync.total);
    if (sync.fail) return t('sync.fail', sync.fail);
    return '';
  }
  function syncPct() { return sync.total ? Math.round(100 * sync.done / sync.total) : 0; }
  function syncBar(id) { return sync.running ? '<div class="pbar" id="' + id + '"><i style="width:' + syncPct() + '%"></i></div>' : ''; }
  function updSyncUI() {
    var tx = syncText(), sl = $('syncLine'); if (sl) sl.textContent = tx || t('sync.ok');
    var hv = $('homeVoice'); if (hv) hv.textContent = tx;
    ['homeBar', 'voiceBar'].forEach(function (id) { var el = $(id); if (el && el.firstChild) el.firstChild.style.width = syncPct() + '%'; });
  }
  function notifySync() {
    var tx = syncText();
    var sl = $('syncLine'); if (sl) sl.textContent = tx || t('sync.ok');
    if (current === 'home') renderHome();
  }
  function syncVoices(force) {
    if (sync.running || !vidx || !vidx.sets) return Promise.resolve();
    var redo = !!force || LS.get(K.vver, '') !== vidx.version, jobs = [];
    Object.keys(vidx.sets).forEach(function (l) {
      if (VLANGS.indexOf(l) < 0) return;
      ['F', 'M'].forEach(function (v) { setTracks(l, v).forEach(function (n) { if (redo || !have[l][v][n]) jobs.push([l, v, n]); }); });
    });
    if (!jobs.length) { LS.set(K.vver, vidx.version); return Promise.resolve(); }
    sync = { running: true, done: 0, total: jobs.length, fail: 0 };
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    notifySync();
    var idx = 0;
    function worker() {
      if (idx >= jobs.length) return Promise.resolve();
      var j = jobs[idx++], l = j[0], v = j[1], n = j[2];
      return fetch(vpath(l, v, n), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
        .then(function (ab) { delete bufCache[vkey(l, v, n)]; return idbPut(vkey(l, v, n), ab); })
        .catch(function () { sync.fail++; })
        .then(function () { sync.done++; updSyncUI(); return worker(); });
    }
    return Promise.all([worker(), worker(), worker(), worker()])
      .then(refreshHave)
      .then(function () {
        sync.running = false;
        if (!sync.fail) LS.set(K.vver, vidx.version);
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
  function getBuffer(l, v, n) {
    var key = vkey(l, v, n);
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
    var tok = ++playToken, v = settings.voice, l = effLang();
    if (currentSrc) { try { currentSrc.onended = null; currentSrc.stop(); } catch (e) {} currentSrc = null; }
    played.push({ voice: v, tracks: list.slice(), at: Date.now() });
    if (played.length > 200) played.shift();
    if (!ensureCtx()) return;
    var i = 0;
    (function next() {
      if (tok !== playToken || i >= list.length) return;
      var n = list[i++];
      getBuffer(l, v, n).then(function (buf) { return buf || (l !== 'en' ? getBuffer('en', v, n) : null); }).then(function (buf) {   /* faixa que falta no idioma: usa a em inglês */
        if (tok !== playToken) return;
        if (!buf) { next(); return; }   /* faixa ausente: silêncio */
        var src = ctx.createBufferSource(); src.buffer = buf; src.connect(gain);
        src.onended = function () { if (tok === playToken) setTimeout(next, 120); };
        currentSrc = src; src.start();
      });
    })();
  }
  function preload() {
    var v = settings.voice, l = effLang();
    for (var n = 1; n <= TOTAL; n++) { if (have[l][v][n]) getBuffer(l, v, n); else if (have.en[v][n]) getBuffer('en', v, n); }
  }

  /* importar arquivos de voz: o número da faixa vem do começo do nome (001.mp3 a 038.mp3) */
  function importFiles(l, v, files) {
    files = Array.prototype.slice.call(files || []);
    var done = 0, ignored = [], bad = [], ok = 0;
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
    ensureCtx();
    var chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        var m = /^(\d{1,3})(?!\d)/.exec(f.name.replace(/^.*[\\/]/, ''));
        var n = m ? parseInt(m[1], 10) : 0;
        if (n < 1 || n > TOTAL) { ignored.push(f.name); return; }
        return f.arrayBuffer().then(function (ab) {
          return decode(ab.slice(0)).then(function (b) {
            return idbPut(vkey(l, v, n), ab).then(function () { bufCache[vkey(l, v, n)] = b; ok++; });
          });
        }).catch(function () { bad.push(f.name); });
      }).then(function () { done++; var el = $('impProgress'); if (el) el.textContent = t('imp.reading', done, files.length); });
    });
    return chain.then(refreshHave).then(function () { return { ok: ok, ignored: ignored, bad: bad }; });
  }

  function trackList(arr) { return arr.map(function (n) { return String(n).padStart(3, '0') + ' ' + E.TRACKS[n]; }).join(', '); }


  /* ---------- modal e aviso ---------- */
  function openModal(html) { var m = $('modal'); m.innerHTML = '<div>' + html + '</div>'; m.hidden = false; return m; }
  function closeModal() { var m = $('modal'); m.hidden = true; m.innerHTML = ''; }
  function confirmBox(text, yes, cb) {
    var m = openModal('<p>' + text + '</p><div class="two"><button class="sbtn" id="cNo">' + esc(t('cancel')) + '</button><button class="sbtn p" id="cYes">' + esc(yes) + '</button></div>');
    m.querySelector('#cNo').onclick = closeModal;
    m.querySelector('#cYes').onclick = function () { closeModal(); cb(); };
  }
  var toastT = null;
  function toast(msg) {
    if (current === 'game') { var g = $('gt'); g.innerHTML = '<span>' + esc(msg) + '</span>'; g.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { g.hidden = true; }, 1800); return; }
    var e = $('toast'); e.textContent = msg; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { e.hidden = true; }, 2200);
  }

  /* ---------- telas verticais ---------- */
  var current = '', draft = null, histIdx = 0, installEvt = null;
  var SCR = {};
  function top(back, home) {
    return '<div class="top">' + logoSvg() + '<div class="ib">' +
      (back ? '<button class="ibtn" data-a="back" aria-label="' + esc(t('back')) + '">' + ui('back', 28) + '</button>' : '') +
      (home ? '<button class="ibtn" data-a="home" aria-label="' + esc(t('home')) + '">' + ui('home', 28) + '</button>' : '') + '</div></div>';
  }
  function opts(key, items, val, cols) {
    return '<div class="grid g' + (cols || items.length) + '">' + items.map(function (it) {
      return '<button class="o' + (String(it.v) === String(val) ? ' on' : '') + '" data-a="' + key + ':' + it.v + '">' + esc(it.t) + (it.s ? '<small>' + esc(it.s) + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function stepper(key, val) {
    return '<div class="stp"><button data-a="step:' + key + ':-30" aria-label="-30 s">' + ui('minus', 22) + '</button><b>' + esc(fmtSec(val)) + '</b><button data-a="step:' + key + ':30" aria-label="+30 s">' + ui('plus', 22) + '</button></div>';
  }
  function resumable() {
    var cur = LS.get(K.cur, null);
    return cur && cur.s && cur.s.phase && cur.s.phase !== 'fim' ? cur : null;
  }
  function sideNames(s, side) {
    if (s.mode === 'D' && s.team) return [s.team[side][0] || t('cfg.player', side * 2 + 1), s.team[side][1] || t('cfg.player', side * 2 + 2)];
    var n = s.names && s.names[side]; return [n || t(side === 0 ? 'cfg.playerA' : 'cfg.playerB').replace(/ \(.*\)/, '')];
  }
  function nameText(s, side) { return sideNames(s, side).join(' | '); }

  SCR.login = function () {
    return '<div class="vs"><div style="background:var(--navy);height:230px;display:flex;align-items:center;justify-content:center"><svg id="loginLogo" viewBox="0 0 350.36 92.58" style="width:260px" role="img" aria-label="brk.Point">' + ICONS.logo + '</svg></div><div class="pad">' +
      '<h1 class="t" style="margin-top:28px">' + esc(t('login.title')) + '</h1>' +
      '<label class="fld"><span>' + esc(t('login.user')) + '</span><input id="loginUser" class="inp" type="text" autocomplete="username" autocapitalize="none" spellcheck="false"></label>' +
      '<label class="fld"><span>' + esc(t('login.pass')) + '</span><input id="loginPass" class="inp" type="password" autocomplete="current-password"></label>' +
      '<p id="loginErr" class="err" role="alert"></p>' +
      '<button id="loginBtn" class="cta" style="margin-top:16px">' + esc(t('login.enter')) + '</button>' +
      '<p class="mut" style="text-align:center">' + esc(t('login.restricted')) + '</p></div></div>';
  };
  SCR.home = function () {
    var h = '<div class="vs">' + top(false, false) + '<div class="pad" style="padding-top:22px">';
    h += '<button class="card lime" data-a="new"><div><b>' + esc(t('home.new')) + '</b><span>' + esc(t('home.newSub')) + '</span></div>' + ui('plus', 40, '#071327') + '</button>';
    var cur = resumable();
    if (cur) {
      var s = cur.s, sets = s.sets.map(function (g) { return g.slice(); });
      h += '<button class="card" data-a="resume"><div><b>' + esc(t('home.resume')) + '</b><span style="color:#fff">' + esc(nameText(s, 0) + '  x  ' + nameText(s, 1)) + '</span><span>' + esc(setsStr(sets, s.tbScores) + ' · ' + E.hhmm(s.clock || 0)) + '</span></div>' + ui('chev', 24) + '</button>';
    }
    var n = (LS.get(K.hist, []) || []).length;
    h += '<button class="card plain" data-a="go:history"><div><b>' + esc(t('home.history')) + '</b><span>' + esc(n === 0 ? t('home.histNone') : n === 1 ? t('home.hist1') : t('home.histN', n)) + '</span></div>' + ui('chev', 22) + '</button>';
    h += '<button class="card plain" data-a="go:voices"><div><b>' + esc(t('home.voices')) + '</b><span id="homeVoice">' + esc(syncText() || (LANG_NAME[settings.lang] + ' · ' + VOICE_TXT(settings.voice) + ' · ' + countHave(settings.voice) + '/' + TOTAL)) + '</span>' + syncBar('homeBar') + '</div>' + (sync.running ? '<span class="spin sm" aria-hidden="true"></span>' : ui('chev', 22)) + '</button>';
    if (installEvt) h += '<button class="card ghost" data-a="install">' + esc(t('home.install')) + '</button>';
    h += '<button class="card ghost" data-a="logout" style="margin-top:6px">' + esc(t('home.logout')) + '</button>';
    return h + '<p class="mut" style="text-align:center;margin-top:20px">' + esc(t('home.offline')) + '</p></div></div>';
  };
  function renderHome() { show('home'); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; if (current === 'home') render(true); });

  function langVoiceNote() {
    return langAvail(settings.lang) ? '' : '<div class="note"><b>' + esc(t('note.title')) + '</b>' + esc(t('note.voiceEn', LANG_NAME[effLang()])) + '</div>';
  }
  SCR.config = function () {
    var c = draft, D = settings.mode === 'D', h = '<div class="vs hasfix">' + top(true, true) + '<div class="pad"><h1 class="t">' + esc(t('cfg.title')) + '</h1>';
    h += opts('mode', [{ v: 'S', t: t('cfg.simple') }, { v: 'D', t: t('cfg.double') }], settings.mode);
    if (D) {
      [0, 1].forEach(function (tm) {
        var a = settings.dnames[tm * 2] || t('cfg.player', tm * 2 + 1), b = settings.dnames[tm * 2 + 1] || t('cfg.player', tm * 2 + 2);
        h += '<div class="team"><h3>' + esc(t(tm ? 'cfg.teamB' : 'cfg.teamA')) + '</h3><div class="grid g2">' +
          '<input class="inp" data-dn="' + (tm * 2) + '" maxlength="20" autocomplete="off" placeholder="' + esc(t('cfg.player', tm * 2 + 1)) + '" value="' + esc(settings.dnames[tm * 2]) + '">' +
          '<input class="inp" data-dn="' + (tm * 2 + 1) + '" maxlength="20" autocomplete="off" placeholder="' + esc(t('cfg.player', tm * 2 + 2)) + '" value="' + esc(settings.dnames[tm * 2 + 1]) + '"></div>' +
          '<div class="lab">' + esc(t('cfg.serveFirst')) + '</div><div class="grid g2">' +
          [0, 1].map(function (k) { return '<button class="o' + (settings.dfirst[tm] === k ? ' on' : '') + '" data-a="df' + tm + ':' + k + '" id="df' + tm + k + '">' + esc(k ? b : a) + '</button>'; }).join('') + '</div></div>';
      });
    } else {
      h += '<div class="lbl">' + esc(t('cfg.playerA')) + '</div><input class="inp" data-sn="0" maxlength="20" autocomplete="off" placeholder="' + esc(t('cfg.optional')) + '" value="' + esc(settings.names[0]) + '">' +
        '<div class="lbl">' + esc(t('cfg.playerB')) + '</div><input class="inp" data-sn="1" maxlength="20" autocomplete="off" placeholder="' + esc(t('cfg.optional')) + '" value="' + esc(settings.names[1]) + '">';
    }
    h += '<div class="lbl" style="margin-top:18px">' + esc(t('cfg.firstServe')) + '</div>' + opts('first', [{ v: 0, t: t(D ? 'cfg.teamA' : 'cfg.playerA') }, { v: 1, t: t(D ? 'cfg.teamB' : 'cfg.playerB') }], c.firstServe);
    h += '<div class="hr"></div><div class="sec">' + esc(t('cfg.format')) + '</div>';
    h += '<div class="lbl">' + esc(t('cfg.match')) + '</div>' + opts('sets', [{ v: 1, t: t('cfg.set1') }, { v: 2, t: t('cfg.bo3') }, { v: 3, t: t('cfg.bo5') }], c.sets);
    h += '<div class="lbl">' + esc(t('cfg.set')) + '</div>' + opts('games', [{ v: 6, t: t('cfg.games6'), s: t('cfg.official') }, { v: 4, t: t('cfg.games4'), s: t('cfg.fast') }], c.games);
    h += '<div class="lbl">' + esc(t('cfg.tiebreak')) + '</div>' + opts('tbPoints', [{ v: 7, t: t('cfg.pts7') }, { v: 10, t: t('cfg.pts10') }], c.tbPoints);
    if (c.sets > 1) h += '<div class="lbl">' + esc(t('cfg.decisive')) + '</div>' + opts('superTb', [{ v: 1, t: t('cfg.superTb'), s: t('cfg.superTbSub') }, { v: 0, t: t('cfg.fullSet') }], c.superTb ? 1 : 0);
    h += '<div class="lbl">' + esc(t('cfg.points')) + '</div>' + opts('noAd', [{ v: 0, t: t('cfg.ad') }, { v: 1, t: t('cfg.noad') }], c.noAd ? 1 : 0);
    h += '<div class="hr"></div><div class="sec">' + esc(t('cfg.times')) + '</div>';
    [['heat', 'heatSec', 'cfg.warmup'], ['brkChange', 'brkChangeSec', 'cfg.change'], ['brkSet', 'brkSetSec', 'cfg.between']].forEach(function (r) {
      h += '<div class="lbl">' + esc(t(r[2])) + '</div>' + opts(r[0], [{ v: 1, t: t('with') }, { v: 0, t: t('without') }], c[r[0]] ? 1 : 0) + (c[r[0]] ? stepper(r[1], c[r[1]]) : '');
    });
    h += '<div class="hr"></div><div class="sec">' + esc(t('cfg.langvoice')) + '</div>';
    h += '<div class="lbl">' + esc(t('cfg.language')) + '</div>' + opts('lang', [{ v: 'pt', t: LANG_NAME.pt }, { v: 'en', t: LANG_NAME.en }, { v: 'es', t: LANG_NAME.es }], settings.lang);
    h += '<div class="lbl">' + esc(t('cfg.voice')) + '</div>' + opts('voice', [{ v: 'F', t: VOICE_TXT('F') }, { v: 'M', t: VOICE_TXT('M') }], settings.voice) + langVoiceNote();
    return h + '</div><div class="fixbar"><button class="cta" data-a="start">' + esc(t('cfg.start')) + '</button></div></div>';
  };
  SCR.history = function () {
    var hl = LS.get(K.hist, []) || [], h = '<div class="vs">' + top(true, true) + '<div class="pad"><h1 class="t">' + esc(t('h.title')) + '</h1>';
    hl.forEach(function (m, i) {
      var d = new Date(m.ts), ds = d.toLocaleDateString(settings.lang === 'pt' ? 'pt-BR' : settings.lang) + ' ' + d.toLocaleTimeString(settings.lang === 'pt' ? 'pt-BR' : settings.lang, { hour: '2-digit', minute: '2-digit' });
      var nm = m.names || ['', ''];
      h += '<button class="hi" data-a="hist:' + i + '"><div class="m"><span>' + esc(ds) + '</span><span>' + esc(fmtLabel(m.cfg && m.cfg.sets || 2)) + '</span></div>' +
        [0, 1].map(function (side) { return '<div class="n' + (m.winner === side ? ' w' : '') + '"><i></i><span>' + esc(nm[side] || t(side ? 'cfg.playerB' : 'cfg.playerA').replace(/ \(.*\)/, '')) + '</span></div>'; }).join('') +
        '<div class="f"><b>' + esc(setsStr(m.sets, m.tbScores)) + '</b><span>' + esc(E.hhmm(m.dur || 0)) + '</span></div></button>';
    });
    if (!hl.length) h += '<p class="mut">' + esc(t('h.none')) + '</p>';
    else h += '<button class="card ghost" data-a="histclear" style="margin-top:8px">' + esc(t('h.clear')) + '</button>';
    return h + '</div></div>';
  };
  SCR.histd = function () {
    var hl = LS.get(K.hist, []) || [], m = hl[histIdx];
    if (!m) return SCR.history();
    var nm = m.names || ['', ''], c = m.cfg || E.normCfg({}), d = new Date(m.ts);
    var h = '<div class="vs">' + top(true, true) + '<div class="pad"><h1 class="t">' + esc(t('h.of', d.toLocaleDateString(settings.lang === 'pt' ? 'pt-BR' : settings.lang))) + '</h1>' +
      '<div style="background:var(--navy);color:#fff;border-radius:8px;padding:9px 14px;font-size:15px;margin-bottom:8px">' + esc(t('h.end')) + ' · ' + esc(E.hhmm(m.dur || 0)) + '</div>';
    [0, 1].forEach(function (side) {
      var parts = (nm[side] || t(side ? 'cfg.playerB' : 'cfg.playerA').replace(/ \(.*\)/, '')).split(' / ');
      h += '<div style="display:flex;gap:4px;margin-bottom:6px"><div style="flex:1;min-width:0;background:var(--' + (side ? 'panel' : 'navy') + ');color:#fff;font-weight:700;font-size:16px;padding:8px 12px;line-height:1.25;display:flex;flex-direction:column;justify-content:center">' +
        parts.map(function (p, i) { return '<span>' + esc(p) + (i < parts.length - 1 ? ' |' : '') + '</span>'; }).join('') + '</div>' +
        m.sets.map(function (g, k) {
          var win = g[side] > g[1 - side], tb = m.tbScores && m.tbScores[k] ? m.tbScores[k][side] : null;
          return '<div style="width:50px;height:58px;background:var(--navy);display:flex;align-items:center;justify-content:center;font-size:27px;font-weight:' + (win ? 600 : 400) + ';color:' + (win ? 'var(--lime)' : 'var(--gray)') + '">' + g[side] + (tb !== null ? '<sup style="font-size:13px;margin-top:-14px">' + tb + '</sup>' : '') + '</div>';
        }).join('') + '</div>';
    });
    h += '<div class="sec">' + esc(t('h.details')) + '</div>';
    var rows = [[t('h.winner'), nm[m.winner] || t(m.winner ? 'cfg.playerB' : 'cfg.playerA').replace(/ \(.*\)/, '')], [t('h.duration'), E.hhmm(m.dur || 0)],
      [t('h.format'), fmtLabel(c.sets) + ' · ' + c.games + ' games · ' + t('cfg.tiebreak') + ' ' + c.tbPoints], [t('h.points'), t(c.noAd ? 'cfg.noad' : 'cfg.ad')],
      [t('h.warmup'), c.heat ? fmtSec(c.heatSec) : t('without')], [t('h.change'), c.brkChange ? fmtSec(c.brkChangeSec) : t('without')]];
    rows.forEach(function (r) { h += '<div class="kv"><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>'; });
    return h + '<button class="card ghost" data-a="histdel" style="margin-top:12px;color:#b3261e;border-color:#b3261e">' + esc(t('h.delete')) + '</button></div></div>';
  };
  SCR.voices = function () {
    var v = settings.voice, L = effLang(), miss = missing(v, L), ok = countHave(v, L) === TOTAL;
    var h = '<div class="vs">' + top(true, true) + '<div class="pad"><h1 class="t">' + esc(t('v.title')) + '</h1>';
    h += '<div class="lbl">' + esc(t('cfg.language')) + '</div>' + opts('lang', [{ v: 'pt', t: LANG_NAME.pt }, { v: 'en', t: LANG_NAME.en }, { v: 'es', t: LANG_NAME.es }], settings.lang);
    h += '<div class="lbl">' + esc(t('cfg.voice')) + '</div>' + opts('voice', [{ v: 'F', t: VOICE_TXT('F'), s: countHave('F', L) + '/' + TOTAL }, { v: 'M', t: VOICE_TXT('M'), s: countHave('M', L) + '/' + TOTAL }], v);
    h += '<div class="status' + (ok ? '' : ' warn') + '"><div style="display:flex;justify-content:space-between;gap:8px"><b>' + esc(LANG_NAME[L]) + ' · ' + esc(VOICE_TXT(v)) + '</b><b style="color:' + (ok ? 'var(--lime)' : '#facc15') + '">' + esc(t('v.tracks', countHave(v, L), TOTAL)) + '</b></div>' +
      (ok ? '<div class="miss">' + esc(t('v.ready')) + '</div>' : '<div class="miss">' + esc(t('v.missing', trackList(miss))) + '</div>') + '</div>';
    h += '<div class="status"><div id="syncLine">' + esc(syncText() || t('sync.ok')) + '</div>' + syncBar('voiceBar') + '</div>';
    h += '<div class="vol"><span>' + esc(t('a.volume')) + '</span><input id="volRange" type="range" min="0" max="100" value="' + Math.round(settings.volume * 100) + '" aria-label="' + esc(t('a.volume')) + '"><button class="sbtn p" data-a="vtest">' + esc(t('v.test')) + '</button></div>';
    h += langVoiceNote();
    h += '<div class="sec">' + esc(t('v.advanced')) + '</div>';
    h += '<button class="card plain" style="padding:13px 16px" data-a="vsync"><b style="font-size:16px;font-weight:600">' + esc(t('v.sync')) + '</b></button>';
    h += '<details class="more"><summary>' + esc(t('v.import')) + '</summary><input id="impFiles" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" multiple hidden>' +
      '<button class="sbtn" id="impBtn" style="width:100%;margin-top:10px">' + esc(t('v.importBtn', VOICE_TXT(v).toLowerCase())) + '</button><p id="impProgress" class="mut" style="color:#fff"></p><p id="impResult" class="mut" style="color:#fff"></p></details>';
    h += '<button class="card plain" style="padding:13px 16px;margin-top:10px;color:#ff9b93" data-a="vclear"><b style="font-size:16px;font-weight:600">' + esc(t('v.remove')) + '</b></button>';
    return h + '<p id="persist" class="mut"></p></div></div>';
  };
  function refreshStep() { if (current === 'voices') render(true); }

  /* ---------- navegação e eventos das telas verticais ---------- */
  function render(keepScroll) {
    var isGame = current === 'game', bt = $('boot'); if (bt) bt.remove();
    $('app').hidden = isGame; $('game').hidden = !isGame;
    document.body.style.background = isGame ? '#071327' : '';
    var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.setAttribute('content', '#071327');
    if (isGame) { fitStage(); renderGame(); updateRotate(); return; }
    var y = window.scrollY;
    $('app').innerHTML = SCR[current]();
    bindScreen();
    if (keepScroll) window.scrollTo(0, y);
  }
  function show(name, keepScroll) {
    var was = current; current = name;
    if (was === 'game' && name !== 'game') { exitLandscape(); releaseWake(); }
    closeModal(); render(keepScroll);
    if (!keepScroll && name !== 'game') window.scrollTo(0, 0);
  }
  function bindScreen() {
    var r = $('app');
    if (current === 'login') { $('loginBtn').onclick = doLogin; $('loginPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); }); }
    if (current === 'voices') {
      $('impBtn').onclick = function () { $('impFiles').click(); };
      $('impFiles').onchange = function (e) {
        var files = e.target.files, v = settings.voice; if (!files || !files.length) return;
        $('impProgress').textContent = t('imp.reading', 0, files.length);
        importFiles(effLang(), v, files).then(function (res) {
          e.target.value = ''; var msg = t('imp.saved', res.ok);
          if (res.ignored.length) msg += ' ' + t('imp.ignored', res.ignored.join(', '));
          if (res.bad.length) msg += ' ' + t('imp.bad', res.bad.join(', '));
          refreshStep(); setTimeout(function () { var el = $('impResult'); if (el) el.textContent = msg; }, 50);
        });
      };
      if (navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then(function (p) { var el = $('persist'); if (el) el.textContent = p ? t('v.persistOk') : t('v.persistNo'); });
    }
  }
  $('app').addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-dn')) {
      var i = +el.getAttribute('data-dn'); settings.dnames[i] = el.value; saveSettings();
      var b = $('df' + Math.floor(i / 2) + (i % 2)); if (b) b.textContent = el.value || t('cfg.player', i + 1);
    } else if (el.hasAttribute('data-sn')) { settings.names[+el.getAttribute('data-sn')] = el.value; saveSettings(); }
    else if (el.id === 'volRange') { settings.volume = el.value / 100; saveSettings(); if (gain) gain.gain.value = settings.mute ? 0 : settings.volume; }
  });
  $('app').addEventListener('click', function (e) {
    var el = e.target.closest('[data-a]'); if (!el) return;
    var a = el.getAttribute('data-a').split(':'), k = a[0];
    var BOOL = { noAd: 1, heat: 1, brkChange: 1, brkSet: 1, superTb: 1 };
    if (k === 'back') { show(current === 'histd' ? 'history' : current === 'admin' ? (authOk() ? 'home' : 'login') : 'home'); }
    else if (k === 'home') renderHome();
    else if (k === 'go') show(a[1]);
    else if (k === 'new') {
      var go = function () { openConfig(); };
      if (resumable()) confirmBox(t('home.newAsk'), t('home.new'), function () { LS.del(K.cur); go(); }); else go();
    }
    else if (k === 'logout') { LS.del(K.auth); show('login'); }
    else if (k === 'resume') { ensureCtx(); resumeMatch(); }
    else if (k === 'install') { if (installEvt) { installEvt.prompt(); installEvt = null; render(true); } }
    else if (k === 'mode') { settings.mode = a[1] === 'D' ? 'D' : 'S'; saveSettings(); render(true); }
    else if (k === 'df0' || k === 'df1') { settings.dfirst[+k.charAt(2)] = +a[1]; saveSettings(); render(true); }
    else if (k === 'first') { draft.firstServe = +a[1]; render(true); }
    else if (k === 'lang') { settings.lang = a[1]; saveSettings(); stopAudio(); preload(); render(true); }
    else if (k === 'voice') { settings.voice = a[1]; saveSettings(); stopAudio(); preload(); render(true); }
    else if (BOOL[k]) { draft[k] = a[1] === '1'; draft = E.normCfg(draft); render(true); }
    else if (k === 'sets' || k === 'games' || k === 'tbPoints') { draft[k] = +a[1]; draft = E.normCfg(draft); render(true); }
    else if (k === 'step') { var key = a[1], lim = key === 'brkChangeSec' ? [30, 600] : [30, 900]; draft[key] = Math.max(lim[0], Math.min(lim[1], draft[key] + (+a[2]))); render(true); }
    else if (k === 'start') { settings.cfg = E.normCfg(draft); saveSettings(); startMatch(); }
    else if (k === 'hist') { histIdx = +a[1]; show('histd'); }
    else if (k === 'histdel') { var hl = LS.get(K.hist, []); hl.splice(histIdx, 1); LS.set(K.hist, hl); toast(t('h.deleted')); show('history'); }
    else if (k === 'histclear') confirmBox(t('h.clearAsk'), t('h.clear'), function () { LS.del(K.hist); show('history', true); });
    else if (k === 'vtest') { ensureCtx(); playTracks([27]); }
    else if (k === 'vsync') syncVoices(true);
    else if (k === 'vclear') confirmBox(t('v.removeAsk'), t('remove'), function () { idbDelPrefix('').then(function () { bufCache = {}; return refreshHave(); }).then(refreshStep); });
  });
  function openConfig() {
    settings.names = ['', '']; settings.dnames = ['', '', '', '']; settings.dfirst = [0, 0]; saveSettings();   /* nova partida sempre começa sem nomes */
    draft = E.normCfg(settings.cfg); show('config');
  }

  /* ---------- jogo ---------- */
  var CALLS = [[29, 'Let'], [32, 'Out'], [27, 'Time'], [38, 'Play'], [33, 'Quiet, please'], [31, 'Foot fault'], [34, 'Double fault'], [30, 'Warning'], [37, 'Time violation'], [35, 'Code violation'], [36, 'Point penalty']];
  var S = null, lastSay = 0, lastTick = 0, ticker = null, lastSave = 0, saved = false, lastTap = [0, 0], ov = null, hideBars = false, lastTouch = Date.now(), wake = null, cr = null, nmd = null, lastKey = '', lastClock = '';
  var REMOTE_ON = false;   /* indicador do controle remoto: liga junto com a tela de controle remoto */
  var W = 915.58, H = 412;

  function trim20(n) { return String(n || '').trim().slice(0, 20); }
  function startMatch() {
    ensureCtx(); preload();
    S = E.reset(settings.cfg); S.mode = settings.mode;
    S.names = settings.names.map(trim20);
    if (S.mode === 'D') {
      var dn = settings.dnames.map(trim20);
      S.team = [[dn[0], dn[1]], [dn[2], dn[3]]];
      S.dInit = [settings.dfirst[0], settings.dfirst[1]];
      S.d = { next: S.dInit.slice(), tbStart: [0, 0], tbFirst: 0 }; S.dh = []; S.dhf = [];
    }
    lastSay = S.sayId; saved = false; ov = null; hideBars = false;
    persist(true); enterGame();
  }
  function resumeMatch() {
    var cur = resumable(); if (!cur) return;
    S = cur.s; S.cfg = E.normCfg(S.cfg); S.names = S.names || ['', '']; S.mode = S.mode === 'D' ? 'D' : 'S';
    S.future = S.future || []; S.tbScores = S.tbScores || [];
    if (S.started === undefined) S.started = (S.phase === 'jogo' || S.phase === 'intervalo' || (S.clock || 0) > 0);
    if (S.mode === 'D') { S.dh = S.dh || []; S.dhf = S.dhf || []; S.dInit = S.dInit || [0, 0]; }
    lastSay = S.sayId; saved = false; ov = null; hideBars = false;
    if (S.phase !== 'ocioso') { S.paused = true; S.msg = 'Partida retomada.'; S.tracks = []; }
    preload(); enterGame();
  }
  function persist(force) {
    if (!S) return;
    var now = Date.now();
    if (!force && now - lastSave < 4000) return;
    lastSave = now; LS.set(K.cur, { cfg: S.cfg, s: S, savedAt: now });
  }
  function enterGame() {
    lastTick = performance.now(); lastTouch = Date.now(); lastKey = '';
    if (!ticker) ticker = setInterval(onTick, 250);
    show('game');
    requestFullscreenLandscape(); requestWake();
    setTimeout(fitStage, 150);
  }
  function leaveGame() { persist(true); ov = null; renderHome(); }
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
  function exitLandscape() {
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
  }
  function requestWake() {
    if (!settings.keepAwake || !('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (l) { wake = l; l.addEventListener('release', function () { wake = null; }); }).catch(function () {});
  }
  function releaseWake() { if (wake) { try { wake.release(); } catch (e) {} wake = null; } }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && current === 'game') { requestWake(); lastTick = performance.now(); } });

  var forceRot = false, rotShown = null;
  function fitStage() {
    var vw = window.innerWidth, vh = window.innerHeight, host = $('stageHost'), k;
    if (vh > vw && forceRot) {   /* em pé, mas o usuário escolheu ver o placar girado */
      k = Math.min(vh / W, vw / H);
      host.style.transform = 'translate(' + ((vw - H * k) / 2 + H * k) + 'px,' + ((vh - W * k) / 2) + 'px) rotate(90deg) scale(' + k + ')';
      return;
    }
    k = Math.min(vw / W, vh / H);
    host.style.transform = 'translate(' + ((vw - W * k) / 2) + 'px,' + ((vh - H * k) / 2) + 'px) scale(' + k + ')';
  }
  function updateRotate() {
    var portrait = window.innerHeight > window.innerWidth;
    if (!portrait || current !== 'game') forceRot = false;
    var want = current === 'game' && portrait && !forceRot, r = $('rotate');
    if (want && rotShown !== settings.lang) { r.innerHTML = '<div><div>' + esc(t('rot')) + '</div><button class="sbtn p" data-a="rotforce" style="margin-top:18px">' + esc(t('rot.force')) + '</button></div>'; rotShown = settings.lang; }
    if (!want) rotShown = null;
    r.hidden = !want;
    if (current === 'game') fitStage();
  }

  /* ---------- relógio, status e tempo ---------- */
  function clockText() {
    if (S.phase === 'aquecimento') return E.mmss(Math.ceil(S.heatLeft));
    if (S.phase === 'intervalo') return E.mmss(Math.ceil(S.brkLeft));
    return E.hhmm(S.clock);
  }
  function statusText() {
    var ph = S.phase;
    if (ph === 'ocioso') return t('g.ready');
    if (ph === 'fim') return t('g.end');
    if (S.paused) return t('g.paused');
    if (ph === 'aquecimento') return t('g.warmup');
    if (ph === 'intervalo') return t(S.brkKind === 'set' ? 'g.between' : 'g.change');
    var sit = E.situation(S);
    return sit.kind === 'match' ? t('g.match') : sit.kind === 'set' ? t('g.setpoint') : sit.kind === 'break' ? t('g.break') : sit.kind === 'tb' ? t('g.tb') : sit.kind === 'stb' ? t('g.stb') : t('g.setn', sit.n);
  }
  function onTick() {
    if (current !== 'game' || !S) return;
    var now = performance.now(), dt = (now - lastTick) / 1000; lastTick = now;
    if (dt > 0 && S.phase !== 'fim') E.tick(S, dt);
    var key = S.sayId + '|' + S.phase + '|' + S.paused + '|' + S.brkKind;
    if (key !== lastKey) { afterChange(false); return; }
    if (S.phase === 'jogo' && !S.paused && !ov && !hideBars && Date.now() - lastTouch > 5000) { hideBars = true; renderGame(); return; }
    var c = clockText();
    if (c !== lastClock) { lastClock = c; var e = $('ck'); if (e) e.textContent = c; var iv = $('ivr'); if (iv) iv.textContent = E.mmss(Math.ceil(S.brkLeft)); }
    persist(false);
  }
  function afterChange(forceSave) {
    if (S.sayId !== lastSay) { lastSay = S.sayId; playTracks(S.tracks); }
    if (S.phase === 'fim' && !saved) { saved = true; addHistory(); persist(true); }
    else persist(forceSave);
    lastKey = S.sayId + '|' + S.phase + '|' + S.paused + '|' + S.brkKind;
    renderGame();
  }

  /* ---------- duplas: quem saca e rodízio ---------- */
  function teamNames(side) { var t2 = S.team[side]; return [t2[0] || t('cfg.player', side * 2 + 1), t2[1] || t('cfg.player', side * 2 + 2)]; }
  function sideName(side) { return S.mode === 'D' ? teamNames(side).join(' / ') : (S.names && S.names[side]) || ''; }
  function setsSum() { return S.sets.reduce(function (a, g) { return a + g[0] + g[1]; }, 0); }
  function dServerIdx(side) {
    var d = S.d; if (!S.tb) return d.next[side];
    var t2 = Math.floor((S.pts[0] + S.pts[1] + 1) / 2);
    return (d.tbStart[side] + Math.floor(t2 / 2)) % 2;
  }
  function dAfter(p) {
    var d = S.d, ended = setsSum() > p.sum; if (!ended) return;
    if (p.tb) {
      var T = Math.floor((p.tot + 1) / 2) + 1, f = Math.ceil(T / 2), o = Math.floor(T / 2), first = d.tbFirst;
      d.next[first] = (d.tbStart[first] + f) % 2; d.next[1 - first] = (d.tbStart[1 - first] + o) % 2;
    } else d.next[p.serve] = 1 - d.next[p.serve];
    if (S.tb) { d.tbStart = d.next.slice(); d.tbFirst = S.serve; }
  }
  function displayNames(side) {   /* nomes mostrados na linha, com o índice de quem saca (ou -1) */
    var arr = S.mode === 'D' ? teamNames(side) : [(S.names && S.names[side]) || t(side ? 'cfg.playerB' : 'cfg.playerA').replace(/ \(.*\)/, '')];
    var srv = S.phase !== 'fim' && S.serve === side ? (S.mode === 'D' ? dServerIdx(side) : 0) : -1;
    return { arr: arr, srv: srv };
  }
  function undoPoint() {
    var n = S.history.length, D = S.mode === 'D', cur = D ? JSON.stringify(S.d) : null;
    E.undo(S);
    if (S.history.length < n && D && S.dh.length) { S.dhf = S.dhf || []; S.dhf.push(cur); S.d = JSON.parse(S.dh.pop()); }
  }
  function redoPoint() {
    var n = S.future.length, D = S.mode === 'D', cur = D ? JSON.stringify(S.d) : null;
    E.redo(S);
    if (S.future.length < n && D && S.dhf && S.dhf.length) { S.dh.push(cur); S.d = JSON.parse(S.dhf.pop()); }
  }

  /* ---------- desenho do placar (SVG na área 915,58 x 412) ---------- */
  var SP = ' pointer-events="all" fill="transparent"';
  function hitRect(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + SP + '/>'; }
  function plusBtn(side, y) {
    var cx = 802.95, cy = y + 45;
    return '<g data-a="pt' + side + '" role="button" aria-label="' + esc(t(side ? 'cfg.playerB' : 'cfg.playerA')) + '"><rect x="757.95" y="' + y + '" width="90" height="90" rx="5.26" fill="#071327"/>' +
      '<rect x="' + (cx - 5.25) + '" y="' + (cy - 25.5) + '" width="10.5" height="51" fill="#fff"/><rect x="' + (cx - 25) + '" y="' + (cy - 5.25) + '" width="50" height="10.5" fill="#fff"/></g>';
  }
  function centerIcon() {
    var ph = S.phase, F = '#f8f2f6';
    if (ph === 'fim') return { svg: '<g opacity=".6">' + ICONS.pause + '</g>', act: '' };
    if (S.paused || ph === 'ocioso') return { svg: '<polygon points="446,365 446,397.5 473,381" fill="' + F + '"/>', act: 'main' };
    if (ph === 'aquecimento' || ph === 'intervalo') return { svg: '<polygon points="443,365 443,397.5 465,381" fill="' + F + '"/><rect x="469" y="365" width="5.5" height="32.5" fill="' + F + '"/>', act: 'main' };
    return { svg: ICONS.pause, act: 'main' };
  }
  function gameSvg() {
    var ph = S.phase, v = E.view(S), m = S.setIdx, firstX = m > 0 ? 547.45 - 68.6 * (m - 1) : 613.05;
    var showPts = ph === 'jogo', cur = S.sets[S.setIdx], h = '';
    h += '<rect width="' + W + '" height="' + H + '" fill="#6f98d0"/>';
    /* conteúdo */
    var b = '<text id="stt" x="68.96" y="129.37" font-size="25" fill="#071327">' + esc(statusText()) + '</text>';
    b += '<rect x="67.05" y="140.71" width="612" height="130.58" fill="#071327"/>';
    b += '<rect x="101.02" y="205" width="' + Math.max(40, firstX - 36.7 - 101.02) + '" height="2" fill="#3e485c"/>';
    for (var j = 0; j < m; j++) {
      var x = 547.45 - 68.6 * (m - 1 - j), g = S.sets[j], tb = S.tbScores && S.tbScores[j];
      b += '<rect x="' + x + '" y="205" width="60" height="2" fill="#3e485c"/>';
      [0, 1].forEach(function (sd) {
        var win = g[sd] > g[1 - sd], y = sd ? 251.24 : 186.56;
        b += '<text x="' + (x + 30) + '" y="' + y + '" font-size="45" text-anchor="middle" font-weight="' + (win ? 600 : 400) + '" fill="' + (win ? '#c9e727' : '#dadada') + '">' + g[sd] + '</text>';
        if (tb) b += '<text x="' + (x + 42.5) + '" y="' + (y - 16.4) + '" font-size="30" font-weight="' + (win ? 600 : 400) + '" fill="' + (win ? '#c9e727' : '#dadada') + '">' + tb[sd] + '</text>';
      });
    }
    b += '<rect x="613.05" y="140.71" width="66" height="130.58" fill="#161ffe"/><rect x="613.05" y="205" width="66" height="2" fill="#071327"/>';
    if (ph !== 'ocioso' && ph !== 'aquecimento') [0, 1].forEach(function (sd) { b += '<text x="646.05" y="' + (sd ? 251.24 : 186.56) + '" font-size="45" text-anchor="middle" font-weight="600" fill="#fff">' + cur[sd] + '</text>'; });
    b += '<rect x="678.52" y="140.71" width="66" height="130.58" fill="#21364d"/>';
    if (showPts) [0, 1].forEach(function (sd) { b += '<text x="711.52" y="' + (sd ? 252.08 : 187.41) + '" font-size="45" text-anchor="middle" fill="#fff">' + esc(v.game[sd]) + '</text>'; });
    [0, 1].forEach(function (sd) {
      var dn = displayNames(sd), y = sd ? 249.77 : 185.1, tsp = '';
      dn.arr.forEach(function (n, i) { tsp += '<tspan id="ns' + sd + '_' + i + '">' + esc(n) + '</tspan>' + (i < dn.arr.length - 1 ? '<tspan> | </tspan>' : ''); });
      b += '<text id="nm' + sd + '" x="98.99" y="' + y + '" font-size="38" font-weight="700" fill="#fff" data-srv="' + dn.srv + '" data-y="' + y + '">' + tsp + '</text>';
      if (dn.srv >= 0) b += '<g id="bl' + sd + '"><circle cx="82" cy="' + (y - 16.7) + '" r="7.5" fill="#c9e727"/></g><rect id="ul' + sd + '" x="0" y="' + (y + 4.6) + '" width="0" height="2" fill="#c9e727"/>';
    });
    b += plusBtn(0, 86.14) + plusBtn(1, 235.86);
    b += '<rect x="757.95" y="182.22" width="90" height="47.56" rx="5.26" fill="#071327"/><text id="ck" x="802.95" y="216.27" font-size="35" text-anchor="middle" fill="#fff" letter-spacing="-0.35">' + esc(clockText()) + '</text>';
    h += '<g class="body" style="transform:' + (hideBars ? 'translate(457.79px,206px) scale(1.12) translate(-457.79px,-206px)' : 'none') + '">' + b + '</g>';
    /* barras */
    h += '<g class="bar" style="transform:' + (hideBars ? 'translateY(-65px)' : 'none') + '"><rect width="' + W + '" height="65" fill="#071327"/>' +
      '<g transform="translate(36 16) scale(0.35)">' + ICONS.logo + '</g>' +
      '<g data-a="aj" role="button" aria-label="' + esc(t('a.title')) + '">' + ICONS.sliders + hitRect(748, 2, 64, 61) + '</g>' +
      '<g data-a="home" role="button" aria-label="' + esc(t('home')) + '">' + ICONS.home + hitRect(825, 2, 64, 61) + '</g></g>';
    var ci = centerIcon(), canUndo = S.history.length && ph !== 'ocioso', canRedo = S.future.length > 0 && ph !== 'ocioso';
    h += '<g class="bar" style="transform:' + (hideBars ? 'translateY(65px)' : 'none') + '"><rect y="347" width="' + W + '" height="65" fill="#071327"/>' +
      '<g' + (canUndo ? ' data-a="undo" role="button"' : '') + ' aria-label="' + esc(t('g.undo')) + '" opacity="' + (canUndo ? 1 : 0.6) + '">' + ICONS.undo + hitRect(329.5, 349, 64, 61) + '</g>' +
      '<g' + (canRedo ? ' data-a="redo" role="button"' : '') + ' aria-label="' + esc(t('g.redo')) + '" opacity="' + (canRedo ? 1 : 0.6) + '">' + ICONS.redo + hitRect(521, 349, 64, 61) + '</g>' +
      '<g' + (ci.act ? ' data-a="' + ci.act + '" role="button"' : '') + '>' + ci.svg + hitRect(425, 349, 65, 61) + '</g>' +
      '<g data-a="calls" role="button" aria-label="' + esc(t('g.calls')) + '">' + ICONS.mega + hitRect(822, 349, 64, 61) + '</g>' +
      (REMOTE_ON ? '<g id="rem" data-a="remote">' + ICONS.remotepill + '<g class="blink">' + ICONS.remoteball + '</g>' + hitRect(2, 349, 50, 61) + '</g>' : '') + '</g>';
    return h;
  }
  function fitNames() {
    var m = S.setIdx, firstX = m > 0 ? 547.45 - 68.6 * (m - 1) : 613.05, avail = firstX - 36.7 - 98.99;
    [0, 1].forEach(function (sd) {
      var el = $('nm' + sd); if (!el) return;
      var size = 38; el.setAttribute('font-size', size);
      try { while (el.getComputedTextLength() > avail && size > 14) { size -= 1; el.setAttribute('font-size', size); } } catch (e) {}
      var srv = +el.getAttribute('data-srv'), y = +el.getAttribute('data-y');
      if (srv >= 0) {
        var ts = $('ns' + sd + '_' + srv), ul = $('ul' + sd), bl = $('bl' + sd);
        try { var bb = ts.getBBox(); ul.setAttribute('x', bb.x); ul.setAttribute('width', bb.width); } catch (e) {}
        if (bl) bl.setAttribute('transform', 'translate(0 ' + ((size - 38) * 0.44) + ')');
      }
    });
  }
  function renderGame() {
    if (!S) return;
    $('sv').innerHTML = gameSvg();
    fitNames();
    lastClock = clockText();
    var html = overlayHtml();
    var o = $('ov');
    if (html) { o.innerHTML = html; o.hidden = false; bindOverlay(); } else { o.innerHTML = ''; o.hidden = true; }
  }

  /* ---------- tela do administrador: usuários e senhas ---------- */
  var AD = null, adTaps = [];
  function ghRepoGuess() { var h = location.hostname, p = location.pathname.split('/')[1]; return /\.github\.io$/.test(h) && p ? h.split('.')[0] + '/' + p : ''; }
  function cfgText(cfg) { return '/* Acesso: só os códigos de verificação de logins e senhas. Gerado pela tela de usuários do app. */\nwindow.PLACAR_ACCESS = ' + JSON.stringify(cfg, null, 2) + ';\n'; }
  function parseCfg(txt) { var i = txt.indexOf('{'), j = txt.lastIndexOf('}'); return JSON.parse(txt.slice(i, j + 1)); }
  function adUsers(list) { return (list || []).map(function (u, i) { return { name: u.name || ('Acesso antigo ' + (i + 1)), salt: u.salt, hash: u.hash }; }); }
  function openAdmin() {
    var a = window.PLACAR_ACCESS || {};
    AD = { iter: a.iter || 150000, users: adUsers(a.users), dirty: false, busy: false, msg: '', ok: false, repo: LS.get('placar:ghrepo', '') || ghRepoGuess() };
    show('admin');
    fetch('auth-config.js?v=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : null; }).then(function (txt) {
      if (!txt || !AD || AD.dirty || current !== 'admin') return;
      var c = parseCfg(txt); AD.iter = c.iter || AD.iter; AD.users = adUsers(c.users); render(true);
    }).catch(function () {});
  }
  SCR.admin = function () {
    var tok = LS.get(K.gh, ''), h = '<div class="vs">' + top(true, false) + '<div class="pad"><h1 class="t">Usuários</h1><p class="mut" style="margin-top:0">Quem pode entrar no app. Login e senha não diferenciam maiúsculas de minúsculas.</p>';
    if (!AD.users.length) h += '<div class="note warn"><b>Sem usuários</b>Ninguém consegue entrar no app.</div>';
    AD.users.forEach(function (u, i) {
      h += '<div class="kv" style="align-items:center"><span style="color:#fff;font-weight:700;font-size:17px">' + esc(u.name) + '</span><button class="sbtn d" data-adm="rm:' + i + '">Remover</button></div>';
    });
    h += '<div class="sec">Adicionar usuário</div><div class="grid g2"><input class="inp" id="admUser" placeholder="Usuário" autocomplete="off" autocapitalize="none" maxlength="30"><input class="inp" id="admPass" placeholder="Senha" autocomplete="off" autocapitalize="none" maxlength="40"></div><button class="sbtn p" style="width:100%;margin-top:8px" data-adm="add">Adicionar</button>';
    if (AD.msg) h += '<div class="' + (AD.ok ? 'note' : 'err') + '" style="margin-top:12px;color:#fff">' + esc(AD.msg) + '</div>';
    h += '<div class="sec">Publicar</div>';
    h += AD.dirty ? '<div class="note warn"><b>Alterações ainda não valem</b>Toque em Publicar para valerem para todos.</div>' : '<div class="status">Tudo publicado.</div>';
    h += '<button class="cta" style="margin-top:12px" data-adm="pub"' + (AD.busy || !AD.dirty ? ' disabled' : '') + '>' + (AD.busy ? '<span class="spin sm dark" aria-hidden="true"></span> Publicando...' : 'Publicar alterações') + '</button>';
    h += '<div class="sec">Chave do GitHub</div>';
    if (tok) h += '<div class="status">Chave guardada neste aparelho.</div><button class="sbtn" style="width:100%;margin-top:8px" data-adm="tokdel">Esquecer a chave</button>';
    else h += '<div class="note"><b>Falta a chave (uma vez só)</b>1. Entre em github.com e abra github.com/settings/personal-access-tokens/new<br>2. Em Repository access, escolha Only select repositories e marque o repositório do app.<br>3. Em Permissions, abra Repository permissions e deixe Contents em Read and write.<br>4. Gere a chave e cole abaixo.</div><input class="inp" id="admTok" type="password" placeholder="Cole a chave aqui" autocomplete="off" style="margin-top:10px"><button class="sbtn p" style="width:100%;margin-top:8px" data-adm="tok">Guardar chave</button>';
    h += '<details class="more"><summary>Repositório e envio manual</summary><div class="lbl" style="color:#dadada">Repositório (dono/nome)</div><input class="inp" id="admRepo" value="' + esc(AD.repo) + '" placeholder="dono/nome" autocomplete="off" autocapitalize="none"><button class="sbtn" style="width:100%;margin-top:8px" data-adm="repo">Guardar repositório</button><button class="sbtn" style="width:100%;margin-top:8px" data-adm="dl">Baixar auth-config.js (para subir à mão)</button></details>';
    return h + '</div></div>';
  };
  function admSay(msg, ok) { AD.msg = msg; AD.ok = !!ok; AD.busy = false; render(true); }
  function admPublish() {
    var tok = LS.get(K.gh, '');
    if (!tok) { admSay('Cole e guarde a chave do GitHub primeiro.'); return; }
    if (!/^[^\/\s]+\/[^\/\s]+$/.test(AD.repo)) { admSay('Informe o repositório no formato dono/nome, em "Repositório e envio manual".'); return; }
    if (!AD.users.length && !window.confirm('Sem usuários, ninguém consegue entrar no app, nem você. Publicar mesmo assim?')) return;
    AD.busy = true; AD.msg = ''; render(true);
    var text = cfgText({ iter: AD.iter, users: AD.users }), url = 'https://api.github.com/repos/' + AD.repo + '/contents/auth-config.js', hdr = { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json' };
    function fail(r) {
      if (r.status === 401) return 'O GitHub não aceitou a chave. Gere outra, esqueça esta e cole de novo.';
      if (r.status === 403) return 'A chave não tem permissão para gravar neste repositório. Em Permissions, deixe Contents em Read and write.';
      if (r.status === 404) return 'Não achei o auth-config.js em ' + AD.repo + '. Confira o nome do repositório e se a chave tem acesso a ele.';
      return 'O GitHub respondeu com erro ' + r.status + '.';
    }
    function attempt(n) {
      return fetch(url, { headers: hdr, cache: 'no-store' }).then(function (g) {
        if (!g.ok) return admSay(fail(g));
        return g.json().then(function (j) {
          return fetch(url, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr), body: JSON.stringify({ message: 'Atualizar usuários do app', content: btoa(unescape(encodeURIComponent(text))), sha: j.sha }) }).then(function (p) {
            if (p.ok) { AD.dirty = false; window.PLACAR_ACCESS = { iter: AD.iter, users: AD.users }; return admSay('Publicado. Vale em 1 a 2 minutos.', true); }
            if ((p.status === 409 || p.status === 422) && n < 1) return attempt(n + 1);
            return admSay(fail(p));
          });
        });
      });
    }
    attempt(0).catch(function () { admSay('Sem internet ou o GitHub não respondeu. Tente de novo.'); });
  }
  function admAdd() {
    var u = ($('admUser').value || '').trim(), p = ($('admPass').value || '').trim();
    if (!u || !p) { admSay('Preencha o usuário e a senha.'); return; }
    if (p.length < 4) { admSay('A senha precisa ter pelo menos 4 caracteres.'); return; }
    if (AD.users.some(function (x) { return x.name.toLowerCase() === u.toLowerCase(); })) { admSay('Já existe um usuário com esse nome.'); return; }
    var salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    derive(u, p, salt, AD.iter).then(function (d) {
      AD.users.push({ name: u, salt: salt, hash: d.h }); AD.dirty = true; admSay(u + ' adicionado. Toque em Publicar.', true);
    }).catch(function () { admSay('Não foi possível criar o acesso neste aparelho.'); });
  }
  $('app').addEventListener('click', function (e) {
    var lg = e.target.closest('svg.logo, #loginLogo');
    if (lg) { var now = Date.now(); adTaps = adTaps.filter(function (x) { return now - x < 4000; }); adTaps.push(now); if (adTaps.length >= 5) { adTaps = []; openAdmin(); } return; }
    var el = e.target.closest('[data-adm]'); if (!el || !AD) return;
    var a = el.getAttribute('data-adm').split(':'), k = a[0];
    if (k === 'rm') { var u = AD.users[+a[1]]; if (u) confirmBox('Remover o usuário ' + esc(u.name) + '?', t('remove'), function () { AD.users.splice(+a[1], 1); AD.dirty = true; AD.msg = ''; render(true); }); }
    else if (k === 'add') admAdd();
    else if (k === 'pub') admPublish();
    else if (k === 'tok') { var v = ($('admTok').value || '').trim(); if (v) { LS.set(K.gh, v); admSay('Chave guardada neste aparelho.', true); } else admSay('Cole a chave no campo.'); }
    else if (k === 'tokdel') { LS.del(K.gh); admSay('Chave esquecida.', true); }
    else if (k === 'repo') { AD.repo = ($('admRepo').value || '').trim(); LS.set('placar:ghrepo', AD.repo); admSay('Repositório guardado.', true); }
    else if (k === 'dl') {
      var blob = new Blob([cfgText({ iter: AD.iter, users: AD.users })], { type: 'text/javascript' }), a2 = document.createElement('a');
      a2.href = URL.createObjectURL(blob); a2.download = 'auth-config.js'; document.body.appendChild(a2); a2.click(); setTimeout(function () { URL.revokeObjectURL(a2.href); a2.remove(); }, 3000);
    }
  });
  window.__admin = { open: openAdmin, state: function () { return AD; } };

  /* ---------- janelas sobre o placar ---------- */
  function ob(label, act, cls, style) { return '<button class="ob' + (cls ? ' ' + cls : '') + '" data-a="' + act + '"' + (style ? ' style="' + style + '"' : '') + '>' + label + '</button>'; }
  function xBtn() { return '<button class="ob x" data-a="close" aria-label="' + esc(t('close')) + '">' + ui('x', 22) + '</button>'; }
  function row(label, sub, act, extra) { return '<button class="ob row" data-a="' + act + '"><span>' + label + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (extra || ui('chev', 20, '#dadada')) + '</button>'; }
  function toggle(on) { return '<span style="width:52px;height:28px;border-radius:14px;background:' + (on ? 'var(--lime)' : '#3e485c') + ';position:relative;flex:none"><span style="position:absolute;top:3px;' + (on ? 'right' : 'left') + ':3px;width:22px;height:22px;border-radius:50%;background:' + (on ? '#071327' : '#fff') + '"></span></span>'; }
  function stepBox(act, val, big) {
    return '<div style="display:flex;align-items:center;justify-content:center;gap:3px"><button class="stb" style="width:36px" data-a="' + act + ':-1" aria-label="-">' + ui('minus', 18) + '</button><div class="stv" style="min-width:40px;font-size:' + (big || 26) + 'px">' + esc(val) + '</div><button class="stb" style="width:36px" data-a="' + act + ':1" aria-label="+">' + ui('plus', 18) + '</button></div>';
  }
  function serverLabel() { var d = displayNames(S.serve); return d.arr.length === 1 ? d.arr[0] : d.arr[d.srv]; }
  function overlayHtml() {
    var ph = S.phase, c = S.cfg;
    if (ov === 'calls') {
      return '<div class="oc" style="width:780px"><div class="hd"><h2>' + esc(t('g.calls')) + '</h2>' + xBtn() + '</div><div class="ogrid" style="grid-template-columns:repeat(4,1fr)">' +
        CALLS.map(function (cl) { return ob(esc(cl[1]), 'call:' + cl[0], '', 'min-height:62px;font-size:20px'); }).join('') + '</div></div>';
    }
    if (ov === 'aj') {
      var ivs = (c.brkChange ? fmtSec(c.brkChangeSec) : t('a.noBreak')) + ' · ' + (c.brkSet ? fmtSec(c.brkSetSec) : t('a.noBreak'));
      return '<div class="oc" style="width:860px"><div class="hd"><h2>' + esc(t('a.title')) + '</h2>' + xBtn() + '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px"><div class="ogrid" style="align-content:start">' +
        '<div class="olbl">' + esc(t('a.audio')) + '</div>' +
        '<div class="ob row" style="cursor:default"><span>' + esc(t('a.volume')) + '</span><input type="range" min="0" max="100" value="' + Math.round(settings.volume * 100) + '" data-svol aria-label="' + esc(t('a.volume')) + '" style="width:48%"><b id="volpct">' + Math.round(settings.volume * 100) + '%</b></div>' +
        row(esc(t('a.langvoice')), esc(LANG_NAME[settings.lang] + ' · ' + VOICE_TXT(settings.voice)), 'ajx:voz') +
        row(esc(t('a.awake')), '', 'ajx:awake', toggle(settings.keepAwake)) +
        '<div class="olbl" style="margin-top:4px">' + esc(t('a.exit')) + '</div><div class="ogrid" style="grid-template-columns:1fr 1fr">' + ob(esc(t('a.saveExit')), 'exit:save') + ob(esc(t('a.reset')), 'ajx:reset', '', 'color:#ff9b93') + '</div></div>' +
        '<div class="ogrid" style="align-content:start"><div class="olbl">' + esc(t('a.match')) + '</div>' +
        row(esc(t('a.fixScore')), '', 'ajx:cr') + row(esc(t('a.fixNames')), '', 'ajx:nm') + row(esc(t('a.server')), esc(t('a.serverNow', serverLabel())), 'ajx:srv') +
        row(esc(t('a.breaks')), esc(t('a.breaksSub', ivs)), 'ajx:ivl') + row(esc(t('a.endEarly')), esc(t('a.endEarlySub')), 'ajx:end') + '</div></div></div>';
    }
    if (ov === 'voz') {
      return '<div class="oc" style="width:600px"><div class="hd"><h2>' + esc(t('a.langvoice')) + '</h2>' + xBtn() + '</div><div class="olbl">' + esc(t('cfg.language')) + '</div><div class="ogrid" style="grid-template-columns:repeat(3,1fr)">' +
        ['pt', 'en', 'es'].map(function (l) { return ob(esc(LANG_NAME[l]), 'lang:' + l, settings.lang === l ? 'on' : ''); }).join('') + '</div><div class="olbl" style="margin-top:10px">' + esc(t('cfg.voice')) + '</div><div class="ogrid" style="grid-template-columns:1fr 1fr">' +
        ['F', 'M'].map(function (v) { return ob(esc(VOICE_TXT(v)), 'voice:' + v, settings.voice === v ? 'on' : ''); }).join('') + '</div>' +
        '<div class="ob row" style="cursor:default;margin-top:10px"><span>' + esc(t('a.volume')) + '</span><input type="range" min="0" max="100" value="' + Math.round(settings.volume * 100) + '" data-svol style="width:48%"><b id="volpct">' + Math.round(settings.volume * 100) + '%</b></div>' +
        '<div style="margin-top:8px">' + ob(esc(t('v.test')), 'vtest', '', 'width:100%') + '</div>' +
        (langAvail(settings.lang) ? '' : '<div class="sub" style="margin-top:10px;color:var(--lime)">' + esc(t('note.voiceEn', LANG_NAME[effLang()])) + '</div>') + '</div>';
    }
    if (ov === 'cr' && cr) {
      var nc = cr.sets.length + 1, tbm = !!S.tb, cols = '120px repeat(' + nc + ',1fr)', hd = '<div></div>';
      for (var i = 0; i < nc; i++) hd += '<div class="olbl" style="text-align:center;margin:0">' + esc(i === nc - 1 ? t('c.points') : t('c.set', i + 1)) + '</div>';
      var rowsH = '';
      [0, 1].forEach(function (sd) {
        rowsH += '<div class="ob" style="background:' + (sd ? '#21364d' : '#3a4a9a') + ';font-size:15px;justify-content:flex-start;min-height:50px;overflow:hidden">' + esc(nameText(S, sd).replace(/ \| /g, ' / ')) + '</div>';
        cr.sets.forEach(function (g, k) { rowsH += stepBox('cr:g:' + k + ':' + sd, g[sd]); });
        rowsH += stepBox('cr:p:' + sd, tbm ? cr.p[sd] : ['0', '15', '30', '40', 'AD'][cr.p[sd]]);
      });
      return '<div class="oc" style="width:890px"><div class="hd"><div><h2>' + esc(t('c.title')) + '</h2><div class="sub">' + esc(t('c.hint')) + '</div></div><div style="display:flex;gap:8px">' + ob(esc(t('cancel')), 'close') + ob(esc(t('apply')), 'crapply', 'p') + '</div></div>' +
        '<div style="display:grid;grid-template-columns:' + cols + ';gap:6px 6px;align-items:center">' + hd + rowsH + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-top:12px"><b style="font-size:17px;margin-right:4px">' + esc(t('c.whoServes')) + '</b>' +
        [0, 1].map(function (sd) { return ob(esc(nameText(S, sd).replace(/ \| /g, ' / ')), 'cr:srv:' + sd + ':0', cr.serve === sd ? 'on' : '', 'flex:1;font-size:15px;overflow:hidden'); }).join('') + '</div></div>';
    }
    if (ov === 'nm' && nmd) {
      var D = S.mode === 'D', box = function (sd) {
        var n = D ? 2 : 1, h = '<div style="flex:1;background:' + (sd ? '#21364d' : '#3a4a9a') + ';border-radius:10px;padding:12px"><div class="olbl" style="color:#fff">' + esc(t(D ? (sd ? 'cfg.teamB' : 'cfg.teamA') : (sd ? 'cfg.playerB' : 'cfg.playerA'))) + '</div>';
        for (var i = 0; i < n; i++) h += '<input class="oin" data-nm="' + (sd * 2 + i) + '" maxlength="20" autocomplete="off" value="' + esc(nmd[sd * 2 + i]) + '" style="margin-top:' + (i ? 8 : 0) + 'px" aria-label="' + esc(t('cfg.player', sd * 2 + i + 1)) + '">';
        return h + '</div>';
      };
      return '<div class="oc" style="width:860px"><div class="hd"><h2>' + esc(t('n.title')) + '</h2><div style="display:flex;gap:8px">' + ob(esc(t('cancel')), 'close') + ob(esc(t('save')), 'nmsave', 'p') + '</div></div><div style="display:flex;gap:14px">' + box(0) + box(1) + '</div></div>';
    }
    if (ov === 'srv') {
      var colH = function (sd) {
        var d = displayNames(sd), D2 = S.mode === 'D', h = '<div style="flex:1"><div class="olbl" style="text-align:center">' + esc(t(D2 ? (sd ? 'cfg.teamB' : 'cfg.teamA') : (sd ? 'cfg.playerB' : 'cfg.playerA'))) + '</div><div class="ogrid">';
        d.arr.forEach(function (n, i) { var on = S.serve === sd && (d.arr.length === 1 || (S.mode === 'D' ? dServerIdx(sd) : 0) === i); h += ob(esc(n) + (on ? ' ●' : ''), 'svset:' + sd + ':' + i, on ? 'on' : '', 'min-height:58px;font-size:21px'); });
        return h + '</div></div>';
      };
      return '<div class="oc" style="width:620px"><div class="hd"><h2>' + esc(t('sv.title')) + '</h2>' + xBtn() + '</div><div style="display:flex;gap:14px">' + colH(0) + colH(1) + '</div></div>';
    }
    if (ov === 'ivl') {
      var inIv = ph === 'intervalo', rowsI = '';
      [['brkChange', 'brkChangeSec', 'cfg.change', 'bc'], ['brkSet', 'brkSetSec', 'cfg.between', 'bs']].forEach(function (r) {
        var on = c[r[0]];
        rowsI += '<div style="display:flex;align-items:center;gap:8px;margin-top:8px"><div style="width:170px;font-size:20px;font-weight:700">' + esc(t(r[2])) + '</div>' + ob(esc(t('with')), 'ivl:' + r[3] + ':1', on ? 'on' : '', 'width:84px') + ob(esc(t('without')), 'ivl:' + r[3] + ':0', on ? '' : 'on', 'width:84px') +
          (on ? '<button class="stb" style="width:48px" data-a="ivl:' + r[3] + 'Sec:-30" aria-label="-30 s">' + ui('minus', 20) + '</button><div style="min-width:120px;text-align:center;font-size:22px;font-weight:700">' + esc(fmtSec(c[r[1]])) + '</div><button class="stb" style="width:48px" data-a="ivl:' + r[3] + 'Sec:30" aria-label="+30 s">' + ui('plus', 20) + '</button>' : '') + '</div>';
      });
      return '<div class="oc" style="width:700px"><div class="hd"><h2>' + esc(t('b.title')) + '</h2>' + xBtn() + '</div>' +
        '<div style="background:#21364d;border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:66px">' +
        (inIv ? '<div><div class="sub" style="margin:0">' + esc(t('b.running')) + '</div><div style="font-size:24px;font-weight:700">' + esc(t(S.brkKind === 'set' ? 'g.between' : 'g.change')) + ' · <span id="ivr">' + esc(E.mmss(Math.ceil(S.brkLeft))) + '</span></div></div><div style="display:flex;gap:8px">' + ob(esc(t('b.cancel')), 'ivl:cancel', 'p') + ob(esc(t('b.cut')), 'ivl:cut') + '</div>'
          : '<div style="font-size:18px;color:var(--gray)">' + esc(t('b.none')) + '</div>') + '</div>' +
        '<div class="olbl" style="margin-top:12px">' + esc(t('b.next')) + '</div>' + rowsI + '<div style="margin-top:14px">' + ob(esc(t('done')), 'close', 'p', 'width:100%') + '</div></div>';
    }
    if (ov === 'reset') return '<div class="oc" style="width:520px;text-align:center"><h2>' + esc(t('r.title')) + '</h2><div class="sub">' + esc(t('r.text')) + '</div><div class="sub" style="color:#ff9b93">' + esc(t('r.warn')) + '</div><div class="ogrid" style="grid-template-columns:1fr 1fr;margin-top:14px">' + ob(esc(t('cancel')), 'close') + ob(esc(t('r.do')), 'resetyes', 'd') + '</div></div>';
    if (ov === 'exit') return '<div class="oc" style="width:560px;text-align:center"><h2>' + esc(t('x.title')) + '</h2><div class="sub">' + esc(t(ph === 'fim' ? 'x.text2' : 'x.text1')) + '</div><div style="margin-top:14px">' + ob(esc(t('x.save')), 'exit:save', 'p', 'width:100%') + '</div><div class="ogrid" style="grid-template-columns:1fr 1fr;margin-top:8px">' + ob(esc(t('x.nosave')), 'exit:nosave', 'd') + ob(esc(t('x.keep')), 'close') + '</div></div>';
    if (ov === 'end') return '<div class="oc" style="width:600px;text-align:center"><h2>' + esc(t('e.title')) + '</h2><div class="sub">' + esc(t('e.text')) + '</div><div class="ogrid" style="grid-template-columns:1fr 1fr;margin-top:14px">' +
      [0, 1].map(function (sd) { return ob(esc(sideNames(S, sd)[0] + ' (' + (sd ? 'B' : 'A') + ')'), 'end:' + sd, '', 'min-height:54px;font-size:19px'); }).join('') + '</div><div style="margin-top:8px">' + ob(esc(t('cancel')), 'close', '', 'width:100%') + '</div></div>';
    if (!ov && S.paused && ph !== 'fim' && ph !== 'ocioso') return '<div class="oc" style="text-align:center;min-width:460px"><h2 style="font-size:34px">' + esc(t('g.pausedTitle')) + '</h2><div class="sub">' + esc(t('g.pausedSub')) + '</div>' + ob(esc(t('g.resume')), 'main', 'p', 'margin-top:16px;width:100%;min-height:52px;font-size:20px') + '</div>';
    if (!ov && ph === 'fim') {
      var w = S.winner, nt = sideName(w) || sideNames(S, w)[0];
      return '<div class="oc" style="text-align:center;min-width:560px"><div class="sub" style="margin:0">' + esc(t('g.winners')) + '</div><h2 style="font-size:' + Math.max(24, Math.min(40, 520 / (nt.length * .55))) + 'px;color:var(--lime);margin:4px 0">' + esc(nt) + '</h2><div style="font-size:24px;margin-bottom:14px">' + esc(setsStr(S.sets, S.tbScores)) + '</div>' +
        '<div class="ogrid" style="grid-template-columns:1fr 1fr">' + ob(esc(t('g.undoLast')), 'undo') + ob(esc(t('x.save')), 'exit:save', 'p') + '</div></div>';
    }
    return '';
  }
  function bindOverlay() { /* os eventos ficam delegados em #game, ver gameEvents */ }

  /* ---------- ações do jogo ---------- */
  function tap(side) {
    if (!S || current !== 'game' || ov) return;
    if (S.paused) { toast(t('g.hintPaused')); return; }
    var now = Date.now();
    if (now - lastTap[side] < 220) return;
    lastTap[side] = now;
    ensureCtx();
    if (S.phase !== 'jogo') {
      toast(t(S.phase === 'ocioso' ? 'g.hintStart' : S.phase === 'aquecimento' ? 'g.hintWarm' : S.phase === 'intervalo' ? 'g.hintBreak' : 'g.hintEnd'));
      return;
    }
    var before = S.history.length, D = S.mode === 'D';
    var snap = D ? JSON.stringify(S.d) : null, prev = D ? { serve: S.serve, tb: S.tb, sum: setsSum(), tot: S.pts[0] + S.pts[1] } : null;
    E.point(S, side);
    if (S.history.length !== before) {
      if (D) { S.dh.push(snap); if (S.dh.length > 300) S.dh.shift(); S.dhf = []; dAfter(prev); }
      if (navigator.vibrate) navigator.vibrate(20);
    }
    afterChange(true);
  }
  function doMain() {
    if (!S) return;
    ensureCtx();
    var ph = S.phase;
    if (ph === 'fim') return;
    if (S.paused || ph === 'jogo') E.togglePause(S);
    else if (ph === 'ocioso' || ph === 'aquecimento' || ph === 'intervalo') E.press(S);
    hideBars = false; lastTouch = Date.now(); lastTick = performance.now(); afterChange(true);
  }
  function openCr() {
    var sets = S.sets.map(function (g) { return g.slice(); }), p;
    if (S.tb) p = S.pts.slice();
    else { var a = S.pts[0], b = S.pts[1]; p = (a >= 3 && b >= 3 && !S.cfg.noAd) ? (a === b ? [3, 3] : a > b ? [4, 3] : [3, 4]) : [Math.min(a, 3), Math.min(b, 3)]; }
    cr = { sets: sets, p: p, serve: S.serve }; ov = 'cr';
  }
  function applyCr() {
    var D = S.mode === 'D', wasFim = S.phase === 'fim';
    if (D) { S.dh.push(JSON.stringify(S.d)); S.dhf = []; }
    var counts = S.tb ? cr.p.slice() : (cr.p[0] === 4 ? [4, 3] : cr.p[1] === 4 ? [3, 4] : cr.p.slice());
    E.correct(S, { sets: cr.sets, pts: counts, serve: cr.serve });
    if (wasFim && S.phase !== 'fim') { saved = false; removeLastHistory(); }
    ov = null; cr = null; afterChange(true); toast(t('c.applied'));
  }
  function resetMatch() {
    var old = S, ns = E.reset(old.cfg);
    ns.mode = old.mode; ns.names = old.names;
    if (old.mode === 'D') { ns.team = old.team; ns.dInit = old.dInit || [0, 0]; ns.d = { next: ns.dInit.slice(), tbStart: [0, 0], tbFirst: 0 }; ns.dh = []; ns.dhf = []; }
    S = ns; lastSay = S.sayId; saved = false; ov = null; hideBars = false; afterChange(true);
  }
  function gact(a) {
    var p = a.split(':'), k = p[0];
    lastTouch = Date.now();
    switch (k) {
      case 'pt0': case 'pt1': tap(+k.charAt(2)); return;
      case 'undo': { var wasFim = S.phase === 'fim'; undoPoint(); if (wasFim && S.phase !== 'fim') { saved = false; removeLastHistory(); } hideBars = false; afterChange(true); return; }
      case 'redo': redoPoint(); hideBars = false; afterChange(true); return;
      case 'main': doMain(); return;
      case 'calls': if (S.phase === 'fim') { toast(t('g.hintEnd')); return; } ov = 'calls'; renderGame(); return;
      case 'aj': ov = 'aj'; renderGame(); return;
      case 'home': ov = 'exit'; renderGame(); return;
      case 'remote': toast(t('g.remoteHint')); return;
      case 'close': ov = null; cr = null; nmd = null; renderGame(); return;
      case 'call': { var n = +p[1], nm = ''; CALLS.forEach(function (c) { if (c[0] === n) nm = c[1]; }); ensureCtx(); playTracks([n]); ov = null; renderGame(); toast(nm); return; }
      case 'ajx':
        if (p[1] === 'voz') ov = 'voz';
        else if (p[1] === 'awake') { settings.keepAwake = !settings.keepAwake; saveSettings(); if (settings.keepAwake) requestWake(); else releaseWake(); }
        else if (p[1] === 'cr') openCr();
        else if (p[1] === 'nm') { nmd = S.mode === 'D' ? teamNames(0).concat(teamNames(1)) : [(S.names && S.names[0]) || '', (S.names && S.names[1]) || '']; nmd = S.mode === 'D' ? [S.team[0][0], S.team[0][1], S.team[1][0], S.team[1][1]] : [S.names[0] || '', '', S.names[1] || '', '']; ov = 'nm'; }
        else if (p[1] === 'srv') ov = 'srv';
        else if (p[1] === 'ivl') ov = 'ivl';
        else if (p[1] === 'end') ov = 'end';
        else if (p[1] === 'reset') ov = 'reset';
        renderGame(); return;
      case 'lang': settings.lang = p[1]; saveSettings(); stopAudio(); preload(); renderGame(); return;
      case 'voice': settings.voice = p[1]; saveSettings(); stopAudio(); preload(); renderGame(); return;
      case 'vtest': ensureCtx(); playTracks([27]); return;
      case 'cr':
        if (!cr) return;
        if (p[1] === 'g') { var si = +p[2], sd = +p[3], d = +p[4]; cr.sets[si][sd] = Math.max(0, Math.min(S.cfg.games + 1, cr.sets[si][sd] + d)); }
        else if (p[1] === 'p') { var sd2 = +p[2], d2 = +p[3]; cr.p[sd2] = Math.max(0, Math.min(S.tb ? 99 : 4, cr.p[sd2] + d2)); }
        else if (p[1] === 'srv') cr.serve = +p[2];
        renderGame(); return;
      case 'crapply': applyCr(); return;
      case 'nmsave':
        if (S.mode === 'D') S.team = [[trim20(nmd[0]), trim20(nmd[1])], [trim20(nmd[2]), trim20(nmd[3])]]; else S.names = [trim20(nmd[0]), trim20(nmd[2])];
        ov = null; nmd = null; persist(true); renderGame(); toast(t('n.updated')); return;
      case 'svset': {
        var tm = +p[1], ix = +p[2];
        E.setServe(S, tm);
        if (S.mode === 'D') { S.d.next[tm] = ix; if (S.tb) S.d.tbStart[tm] = ix; }
        ov = null; afterChange(true); toast(t('sv.set', sideNames(S, tm)[S.mode === 'D' ? ix : 0])); return;
      }
      case 'ivl': {
        var kk = p[1];
        if (kk === 'cancel') { if (S.phase === 'intervalo') E.press(S); ov = null; afterChange(true); toast(t('b.cancelled')); return; }
        if (kk === 'cut') { S.brkLeft = Math.max(0, S.brkLeft - 30); if (S.brkLeft <= 0 && S.phase === 'intervalo') { E.press(S); ov = null; toast(t('b.ended')); } afterChange(true); return; }
        if (kk === 'bc') S.cfg.brkChange = p[2] === '1';
        else if (kk === 'bs') S.cfg.brkSet = p[2] === '1';
        else if (kk === 'bcSec') S.cfg.brkChangeSec = Math.max(30, Math.min(600, S.cfg.brkChangeSec + (+p[2])));
        else if (kk === 'bsSec') S.cfg.brkSetSec = Math.max(30, Math.min(900, S.cfg.brkSetSec + (+p[2])));
        persist(true); renderGame(); return;
      }
      case 'resetyes': resetMatch(); return;
      case 'exit':
        if (p[1] === 'save') { if (S.phase === 'fim') { LS.del(K.cur); S = null; ov = null; renderHome(); } else { ov = null; leaveGame(); } }
        else { LS.del(K.cur); S = null; ov = null; renderHome(); }
        return;
      case 'end': E.endEarly(S, 1 - (+p[1])); ov = null; afterChange(true); return;
    }
  }
  function gameEvents() {
    var g = $('game');
    g.addEventListener('pointerdown', function (e) {
      lastTouch = Date.now();
      if (hideBars && !e.target.closest('[data-a^="pt"]') && !ov) { hideBars = false; renderGame(); }
    });
    g.addEventListener('click', function (e) {
      var el = e.target.closest('[data-a]'); if (!el || !S) return;
      gact(el.getAttribute('data-a'));
    });
    g.addEventListener('input', function (e) {
      var el = e.target;
      if (el.hasAttribute('data-svol')) {
        settings.volume = el.value / 100; saveSettings(); if (gain) gain.gain.value = settings.mute ? 0 : settings.volume;
        var l = $('volpct'); if (l) l.textContent = el.value + '%';
      } else if (el.hasAttribute('data-nm') && nmd) nmd[+el.getAttribute('data-nm')] = el.value;
    });
  }

  /* ---------- histórico ---------- */
  function addHistory() {
    var h = LS.get(K.hist, []);
    h.unshift({ id: Date.now(), ts: Date.now(), sets: S.sets, tbScores: S.tbScores || [], winner: S.winner, dur: Math.round(S.clock), cfg: S.cfg, names: S.mode === 'D' ? [sideName(0), sideName(1)] : (S.names || ['', '']) });
    LS.set(K.hist, h.slice(0, 200));
  }
  function removeLastHistory() { var h = LS.get(K.hist, []); h.shift(); LS.set(K.hist, h); }

  /* ---------- início do app ---------- */
  function start() {
    refreshHave().then(function () {
      var cur = resumable();
      if (cur) resumeMatch(); else renderHome();
      loadIndex().then(refreshHave).then(function () {
        if (current === 'home' || current === 'voices') render(true);
        syncVoices(false);
      });
    });
  }
  window.addEventListener('resize', function () { if (current === 'game') fitStage(); updateRotate(); });
  window.addEventListener('orientationchange', function () { setTimeout(function () { if (current === 'game') fitStage(); updateRotate(); }, 150); });
  window.addEventListener('pagehide', function () { persist(true); });
  $('rotate').addEventListener('click', function (ev) { if (ev.target.closest('[data-a="rotforce"]')) { forceRot = true; updateRotate(); } });
  try { var mq = window.matchMedia('(orientation: portrait)'); if (mq.addEventListener) mq.addEventListener('change', updateRotate); else if (mq.addListener) mq.addListener(updateRotate); } catch (e2) {}
  setInterval(function () { if (current === 'game') updateRotate(); }, 600);   /* não depende do aviso de giro do navegador */
  gameEvents();
  if (authOk()) start(); else show('login');

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  window.__placar = { have: function () { return have; }, buf: getBuffer, sync: syncVoices, effLang: effLang, state: function () { return S; }, gact: gact, tap: tap, clock: function () { return clockText(); }, status: function () { return S ? statusText() : ''; }, current: function () { return current; }, settings: settings, ov: function () { return ov; } };
})();
