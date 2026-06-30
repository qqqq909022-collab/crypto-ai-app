// ============ SNAPSHOT DATA (2026-06-29) — used as offline-first base ============
const SNAPSHOT = [
  { id:'bitcoin', sym:'BTC', name:'Bitcoin', price:59668.09, ch24:-0.43, ch7:-2.1, mcap:1209531900520, vol:31512449517 },
  { id:'ethereum', sym:'ETH', name:'Ethereum', price:1586.26, ch24:0.39, ch7:1.8, mcap:195520777963, vol:12454909904 },
  { id:'binancecoin', sym:'BNB', name:'BNB', price:554.17, ch24:-0.18, ch7:0.6, mcap:75524653023, vol:765022148 },
  { id:'ripple', sym:'XRP', name:'XRP', price:1.05, ch24:-0.31, ch7:0.98, mcap:66388781741, vol:1938176312 },
  { id:'solana', sym:'SOL', name:'Solana', price:74.25, ch24:2.04, ch7:4.97, mcap:43799746717, vol:4229713062 },
  { id:'dogecoin', sym:'DOGE', name:'Dogecoin', price:0.07248, ch24:-1.15, ch7:-3.6, mcap:10670000000, vol:980000000 },
  { id:'tron', sym:'TRX', name:'TRON', price:0.3215, ch24:0.26, ch7:-3.6, mcap:30474299007, vol:575108814 },
  { id:'cardano', sym:'ADA', name:'Cardano', price:0.398, ch24:-0.8, ch7:-1.2, mcap:14200000000, vol:320000000 },
  { id:'polkadot', sym:'DOT', name:'Polkadot', price:4.12, ch24:3.4, ch7:8.1, mcap:6100000000, vol:210000000 },
  { id:'avalanche-2', sym:'AVAX', name:'Avalanche', price:18.6, ch24:1.1, ch7:2.3, mcap:7600000000, vol:280000000 },
  { id:'chainlink', sym:'LINK', name:'Chainlink', price:11.4, ch24:0.5, ch7:-0.9, mcap:7300000000, vol:340000000 },
  { id:'litecoin', sym:'LTC', name:'Litecoin', price:78.3, ch24:-0.6, ch7:1.4, mcap:5900000000, vol:410000000 },
  { id:'shiba-inu', sym:'SHIB', name:'Shiba Inu', price:0.0000112, ch24:-1.8, ch7:-4.2, mcap:6600000000, vol:190000000 },
  { id:'uniswap', sym:'UNI', name:'Uniswap', price:6.8, ch24:1.9, ch7:3.1, mcap:4100000000, vol:120000000 },
  { id:'near', sym:'NEAR', name:'NEAR Protocol', price:2.9, ch24:2.6, ch7:5.4, mcap:3300000000, vol:140000000 },
  { id:'aptos', sym:'APT', name:'Aptos', price:4.4, ch24:-1.1, ch7:-2.8, mcap:2500000000, vol:95000000 },
  { id:'arbitrum', sym:'ARB', name:'Arbitrum', price:0.42, ch24:0.8, ch7:1.6, mcap:1700000000, vol:88000000 },
  { id:'optimism', sym:'OP', name:'Optimism', price:0.75, ch24:-0.4, ch7:0.3, mcap:1300000000, vol:62000000 },
  { id:'sui', sym:'SUI', name:'Sui', price:1.85, ch24:3.9, ch7:7.2, mcap:5400000000, vol:310000000 },
  { id:'stellar', sym:'XLM', name:'Stellar', price:0.1723, ch24:-0.9, ch7:-1.6, mcap:5200000000, vol:140000000 },
];

const GLOBAL_SNAPSHOT = { totalMcap: 2.2e12, totalVol: 82e9, btcDom: 56.0, ethDom: 8.9 };

