import { escapeHtml } from "../utils/escapeHtml.js";
import { openConfirmModal, openCardModal } from "../ui/modals.js";
import { setupCardDragAndDrop } from "../features/dragDrop.js";

/**
 * Vykreslí detail konkrétního balíčku podle jeho ID.
 * Stránka obsahuje název balíčku, formulář pro přidání kartičky,
 * vyhledávání kartiček, seznam kartiček a možnost spustit učení.
 *
 * @param {Object} params - Parametry z routeru.
 * @param {string} params.id - ID vybraného balíčku.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {HTMLElement} context.app - Hlavní HTML element, do kterého se vykresluje obsah.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {void}
 */
export function renderDeckDetailPage(params, context) {
  const { app, store } = context;
  const deck = store.getDeckById(params.id);

  if (!deck) {
    app.innerHTML = `
      <section class="empty-state">
        <h1>Balíček nebyl nalezen</h1>
        <p>Vybraný balíček neexistuje.</p>
        <a href="/" class="btn" data-link>Zpět na balíčky</a>
      </section>
    `;
    return;
  }

  app.innerHTML = `
    <section>

    <div class="deck-detail-header">
      <div class="deck-detail-title">
        <h1>${escapeHtml(deck.title)}</h1>
        <p>${escapeHtml(deck.description || "Detail balíčku")}</p>
      </div>

      <a href="/learn/${deck.id}" class="btn success-btn deck-detail-learn-btn" data-link>
        Učit se
      </a>
    </div>

      <form id="cardForm" class="form">
        <h2 class="form-title">Přidat novou kartičku</h2>

        <div class="form-group">
          <label for="cardFront">Anglický výraz</label>
          <input
            id="cardFront"
            name="cardFront"
            type="text"
            required
            minlength="1"
            maxlength="80"
            placeholder="Např. apple"
            autofocus
          >
        </div>

        <div class="form-group">
          <label for="cardBack">Překlad nebo vysvětlení</label>
          <textarea
            id="cardBack"
            name="cardBack"
            required
            minlength="1"
            maxlength="160"
            placeholder="Např. jablko"
          ></textarea>
        </div>

        <button type="submit">Přidat kartičku</button>
      </form>

      <div class="form">
        <div class="form-group">
          <label for="cardSearch">Vyhledat kartičku</label>
          <input
            id="cardSearch"
            type="search"
            placeholder="Hledat podle anglického výrazu nebo překladu"
          >
        </div>
      </div>

      <section>
        <div class="page-header">
          <div>
            <h2>Kartičky</h2>
            <p>Seznam kartiček v tomto balíčku.</p>
          </div>
        </div>

        <div id="cardList" class="card-list">
          ${renderCardItems(deck.cards)}
        </div>
      </section>
    </section>
  `;

  document.getElementById("cardForm").addEventListener("submit", event => {
    handleCardSubmit(event, deck.id, context);
  });

  document.getElementById("cardSearch").addEventListener("input", event => {
    const searchValue = event.target.value.trim().toLowerCase();
    renderFilteredCards(deck.id, searchValue, context);
  });

  setupCardButtons(deck.id, context);
  setupDragAndDrop(deck.id, context);
}

/**
 * Vytvoří HTML seznam kartiček pro zobrazení v detailu balíčku.
 * Pokud se právě vyhledává, vypne se možnost přetahování kartiček.
 *
 * @param {Array<Object>} cards - Pole kartiček v balíčku.
 * @param {boolean} [isSearching=false] - Určuje, zda je aktivní vyhledávání.
 * @returns {string} HTML řetězec se seznamem kartiček.
 */
function renderCardItems(cards, isSearching = false) {
  if (cards.length === 0) {
    return `
      <article class="empty-state">
        <h2>Zatím zde nejsou žádné kartičky</h2>
        <p>Přidej první anglické slovíčko a jeho překlad.</p>
      </article>
    `;
  }

  return cards.map(card => `
    <article
      class="word-card"
      draggable="${isSearching ? "false" : "true"}"
      data-card-id="${card.id}"
    >
      <div>
        <strong>${escapeHtml(card.front)}</strong>
        <span>${escapeHtml(card.back)}</span>
      </div>

      <div class="deck-actions">
        <button class="secondary-btn" type="button" data-edit-card="${card.id}">
          Upravit
        </button>

        <button class="danger-btn" type="button" data-delete-card="${card.id}">
          Smazat
        </button>
      </div>
    </article>
  `).join("");
}

/**
 * Vyfiltruje kartičky podle zadaného textu a znovu vykreslí seznam kartiček.
 * Vyhledává se v přední i zadní straně kartičky.
 *
 * @param {string} deckId - ID aktuálního balíčku.
 * @param {string} searchValue - Vyhledávaný text.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {void}
 */
function renderFilteredCards(deckId, searchValue, context) {
  const { store } = context;
  const deck = store.getDeckById(deckId);

  if (!deck) {
    return;
  }

  const filteredCards = deck.cards.filter(card => {
    const front = card.front.toLowerCase();
    const back = card.back.toLowerCase();

    return front.includes(searchValue) || back.includes(searchValue);
  });

  const cardList = document.getElementById("cardList");

  if (!cardList) {
    return;
  }

  if (filteredCards.length === 0) {
    cardList.innerHTML = `
      <article class="empty-state">
        <h2>Žádná kartička nenalezena</h2>
        <p>Zkus zadat jiný vyhledávací výraz.</p>
      </article>
    `;
    return;
  }

  const isSearching = searchValue.length > 0;

  cardList.innerHTML = renderCardItems(filteredCards, isSearching);
  setupCardButtons(deckId, context);

  if (!isSearching) {
    setupDragAndDrop(deckId, context);
  }
}

