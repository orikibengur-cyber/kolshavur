// קול־שבור service worker
// 1. Caches the app shell so it opens instantly and works with no signal.
// 2. Receives files shared from other apps (Android Web Share Target).
// The Whisper model is cached separately by transformers.js, so it is not handled here.
const V = 'kolshavur-v3';
const SHARE = 'kolshavur-share';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V && k !== SHARE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // ── Share Target ────────────────────────────────────────────
  // WhatsApp (and anything else) POSTs the shared voice note here.
  // Stash it in a cache, then redirect to the app, which picks it up.
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try {
        const form = await e.request.formData();
        const file = form.get('audio');
        const text = (form.get('text') || form.get('url') || '').toString().trim();
        const cache = await caches.open(SHARE);
        if (file && file.size) {
          await cache.put('shared-audio', new Response(file, {
            headers: {
              'content-type': file.type || 'application/octet-stream',
              'x-filename': encodeURIComponent(file.name || 'voice-note'),
            }
          }));
          return Response.redirect('./index.html?shared=audio', 303);
        }
        if (text) {
          await cache.put('shared-text', new Response(text));
          return Response.redirect('./index.html?shared=text', 303);
        }
      } catch (err) { /* fall through to a normal open */ }
      return Response.redirect('./index.html', 303);
    })());
    return;
  }

  if (e.request.method !== 'GET') return;
  // Never cache translation or speech calls — they must always be live.
  if (/translate|huggingface|jsdelivr/.test(url.hostname)) return;
  if (url.origin !== location.origin) return;

  // Network-first so a re-upload is picked up on next open, cache as offline fallback.
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.ok) {
          const copy = r.clone();
          caches.open(V).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
