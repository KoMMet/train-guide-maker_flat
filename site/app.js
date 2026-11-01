'use strict';
const W = 1280, H = 720, S = 3;
const FONT = '"Hiragino Sans","Noto Sans JP","Yu Gothic",Meiryo,sans-serif';
const MAX_STATIONS = 30;
const SITE_URL = 'https://kommet.github.io/train-guide-maker_flat/';
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const listEl = document.getElementById('list');

let stations = [
  { name: '日吉', num: '13', min: '12', passed: false, tr: '' },
  { name: '元住吉', num: '12', min: '10', passed: false, tr: '' },
  { name: '武蔵小杉', num: '11', min: '8', passed: false, tr: '' },
  { name: '新丸子', num: '10', min: '6', passed: false, tr: '' },
  { name: '多摩川', num: '09', min: '4', passed: false, tr: '' },
  { name: '田園調布', num: '08', min: '3', passed: false, tr: '' },
  { name: '自由が丘', num: '07', min: '2', passed: false, tr: '' },
  { name: '都立大学', num: '06', min: '', passed: true, tr: '' },
];
let nextIdx = 6;

const val = id => document.getElementById(id).value;
const safeColor = c => /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#0068b7';

function code(st) {
  const n = String(st.num).trim();
  return n ? val('prefix').trim() + '-' + n : '';
}

function fit(text, maxW, size, weight) {
  let s = size;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (ctx.measureText(text).width > maxW && s > 8) {
    s -= 1;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
  return s;
}

function circle(x, y, r, fill, stroke, lw) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}

