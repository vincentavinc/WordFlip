/**
 * Název aktuální verze cache.
 * Při změně seznamu cachovaných souborů je vhodné zvýšit číslo verze,
 * aby se odstranila stará cache a načetly se nové soubory.
 *
 * @type {string}
 */
const CACHE_NAME = "wordflip-cache-v8";

/**
 * Seznam souborů, které se mají uložit do cache pro offline režim.
 * Obsahuje HTML, CSS, JavaScript moduly, manifest, ikonu a zvukové soubory.
 *
 * @type {string[]}
 */
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",

  "./js/app.js",
  "./js/router.js",
  "./js/store.js",
  "./js/models.js",
  "./js/audio.js",
  "./js/stats.js",
  "./js/components/flash-card.js",

  "./js/views/decksPage.js",
  "./js/views/deckDetailPage.js",
  "./js/views/learningPage.js",
  "./js/views/statsPage.js",
  "./js/ui/modals.js",
  "./js/ui/headerControls.js",
  "./js/features/dragDrop.js",
  "./js/utils/escapeHtml.js",

  "./assets/icons/logo.svg",

  "./assets/audio/flip.mp3",
  "./assets/audio/correct.mp3",
  "./assets/audio/wrong.mp3",
  "./assets/audio/background.mp3"
];

/**
 * Událost install se spustí při instalaci service workeru.
 * Během instalace se otevře cache a uloží se do ní všechny základní soubory aplikace.
 */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

/**
 * Událost activate se spustí po aktivaci nové verze service workeru.
 * Odstraní staré cache, které nemají aktuální název CACHE_NAME.
 */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

/**
 * Událost fetch zachytává síťové požadavky aplikace.
 * Service worker se nejprve pokusí najít odpověď v cache.
 * Pokud soubor v cache není, požadavek se pošle na síť.
 * Pokud síť není dostupná a jde o navigaci, vrátí se index.html jako fallback pro SPA.
 */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return Response.error();
      });
    })
  );
});