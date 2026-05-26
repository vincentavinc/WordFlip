import { escapeHtml } from "../utils/escapeHtml.js";
import "../components/flash-card.js";

/**
 * Vykreslí stránku pro procvičování kartiček z vybraného balíčku.
 * Uživatel postupně otáčí kartičky, označuje odpovědi jako správné nebo špatné
 * a na konci vidí výsledek celého procvičování.
 *
 * @param {Object} params - Parametry z routeru.
 * @param {string} params.id - ID balíčku, který se má procvičovat.
 * @param {Object} context - Sdílený kontext aplikace.
 * @param {HTMLElement} context.app - Hlavní HTML element, do kterého se vykresluje obsah.
 * @param {FlashcardStore} context.store - Úložiště dat aplikace.
 * @param {AudioController} context.audioController - Ovladač zvuků v aplikaci.
 * @returns {void}
 */
export function renderLearningPage(params, context) {
  const { app, store, audioController } = context;

  const deck = store.getDeckById(params.id);

  if (!deck) {
    app.innerHTML = `
      <section class="empty-state">
        <h1>Balíček nebyl nalezen</h1>
        <a href="/" class="btn" data-link>Zpět na balíčky</a>
      </section>
    `;
    return;
  }

  if (deck.cards.length === 0) {
  app.innerHTML = `
    <section class="empty-state learning-empty-state">
      <h1>Balíček neobsahuje žádné kartičky</h1>
      <p>Nejdříve přidej kartičky do balíčku.</p>
      <a href="/deck/${deck.id}" class="btn" data-link>Zpět na detail balíčku</a>
    </section>
    `;
    return;
  }

  let currentIndex = 0;
  let isFlipped = false;
  let sessionCorrect = 0;
  let sessionWrong = 0;

  renderCurrentCard();

  /**
   * Vykreslí aktuální kartičku podle hodnoty currentIndex.
   * Zobrazuje také průběh procvičování a tlačítka pro vyhodnocení odpovědi.
   *
   * @returns {void}
   */
  function renderCurrentCard() {
    const card = deck.cards[currentIndex];
    const answeredCount = sessionCorrect + sessionWrong;
    const progressPercent = Math.round((answeredCount / deck.cards.length) * 100);

    app.innerHTML = `
      <section class="learning-screen">
        <div class="learning-top">
          <div>
            <h1>${escapeHtml(deck.title)}</h1>
            <p>Kartička ${currentIndex + 1} z ${deck.cards.length}</p>
          </div>

          <div class="learning-progress-count">
            ${answeredCount} / ${deck.cards.length}
          </div>
        </div>

        <div class="learning-progress">
          <div class="learning-progress-fill" style="width: ${progressPercent}%"></div>
        </div>

        <flashcard-card
          id="learningCard"
          front="${escapeHtml(card.front)}"
          back="${escapeHtml(card.back)}"
          front-label="ENGLISH"
          back-label="ČESKY"
          ${isFlipped ? "flipped" : ""}
        ></flashcard-card>

        ${
          isFlipped
            ? `
              <div class="learning-actions">
                <button id="wrongBtn" class="answer-btn wrong-answer-btn" type="button">
                  × Špatně
                </button>

                <button id="correctBtn" class="answer-btn correct-answer-btn" type="button">
                  ✓ Správně
                </button>
              </div>
            `
            : `
              <div class="learning-session-stats">
                <article>
                  <strong class="correct-count">${sessionCorrect}</strong>
                  <span>SPRÁVNĚ</span>
                </article>

                <article>
                  <strong class="wrong-count">${sessionWrong}</strong>
                  <span>ŠPATNĚ</span>
                </article>
              </div>
            `
        }
      </section>
    `;

    const learningCard = document.getElementById("learningCard");

    /**
     * Otočí aktuální kartičku a přehraje zvuk otočení.
     *
     * @returns {void}
     */
    function flipLearningCard() {
      isFlipped = !isFlipped;
      audioController.playFlip();

      if (isFlipped) {
        learningCard.setAttribute("flipped", "");
      } else {
        learningCard.removeAttribute("flipped");
      }

      setTimeout(() => {
        renderCurrentCard();
      }, 300);
    }

    learningCard.addEventListener("card-flip", flipLearningCard);

    setTimeout(() => {
      learningCard.querySelector(".flashcard")?.focus();
    }, 0);

    if (isFlipped) {
      document.getElementById("correctBtn").addEventListener("click", () => {
        saveLearningAnswer(card.id, true);
      });

      document.getElementById("wrongBtn").addEventListener("click", () => {
        saveLearningAnswer(card.id, false);
      });
    }
  }

  /**
   * Uloží odpověď uživatele, aktualizuje statistiku relace
   * a přesune procvičování na další kartičku.
   *
   * @param {string} cardId - ID kartičky, na kterou uživatel odpověděl.
   * @param {boolean} isCorrect - Určuje, zda byla odpověď správná.
   * @returns {void}
   */
  function saveLearningAnswer(cardId, isCorrect) {
    store.saveAnswer(deck.id, cardId, isCorrect);

    if (isCorrect) {
      sessionCorrect++;
      audioController.playCorrect();
    } else {
      sessionWrong++;
      audioController.playWrong();
    }

    if (currentIndex < deck.cards.length - 1) {
      currentIndex++;
      isFlipped = false;
      renderCurrentCard();
    } else {
      renderLearningFinished();
    }
  }

  /**
   * Vykreslí závěrečnou obrazovku po dokončení procvičování.
   * Zobrazuje počet správných a špatných odpovědí a úspěšnost v procentech.
   *
   * @returns {void}
   */
  function renderLearningFinished() {
    const total = sessionCorrect + sessionWrong;

    const successRate = total === 0
      ? 0
      : Math.round((sessionCorrect / total) * 100);

    app.innerHTML = `
      <section class="empty-state">
        <h1>Procvičování dokončeno</h1>

        <p>
          Dokončil/a jsi balíček:
          <strong>${escapeHtml(deck.title)}</strong>
        </p>

        <div class="finished-results">
          <p>Správné odpovědi: <strong class="finished-correct">${sessionCorrect}</strong></p>
          <p>Špatné odpovědi: <strong class="finished-wrong">${sessionWrong}</strong></p>
          <p>Úspěšnost v tomto procvičování: <strong>${successRate}%</strong></p>
        </div>

        <div class="learning-actions">
          <button id="restartLearningBtn" class="restart-btn" type="button">
            Procvičit znovu
          </button>

          <a href="/stats" class="btn stats-finish-btn" data-link>
            Statistiky
          </a>
        </div>
      </section>
    `;

    document.getElementById("restartLearningBtn").addEventListener("click", () => {
      currentIndex = 0;
      isFlipped = false;
      sessionCorrect = 0;
      sessionWrong = 0;
      renderCurrentCard();
    });
  }
}


