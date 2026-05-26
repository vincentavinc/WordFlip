import { escapeHtml } from "../utils/escapeHtml.js";
import { openConfirmModal, openDeckModal } from "../ui/modals.js";

/**
 * Vykreslí hlavní stránku se seznamem balíčků.
 * Stránka obsahuje formulář pro vytvoření nového balíčku
 * a seznam již existujících balíčků.
 *
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {HTMLElement} context.app - Hlavní HTML element, do kterého se vykresluje obsah.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {void}
 */
export function renderDecksPage(context) {
  const { app, store } = context;

  const decks = store.getDecks();

  app.innerHTML = `
    <section>
      <div class="page-header">
        <div>
          <h1>Balíčky</h1>
          <p>Vytvářej vlastní balíčky anglických slovíček.</p>
        </div>
      </div>

      <form id="deckForm" class="form">
        <h2 class="form-title">Přidat nový balíček</h2>

        <div class="form-group">
          <label for="deckTitle">Název balíčku</label>
          <input
            id="deckTitle"
            name="deckTitle"
            type="text"
            required
            minlength="2"
            maxlength="40"
            placeholder="Např. Travel English"
            autofocus
          >
        </div>

        <div class="form-group">
          <label for="deckDescription">Popis</label>
          <textarea
            id="deckDescription"
            name="deckDescription"
            maxlength="120"
            placeholder="Krátký popis balíčku"
          ></textarea>
        </div>

        <button type="submit">Přidat balíček</button>
      </form>

      <section class="deck-grid">
        ${renderDeckCards(decks)}
      </section>
    </section>
  `;

  document.getElementById("deckForm").addEventListener("submit", event => {
    handleDeckSubmit(event, context);
  });

  document.querySelectorAll("[data-delete-deck]").forEach(button => {
    button.addEventListener("click", () => {
      deleteDeck(button.dataset.deleteDeck, context);
    });
  });

  document.querySelectorAll("[data-edit-deck]").forEach(button => {
    button.addEventListener("click", () => {
      editDeck(button.dataset.editDeck, context);
    });
  });

  setupDeckMenus();

}

/**
 * Vytvoří HTML kód pro seznam balíčků.
 * Pokud nejsou vytvořené žádné balíčky, zobrazí se prázdný stav.
 *
 * @param {Array<Object>} decks - Pole balíčků uložených v aplikaci.
 * @returns {string} HTML řetězec se seznamem balíčků.
 */
function renderDeckCards(decks) {
  if (decks.length === 0) {
    return `
      <article class="empty-state">
        <h2>Zatím nemáš žádný balíček</h2>
        <p>Vytvoř první balíček a začni přidávat kartičky.</p>
      </article>
    `;
  }

  return decks.map(deck => `
    <article class="deck-card">
      <div class="deck-card-header">
        <div>
          <h3>${escapeHtml(deck.title)}</h3>
          <p>${escapeHtml(deck.description || "Bez popisu")}</p>
        </div>

        <div class="deck-menu">
          <button
            class="icon-btn"
            type="button"
            data-deck-menu="${deck.id}"
            aria-label="Otevřít menu balíčku"
          >
            ⋯
          </button>

          <div class="deck-menu-dropdown" data-deck-menu-dropdown="${deck.id}">
            <button class="menu-item" type="button" data-edit-deck="${deck.id}">
              Upravit
            </button>

            <button class="menu-item danger-menu-item" type="button" data-delete-deck="${deck.id}">
              Smazat
            </button>
          </div>
        </div>
      </div>

      <p class="deck-card-count">
        <strong>${deck.cards.length}</strong> kartiček
      </p>

      <div class="deck-main-actions">
        <a class="btn deck-open-btn" href="/deck/${deck.id}" data-link>Zobrazit</a>
        <a class="btn success-btn deck-learn-btn" href="/learn/${deck.id}" data-link>
          <span class="play-icon">▷</span>
          Učit se
        </a>
      </div>
    </article>
  `).join("");
}

/**
 * Nastaví rozbalovací menu u jednotlivých balíčků.
 * Menu umožňuje balíček upravit nebo smazat.
 *
 * @returns {void}
 */
function setupDeckMenus() {
  document.querySelectorAll("[data-deck-menu]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();

      const deckId = button.dataset.deckMenu;
      const dropdown = document.querySelector(`[data-deck-menu-dropdown="${deckId}"]`);

      document.querySelectorAll(".deck-menu-dropdown.open").forEach(openDropdown => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove("open");
        }
      });

      if (dropdown) {
        dropdown.classList.toggle("open");
      }
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".deck-menu-dropdown.open").forEach(dropdown => {
      dropdown.classList.remove("open");
    });
  });
}

/**
 * Zpracuje odeslání formuláře pro vytvoření nového balíčku.
 * Zkontroluje minimální délku názvu, uloží balíček do úložiště
 * a znovu vykreslí stránku balíčků.
 *
 * @param {SubmitEvent} event - Událost odeslání formuláře.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {void}
 */
function handleDeckSubmit(event, context) {
  event.preventDefault();

  const { store } = context;
  const form = event.target;
  const title = form.deckTitle.value.trim();
  const description = form.deckDescription.value.trim();

  if (title.length < 2) {
    alert("Název balíčku musí mít alespoň 2 znaky.");
    return;
  }

  store.addDeck(title, description);
  renderDecksPage(context);
}

/**
 * Smaže vybraný balíček po potvrzení uživatelem.
 * Společně s balíčkem se smažou také všechny jeho kartičky.
 *
 * @param {string} deckId - ID balíčku, který se má smazat.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {Promise<void>}
 */
async function deleteDeck(deckId, context) {
  const { store } = context;
  const deck = store.getDeckById(deckId);

  if (!deck) {
    return;
  }

  const confirmed = await openConfirmModal({
    title: "Smazat balíček",
    message: `Opravdu chceš smazat balíček „${deck.title}“? Všechny kartičky v tomto balíčku budou také odstraněny.`,
    confirmText: "Smazat",
    cancelText: "Zrušit"
  });

  if (!confirmed) {
    return;
  }

  store.deleteDeck(deckId);
  renderDecksPage(context);
}

/**
 * Otevře modální okno pro úpravu balíčku.
 * Po potvrzení uloží nový název a popis balíčku.
 *
 * @param {string} deckId - ID balíčku, který se má upravit.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {Promise<void>}
 */
async function editDeck(deckId, context) {
  const { store } = context;
  const deck = store.getDeckById(deckId);
  if (!deck) {
    return;
  }

  const result = await openDeckModal({
    title: "Upravit balíček",
    deckTitle: deck.title,
    deckDescription: deck.description,
    submitText: "Uložit"
  });

  if (!result) {
    return;
  }

  store.updateDeck(deckId, result.title, result.description);
  renderDecksPage(context);
}