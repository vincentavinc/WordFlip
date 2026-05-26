import { Router } from "./router.js";
import { FlashcardStore } from "./store.js";
import { AudioController } from "./audio.js";

import { renderDecksPage } from "./views/decksPage.js";
import { renderDeckDetailPage } from "./views/deckDetailPage.js";
import { renderLearningPage } from "./views/learningPage.js";
import { renderStatsPage } from "./views/statsPage.js";

import {
  setupNetworkStatus,
  setupAudioButton,
  registerServiceWorker
} from "./ui/headerControls.js";

/**
 * Hlavní HTML element aplikace.
 * Do tohoto elementu router vykresluje jednotlivé stránky.
 *
 * @type {HTMLElement}
 */
const app = document.getElementById("app");

/**
 * HTML element pro zobrazení aktuálního stavu připojení k internetu.
 *
 * @type {HTMLElement}
 */
const networkStatus = document.getElementById("networkStatus");

/**
 * Hlavní úložiště aplikace.
 * Stará se o načítání, ukládání a úpravu balíčků a kartiček.
 *
 * @type {FlashcardStore}
 */
const store = new FlashcardStore();

/**
 * Ovladač zvuků aplikace.
 * Používá se pro zvuk otočení kartičky, správnou/špatnou odpověď
 * a pro zapnutí nebo vypnutí hudby.
 *
 * @type {AudioController}
 */
const audioController = new AudioController();

/**
 * Sdílený kontext aplikace.
 * Předává se jednotlivým stránkám, aby měly přístup
 * k hlavnímu HTML elementu, úložišti a ovladači zvuků.
 *
 * @type {Object}
 * @property {HTMLElement} app - Hlavní element aplikace.
 * @property {FlashcardStore} store - Úložiště dat aplikace.
 * @property {AudioController} audioController - Ovladač zvuků aplikace.
 * @property {HTMLElement} networkStatus - Element pro zobrazení online/offline stavu.
 */
const context = {
  app,
  store,
  audioController,
  networkStatus
};

/**
 * Router aplikace.
 * Podle aktuální URL cesty rozhoduje, která stránka se má vykreslit.
 *
 * @type {Router}
 */
const router = new Router({
  "/": () => renderDecksPage(context),
  "/stats": () => renderStatsPage(context),
  "/deck/:id": params => renderDeckDetailPage(params, context),
  "/learn/:id": params => renderLearningPage(params, context)
});

router.init();
setupNetworkStatus(networkStatus);
setupAudioButton(audioController);
registerServiceWorker();