// ============ SNAPSHOT DATA (2026-06-29) — used as offline-first base, shown before live list loads ============
// id == Binance symbol (e.g. 'BTCUSDT') so the whole app can scale to any number of coins with one consistent key
const SNAPSHOT = [
  { id:'BTCUSDT', sym:'BTC', name:'Bitcoin', price:59668.09, ch24:-0.43, ch7:-2.1, mcap:0, vol:31512449517 },
  { id:'ETHUSDT', sym:'ETH', name:'Ethereum', price:1586.26, ch24:0.39, ch7:1.8, mcap:0, vol:12454909904 },
  { id:'BNBUSDT', sym:'BNB', name:'BNB', price:554.17, ch24:-0.18, ch7:0.6, mcap:0, vol:765022148 },
  { id:'XRPUSDT', sym:'XRP', name:'XRP', price:1.05, ch24:-0.31, ch7:0.98, mcap:0, vol:1938176312 },
  { id:'SOLUSDT', sym:'SOL', name:'Solana', price:74.25, ch24:2.04, ch7:4.97, mcap:0, vol:4229713062 },
  { id:'DOGEUSDT', sym:'DOGE', name:'Dogecoin', price:0.07248, ch24:-1.15, ch7:-3.6, mcap:0, vol:980000000 },
  { id:'TRXUSDT', sym:'TRX', name:'TRON', price:0.3215, ch24:0.26, ch7:-3.6, mcap:0, vol:575108814 },
  { id:'ADAUSDT', sym:'ADA', name:'Cardano', price:0.398, ch24:-0.8, ch7:-1.2, mcap:0, vol:320000000 },
  { id:'DOTUSDT', sym:'DOT', name:'Polkadot', price:4.12, ch24:3.4, ch7:8.1, mcap:0, vol:210000000 },
  { id:'AVAXUSDT', sym:'AVAX', name:'Avalanche', price:18.6, ch24:1.1, ch7:2.3, mcap:0, vol:280000000 },
  { id:'LINKUSDT', sym:'LINK', name:'Chainlink', price:11.4, ch24:0.5, ch7:-0.9, mcap:0, vol:340000000 },
  { id:'LTCUSDT', sym:'LTC', name:'Litecoin', price:78.3, ch24:-0.6, ch7:1.4, mcap:0, vol:410000000 },
  { id:'SHIBUSDT', sym:'SHIB', name:'Shiba Inu', price:0.0000112, ch24:-1.8, ch7:-4.2, mcap:0, vol:190000000 },
  { id:'UNIUSDT', sym:'UNI', name:'Uniswap', price:6.8, ch24:1.9, ch7:3.1, mcap:0, vol:120000000 },
  { id:'NEARUSDT', sym:'NEAR', name:'NEAR Protocol', price:2.9, ch24:2.6, ch7:5.4, mcap:0, vol:140000000 },
  { id:'APTUSDT', sym:'APT', name:'Aptos', price:4.4, ch24:-1.1, ch7:-2.8, mcap:0, vol:95000000 },
  { id:'ARBUSDT', sym:'ARB', name:'Arbitrum', price:0.42, ch24:0.8, ch7:1.6, mcap:0, vol:88000000 },
  { id:'OPUSDT', sym:'OP', name:'Optimism', price:0.75, ch24:-0.4, ch7:0.3, mcap:0, vol:62000000 },
  { id:'SUIUSDT', sym:'SUI', name:'Sui', price:1.85, ch24:3.9, ch7:7.2, mcap:0, vol:310000000 },
  { id:'XLMUSDT', sym:'XLM', name:'Stellar', price:0.1723, ch24:-0.9, ch7:-1.6, mcap:0, vol:140000000 },
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
let currentDetailId = 'BTCUSDT';
let currentTF = '1h';
let coinListExpanded = false; // becomes true once the full ~200-coin list has loaded

// Friendly display names for common base assets; falls back to the base asset code itself if unlisted
const COIN_NAMES = {
  BTC:'Bitcoin', ETH:'Ethereum', BNB:'BNB', XRP:'XRP', SOL:'Solana', DOGE:'Dogecoin',
  TRX:'TRON', ADA:'Cardano', DOT:'Polkadot', AVAX:'Avalanche', LINK:'Chainlink', LTC:'Litecoin',
  SHIB:'Shiba Inu', UNI:'Uniswap', NEAR:'NEAR Protocol', APT:'Aptos', ARB:'Arbitrum', OP:'Optimism',
  SUI:'Sui', XLM:'Stellar', BCH:'Bitcoin Cash', ATOM:'Cosmos', FIL:'Filecoin', ICP:'Internet Computer',
  ETC:'Ethereum Classic', HBAR:'Hedera', VET:'VeChain', RENDER:'Render', INJ:'Injective', TIA:'Celestia',
  SEI:'Sei', GRT:'The Graph', ALGO:'Algorand', FTM:'Fantom', SAND:'The Sandbox', MANA:'Decentraland',
  AAVE:'Aave', MKR:'Maker', SNX:'Synthetix', CRV:'Curve DAO', LDO:'Lido DAO', RUNE:'THORChain',
  IMX:'Immutable', FLOW:'Flow', EGLD:'MultiversX', XTZ:'Tezos', THETA:'Theta Network', EOS:'EOS',
  KAVA:'Kava', MINA:'Mina', ZEC:'Zcash', DASH:'Dash', NEO:'NEO', QTUM:'Qtum', WAVES:'Waves',
  CHZ:'Chiliz', ENJ:'Enjin Coin', BAT:'Basic Attention Token', ZIL:'Zilliqa', ONE:'Harmony',
  GALA:'Gala', AXS:'Axie Infinity', FET:'Fetch.ai', AGIX:'SingularityNET', OCEAN:'Ocean Protocol',
  PEPE:'Pepe', WIF:'dogwifhat', BONK:'Bonk', FLOKI:'Floki', JUP:'Jupiter', PYTH:'Pyth Network',
  ORDI:'ORDI', WLD:'Worldcoin', STX:'Stacks', RNDR:'Render', TON:'Toncoin', PENDLE:'Pendle',
  ENS:'Ethereum Name Service', COMP:'Compound', YFI:'yearn.finance', '1INCH':'1inch', SUSHI:'SushiSwap',
  CAKE:'PancakeSwap', GMX:'GMX', DYDX:'dYdX', BLUR:'Blur', MASK:'Mask Network', ROSE:'Oasis Network',
  CFX:'Conflux', KSM:'Kusama', ZRX:'0x Protocol', ANKR:'Ankr', CELR:'Celer Network', SKL:'SKALE',
  COTI:'COTI', STORJ:'Storj', BAND:'Band Protocol', OGN:'Origin Protocol', CTSI:'Cartesi',
  API3:'API3', WOO:'WOO Network', HOOK:'Hooked Protocol', HIGH:'Highstreet', PHB:'Phoenix',
  ID:'SPACE ID', EDU:'Open Campus', ARKM:'Arkham', NOT:'Notcoin', ACE:'Fusionist',
};
function nameFor(symBase, fallbackSym) {
  return COIN_NAMES[symBase] || fallbackSym;
}

function loadState(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch(e) { return fallback; }
}
function saveState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

let favorites = loadState('cai_favorites', ['BTCUSDT','ETHUSDT','SOLUSDT']);
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

  const searchEl = document.getElementById('coin-search');
  const query = searchEl ? searchEl.value.trim().toUpperCase() : '';
  const filtered = query
    ? coins.filter(c => c.sym.toUpperCase().includes(query) || c.name.toUpperCase().includes(query))
    : coins;

  const listEl = document.getElementById('all-coins-list');
  listEl.innerHTML = filtered.length
    ? filtered.map(c => coinRowHTML(c)).join('')
    : `<div class="empty-state"><div class="icon">⌕</div>找不到符合「${query}」的幣種</div>`;
}