const NEWS_SNAPSHOT = [
  { tag:'市場', title:'比特幣主導率守在 56-60% 區間，山寨幣季節指數約 46，仍屬比特幣領漲格局', time:'今天' },
  { tag:'ETF', title:'現貨比特幣 ETF 累積流入已突破 569 億美元，機構資金持續鎖定在 BTC 生態', time:'今天' },
  { tag:'山寨幣', title:'分析師指出需確認跌破 55% 主導率才是真正資金輪動訊號，目前已超過 260 天未見山寨幣季', time:'1天前' },
  { tag:'監管', title:'英國 FCA 公布加密貨幣公司新規定，最終期限訂在 2027 年 2 月', time:'2天前' },
  { tag:'生態', title:'Solana 基金會推出 STRIDE 安全框架與 Alpenglow 共識升級提案', time:'3天前' },
];

// ============ STATE (persisted via localStorage in real PWA context) ============
let coins = JSON.parse(JSON.stringify(SNAPSHOT));
let globalStats = { ...GLOBAL_SNAPSHOT };
let dataIsLive = false;
let currentDetailId = 'bitcoin';
let currentTF = 7;

function loadState(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch(e) { return fallback; }
}
function saveState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

let favorites = loadState('cai_favorites', ['bitcoin','ethereum','solana']);
let holdings = loadState('cai_holdings', []); // [{id, amount}]
let alerts = loadState('cai_alerts', []); // [{id, coinId, cond, price, fired}]

// ============ UTIL ============
function fmtPrice(p) {
  if (p == null) return '--';
  if (p >= 1000) return '$' + p.toLocaleString('en-US',{maximumFractionDigits:0});
  if (p >= 1) return '$' + p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  if (p >= 0.01) return '$' + p.toFixed(4);
  return '$' + p.toFixed(8);
}
function fmtBig(n) {
  if (!n) return '--';
  if (n >= 1e12) return '$'+(n/1e12).toFixed(2)+'T';
  if (n >= 1e9) return '$'+(n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return '$'+(n/1e6).toFixed(0)+'M';
  return '$'+n.toFixed(0);
}
function getCoin(id) { return coins.find(c => c.id === id); }
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ============ SIGNAL LOGIC ============
function computeSignal(c) {
  const ch = c.ch24, ch7 = c.ch7;
  if (ch > 4 && ch7 > 5) return 'BUY';
  if (ch < -4 && ch7 < -5) return 'SELL';
  if (ch < -2 && ch7 < -8) return 'SELL';
  if (ch > 2 && ch7 > 0) return 'BUY';
  return 'HOLD';
}
function signalLabel(s) { return s==='BUY' ? '買入' : s==='SELL' ? '賣出' : '觀望'; }
function signalReason(c) {
  const s = computeSignal(c);
  if (s === 'BUY') return `24h ${c.ch24>=0?'+':''}${c.ch24.toFixed(1)}%，7d ${c.ch7>=0?'+':''}${c.ch7.toFixed(1)}%，動能轉強，短線偏多排列。`;
  if (s === 'SELL') return `24h ${c.ch24.toFixed(1)}%，7d ${c.ch7.toFixed(1)}%，賣壓明顯，留意支撐是否跌破。`;
  return `24h ${c.ch24>=0?'+':''}${c.ch24.toFixed(1)}%，盤整格局，建議觀望等待方向確認。`;
}

// ============ RENDER: TOP TICKER ============
function renderTicker() {
  const top6 = coins.slice(0, 6);
  document.getElementById('ticker-strip').innerHTML = top6.map(c => {
    const dir = c.ch24 >= 0 ? 'up' : 'dn';
    return `<span>${c.sym} <b>${fmtPrice(c.price)}</b> <span class="${dir}">${c.ch24>=0?'+':''}${c.ch24.toFixed(1)}%</span></span>`;
  }).join('');
}

// ============ RENDER: COIN ROW ============
function coinRowHTML(c, showStar=true) {
  const dir = c.ch24 >= 0 ? 'up' : 'dn';
  const sig = computeSignal(c);
  const isFav = favorites.includes(c.id);
  return `<div class="coin-row" onclick="openDetail('${c.id}')">
    <div class="coin-glyph">${c.sym.slice(0,4)}</div>
    <div class="coin-info">
      <div class="coin-sym">${c.sym} <span class="sig-tag ${sig}">${signalLabel(sig)}</span></div>
      <div class="coin-name">${c.name}</div>
    </div>
    <div class="coin-right">
      <div class="coin-price">${fmtPrice(c.price)}</div>
      <div class="coin-chg ${dir}">${c.ch24>=0?'+':''}${c.ch24.toFixed(2)}%</div>
    </div>
    ${showStar ? `<div class="star-btn ${isFav?'active':''}" onclick="event.stopPropagation();toggleFav('${c.id}')">${isFav?'★':'☆'}</div>` : ''}
  </div>`;
}

function renderMarketScreen() {
  const favList = coins.filter(c => favorites.includes(c.id));
  const favEl = document.getElementById('favorites-list');
  favEl.innerHTML = favList.length
    ? favList.map(c => coinRowHTML(c)).join('')
    : `<div class="empty-state"><div class="icon">☆</div>點擊幣種旁的星星加入最愛</div>`;

  document.getElementById('all-coins-list').innerHTML = coins.map(c => coinRowHTML(c)).join('');
}

function toggleFav(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  saveState('cai_favorites', favorites);
  renderMarketScreen();
  if (currentDetailId === id) updateFavToggleBtn();
}

function toggleFavCurrent() { toggleFav(currentDetailId); }
function updateFavToggleBtn() {
  const btn = document.getElementById('fav-toggle');
  const isFav = favorites.includes(currentDetailId);
  btn.textContent = isFav ? '★ 已加入最愛' : '☆ 加入最愛';
  btn.classList.toggle('active', isFav);
}

// ============ NAVIGATION ============
function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.screen === name));
  if (name === 'portfolio') renderPortfolio();
  if (name === 'alerts') { renderAlerts(); renderNews(); }
}

