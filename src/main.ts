import './style.css';
import { L, type Key, type Lang } from './i18n';
import { NAMES, BRANCHES, CARGO, DISPLAY_MOD, type Kind } from './world';
import { newState, save, load, wipe, displayedSkill, displayedTotal, type State } from './state';
import { generateRace, pointAt, TRACK } from './race';
import { rng, seedFrom } from './rng';

let lang: Lang = (() => { try { const v = localStorage.getItem('enro-lang'); if (v === 'hu' || v === 'en') return v; } catch { /* */ } return navigator.language.toLowerCase().startsWith('hu') ? 'hu' : 'en'; })();
let S: State | null = load();
const tr = (k: Key) => L[k][lang];
const pick = (hu: string, en: string) => (lang === 'hu' ? hu : en);
const main = document.querySelector('main')!;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e;
}
function hud(): void {
  const h = document.getElementById('hud')!; h.replaceChildren();
  if (!S?.character) return;
  const item = (label: string, v: string) => { const s = el('span', '', label + ' '); s.append(el('b', '', v)); h.append(s); };
  item(lang === 'hu' ? S.character.nameHu : S.character.nameRu, '');
  item('€', String(S.eur)); item('КриптоРубль', String(S.krub)); item('Привязка', S.privyazka + '%');
  item('Skill COIN', String(displayedTotal(S)));
}
function note(entry: string): void { if (S && !S.dossier.includes(entry)) S.dossier.push(entry); }
function advance(): void { if (!S) return; S.step++; save(S); render(); }

interface Scene { phase: string; title: string; body: string[]; ru?: string; choices?: { label: string; act: () => void }[]; custom?: (box: HTMLElement) => void }
function scene(sc: Scene): void {
  main.replaceChildren();
  main.append(el('div', 'phase', sc.phase), el('h1', '', sc.title));
  sc.body.forEach(b => main.append(el('p', '', b)));
  if (sc.ru) main.append(el('p', 'ru', sc.ru));
  const box = el('div'); main.append(box);
  if (sc.custom) sc.custom(box);
  if (sc.choices) {
    const c = el('div', 'choices');
    sc.choices.forEach(ch => { const b = el('button', '', ch.label); b.type = 'button'; b.onclick = ch.act; c.append(b); });
    main.append(c);
  }
  if (S && S.dossier.length) {
    const d = el('div', 'dossier'); d.append(el('div', '', tr('dossier')));
    const ul = el('ul'); S.dossier.forEach(x => ul.append(el('li', '', x))); d.append(ul); main.append(d);
  }
  hud();
}