const coinSearchEl = document.getElementById('coin-search');
if (coinSearchEl) {
  coinSearchEl.addEventListener('input', () => renderMarketScreen());
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
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-detail').classList.add('active');
  renderDetail();
}

// ============ FALLBACK PSEUDO-CANDLE GENERATION (offline, deterministic from price) ============
function generateSeries(c, interval) {
  const pointsMap = { '15m':60, '1h':60, '4h':60, '1d':60 };
  const volMap = { '15m':0.15, '1h':0.4, '4h':1.0, '1d':2.5 }; // total % swing scale across the window
  const points = pointsMap[interval] || 60;
  const totalChange = (c.ch24 || 0) * (volMap[interval] || 0.4);
  const startPrice = c.price / (1 + totalChange/100);
  let seed = c.sym.charCodeAt(0) * 7 + c.sym.charCodeAt(1) * 13;
  function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  const candles = [];
  let p = startPrice;
  for (let i=0;i<points;i++) {
    const progress = i/(points-1);
    const target = startPrice + (c.price - startPrice) * progress;
    const noise = (rand()-0.5) * Math.abs(c.price)*0.01;
    const open = p;
    p = target + noise;
    const close = p;
    const high = Math.max(open,close) + Math.abs(rand())*Math.abs(c.price)*0.003;
    const low = Math.min(open,close) - Math.abs(rand())*Math.abs(c.price)*0.003;
    candles.push({ open, high, low, close });
  }
  candles[candles.length-1].close = c.price;
  return candles;
}