/**
 * Zpracuje odeslání formuláře pro přidání nové kartičky.
 * Zkontroluje vyplněná pole, uloží kartičku do úložiště
 * a znovu vykreslí detail balíčku.
 *
 * @param {SubmitEvent} event - Událost odeslání formuláře.
 * @param {string} deckId - ID balíčku, do kterého se kartička přidává.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {void}
 */
function handleCardSubmit(event, deckId, context) {
  event.preventDefault();

  const { store } = context;
  const form = event.target;
  const front = form.cardFront.value.trim();
  const back = form.cardBack.value.trim();

  if (!front || !back) {
    alert("Vyplň anglický výraz i překlad.");
    return;
  }

  store.addCard(deckId, front, back);
  renderDeckDetailPage({ id: deckId }, context);
}

/**
 * Nastaví obsluhu tlačítek pro úpravu a smazání kartiček.
 *
 * @param {string} deckId - ID aktuálního balíčku.
 * @param {Object} context - Sdílený kontext aplikace.
 * @returns {void}
 */
function setupCardButtons(deckId, context) {
  document.querySelectorAll("[data-delete-card]").forEach(button => {
    button.addEventListener("click", () => {
      deleteCard(deckId, button.dataset.deleteCard, context);
    });
  });

  document.querySelectorAll("[data-edit-card]").forEach(button => {
    button.addEventListener("click", () => {
      editCard(deckId, button.dataset.editCard, context);
    });
  });
}

/**
 * Smaže vybranou kartičku z balíčku po potvrzení uživatelem.
 *
 * @param {string} deckId - ID balíčku, ze kterého se kartička maže.
 * @param {string} cardId - ID mazané kartičky.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {Promise<void>}
 */
async function deleteCard(deckId, cardId, context) {
  const { store } = context;
  const deck = store.getDeckById(deckId);

  if (!deck) {
    return;
  }

  const card = deck.cards.find(card => card.id === cardId);

  if (!card) {
    return;
  }

  const confirmed = await openConfirmModal({
    title: "Smazat kartičku",
    message: `Opravdu chceš smazat kartičku „${card.front}“?`,
    confirmText: "Smazat",
    cancelText: "Zrušit"
  });

  if (!confirmed) {
    return;
  }

  store.deleteCard(deckId, cardId);
  renderDeckDetailPage({ id: deckId }, context);
}


/**
 * Otevře modální okno pro úpravu kartičky.
 * Po potvrzení uloží nové hodnoty do úložiště a znovu vykreslí stránku.
 *
 * @param {string} deckId - ID balíčku, ve kterém se kartička nachází.
 * @param {string} cardId - ID upravované kartičky.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {Promise<void>}
 */
async function editCard(deckId, cardId, context) {
  const { store } = context;
  const deck = store.getDeckById(deckId);

  if (!deck) {
    return;
  }

  const card = deck.cards.find(card => card.id === cardId);

  if (!card) {
    return;
  }

  const result = await openCardModal({
    title: "Upravit kartičku",
    front: card.front,
    back: card.back,
    submitText: "Uložit"
  });

  if (!result) {
    return;
  }

  store.updateCard(deckId, cardId, result.front, result.back);
  renderDeckDetailPage({ id: deckId }, context);
}

/**
 * Změní pořadí kartiček v balíčku po použití Drag & Drop.
 * Přesune přetahovanou kartičku na pozici cílové kartičky.
 *
 * @param {string} deckId - ID aktuálního balíčku.
 * @param {string} draggedCardId - ID přetahované kartičky.
 * @param {string} targetCardId - ID kartičky, na jejíž místo se karta přesune.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {void}
 */
function reorderCards(deckId, draggedCardId, targetCardId, context) {
  const { store } = context;
  const deck = store.getDeckById(deckId);

  if (!deck) {
    return;
  }

  const cards = [...deck.cards];

  const draggedIndex = cards.findIndex(card => card.id === draggedCardId);
  const targetIndex = cards.findIndex(card => card.id === targetCardId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return;
  }

  const [draggedCard] = cards.splice(draggedIndex, 1);
  cards.splice(targetIndex, 0, draggedCard);

  store.reorderCards(deckId, cards);
  renderDeckDetailPage({ id: deckId }, context);
}

/**
 * Aktivuje Drag & Drop řazení kartiček v seznamu.
 *
 * @param {string} deckId - ID aktuálního balíčku.
 * @param {Object} context - Sdílený kontext aplikace.
 * @returns {void}
 */
function setupDragAndDrop(deckId, context) {
  const cardList = document.getElementById("cardList");

  if (!cardList) {
    return;
  }

  setupCardDragAndDrop(cardList, (draggedCardId, targetCardId) => {
    reorderCards(deckId, draggedCardId, targetCardId, context);
  });
}