// ---------- title & character form ----------
function title(): void {
  scene({ phase: 'ENRO', title: 'Europ Night Racing Online', body: [tr('intro'), tr('demo')], ru: '«Освободительная операция»',
    choices: [
      ...(S?.character ? [{ label: tr('cont'), act: () => render() }] : []),
      { label: tr('start'), act: () => { wipe(); S = newState(seedFrom('ENRO-Budapest-' + Date.now())); S.step = -1; save(S); render(); } },
    ] });
}
function form(): void {
  let kind: Kind = 'woman';
  scene({ phase: 'Hivatal', title: tr('formTitle'), body: [], custom: box => {
    const f = el('form', 'form');
    f.append(el('h2', '', 'ЗАЯВЛЕНИЕ НА УЧАСТИЕ'), el('div', 'stamp', tr('formStamp')));
    const fsK = el('fieldset'); fsK.append(el('legend', '', tr('sex')));
    const kinds: [Kind, Key, string][] = [['woman', 'woman', 'var(--blue)'], ['man', 'man', 'var(--red)'], ['android', 'other', 'var(--yellow)']];
    const fsN = el('fieldset'); fsN.append(el('legend', '', tr('name')));
    const sel = el('select');
    const stats = el('div');
    const fill = () => {
      sel.replaceChildren();
      if (kind === 'android') { const o = el('option', '', '«Гражданин № 0417»'); o.value = 'android'; sel.append(o); sel.disabled = true; }
      else { sel.disabled = false; NAMES.filter(n => n.female === (kind === 'woman')).forEach((n, i) => { const o = el('option', '', `${n.hu} / ${n.ru} – ${pick(n.meaningHu, n.meaningEn)} → ${n.branch}`); o.value = String(NAMES.indexOf(n)); if (i === 0) o.selected = true; sel.append(o); }); }
      showStats();
    };
    const showStats = () => {
      stats.replaceChildren();
      const tmp: State = { ...newState(0) };
      const n = kind === 'android' ? null : NAMES.at(Number(sel.value))!;
      tmp.character = { kind, nameHu: n?.hu ?? '№ 0417', nameRu: n?.ru ?? '№ 0417', branch: n?.branch ?? null };
      BRANCHES.forEach(b => { const r = el('div', 'row'); r.append(el('span', '', b), el('span', '', String(displayedSkill(tmp, b)))); stats.append(r); });
      const sum = el('div', 'row'); const m = DISPLAY_MOD[kind];
      sum.append(el('b', '', tr('shown')), el('b', '', `${displayedTotal(tmp)} (${m > 0 ? '+' : ''}${m})`)); stats.append(sum);
      const eq = el('div', 'row'); eq.append(el('span', '', tr('equality')), el('span', '', '1,00')); stats.append(eq);
    };
    kinds.forEach(([k, key, col]) => {
      const lab = el('label'); const inp = el('input'); inp.type = 'radio'; inp.name = 'kind'; inp.checked = k === kind;
      inp.onchange = () => { kind = k; fill(); };
      const sw = el('span', 'sw'); sw.style.background = col; lab.append(inp, sw, document.createTextNode(tr(key))); fsK.append(lab);
    });
    sel.onchange = showStats; fsN.append(sel);
    const sub = el('button', '', tr('submit')); sub.type = 'submit';
    f.append(fsK, fsN, stats, sub);
    f.onsubmit = ev => {
      ev.preventDefault(); if (!S) return;
      const n = kind === 'android' ? null : NAMES.at(Number(sel.value))!;
      S.character = { kind, nameHu: n?.hu ?? '№ 0417', nameRu: n?.ru ?? '«Гражданин № 0417»', branch: n?.branch ?? null };
      if (kind === 'android') { S.privyazka = 25; note('«Пол: не применимо» → «Одобрено»'); }
      f.append(el('div', 'ok', tr('approved')));
      sub.disabled = true; setTimeout(advance, 900);
    };
    box.append(f); fill();
  } });
}

