/* =========================================================
   Automatic livestreams from YouTube
   - Shows the 3 most recent livestreams in "Prédicas anteriores"
   - Shows an "EN VIVO AHORA" player while the church is live
   Only setting you must change: apiKey (see README-youtube.txt)
   ========================================================= */
const YT_CONFIG = {
  apiKey: 'PEGA_TU_API_KEY_AQUI',          // <-- paste your YouTube API key here
  channelId: 'UCp0e_TNVQrB-KdrJ4xG9-Rw',   // New Day New Beginning Church
  count: 3,                                 // how many past livestreams to show
  cacheMinutes: 10,                         // how long to reuse results before asking YouTube again
};

(async function loadLivestreams() {
  const grid = document.getElementById('sermons-grid');
  if (!grid) return;
  if (!YT_CONFIG.apiKey || YT_CONFIG.apiKey.startsWith('PEGA')) {
    console.warn('youtube.js: no API key set — showing the backup videos.');
    return;
  }

  let data = readCache();
  if (!data) {
    try {
      data = await fetchStreams();
      writeCache(data);
    } catch (err) {
      console.warn('youtube.js: could not load videos — showing the backup videos.', err);
      return;
    }
  }

  renderLive(data.live);
  renderPast(grid, data.past);
})();

async function fetchStreams() {
  const base = 'https://www.googleapis.com/youtube/v3';
  const key = encodeURIComponent(YT_CONFIG.apiKey);
  // Every channel's "uploads" playlist is its channel ID with UC swapped for UU
  const uploadsId = 'UU' + YT_CONFIG.channelId.slice(2);

  // 1) Latest 25 uploads (livestreams land here too)
  const listRes = await fetch(
    `${base}/playlistItems?part=contentDetails&maxResults=25&playlistId=${uploadsId}&key=${key}`
  );
  if (!listRes.ok) throw new Error('playlistItems ' + listRes.status);
  const list = await listRes.json();
  const ids = (list.items || []).map((i) => i.contentDetails.videoId);
  if (!ids.length) return { live: null, past: [] };

  // 2) Details for those videos, so we can tell which ones were livestreams
  const vidRes = await fetch(
    `${base}/videos?part=snippet,liveStreamingDetails&id=${ids.join(',')}&key=${key}`
  );
  if (!vidRes.ok) throw new Error('videos ' + vidRes.status);
  const vids = (await vidRes.json()).items || [];

  const simplify = (v) => ({
    id: v.id,
    title: v.snippet.title,
    date: (v.liveStreamingDetails && v.liveStreamingDetails.actualStartTime) || v.snippet.publishedAt,
  });

  const live = vids.find((v) => v.snippet.liveBroadcastContent === 'live');
  const past = vids
    .filter((v) => v.liveStreamingDetails && v.liveStreamingDetails.actualEndTime)
    .map(simplify)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, YT_CONFIG.count);

  return { live: live ? simplify(live) : null, past };
}

function makePlayer(videoId, title) {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.title = title;
  iframe.loading = 'lazy';
  iframe.allowFullscreen = true;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  return iframe;
}

function renderLive(live) {
  const box = document.getElementById('live-now');
  if (!box || !live) return;
  document.getElementById('live-now-player').appendChild(makePlayer(live.id, live.title));
  document.getElementById('live-now-title').textContent = live.title;
  box.hidden = false;
}

function renderPast(grid, past) {
  if (!past || !past.length) return; // keep the backup videos
  const fmt = new Intl.DateTimeFormat('es-US', { day: 'numeric', month: 'long', year: 'numeric' });

  grid.innerHTML = '';
  past.forEach((v) => {
    const card = document.createElement('article');
    card.className = 'sermon-card';

    const player = document.createElement('div');
    player.className = 'video';
    player.appendChild(makePlayer(v.id, v.title));

    const title = document.createElement('h3');
    title.className = 'sermon-card__title';
    title.textContent = v.title;

    const date = document.createElement('p');
    date.className = 'sermon-card__date';
    date.textContent = fmt.format(new Date(v.date));

    card.append(player, title, date);
    grid.appendChild(card);
  });
}

/* ---- small cache so every visitor doesn't use up the daily YouTube quota ---- */
const CACHE_KEY = 'ndnb-youtube-cache';

function readCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (saved && Date.now() - saved.time < YT_CONFIG.cacheMinutes * 60 * 1000) return saved.data;
  } catch (e) { /* ignore */ }
  return null;
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
  } catch (e) { /* ignore */ }
}