function openDetail(id) {
  currentDetailId = id;
  switchScreen('detail-internal'); // placeholder, handled below
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-detail').classList.add('active');
  renderDetail();
}

// ============ FALLBACK PSEUDO-CANDLE GENERATION (offline, deterministic from price) ============
function generateSeries(c, days) {
  const points = days === 1 ? 24 : days === 7 ? 42 : days === 30 ? 60 : 90;
  const totalChange = days === 1 ? c.ch24 : days === 7 ? c.ch7 : days === 30 ? c.ch7*1.8 : c.ch7*3.2;
  const startPrice = c.price / (1 + totalChange/100);
  let seed = c.sym.charCodeAt(0) * 7 + c.sym.charCodeAt(1) * 13;
  function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  const candles = [];
  let p = startPrice;
  for (let i=0;i<points;i++) {
    const progress = i/(points-1);
    const target = startPrice + (c.price - startPrice) * progress;
    const noise = (rand()-0.5) * Math.abs(c.price)*0.015;
    const open = p;
    p = target + noise;
    const close = p;
    const high = Math.max(open,close) + Math.abs(rand())*Math.abs(c.price)*0.004;
    const low = Math.min(open,close) - Math.abs(rand())*Math.abs(c.price)*0.004;
    candles.push({ open, high, low, close });
  }
  candles[candles.length-1].close = c.price;
  return candles;
}

// ============ REAL OHLC FETCH (CoinGecko) ============
const ohlcCache = {};
async function fetchRealOHLC(coinId, days) {
  const cacheKey = `${coinId}-${days}`;
  if (ohlcCache[cacheKey]) return ohlcCache[cacheKey];
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 6000);
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 3) throw new Error('insufficient data');
    const candles = data.map(d => ({ time: d[0], open: d[1], high: d[2], low: d[3], close: d[4] }));
    ohlcCache[cacheKey] = candles;
    return candles;
  } catch(e) {
    return null;
  }
}

