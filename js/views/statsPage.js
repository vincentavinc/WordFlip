import { renderStatsChart } from "../stats.js";
import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * Vykreslí stránku se statistikami učení.
 * Stránka zobrazuje celkovou úspěšnost, počet správných a špatných odpovědí,
 * úspěšnost podle jednotlivých balíčků a SVG graf odpovědí.
 *
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {HTMLElement} context.app - Hlavní HTML element, do kterého se vykresluje obsah.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @returns {void}
 */
export function renderStatsPage(context) {
  const { app, store } = context;

  const stats = store.getStats();
  const decks = store.getDecks();
  
    app.innerHTML = `
      <section>
        <div class="page-header">
          <div>
            <h1>Statistiky</h1>
            <p>Přehled úspěšnosti podle naposledy uložených odpovědí.</p>
          </div>
        </div>
  
        <section class="stats-grid stats-grid-compact" aria-label="Souhrnné statistiky">
          <article class="stats-card">
            <span class="stats-card-label">Úspěšnost</span>
            <strong>${stats.successRate}%</strong>
          </article>
  
          <article class="stats-card">
            <span class="stats-card-label">Správně</span>
            <strong class="stats-correct">${stats.totalCorrect}</strong>
          </article>
  
          <article class="stats-card">
            <span class="stats-card-label">Špatně</span>
            <strong class="stats-wrong">${stats.totalWrong}</strong>
          </article>
        </section>
  
        <section class="form">
          <h2 class="form-title">Úspěšnost podle balíčků</h2>
  
          <div class="deck-progress-list">
            ${renderDeckProgressList(decks)}
          </div>
        </section>
  
        <section class="form">
          <h2 class="form-title">Graf odpovědí</h2>
          <div id="statsChart" class="svg-wrapper"></div>
        </section>
      </section>
    `;
  
    renderStatsChart("statsChart", stats);
}

/**
 * Vytvoří HTML seznam úspěšnosti pro jednotlivé balíčky.
 * Pro každý balíček spočítá počet správných a špatných odpovědí
 * a následně vypočítá procentuální úspěšnost.
 *
 * @param {Array<Object>} decks - Pole všech balíčků v aplikaci.
 * @returns {string} HTML řetězec se seznamem úspěšnosti podle balíčků.
 */
function renderDeckProgressList(decks) {
  if (decks.length === 0) {
    return `
      <article class="empty-state">
        <h2>Zatím nejsou dostupná žádná data</h2>
        <p>Nejdříve vytvoř balíček a přidej kartičky.</p>
      </article>
    `;
  }

  return decks.map(deck => {
    let correct = 0;
    let wrong = 0;

    deck.cards.forEach(card => {
      correct += card.correctCount;
      wrong += card.wrongCount;
    });

    const answered = correct + wrong;

    const successRate = answered === 0
      ? 0
      : Math.round((correct / answered) * 100);

    return `
      <article class="deck-progress-item">
        <div class="deck-progress-header">
          <h3>${escapeHtml(deck.title)}</h3>
          <span>${correct} / ${answered} (${successRate}%)</span>
        </div>

        <div class="deck-progress-bar" aria-label="Úspěšnost ${successRate}%">
          <div class="deck-progress-fill" style="width: ${successRate}%"></div>
        </div>
      </article>
    `;
  }).join("");
}

