/**
   * Vytvoří nový balíček kartiček.
   *
   * @param {string} title - Název balíčku.
   * @param {string} [description=""] - Volitelný popis balíčku.
   */
export class Deck {
  constructor(title, description = "") {
    this.id = crypto.randomUUID();
    this.title = title;
    this.description = description;
    this.cards = [];
    this.createdAt = new Date().toISOString();
  }
}

/**
   * Vytvoří novou kartičku.
   *
   * @param {string} front - Text na přední straně kartičky, například anglické slovíčko.
   * @param {string} back - Text na zadní straně kartičky, například překlad nebo vysvětlení.
   */
export class Flashcard {
  constructor(front, back) {
    this.id = crypto.randomUUID();
    this.front = front;
    this.back = back;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.createdAt = new Date().toISOString();
  }
}