function render() {
  const color = safeColor(val('color'));
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'middle';

  // header
  ctx.fillStyle = '#fff3d0';
  const g = ctx.createLinearGradient(0, 0, 0, 24 * S);
  g.addColorStop(0, '#fff'); g.addColorStop(1, '#f1ede0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 28 * S);
  ctx.fillStyle = color; ctx.fillRect(0, 0, 6 * S, 28 * S);
  ctx.fillStyle = '#111'; ctx.textAlign = 'left';
  fit(val('dest'), 300 * S, 18 * S, 'bold');
  ctx.fillText(val('dest'), 12 * S, 14 * S);
  const car = val('car');
  ctx.fillStyle = '#111';
  roundRect(W - 50 * S, 3 * S, 34 * S, 24 * S, 4 * S); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.font = `bold ${22 * S}px ${FONT}`; ctx.fillText(car, W - 38 * S, 15 * S);
  ctx.font = `bold ${8 * S}px ${FONT}`; ctx.fillText('号車', W - 22 * S, 21 * S);

  // next station
  const next = stations[nextIdx];
  ctx.textAlign = 'left'; ctx.fillStyle = '#111';
  ctx.font = `bold ${15 * S}px ${FONT}`;
  ctx.fillText(val('nextlabel'), 28 * S, 56 * S);
  const nr = 18 * S, ncx = 110 * S, ncy = 52 * S;
  if (next) {
    circle(ncx, ncy, nr, '#fff', color, 4 * S);
    ctx.fillStyle = '#111'; ctx.textAlign = 'center';
    ctx.font = `bold ${14 * S}px ${FONT}`;
    ctx.fillText(val('prefix').trim(), ncx, ncy - 7 * S);
    ctx.fillText(String(next.num).trim(), ncx, ncy + 8 * S);
    const nameMax = W - 150 * S - 20 * S;
    fit(next.name, nameMax, 38 * S, 'bold');
    ctx.textAlign = 'center'; ctx.fillStyle = '#111';
    ctx.fillText(next.name, 150 * S + nameMax / 2, 50 * S);
  }

  // line band
  const by = 92 * S, bh = 32 * S;
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; 
  ctx.beginPath(); ctx.moveTo(0, 78 * S); ctx.lineTo(W, 78 * S); ctx.stroke();
  const left = 6 * S, right = W - 6 * S;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(left + 10 * S, by); ctx.lineTo(right - 12 * S, by);
  ctx.lineTo(right - 12 * S, by); ctx.lineTo(right, by + bh / 2); ctx.lineTo(right - 12 * S, by + bh);
  ctx.lineTo(left + 10 * S, by + bh); ctx.lineTo(left, by + bh / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
  ctx.font = `bold ${10 * S}px ${FONT}`; ctx.fillText(val('minlabel'), left + 9 * S, by + bh / 2);

  // stations (index 0 = rightmost)
  const n = stations.length;
  const x0 = left + 28 * S, x1 = right - 26 * S;
  const slot = Math.min(56 * S, (x1 - x0) / Math.max(n, 1));
  stations.forEach((st, i) => {
    const cxx = x0 + slot * i + slot / 2;
    const gray = st.passed;
    // time
    ctx.textAlign = 'center';
    if (st.min !== '' && !gray) {
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.min(30 * S, slot * 0.6)}px ${FONT}`;
      ctx.fillText(st.min, cxx, by + bh / 2 + S);
    }
    // code
    ctx.fillStyle = gray ? '#aaa' : '#111';
    ctx.font = `bold ${Math.min(8 * S, slot * 0.2)}px ${FONT}`;
    ctx.fillText(code(st), cxx, by + bh + 10 * S);
    // name vertical
    const chars = Array.from(st.name);
    const maxH = H - (by + bh + 20 * S) - 16 * S;
    const cs = Math.min(15 * S, slot * 0.4, maxH / Math.max(chars.length, 1));
    ctx.font = `bold ${cs}px ${FONT}`;
    chars.forEach((ch, k) => {
      ctx.fillText(ch, cxx, by + bh + 22 * S + cs * (k + 0.5));
    });
    // transfers (above band)
    if (st.tr) {
      const lines = st.tr.split('\n').slice(0, 3);
      const ts = Math.min(5.5 * S, slot * 0.14);
      ctx.font = `${ts}px ${FONT}`;
      ctx.fillStyle = gray ? '#aaa' : '#111';
      lines.forEach((l, k) => {
        const y = by - 6 * S - (lines.length - 1 - k) * (ts + 3 * S);
        ctx.fillText(l, cxx, y, slot - 2 * S);
      });
    }
    // marker for passed arrow tip
    if (gray) {
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(cxx - slot / 2 + 2, by + 2, slot - 4, bh - 4);
    }
  });
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function mk(tag, props, ...kids) {
  const e = document.createElement(tag);
  Object.assign(e, props || {});
  kids.forEach(k => e.append(k));
  return e;
}

function field(label, input) { return mk('label', {}, label, input); }

// 駅名の候補プルダウン(フォーカスで一覧、入力で絞り込み)
function combo(input, onPick) {
  const box = mk('div', { className: 'combo' });
  const ul = mk('ul', { className: 'suggest', hidden: true });
  ul.setAttribute('role', 'listbox');
  box.append(input, ul);
  let showAll = true;
  const refresh = () => {
    const q = input.value.trim();
    const hits = STATIONS.filter(n => showAll || !q || n.startsWith(q)).slice(0, 60);
    ul.replaceChildren(...hits.map(n => {
      const li = mk('li', { textContent: n });
      li.setAttribute('role', 'option');
      li.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        input.value = n; onPick(n); ul.hidden = true;
      });
      return li;
    }));
    ul.hidden = hits.length === 0;
  };
  input.addEventListener('focus', () => { showAll = true; refresh(); });
  input.addEventListener('input', () => { showAll = false; onPick(input.value); refresh(); });
  input.addEventListener('blur', () => { ul.hidden = true; });
  input.addEventListener('keydown', ev => { if (ev.key === 'Escape') ul.hidden = true; });
  return box;
}

// 路線→駅の順に選ぶポップアップ
function openPicker(onPick) {
  const opener = document.activeElement;
  const back = mk('div', { className: 'backdrop' });
  const dlg = mk('div', { className: 'modal' });
  dlg.setAttribute('role', 'dialog');
  dlg.setAttribute('aria-modal', 'true');
  const title = mk('h3');
  const search = mk('input', { type: 'text', placeholder: '路線名で検索', maxLength: 20 });
  const body = mk('div', { className: 'modal-body' });
  const prev = mk('button', { type: 'button', textContent: '← 路線一覧', hidden: true });
  const close = mk('button', { type: 'button', textContent: '閉じる' });
  const head = mk('div', { className: 'modal-head' }, prev, title, close);
  dlg.append(head, search, body);
  back.append(dlg);
  document.body.append(back);

  const done = () => { back.remove(); if (opener && opener.focus) opener.focus(); };
  close.addEventListener('click', done);
  back.addEventListener('pointerdown', ev => { if (ev.target === back) done(); });
  back.addEventListener('keydown', ev => { if (ev.key === 'Escape') done(); });

  const showLines = () => {
    title.textContent = '路線を選択';
    prev.hidden = true; search.hidden = false; search.placeholder = '路線名で検索';
    const q = search.value.trim();
    const frag = [];
    let op = null;
    LINES.filter(l => !q || l.n.includes(q) || l.o.includes(q)).forEach(l => {
      if (l.o !== op) { op = l.o; frag.push(mk('h4', { textContent: op })); }
      const b = mk('button', { type: 'button', className: 'item', textContent: l.n });
      b.addEventListener('click', () => showStations(l));
      frag.push(b);
    });
    if (!frag.length) frag.push(mk('p', { textContent: '該当する路線がありません' }));
    body.replaceChildren(...frag);
    body.scrollTop = 0;
  };
  const showStations = l => {
    title.textContent = l.n + ' — 駅を選択';
    prev.hidden = false; search.hidden = true;
    body.replaceChildren(...l.s.map(n => {
      const b = mk('button', { type: 'button', className: 'item', textContent: n });
      b.addEventListener('click', () => { onPick(n); done(); });
      return b;
    }));
    body.scrollTop = 0;
  };
  prev.addEventListener('click', showLines);
  search.addEventListener('input', showLines);
  showLines();
  search.focus();
}

function buildList() {
  listEl.replaceChildren();
  stations.forEach((st, i) => {
    const radio = mk('input', { type: 'radio', name: 'next', checked: i === nextIdx, title: '次の駅' });
    radio.addEventListener('change', () => { nextIdx = i; render(); });
    const name = mk('input', { type: 'text', maxLength: 12, value: st.name, placeholder: '駅名を入力して検索' });
    name.autocomplete = 'off';
    const nameBox = combo(name, v => { st.name = v; render(); });
    const pick = mk('button', { type: 'button', className: 'pick', textContent: '路線から選ぶ' });
    pick.addEventListener('click', () => openPicker(v => { name.value = v; st.name = v; render(); }));
    nameBox.append(pick);
    const num = mk('input', { type: 'text', maxLength: 3, value: st.num });
    num.addEventListener('input', () => { st.num = num.value; render(); });
    const min = mk('input', { type: 'text', maxLength: 3, value: st.min });
    min.addEventListener('input', () => { st.min = min.value; render(); });
    const tr = mk('textarea', { maxLength: 80, rows: 2, value: st.tr });
    tr.addEventListener('input', () => { st.tr = tr.value; render(); });
    const pass = mk('input', { type: 'checkbox', checked: st.passed });
    pass.addEventListener('change', () => { st.passed = pass.checked; render(); });
    const up = mk('button', { type: 'button', textContent: '↑', title: '上へ' });
    up.addEventListener('click', () => move(i, -1));
    const dn = mk('button', { type: 'button', textContent: '↓', title: '下へ' });
    dn.addEventListener('click', () => move(i, 1));
    const del = mk('button', { type: 'button', textContent: '削除', title: '削除' });
    del.addEventListener('click', () => remove(i));
    const row = mk('div', { className: 'row' },
      field('次', radio), field('駅名', nameBox), field('番号', num), field('所要分', min),
      field('乗換 (改行区切り)', tr),
      mk('div', { className: 'btns' }, up, dn, del));
    const pl = field('通過済(灰色)', pass); pl.className = 'chk';
    row.append(pl);
    listEl.append(row);
  });
}

function move(i, d) {
  const j = i + d;
  if (j < 0 || j >= stations.length) return;
  [stations[i], stations[j]] = [stations[j], stations[i]];
  if (nextIdx === i) nextIdx = j; else if (nextIdx === j) nextIdx = i;
  buildList(); render();
}

function remove(i) {
  if (stations.length <= 1) return;
  stations.splice(i, 1);
  if (nextIdx > i || nextIdx >= stations.length) nextIdx = Math.max(0, Math.min(nextIdx - 1, stations.length - 1));
  buildList(); render();
}

document.getElementById('add').addEventListener('click', () => {
  if (stations.length >= MAX_STATIONS) return;
  stations.push({ name: '新駅', num: String(stations.length + 1).padStart(2, '0'), min: '', passed: false, tr: '' });
  buildList(); render();
});

['dest', 'car', 'color', 'prefix', 'nextlabel', 'minlabel'].forEach(id =>
  document.getElementById(id).addEventListener('input', render));

document.getElementById('dl').addEventListener('click', () => {
  cv.toBlob(b => {
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url; a.download = 'train-guide.png';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
});

const msg = document.getElementById('msg');
const say = t => { msg.textContent = t; };
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

document.getElementById('copy').addEventListener('click', () => {
  if (!navigator.clipboard || !window.ClipboardItem) { say('このブラウザでは画像コピーに未対応です。ダウンロードをご利用ください。'); return; }
  const item = new ClipboardItem({ 'image/png': new Promise(res => cv.toBlob(res, 'image/png')) });
  navigator.clipboard.write([item]).then(() => say('画像をコピーしました'), () => say('コピーに失敗しました'));
});

document.getElementById('x').addEventListener('click', () => {
  const text = '車内案内図を作りました #車内案内図メーカー（仮）';
  const u = new URL('https://x.com/intent/post');
  u.searchParams.set('text', text);
  u.searchParams.set('url', SITE_URL);
  if (isMobile) {
    // アプリを直接起動。起動できなければWeb版へ
    const t = setTimeout(() => { if (!document.hidden) location.href = u.href; }, 1200);
    document.addEventListener('visibilitychange', () => clearTimeout(t), { once: true });
    location.href = 'twitter://post?message=' + encodeURIComponent(text + '\n' + SITE_URL);
  } else {
    // ユーザー操作中に同期的に開く(ポップアップブロック回避)
    window.open(u.href, '_blank', 'noopener,noreferrer');
  }
  say('Xの投稿画面を開きました。サイトのリンクカードに画像が表示されます。作成した画像は「ダウンロード」または「画像をコピー」で添付できます。');
});

buildList();
render();
