import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * Otevře potvrzovací modální okno.
 * Používá se například při mazání balíčku nebo kartičky.
 * Funkce vrací Promise, která se vyřeší hodnotou true při potvrzení
 * nebo false při zrušení akce.
 *
 * @param {Object} options - Nastavení potvrzovacího okna.
 * @param {string} options.title - Nadpis modálního okna.
 * @param {string} options.message - Text potvrzovací zprávy.
 * @param {string} [options.confirmText="Potvrdit"] - Text potvrzovacího tlačítka.
 * @param {string} [options.cancelText="Zrušit"] - Text tlačítka pro zrušení.
 * @returns {Promise<boolean>} Výsledek potvrzení uživatelem.
 */
export function openConfirmModal(options) { 
    return new Promise(resolve => {
    const modal = createModal(`
      <div class="modal-header">
        <h2>${escapeHtml(options.title)}</h2>
        <button class="modal-close-btn" type="button" data-modal-cancel>×</button>
      </div>

      <p class="modal-text">${escapeHtml(options.message)}</p>

      <div class="modal-actions">
        <button class="secondary-btn" type="button" data-modal-cancel>
          ${escapeHtml(options.cancelText || "Zrušit")}
        </button>

        <button class="danger-btn" type="button" data-modal-confirm>
          ${escapeHtml(options.confirmText || "Potvrdit")}
        </button>
      </div>
    `);

    modal.querySelector("[data-modal-confirm]").addEventListener("click", () => {
      closeModal(modal);
      resolve(true);
    });

    modal.querySelectorAll("[data-modal-cancel]").forEach(button => {
      button.addEventListener("click", () => {
        closeModal(modal);
        resolve(false);
      });
    });
  });
}

/**
 * Otevře modální okno pro úpravu balíčku.
 * Uživatel může změnit název a popis balíčku.
 * Pokud formulář potvrdí, funkce vrátí nové hodnoty.
 * Pokud akci zruší, vrátí null.
 *
 * @param {Object} options - Nastavení modálního okna.
 * @param {string} options.title - Nadpis modálního okna.
 * @param {string} options.deckTitle - Aktuální název balíčku.
 * @param {string} [options.deckDescription] - Aktuální popis balíčku.
 * @param {string} [options.submitText="Uložit"] - Text potvrzovacího tlačítka.
 * @returns {Promise<{title: string, description: string} | null>} Upravená data balíčku nebo null.
 */
export function openDeckModal(options) { 
    return new Promise(resolve => {
    const modal = createModal(`
      <div class="modal-header">
        <h2>${escapeHtml(options.title)}</h2>
        <button class="modal-close-btn" type="button" data-modal-cancel>×</button>
      </div>

      <form id="deckEditForm">
        <div class="form-group">
          <label for="modalDeckTitle">Název</label>
          <input
            id="modalDeckTitle"
            name="title"
            type="text"
            required
            minlength="2"
            maxlength="40"
            value="${escapeHtml(options.deckTitle)}"
          >
        </div>

        <div class="form-group">
          <label for="modalDeckDescription">Popis</label>
          <textarea
            id="modalDeckDescription"
            name="description"
            maxlength="120"
          >${escapeHtml(options.deckDescription || "")}</textarea>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" type="button" data-modal-cancel>
            Zrušit
          </button>

          <button type="submit">
            ${escapeHtml(options.submitText || "Uložit")}
          </button>
        </div>
      </form>
    `);

    const form = modal.querySelector("#deckEditForm");
    const titleInput = modal.querySelector("#modalDeckTitle");

    titleInput.focus();
    titleInput.select();

    form.addEventListener("submit", event => {
      event.preventDefault();

      const title = form.title.value.trim();
      const description = form.description.value.trim();

      if (title.length < 2) {
        titleInput.focus();
        return;
      }

      closeModal(modal);
      resolve({ title, description });
    });

    modal.querySelectorAll("[data-modal-cancel]").forEach(button => {
      button.addEventListener("click", () => {
        closeModal(modal);
        resolve(null);
      });
    });
  });
}

/**
 * Otevře modální okno pro úpravu kartičky.
 * Uživatel může změnit anglický výraz a jeho překlad nebo vysvětlení.
 * Pokud formulář potvrdí, funkce vrátí nové hodnoty.
 * Pokud akci zruší, vrátí null.
 *
 * @param {Object} options - Nastavení modálního okna.
 * @param {string} options.title - Nadpis modálního okna.
 * @param {string} options.front - Aktuální přední strana kartičky.
 * @param {string} options.back - Aktuální zadní strana kartičky.
 * @param {string} [options.submitText="Uložit"] - Text potvrzovacího tlačítka.
 * @returns {Promise<{front: string, back: string} | null>} Upravená data kartičky nebo null.
 */
export function openCardModal(options) { 
    return new Promise(resolve => {
    const modal = createModal(`
      <div class="modal-header">
        <h2>${escapeHtml(options.title)}</h2>
        <button class="modal-close-btn" type="button" data-modal-cancel>×</button>
      </div>

      <form id="cardEditForm">
        <div class="form-group">
          <label for="modalCardFront">Anglický výraz</label>
          <input
            id="modalCardFront"
            name="front"
            type="text"
            required
            minlength="1"
            maxlength="80"
            value="${escapeHtml(options.front)}"
          >
        </div>

        <div class="form-group">
          <label for="modalCardBack">Překlad nebo vysvětlení</label>
          <textarea
            id="modalCardBack"
            name="back"
            required
            minlength="1"
            maxlength="160"
          >${escapeHtml(options.back)}</textarea>
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" type="button" data-modal-cancel>
            Zrušit
          </button>

          <button type="submit">
            ${escapeHtml(options.submitText || "Uložit")}
          </button>
        </div>
      </form>
    `);

    const form = modal.querySelector("#cardEditForm");
    const frontInput = modal.querySelector("#modalCardFront");

    frontInput.focus();
    frontInput.select();

    form.addEventListener("submit", event => {
      event.preventDefault();

      const front = form.front.value.trim();
      const back = form.back.value.trim();

      if (!front || !back) {
        return;
      }

      closeModal(modal);
      resolve({ front, back });
    });

    modal.querySelectorAll("[data-modal-cancel]").forEach(button => {
      button.addEventListener("click", () => {
        closeModal(modal);
        resolve(null);
      });
    });
  });
}

/**
 * Vytvoří základní strukturu modálního okna a vloží ji do stránky.
 * Modal je možné zavřít kliknutím na pozadí nebo klávesou Escape.
 *
 * @param {string} content - HTML obsah, který bude vložen do modálního okna.
 * @returns {HTMLDivElement} Element pozadí modálního okna.
 */
function createModal(content) { 
    const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";

  backdrop.innerHTML = `
    <section class="modal-window" role="dialog" aria-modal="true">
      ${content}
    </section>
  `;

  document.body.appendChild(backdrop);

  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) {
      backdrop.querySelector("[data-modal-cancel]")?.click();
    }
  });

  const handleEscape = event => {
    if (event.key === "Escape") {
      backdrop.querySelector("[data-modal-cancel]")?.click();
      document.removeEventListener("keydown", handleEscape);
    }
  };

  document.addEventListener("keydown", handleEscape);

  return backdrop;
}

/**
 * Zavře modální okno.
 * Nejprve přidá CSS třídu pro animaci zavření
 * a po skončení animace odstraní modal z DOM.
 *
 * @param {HTMLElement} modal - Element modálního okna, který se má zavřít.
 * @returns {void}
 */
function closeModal(modal) { 
  modal.classList.add("closing");

  setTimeout(() => {
    modal.remove();
  }, 180);
}