// ============ INDICATORS (accept array of closes, numbers) ============
function calcRSI(closes, period=14) {
  if (closes.length < period+1) period = Math.max(3, closes.length-2);
  let gains=0, losses=0;
  for (let i=1;i<=period;i++) {
    const d = closes[i]-closes[i-1];
    if (d>=0) gains+=d; else losses-=d;
  }
  let avgGain=gains/period, avgLoss=losses/period;
  for (let i=period+1;i<closes.length;i++) {
    const d = closes[i]-closes[i-1];
    const g = d>0?d:0, l=d<0?-d:0;
    avgGain = (avgGain*(period-1)+g)/period;
    avgLoss = (avgLoss*(period-1)+l)/period;
  }
  if (avgLoss===0) return 100;
  const rs = avgGain/avgLoss;
  return 100 - (100/(1+rs));
}
function ema(values, period) {
  const k = 2/(period+1);
  let out = [values[0]];
  for (let i=1;i<values.length;i++) out.push(values[i]*k + out[i-1]*(1-k));
  return out;
}
function calcMACD(closes) {
  const p = Math.min(12, Math.floor(closes.length/3));
  const p2 = Math.min(26, Math.floor(closes.length/1.5));
  if (closes.length < 5) return null;
  const e1 = ema(closes, Math.max(3,p)), e2 = ema(closes, Math.max(5,p2));
  const macdLine = e1.map((v,i)=>v-e2[i]);
  const sig = ema(macdLine, 5);
  return { hist: macdLine[macdLine.length-1] - sig[sig.length-1] };
}
function calcMA(closes, period) {
  const p = Math.min(period, closes.length);
  return closes.slice(-p).reduce((a,b)=>a+b,0)/p;
}
function calcATR(closes) {
  if (closes.length<2) return 0;
  let sum=0;
  for (let i=1;i<closes.length;i++) sum += Math.abs(closes[i]-closes[i-1]);
  return (sum/(closes.length-1))/closes[closes.length-1]*100;
}

// ============ REAL CANDLESTICK CHART (canvas) ============
function drawCandleChart(candles) {
  const canvas = document.getElementById('mini-chart');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 200 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const w = rect.width, h = 200;
  ctx.clearRect(0,0,w,h);

  const highs = candles.map(c=>c.high), lows = candles.map(c=>c.low);
  const min = Math.min(...lows), max = Math.max(...highs);
  const range = (max-min) || 1;
  const padTop = 10, padBottom = 10;
  const plotH = h - padTop - padBottom;

  const n = candles.length;
  const slotW = w / n;
  const bodyW = Math.max(1.5, slotW * 0.62);

  const yFor = (price) => padTop + (1 - (price-min)/range) * plotH;

  candles.forEach((c, i) => {
    const xCenter = slotW * i + slotW/2;
    const up = c.close >= c.open;
    const color = up ? '#2dd4a3' : '#ff5c6c';

    // wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xCenter, yFor(c.high));
    ctx.lineTo(xCenter, yFor(c.low));
    ctx.stroke();

    // body
    const yOpen = yFor(c.open), yClose = yFor(c.close);
    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
    ctx.fillStyle = color;
    ctx.fillRect(xCenter - bodyW/2, bodyTop, bodyW, bodyHeight);
  });
}

// ============ DETAIL SCREEN ============
function renderDetail() {
  const c = getCoin(currentDetailId);
  if (!c) return;
  document.getElementById('d-sym').textContent = `${c.sym} · ${c.name.toUpperCase()}`;
  document.getElementById('d-price').textContent = fmtPrice(c.price);
  const chgEl = document.getElementById('d-chg');
  chgEl.textContent = `${c.ch24>=0?'+':''}${c.ch24.toFixed(2)}% (24h)`;
  chgEl.style.color = c.ch24>=0 ? 'var(--up)' : 'var(--down)';

  updateFavToggleBtn();
  renderChartAndIndicators();
  renderAIForDetail(c);
}

