/**
 * Nastaví Drag & Drop funkcionalitu pro seznam kartiček.
 * Uživatel může přetáhnout jednu kartičku na místo jiné kartičky
 * a tím změnit jejich pořadí v balíčku.
 *
 * @param {HTMLElement} cardList - HTML kontejner, který obsahuje všechny kartičky.
 * @param {Function} onReorder - Callback funkce zavolaná po přesunutí kartičky.
 * @param {string} onReorder.draggedCardId - ID přetahované kartičky.
 * @param {string} onReorder.targetCardId - ID cílové kartičky.
 * @returns {void}
 */
export function setupCardDragAndDrop(cardList, onReorder) {
  let draggedCardId = null;

  cardList.querySelectorAll(".word-card").forEach(cardElement => {
    cardElement.addEventListener("dragstart", event => {
      draggedCardId = cardElement.dataset.cardId;
      cardElement.classList.add("dragging");

      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedCardId);
    });

    cardElement.addEventListener("dragend", () => {
      draggedCardId = null;
      cardElement.classList.remove("dragging");

      cardList.querySelectorAll(".word-card").forEach(card => {
        card.classList.remove("drag-over");
      });
    });

    cardElement.addEventListener("dragover", event => {
      event.preventDefault();
      cardElement.classList.add("drag-over");
    });

    cardElement.addEventListener("dragleave", () => {
      cardElement.classList.remove("drag-over");
    });

    cardElement.addEventListener("drop", event => {
      event.preventDefault();

      const targetCardId = cardElement.dataset.cardId;

      if (!draggedCardId || draggedCardId === targetCardId) {
        return;
      }

      onReorder(draggedCardId, targetCardId);
    });
  });
}