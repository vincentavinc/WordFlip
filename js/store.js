import { Deck, Flashcard } from "./models.js";

export class FlashcardStore {
  constructor() {
    this.storageKey = "flashcards-app-data";
    this.decks = this.load();
  }

  /**
   * Načte data z localStorage.
   * Pokud žádná data nejsou uložená nebo dojde k chybě při čtení,
   * vrátí se prázdné pole.
   *
   * @returns {Array<Object>} Pole uložených balíčků.
   */
  load() {
    const savedData = localStorage.getItem(this.storageKey);

    if (!savedData) {
      return [];
    }

    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error("Chyba při načítání dat:", error);
      return [];
    }
  }

  /**
   * Uloží aktuální stav balíčků do localStorage.
   *
   * @returns {void}
   */
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.decks));
  }

  /**
   * Vrátí všechny balíčky uložené v aplikaci.
   *
   * @returns {Array<Object>} Pole všech balíčků.
   */
  getDecks() {
    return this.decks;
  }

  /**
   * Najde balíček podle jeho ID.
   *
   * @param {string} deckId - ID hledaného balíčku.
   * @returns {Object|undefined} Nalezený balíček nebo undefined.
   */
  getDeckById(deckId) {
    return this.decks.find(deck => deck.id === deckId);
  }

  /**
   * Vytvoří nový balíček a uloží ho do úložiště.
   *
   * @param {string} title - Název balíčku.
   * @param {string} [description=""] - Volitelný popis balíčku.
   * @returns {Deck} Nově vytvořený balíček.
   */
  addDeck(title, description = "") {
    const deck = new Deck(title, description);

    this.decks.push(deck);
    this.save();

    return deck;
  }

  /**
   * Upraví název a popis existujícího balíčku.
   *
   * @param {string} deckId - ID upravovaného balíčku.
   * @param {string} title - Nový název balíčku.
   * @param {string} [description=""] - Nový popis balíčku.
   * @returns {boolean} True, pokud byl balíček upraven, jinak false.
   */
  updateDeck(deckId, title, description = "") {
    const deck = this.getDeckById(deckId);

    if (!deck) {
      return false;
    }

    deck.title = title;
    deck.description = description;
    this.save();

    return true;
  }

  /**
   * Smaže balíček podle jeho ID.
   *
   * @param {string} deckId - ID balíčku, který se má smazat.
   * @returns {void}
   */
  deleteDeck(deckId) {
    this.decks = this.decks.filter(deck => deck.id !== deckId);
    this.save();
  }

  /**
   * Přidá novou kartičku do vybraného balíčku.
   *
   * @param {string} deckId - ID balíčku, do kterého se kartička přidává.
   * @param {string} front - Text na přední straně kartičky.
   * @param {string} back - Text na zadní straně kartičky.
   * @returns {Flashcard|null} Nově vytvořená kartička nebo null, pokud balíček neexistuje.
   */
  addCard(deckId, front, back) {
    const deck = this.getDeckById(deckId);

    if (!deck) {
      return null;
    }

    const card = new Flashcard(front, back);

    deck.cards.push(card);
    this.save();

    return card;
  }

  /**
   * Upraví existující kartičku ve vybraném balíčku.
   *
   * @param {string} deckId - ID balíčku, ve kterém se kartička nachází.
   * @param {string} cardId - ID upravované kartičky.
   * @param {string} front - Nový text přední strany kartičky.
   * @param {string} back - Nový text zadní strany kartičky.
   * @returns {boolean} True, pokud byla kartička upravena, jinak false.
   */
  updateCard(deckId, cardId, front, back) {
    const deck = this.getDeckById(deckId);

    if (!deck) {
      return false;
    }

    const card = deck.cards.find(card => card.id === cardId);

    if (!card) {
      return false;
    }

    card.front = front;
    card.back = back;
    this.save();

    return true;
  }

  /**
   * Smaže kartičku z vybraného balíčku.
   *
   * @param {string} deckId - ID balíčku, ze kterého se kartička maže.
   * @param {string} cardId - ID kartičky, která se má smazat.
   * @returns {boolean} True, pokud byla operace provedena, jinak false.
   */
  deleteCard(deckId, cardId) {
    const deck = this.getDeckById(deckId);

    if (!deck) {
      return false;
    }

    deck.cards = deck.cards.filter(card => card.id !== cardId);
    this.save();

    return true;
  }

  /**
   * Uloží nové pořadí kartiček ve vybraném balíčku.
   * Používá se po změně pořadí pomocí Drag & Drop.
   *
   * @param {string} deckId - ID balíčku, ve kterém se mění pořadí kartiček.
   * @param {Array<Object>} newCardsOrder - Nové pořadí kartiček.
   * @returns {boolean} True, pokud bylo pořadí uloženo, jinak false.
   */
  reorderCards(deckId, newCardsOrder) {
    const deck = this.getDeckById(deckId);

    if (!deck) {
      return false;
    }

    deck.cards = newCardsOrder;
    this.save();

    return true;
  }

  /**
   * Uloží výsledek odpovědi u konkrétní kartičky.
   * Aktuální implementace ukládá poslední výsledek kartičky:
   * správná odpověď nastaví correctCount na 1 a wrongCount na 0,
   * špatná odpověď nastaví correctCount na 0 a wrongCount na 1.
   *
   * @param {string} deckId - ID balíčku, ve kterém se kartička nachází.
   * @param {string} cardId - ID kartičky, ke které se ukládá odpověď.
   * @param {boolean} isCorrect - Určuje, zda byla odpověď správná.
   * @returns {boolean} True, pokud byl výsledek uložen, jinak false.
   */
  saveAnswer(deckId, cardId, isCorrect) {
    const deck = this.getDeckById(deckId);

    if (!deck) {
      return false;
    }

    const card = deck.cards.find(card => card.id === cardId);

    if (!card) {
      return false;
    }

    card.correctCount = isCorrect ? 1 : 0;
    card.wrongCount = isCorrect ? 0 : 1;

    this.save();

    return true;
  }

  /**
   * Spočítá celkové statistiky aplikace.
   * Vrací počet balíčků, počet kartiček, počet správných a špatných odpovědí,
   * celkový počet odpovědí a procentuální úspěšnost.
   *
   * @returns {Object} Objekt se statistikami aplikace.
   * @returns {number} return.totalDecks - Celkový počet balíčků.
   * @returns {number} return.totalCards - Celkový počet kartiček.
   * @returns {number} return.totalCorrect - Celkový počet správných odpovědí.
   * @returns {number} return.totalWrong - Celkový počet špatných odpovědí.
   * @returns {number} return.totalAnswers - Celkový počet odpovědí.
   * @returns {number} return.successRate - Úspěšnost v procentech.
   */
  getStats() {
    let totalCards = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    this.decks.forEach(deck => {
      totalCards += deck.cards.length;

      deck.cards.forEach(card => {
        totalCorrect += card.correctCount;
        totalWrong += card.wrongCount;
      });
    });

    const totalAnswers = totalCorrect + totalWrong;

    const successRate = totalAnswers === 0
      ? 0
      : Math.round((totalCorrect / totalAnswers) * 100);

    return {
      totalDecks: this.decks.length,
      totalCards,
      totalCorrect,
      totalWrong,
      totalAnswers,
      successRate
    };
  }
}