async function renderChartAndIndicators() {
  const c = getCoin(currentDetailId);
  const tfMap = { 1:1, 7:7, 30:30, 90:90 };
  const days = tfMap[currentTF] || 7;

  // show loading state briefly
  const srcTag = document.getElementById('chart-src');
  if (srcTag) srcTag.textContent = '載入中...';

  let candles = await fetchRealOHLC(c.id, days);
  let isReal = true;
  if (!candles || candles.length < 5) {
    candles = generateSeries(c, currentTF);
    isReal = false;
  }

  // if user navigated away/changed coin while fetch was in flight, abort render
  if (getCoin(currentDetailId).id !== c.id) return;

  drawCandleChart(candles);
  if (srcTag) srcTag.textContent = isReal ? '真實K線數據' : '模擬走勢（離線）';

  const closes = candles.map(k => k.close);
  const highs = candles.map(k => k.high);
  const lows = candles.map(k => k.low);

  const rsi = calcRSI(closes);
  const rsiEl = document.getElementById('ind-rsi'), rsiFill = document.getElementById('ind-rsi-fill'), rsiCap = document.getElementById('ind-rsi-cap');
  rsiEl.textContent = rsi.toFixed(1);
  rsiFill.style.width = rsi+'%';
  if (rsi>70) { rsiEl.className='ind-num dn'; rsiFill.style.background='var(--down)'; rsiCap.textContent='超買區間'; }
  else if (rsi<30) { rsiEl.className='ind-num up'; rsiFill.style.background='var(--up)'; rsiCap.textContent='超賣區間'; }
  else { rsiEl.className='ind-num neu'; rsiFill.style.background='var(--accent)'; rsiCap.textContent='中性區間'; }

  const macd = calcMACD(closes);
  const macdEl = document.getElementById('ind-macd'), macdCap = document.getElementById('ind-macd-cap');
  if (macd) {
    macdEl.textContent = macd.hist>0?'正向':'負向';
    macdEl.className = 'ind-num ' + (macd.hist>0?'up':'dn');
    macdCap.textContent = macd.hist>0 ? '柱狀圖轉正，動能轉強' : '柱狀圖轉負，動能偏弱';
  }

  const ma7 = calcMA(closes,7), maLong = calcMA(closes, Math.min(25,closes.length));
  const maEl = document.getElementById('ind-ma'), maCap = document.getElementById('ind-ma-cap');
  const bullish = ma7 > maLong;
  maEl.textContent = bullish ? '偏多' : '偏空';
  maEl.className = 'ind-num ' + (bullish?'up':'dn');
  maCap.textContent = bullish ? '短均線在長均線之上' : '短均線在長均線之下';

  const atr = calcATR(closes);
  const atrEl = document.getElementById('ind-atr'), atrCap = document.getElementById('ind-atr-cap');
  atrEl.textContent = atr.toFixed(2)+'%';
  atrEl.className = 'ind-num ' + (atr>4?'dn':atr>1.5?'neu':'up');
  atrCap.textContent = atr>4 ? '波動劇烈' : atr>1.5 ? '正常區間' : '波動平緩';

  // signal banner
  const sig = computeSignal(c);
  const banner = document.getElementById('signal-banner');
  banner.className = 'signal-banner ' + sig;
  document.getElementById('sig-verdict').textContent = (sig==='BUY'?'✦ 買入訊號':sig==='SELL'?'✦ 賣出訊號':'— 觀望訊號');
  document.getElementById('sig-why').textContent = signalReason(c) + ` RSI ${rsi.toFixed(0)}，均線${bullish?'偏多':'偏空'}排列，波動率${atr.toFixed(1)}%。`;
}

document.getElementById('tf-row').addEventListener('click', (e) => {
  const pill = e.target.closest('.tf-pill');
  if (!pill) return;
  document.querySelectorAll('.tf-pill').forEach(p=>p.classList.remove('active'));
  pill.classList.add('active');
  currentTF = parseInt(pill.dataset.d);
  renderChartAndIndicators();
});

function renderAIForDetail(c) {
  const sig = computeSignal(c);
  const verdict = sig==='BUY' ? '技術面與動能呈現偏多訊號' : sig==='SELL' ? '短線賣壓較重，建議謹慎' : '目前處於盤整格局，方向尚不明確';
  const strategy = sig==='BUY'
    ? '短線可關注回踩支撐的進場機會；中長期持有者可考慮分批加碼。'
    : sig==='SELL'
    ? '短線交易者宜降低曝險或設定停損；中長期持有者可觀察是否跌破關鍵支撐再決定加碼時機。'
    : '建議耐心等待量價配合的突破訊號，避免在盤整區間頻繁進出。';

  document.getElementById('d-ai-report').innerHTML = `
    <h3>市場研判</h3>
    <p>${c.name}（${c.sym}）24小時${c.ch24>=0?'上漲':'下跌'} ${Math.abs(c.ch24).toFixed(2)}%，7日${c.ch7>=0?'上漲':'下跌'} ${Math.abs(c.ch7).toFixed(2)}%。${verdict}。</p>
    <h3>操作策略</h3>
    <p>${strategy}</p>
    <h3>風險提示</h3>
    <p>加密貨幣價格波動劇烈，本分析基於歷史價格動能計算，不構成投資建議，請自行評估風險並謹慎操作。</p>
  `;
}

