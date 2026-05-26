/**
 * Nastaví sledování stavu připojení k internetu.
 * Při změně online/offline stavu se aktualizuje text a styl indikátoru v hlavičce.
 *
 * @param {HTMLElement} networkStatus - HTML element, ve kterém se zobrazuje stav připojení.
 * @returns {void}
 */
export function setupNetworkStatus(networkStatus) {
  updateNetworkStatus(networkStatus);

  window.addEventListener("online", () => updateNetworkStatus(networkStatus));
  window.addEventListener("offline", () => updateNetworkStatus(networkStatus));
}

/**
 * Aktualizuje text a CSS třídu indikátoru podle aktuálního stavu internetu.
 *
 * @param {HTMLElement} networkStatus - HTML element indikátoru připojení.
 * @returns {void}
 */
function updateNetworkStatus(networkStatus) {
  if (!networkStatus) return;

  if (navigator.onLine) {
    networkStatus.textContent = "Online";
    networkStatus.classList.remove("offline");
  } else {
    networkStatus.textContent = "Offline";
    networkStatus.classList.add("offline");
  }
}

/**
 * Nastaví ovládání tlačítka pro zapnutí a vypnutí hudby.
 * Po kliknutí se přepne přehrávání hudby a zároveň se aktualizuje vzhled,
 * aria-label a title tlačítka.
 *
 * @param {AudioController} audioController - Objekt pro ovládání zvuků a hudby.
 * @returns {void}
 */
export function setupAudioButton(audioController) {
  const musicToggleBtn = document.getElementById("musicToggleBtn");

  if (!musicToggleBtn) return;

  musicToggleBtn.addEventListener("click", () => {
    const isPlaying = audioController.toggleMusic();

    musicToggleBtn.classList.toggle("is-playing", isPlaying);

    musicToggleBtn.setAttribute(
      "aria-label",
      isPlaying ? "Vypnout hudbu" : "Zapnout hudbu"
    );

    musicToggleBtn.setAttribute(
      "title",
      isPlaying ? "Vypnout hudbu" : "Zapnout hudbu"
    );
  });
}

/**
 * Zaregistruje service worker pro offline režim aplikace.
 * Registrace proběhne až po načtení celé stránky.
 *
 * @returns {void}
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service_worker.js")
      .then(() => {
        console.log("Service worker byl úspěšně zaregistrován.");
      })
      .catch(error => {
        console.log("Service worker se nepodařilo zaregistrovat:", error);
      });
  });
}