// ============ REAL K-LINE FETCH (Binance) ============
const klineCache = {};
async function fetchRealOHLC(coinId, interval) {
  const symbol = coinId; // coin.id is already a Binance symbol, e.g. 'BTCUSDT'
  if (!symbol) return null;
  const cacheKey = `${symbol}-${interval}`;
  if (klineCache[cacheKey]) return klineCache[cacheKey];
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 6000);
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=80`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 3) throw new Error('insufficient data');
    // Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
    const candles = data.map(k => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
    }));
    klineCache[cacheKey] = candles;
    return candles;
  } catch(e) {
    return null;
  }
}

// ============ OPEN INTEREST + LONG/SHORT RATIO (Binance Futures) ============
function fmtOI(n) {
  if (n == null) return '--';
  if (n >= 1e9) return (n/1e9).toFixed(2)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(2)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return n.toFixed(0);
}

async function fetchOpenInterestHist(symbol, period='1h') {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 6000);
  try {
    const res = await fetch(`https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=30`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) throw new Error('insufficient data');
    return data.map(d => ({ time: d.timestamp, oi: parseFloat(d.sumOpenInterest), oiValue: parseFloat(d.sumOpenInterestValue) }));
  } catch(e) {
    return null;
  }
}

async function fetchLongShortRatioHist(symbol, period='1h') {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 6000);
  try {
    const res = await fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=${period}&limit=30`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) throw new Error('insufficient data');
    return data.map(d => ({ time: d.timestamp, ratio: parseFloat(d.longShortRatio), longAcct: parseFloat(d.longAccount), shortAcct: parseFloat(d.shortAccount) }));
  } catch(e) {
    return null;
  }
}

// Interpret OI trend + long/short ratio trend into a build/unwind verdict
function interpretPositioning(oiHist, lsrHist) {
  if (!oiHist || !lsrHist || oiHist.length < 2 || lsrHist.length < 2) return null;

  const oiFirst = oiHist[0].oi, oiLast = oiHist[oiHist.length-1].oi;
  const oiChgPct = oiFirst ? ((oiLast - oiFirst) / oiFirst) * 100 : 0;

  const lsrFirst = lsrHist[0].ratio, lsrLast = lsrHist[lsrHist.length-1].ratio;
  const lsrChgPct = lsrFirst ? ((lsrLast - lsrFirst) / lsrFirst) * 100 : 0;

  const oiRising = oiChgPct > 1.5;
  const oiFalling = oiChgPct < -1.5;
  const lsrRising = lsrChgPct > 2; // more long-leaning
  const lsrFalling = lsrChgPct < -2; // more short-leaning

  let verdict = 'FLAT', label = '— 持倉穩定', why;

  if (oiRising && lsrRising) {
    verdict = 'BUILD_LONG'; label = '✦ 多頭建倉中';
    why = `未平倉量上升 ${oiChgPct.toFixed(1)}%，且多空比走升 ${lsrChgPct.toFixed(1)}%，顯示新資金偏向做多，多頭部位持續增加。`;
  } else if (oiRising && lsrFalling) {
    verdict = 'BUILD_SHORT'; label = '✦ 空頭建倉中';
    why = `未平倉量上升 ${oiChgPct.toFixed(1)}%，但多空比下滑 ${Math.abs(lsrChgPct).toFixed(1)}%，顯示新資金偏向做空，空頭部位持續增加。`;
  } else if (oiFalling) {
    verdict = 'UNWIND'; label = '— 部位平倉中';
    why = `未平倉量下降 ${Math.abs(oiChgPct).toFixed(1)}%，顯示市場參與者正在減倉、了結部位，留意行情可能伴隨較大波動。`;
  } else {
    why = `未平倉量變化 ${oiChgPct>=0?'+':''}${oiChgPct.toFixed(1)}%，多空比變化 ${lsrChgPct>=0?'+':''}${lsrChgPct.toFixed(1)}%，目前持倉結構相對穩定，無明顯建倉或平倉跡象。`;
  }

  return { verdict, label, why, oiChgPct, lsrChgPct, oiLast, lsrLast, longAcct: lsrHist[lsrHist.length-1].longAcct, shortAcct: lsrHist[lsrHist.length-1].shortAcct };
}