// ============ PORTFOLIO ============
function populateCoinSelect(selectEl) {
  selectEl.innerHTML = coins.map(c => `<option value="${c.id}">${c.sym} — ${c.name}</option>`).join('');
}

function openAddHolding() {
  populateCoinSelect(document.getElementById('h-coin'));
  document.getElementById('h-amount').value = '';
  showModal('modal-holding');
}
function confirmAddHolding() {
  const id = document.getElementById('h-coin').value;
  const amount = parseFloat(document.getElementById('h-amount').value);
  if (!amount || amount <= 0) { toast('請輸入有效數量'); return; }
  const existing = holdings.find(h => h.id === id);
  if (existing) existing.amount += amount;
  else holdings.push({ id, amount });
  saveState('cai_holdings', holdings);
  closeModal('modal-holding');
  renderPortfolio();
  toast('已新增持倉');
}
function removeHolding(id) {
  holdings = holdings.filter(h => h.id !== id);
  saveState('cai_holdings', holdings);
  renderPortfolio();
}

function renderPortfolio() {
  let total = 0;
  let weightedCh = 0;
  const rows = holdings.map(h => {
    const c = getCoin(h.id);
    if (!c) return '';
    const val = c.price * h.amount;
    total += val;
    weightedCh += val * c.ch24;
    return `<div class="pf-row">
      <div class="coin-glyph">${c.sym.slice(0,4)}</div>
      <div class="pf-row-info">
        <div class="coin-sym">${c.sym}</div>
        <div class="pf-row-amt">${h.amount} ${c.sym}</div>
      </div>
      <div class="pf-row-val">
        <div>${fmtPrice(val)}</div>
        <div class="coin-chg ${c.ch24>=0?'up':'dn'}">${c.ch24>=0?'+':''}${c.ch24.toFixed(2)}%</div>
      </div>
      <div class="pf-del" onclick="removeHolding('${h.id}')">✕</div>
    </div>`;
  }).join('');

  document.getElementById('portfolio-list').innerHTML = rows || `<div class="empty-state"><div class="icon">◈</div>尚未新增任何持倉</div>`;
  document.getElementById('pf-total').textContent = fmtPrice(total);
  const avgCh = total > 0 ? weightedCh/total : 0;
  const chgEl = document.getElementById('pf-total-chg');
  if (total > 0) {
    chgEl.textContent = `${avgCh>=0?'+':''}${avgCh.toFixed(2)}% (24h 加權)`;
    chgEl.style.color = avgCh>=0 ? 'var(--up)' : 'var(--down)';
  } else {
    chgEl.textContent = '尚無持倉';
    chgEl.style.color = 'var(--text-faint)';
  }
}