// ---------- race ----------
function race(kindHu: string, kindEn: string, ru: string, laps: number, reward: () => void, extra?: string): void {
  if (!S) return;
  const st = S;
  scene({ phase: pick('Éjszaka', 'Night'), title: pick(kindHu, kindEn), ru, body: extra ? [extra, tr('vodkaQ')] : [tr('vodkaQ')], choices: [
    { label: tr('drink'), act: () => run(false) },
    { label: tr('tea'), act: () => { note('«Пил чай. Подозрительно трезв.»'); run(true); } },
  ] });
  function run(soberChoice: boolean): void {
    const sober = soberChoice || st.character?.kind === 'android';
    if (st.character?.kind === 'android' && !soberChoice) note('«Обнаружено токсичное вещество. Нейтрализовано.»');
    const res = generateRace(st.seed + st.step * 7919, sober, laps);
    main.replaceChildren(el('div', 'phase', pick('Futam', 'Race')), el('h1', '', pick(kindHu, kindEn)));
    const cv = el('canvas'); cv.width = 720; cv.height = 480; main.append(cv);
    const ov = el('div', 'overlay'); main.append(ov);
    const ctx = cv.getContext('2d')!;
    const total = Math.max(...res.cars.map(c => c.finish));
    const t0 = performance.now(); const speed = 1.6;
    const glaz = sober ? 120 : 70;
    function frame(now: number): void {
      const t = Math.min(total, ((now - t0) / 1000) * speed * 4);
      draw(t);
      if (res.doorAt !== null && t / total > res.doorAt) ov.textContent = tr('door');
      if (sober && t / total > 0.5) ov.textContent = tr('torpedo');
      if (t < total) requestAnimationFrame(frame); else finish();
    }
    function draw(t: number): void {
      ctx.fillStyle = '#1a1714'; ctx.fillRect(0, 0, 720, 480);
      ctx.strokeStyle = 'rgba(217,164,65,0.08)'; ctx.lineWidth = 1;
      for (let x = 0; x < 720; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 480); ctx.stroke(); }
      for (let y = 0; y < 480; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(720, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(47,127,209,0.35)'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(60, 0); ctx.bezierCurveTo(140, 160, 40, 300, 110, 480); ctx.stroke();
      ctx.strokeStyle = '#4a3b33'; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.beginPath();
      TRACK.forEach(([x, y], i) => (i ? ctx.lineTo(x * 720, y * 480) : ctx.moveTo(x * 720, y * 480))); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = 'rgba(179,32,42,0.6)'; ctx.lineWidth = 1; ctx.setLineDash([6, 8]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#d9a441'; ctx.font = '12px Courier New'; ctx.fillText('BUDAPEST · 2030 · ENRO', 14, 470);
      const me = res.cars.find(c => c.player)!;
      const [px, py] = pointAt(Math.min(1, t / me.finish) * laps);
      ctx.strokeStyle = 'rgba(217,164,65,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px * 720, py * 480, glaz, 0, Math.PI * 2); ctx.stroke();
      res.cars.forEach(c => {
        const u = Math.min(1, t / c.finish) * laps; const [x, y] = pointAt(u);
        ctx.fillStyle = c.player ? '#efe4cc' : '#b3202a'; ctx.beginPath(); ctx.arc(x * 720, y * 480, c.player ? 9 : 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.player ? '#0d0b0b' : '#efe4cc'; ctx.font = 'bold 9px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(c.label, x * 720, y * 480 + 3); ctx.textAlign = 'left';
        if (!c.player && sober) { ctx.strokeStyle = 'rgba(179,32,42,0.8)'; ctx.beginPath(); ctx.moveTo(x * 720, y * 480); ctx.lineTo(x * 720 + (px - x) * 720 * 0.12, y * 480 + (py - y) * 480 * 0.12); ctx.stroke(); }
      });
    }
    function finish(): void {
      st.lastPlace = res.playerPlace; reward();
      if (sober) note(pick('«Цель захвачена.» Interpol érdeklődik.', '«Цель захвачена.» Interpol is interested.'));
      const ol = el('ol', 'result');
      res.order.forEach(id => { const li = el('li', id === 'P' ? 'me' : '', id === 'P' ? `01 (${tr('you')})` : `${id} · bot`); ol.append(li); });
      main.append(el('p', '', `${res.playerPlace}. ${tr('place')}. ${pick('Egy bot nyert. A csaló mindig nyer.', 'A bot won. The cheater always wins.')}`), ol);
      const b = el('button', 'primary', tr('next')); b.type = 'button'; b.onclick = advance; main.append(b); save(st); hud();
    }
    requestAnimationFrame(frame);
  }
}

// ---------- the city loop (Labzo, 2026-10-31) ----------
type Step = () => void;
const N1 = pick('Night 1 · Budapest', 'Night 1 · Budapest'), D1 = 'Day 1', N2 = 'Night 2', D2 = 'Day 2', D3 = 'Day 3';
function steps(): Step[] {
  const s = S!;
  const simple = (phase: string, t: [string, string], b: [string, string][], ru?: string, act?: () => void) => () =>
    scene({ phase, title: pick(...t), body: b.map(x => pick(...x)), ru, choices: [{ label: tr('next'), act: () => { act?.(); advance(); } }] });
  const n1 = [
    () => race('Mini futam', 'Mini race', '«Разминка»', 1, () => { s.eur += 10; }),
    () => {
      const cargo = CARGO.at(Math.floor(rng(s.seed + 101)() * CARGO.length))!;
      race('Futárfutam', 'Courier race', '«Курьерский заезд»', 1, () => { s.eur += cargo.ru === 'Ущерб по вине водителя' ? 0 : 25; note('«' + cargo.ru + '»'); }, `${tr('roulette')} ${pick(cargo.hu, cargo.en)}`);
    },
    () => scene({ phase: N1, title: pick('Szállás', 'Lodging'), body: [pick('Fizetés euróban. Ahol alszol, oda fogsz tartozni. Utána kötelező szundi.', 'Payment in euros. Where you sleep decides where you belong. Then a mandatory nap.')], choices: [
      { label: pick('Hotelvonat, 25 €/éj', 'Hotel train, €25/night'), act: () => { s.eur -= 25; s.privyazka += 5; note('«Привязка: +5%»'); advance(); } },
      { label: pick('Albérlet a család mellett, 15 €/éj', 'Room next to the family, €15/night'), act: () => { s.eur -= 15; s.care += 1; advance(); } },
    ] }),
  ];
  const d1 = [
    simple(D1, ['Ébredés', 'Waking up'], [['Bemutatkozik a család. Te vagy a gondviselőjük: két idős szülő és egy unoka.', 'The family introduces itself. You look after them: two elderly parents and a grandchild.']]),
    () => scene({ phase: D1, title: pick('Hivatal', 'The Office'), ru: '«Бюрократическое место»', body: [pick('Az időseket kísérni kötelező. Hármas sorszám, négy ablak, egy nyitva.', 'Escorting the elderly is mandatory. Ticket number three, four windows, one open.')], choices: [
      { label: pick('Kivárod velük, türelmesen', 'Wait it out with them, patiently'), act: () => { s.care += 2; advance(); } },
      { label: pick('Siettetsz, mert este futam van', 'Hurry them, there is a race tonight'), act: () => { note('«Торопил пожилых.»'); advance(); } },
    ] }),
    simple(D1, ['Bolt, patika, étterem', 'Shop, pharmacy, restaurant'], [['A patikában valaki ugyanazt a gyógyszert kéri, mint te a nagymamának. Így indul a barátság.', 'At the pharmacy someone asks for the same medicine you buy for grandma. That is how the friendship starts.']]),
    () => {
      const chosen = s.care >= 2 || s.character?.kind === 'android';
      s.route = chosen ? 'race' : 'proli';
      scene({ phase: D1, title: pick('Szállás újra · 18:00', 'Lodging again · 18:00'), ru: chosen ? '«Да.» → «Игорь выбрал»' : '…', body: [pick(
        chosen ? 'Igor végigmegy a folyosón, megáll előtted, és annyit mond: «Да.» Ma éjjel versenyzel.' : 'Igor végigmegy a folyosón, és továbbmegy. Ma éjjel dolgozol. Ez nem büntetés.',
        chosen ? 'Igor walks down the corridor, stops in front of you and says: «Да.» Tonight you race.' : 'Igor walks down the corridor and keeps going. Tonight you work. It is not a punishment.')],
        choices: [{ label: tr('next'), act: advance }] });
    },
  ];
  const n2race = [
    () => race('Mini futam', 'Mini race', '«Разминка»', 1, () => { s.eur += 10; }),
    () => race('Futárfutam', 'Courier race', '«Курьерский заезд»', 1, () => { s.eur += 25; }),
    () => race('Nagy verseny', 'Big race', '«Большой Заезд»', 2, () => { s.krub += 120; note('«КриптоРубль: +120»'); }),
  ];
  const n2proli = [
    simple(N2, ['Rakományrendezés', 'Sorting cargo'], [['16 egyforma rakodó, 16 egyforma doboz. Mindegyiken: «Техника».', '16 identical loaders, 16 identical boxes. Each says: «Техника».']], undefined, () => { s.eur += 15; }),
    simple(N2, ['Igor-fuvar', 'Igor run'], [['Lemerült akkumulátorokat viszel el, feltöltötteket teszel a helyükre.', 'You take away flat batteries and put charged ones in their place.']], '«Ячейка „Игорь”»', () => { s.krub += 40; }),
    simple(N2, ['Mozdonyvezetői képzés', 'Train driver training'], [['Elkezded a képzést. Igor a hátsó sorban ül és jegyzetel.', 'You start the training. Igor sits in the back row and takes notes.']], '«Передача данных: ИП-1»', () => note('«Передача данных: ИП-1»')),
  ];
  const d2 = [
    simple(D2, ['Ebéd a családdal', 'Lunch with the family'], [['Délelőtti ebéd. A nagymama megkérdezi, hol voltál éjjel.', 'Late-morning lunch. Grandma asks where you were last night.']]),
    simple(D2, ['Bevásárlás', 'Shopping'], [['A barát a МЕРА-ban dolgozik. «Приятного аппетита.»', 'The friend works at МЕРА. «Приятного аппетита.»']]),
    () => scene({ phase: D2, title: pick('Bank és vasútállomás', 'Bank and railway station'), body: [pick('Rendezned kell, amit magaddal viszel, és azt is, ami itt marad.', 'Settle what you take with you and what stays here.')], custom: box => {
      const r = el('div', 'receipt'); const gross = s.krub;
      const rows: [string, number][] = [['КриптоРубль → €', gross], ['«Сбор за сбор за участие в заезде» 20%', -gross * 0.2], ['10 díj-név / 10 fee names 10%', -gross * 0.1], ['«Воздушный сбор» 10%', -gross * 0.1], ['«Сбор за привязку» 25%', -gross * 0.25]];
      rows.forEach(([k, v]) => { const d = el('div', 'row'); d.append(el('span', '', k), el('span', '', v.toFixed(0))); r.append(d); });
      const net = Math.round(gross * 0.35); const d = el('div', 'row'); d.append(el('b', '', '€'), el('b', '', '+' + net)); r.append(d, el('div', '', '«Спасибо за доверие!»'));
      box.append(r);
      const b = el('button', 'primary', tr('next')); b.type = 'button'; b.style.marginTop = '12px'; b.onclick = () => { s.eur += net; s.krub = 0; advance(); }; box.append(b);
    } }),
    simple(D2, ['Szundi', 'Nap'], [['Holnap vonat.', 'Train tomorrow.']]),
  ];
  const d3 = [() => scene({ phase: D3, title: pick('Indulás', 'Departure'), ru: '«Следующая станция: Братислава»', body: [tr('end')], choices: [{ label: tr('restart'), act: () => { wipe(); S = null; title(); } }] })];
  return [...n1, ...d1, ...(s.route === 'proli' ? n2proli : n2race), ...d2, ...d3];
}

function render(): void {
  document.documentElement.lang = lang;
  (document.getElementById('sub') as HTMLElement).textContent = tr('sub');
  (document.getElementById('lang') as HTMLElement).textContent = lang === 'hu' ? 'EN' : 'HU';
  if (!S) return title();
  if (S.step < 0 || !S.character) { S.step = Math.max(S.step, -1); if (!S.character) return form(); S.step = 0; }
  const list = steps();
  const step = list.at(Math.min(S.step, list.length - 1))!;
  step();
}
document.getElementById('lang')!.addEventListener('click', () => { lang = lang === 'hu' ? 'en' : 'hu'; try { localStorage.setItem('enro-lang', lang); } catch { /* */ } render(); });
S ? title() : title();