async function renderPositioningData(coinId) {
  const symbol = coinId; // coin.id is already a Binance symbol
  const banner = document.getElementById('oi-banner');
  const verdictEl = document.getElementById('oi-verdict');
  const whyEl = document.getElementById('oi-why');

  verdictEl.textContent = '— 載入中';
  whyEl.textContent = '正在讀取合約數據...';

  const [oiHist, lsrHist] = await Promise.all([
    fetchOpenInterestHist(symbol, '1h'),
    fetchLongShortRatioHist(symbol, '1h'),
  ]);

  // bail if user navigated to a different coin while this was loading
  if (currentDetailId !== symbol) return;

  const result = interpretPositioning(oiHist, lsrHist);

  if (!result) {
    banner.className = 'oi-banner FLAT';
    verdictEl.textContent = '— 無合約數據';
    whyEl.textContent = '此幣種可能無幣安永續合約市場，或合約數據暫時無法連線。';
    document.getElementById('ind-oi').textContent = '--';
    document.getElementById('ind-oi-chg').textContent = '--';
    document.getElementById('ind-lsr').textContent = '--';
    document.getElementById('ind-lsr-chg').textContent = '--';
    return;
  }

  banner.className = 'oi-banner ' + result.verdict;
  verdictEl.textContent = result.label;
  whyEl.textContent = result.why;

  document.getElementById('ind-oi').textContent = fmtOI(result.oiLast);
  document.getElementById('ind-oi-cap').textContent = symbol + ' 永續合約';

  const oiChgEl = document.getElementById('ind-oi-chg');
  oiChgEl.textContent = (result.oiChgPct>=0?'+':'') + result.oiChgPct.toFixed(2) + '%';
  oiChgEl.className = 'ind-num ' + (result.oiChgPct>1.5?'up':result.oiChgPct<-1.5?'dn':'neu');
  document.getElementById('ind-oi-chg-cap').textContent = result.oiChgPct>1.5 ? '未平倉量增加' : result.oiChgPct<-1.5 ? '未平倉量減少' : '區間變化不大';

  const lsrEl = document.getElementById('ind-lsr');
  lsrEl.textContent = result.lsrLast.toFixed(2);
  lsrEl.className = 'ind-num ' + (result.lsrLast>1?'up':'dn');
  const lsrFill = document.getElementById('ind-lsr-fill');
  const longPct = (result.longAcct*100);
  lsrFill.style.width = longPct + '%';
  lsrFill.style.background = longPct>50 ? 'var(--up)' : 'var(--down)';
  document.getElementById('ind-lsr-cap').textContent = `多方帳戶 ${(result.longAcct*100).toFixed(1)}% ／ 空方帳戶 ${(result.shortAcct*100).toFixed(1)}%`;

  const lsrChgEl = document.getElementById('ind-lsr-chg');
  lsrChgEl.textContent = (result.lsrChgPct>=0?'+':'') + result.lsrChgPct.toFixed(2) + '%';
  lsrChgEl.className = 'ind-num ' + (result.lsrChgPct>2?'up':result.lsrChgPct<-2?'dn':'neu');
  document.getElementById('ind-lsr-chg-cap').textContent = result.lsrChgPct>2 ? '轉向偏多' : result.lsrChgPct<-2 ? '轉向偏空' : '結構穩定';
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
  renderPositioningData(currentDetailId);
  renderAIForDetail(c);
}

