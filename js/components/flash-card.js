/**
 * Webová komponenta pro zobrazení jedné otočné kartičky.
 * Komponenta podporuje přední a zadní stranu kartičky,
 * otočení pomocí kliknutí nebo klávesnice a vlastní událost card-flip.
 */
class FlashcardCard extends HTMLElement {

  /**
   * Seznam atributů, jejichž změny komponenta sleduje.
   *
   * @returns {string[]} Pole názvů sledovaných atributů.
   */
  static get observedAttributes() {
    return ["front", "back", "flipped", "front-label", "back-label"];
  }

  /**
   * Spustí se ve chvíli, kdy je komponenta přidána do DOM.
   * Po přidání se komponenta poprvé vykreslí.
   *
   * @returns {void}
   */
  connectedCallback() {
    this.render();
  }

  /**
   * Spustí se při změně sledovaného atributu.
   * Pokud se změní pouze atribut flipped, aktualizuje se jen stav otočení.
   * Při změně ostatních atributů se komponenta znovu vykreslí.
   *
   * @param {string} name - Název změněného atributu.
   * @returns {void}
   */
  attributeChangedCallback(name) {
    if (name === "flipped" && this.flashcardElement) {
      this.updateFlipState();
      return;
    }

    this.render();
  }

  /**
   * Vykreslí HTML strukturu kartičky.
   * Vytvoří přední a zadní stranu, nastaví přístupnost
   * a přidá obsluhu kliknutí i klávesnice.
   *
   * @returns {void}
   */
  render() {
    const frontText = this.getAttribute("front") || "";
    const backText = this.getAttribute("back") || "";
    const frontLabel = this.getAttribute("front-label") || "ENGLISH";
    const backLabel = this.getAttribute("back-label") || "ČESKY";

    this.innerHTML = "";

    const article = document.createElement("article");
    article.className = "flashcard";
    article.setAttribute("tabindex", "0");
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", "Otočit kartičku");

    /**
     * Vyvolá vlastní událost card-flip.
     * Skutečné otočení řeší stránka, která komponentu používá.
     *
     * @param {Event} event - Událost kliknutí nebo stisku klávesy.
     * @returns {void}
     */
    const requestFlip = event => {
      event.preventDefault();

      this.dispatchEvent(new CustomEvent("card-flip", {
        bubbles: true
      }));
    };

    article.addEventListener("click", requestFlip);

    article.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " " || event.code === "Space") {
        requestFlip(event);
      }
    });

    const inner = document.createElement("div");
    inner.className = "flashcard-inner";

    const front = this.createSide("flashcard-front", frontLabel, frontText);
    const back = this.createSide("flashcard-back", backLabel, backText);

    inner.appendChild(front);
    inner.appendChild(back);
    article.appendChild(inner);
    this.appendChild(article);

    this.flashcardElement = article;
    this.updateFlipState();
  }

  /**
   * Aktualizuje vizuální stav otočení kartičky.
   * Pokud má komponenta atribut flipped, přidá se CSS třída is-flipped.
   *
   * @returns {void}
   */
  updateFlipState() {
    const isFlipped = this.hasAttribute("flipped");

    this.flashcardElement.classList.toggle("is-flipped", isFlipped);
    this.flashcardElement.setAttribute("aria-pressed", String(isFlipped));
  }

  /**
   * Vytvoří jednu stranu kartičky.
   * Strana obsahuje popisek, hlavní text a nápovědu pro ovládání.
   *
   * @param {string} className - CSS třída pro konkrétní stranu kartičky.
   * @param {string} label - Popisek strany kartičky.
   * @param {string} text - Text zobrazený na kartičce.
   * @returns {HTMLDivElement} HTML element jedné strany kartičky.
   */
  createSide(className, label, text) {
    const side = document.createElement("div");
    side.className = className;

    const labelElement = document.createElement("span");
    labelElement.className = "flashcard-label";
    labelElement.textContent = label;

    const textElement = document.createElement("strong");
    textElement.className = "flashcard-word";
    textElement.textContent = text;

    const hintElement = document.createElement("span");
    hintElement.className = "flashcard-click-hint";
    hintElement.textContent = "Klikni nebo stiskni Enter / mezerník pro otočení";

    side.appendChild(labelElement);
    side.appendChild(textElement);
    side.appendChild(hintElement);

    return side;
  }
}

customElements.define("flashcard-card", FlashcardCard);