// ============ ALERTS ============
function openAlertModal() {
  populateCoinSelect(document.getElementById('a-coin'));
  if (currentDetailId) document.getElementById('a-coin').value = currentDetailId;
  document.getElementById('a-price').value = '';
  showModal('modal-alert');
}
function confirmAddAlert() {
  const id = document.getElementById('a-coin').value;
  const cond = document.getElementById('a-cond').value;
  const price = parseFloat(document.getElementById('a-price').value);
  if (!price || price <= 0) { toast('請輸入有效價格'); return; }
  alerts.push({ id: Date.now().toString(), coinId: id, cond, price, fired:false });
  saveState('cai_alerts', alerts);
  closeModal('modal-alert');
  renderAlerts();
  toast('提醒已設定');
}
function removeAlert(id) {
  alerts = alerts.filter(a => a.id !== id);
  saveState('cai_alerts', alerts);
  renderAlerts();
}
function renderAlerts() {
  const rows = alerts.map(a => {
    const c = getCoin(a.coinId);
    if (!c) return '';
    return `<div class="pf-row">
      <div class="coin-glyph">${c.sym.slice(0,4)}</div>
      <div class="pf-row-info">
        <div class="coin-sym">${c.sym}</div>
        <div class="pf-row-amt">${a.cond==='above'?'高於':'低於'} ${fmtPrice(a.price)}</div>
      </div>
      <div class="pf-row-val">${a.fired ? '<span style="color:var(--accent)">已觸發</span>' : '監控中'}</div>
      <div class="pf-del" onclick="removeAlert('${a.id}')">✕</div>
    </div>`;
  }).join('');
  document.getElementById('alerts-list').innerHTML = rows || `<div class="empty-state"><div class="icon">◔</div>尚未設定任何提醒</div>`;
}
function checkAlerts() {
  let changed = false;
  alerts.forEach(a => {
    if (a.fired) return;
    const c = getCoin(a.coinId);
    if (!c) return;
    if ((a.cond==='above' && c.price >= a.price) || (a.cond==='below' && c.price <= a.price)) {
      a.fired = true;
      changed = true;
      toast(`🔔 ${c.sym} 已${a.cond==='above'?'突破':'跌破'} ${fmtPrice(a.price)}`);
      if ('Notification' in window && Notification.permission === 'granted') {
        try { new Notification(`${c.sym} 價格提醒`, { body: `已${a.cond==='above'?'突破':'跌破'} ${fmtPrice(a.price)}` }); } catch(e){}
      }
    }
  });
  if (changed) { saveState('cai_alerts', alerts); renderAlerts(); }
}

// ============ NEWS ============
function renderNews() {
  document.getElementById('news-list').innerHTML = NEWS_SNAPSHOT.map(n => `
    <div class="news-card">
      <div class="news-tag">${n.tag}</div>
      <div class="news-title">${n.title}</div>
      <div class="news-meta">${n.time}</div>
    </div>
  `).join('');
}

// ============ MODAL ============
function showModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('show'); });
});

// ============ LIVE DATA FETCH (best-effort, never blocks) ============
async function tryFetchLive() {
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const ids = coins.map(c=>c.id).join(',');
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 6000);
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=7d`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error('empty');
    const byId = {};
    data.forEach(d => byId[d.id] = d);
    coins.forEach(c => {
      const d = byId[c.id];
      if (!d) return;
      c.price = d.current_price;
      c.ch24 = d.price_change_percentage_24h || 0;
      c.ch7 = d.price_change_percentage_7d_in_currency || 0;
      c.mcap = d.market_cap;
      c.vol = d.total_volume;
    });
    dataIsLive = true;
    statusPill.className = 'status-pill live';
    statusText.textContent = '即時數據 · ' + new Date().toLocaleTimeString('zh-TW',{hour12:false});
    refreshAllViews();
  } catch(e) {
    dataIsLive = false;
    statusPill.className = 'status-pill stale';
    statusText.textContent = '離線快照數據（無法連線）';
  }
}

function manualRefresh() { toast('正在嘗試更新...'); tryFetchLive(); }

function refreshAllViews() {
  renderTicker();
  renderMarketScreen();
  if (document.getElementById('screen-detail').classList.contains('active')) renderDetail();
  if (document.getElementById('screen-portfolio').classList.contains('active')) renderPortfolio();
  checkAlerts();
}

// ============ CLOCK ============
setInterval(() => {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('zh-TW',{hour12:false});
}, 1000);

// ============ NOTIFICATION PERMISSION (best-effort) ============
if ('Notification' in window && Notification.permission === 'default') {
  // ask politely after first interaction, not on load
}

// ============ SERVICE WORKER ============
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}

// ============ INIT ============
renderTicker();
renderMarketScreen();
renderDetail();
document.getElementById('status-text').textContent = '離線快照數據（2026/6/29）';
tryFetchLive();