async function renderChartAndIndicators() {
  const c = getCoin(currentDetailId);
  const interval = currentTF;

  // show loading state briefly
  const srcTag = document.getElementById('chart-src');
  if (srcTag) srcTag.textContent = '載入中...';

  let candles = await fetchRealOHLC(c.id, interval);
  let isReal = true;
  if (!candles || candles.length < 5) {
    candles = generateSeries(c, interval);
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

const tfRowEl = document.getElementById('tf-row');
if (tfRowEl) {
  tfRowEl.addEventListener('click', (e) => {
    const pill = e.target.closest('.tf-pill');
    if (!pill) return;
    document.querySelectorAll('.tf-pill').forEach(p=>p.classList.remove('active'));
    pill.classList.add('active');
    currentTF = pill.dataset.tf;
    renderChartAndIndicators();
  });
}

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
const TOP_N_COINS = 200;

async function tryFetchLive() {
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 8000);
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error('empty');

    // Keep only USDT pairs, exclude leveraged/UP-DOWN tokens and stablecoin-vs-USDT noise
    const STABLE_BASES = new Set(['USDC','FDUSD','TUSD','BUSD','DAI','USDP','EUR','GBP','USDT']);
    const usdtPairs = data.filter(d => {
      if (!d.symbol.endsWith('USDT')) return false;
      const base = d.symbol.slice(0, -4);
      if (!base) return false;
      if (/(UP|DOWN|BULL|BEAR)$/.test(base)) return false; // leveraged tokens
      if (STABLE_BASES.has(base)) return false;
      return true;
    });

    // Sort by quote volume (USDT traded) descending, take top N
    usdtPairs.sort((a,b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
    const top = usdtPairs.slice(0, TOP_N_COINS);

    const existingById = {};
    coins.forEach(c => existingById[c.id] = c);

    const newCoins = top.map(d => {
      const base = d.symbol.slice(0, -4);
      const prev = existingById[d.symbol];
      return {
        id: d.symbol,
        sym: base,
        name: nameFor(base, base),
        price: parseFloat(d.lastPrice),
        ch24: parseFloat(d.priceChangePercent),
        ch7: prev ? prev.ch7 : parseFloat(d.priceChangePercent) * 0.6, // no 7d data from this endpoint; rough estimate, refined further below if previously known
        mcap: 0,
        vol: parseFloat(d.quoteVolume),
      };
    });

    coins = newCoins;
    coinListExpanded = true;
    dataIsLive = true;
    statusPill.className = 'status-pill live';
    statusText.textContent = `即時數據 · 前${coins.length}幣種 · ` + new Date().toLocaleTimeString('zh-TW',{hour12:false});

    // ensure currentDetailId still points at a coin that exists; fall back to BTCUSDT
    if (!getCoin(currentDetailId)) currentDetailId = 'BTCUSDT';

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
  const activeScreen = document.querySelector('.screen.active');
  const activeId = activeScreen ? activeScreen.id : '';
  if (activeId === 'screen-detail') renderDetail();
  if (activeId === 'screen-portfolio') renderPortfolio();
  if (activeId === 'screen-alerts') { renderAlerts(); renderNews(); }
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
function initApp() {
  try {
    renderTicker();
    renderMarketScreen();
    renderDetail();
  } catch(e) { console.error('init render error', e); }
  const statusTextEl = document.getElementById('status-text');
  if (statusTextEl) statusTextEl.textContent = '離線快照數據（2026/6/29）';
  tryFetchLive();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// safety net: ensure market list shows real coin rows, not just the static placeholder
setTimeout(() => {
  const grid = document.getElementById('all-coins-list');
  if (grid && !grid.querySelector('.coin-row')) {
    try { renderTicker(); renderMarketScreen(); } catch(e) {}
  }
}, 1000);
