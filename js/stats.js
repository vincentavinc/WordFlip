/**
 * Vykreslí SVG graf se statistikami správných a špatných odpovědí.
 * Graf se vloží do HTML elementu podle jeho ID.
 * Pokud nejsou dostupná žádná data, zobrazí se pouze informační text.
 *
 * @param {string} containerId - ID HTML elementu, do kterého se má graf vykreslit.
 * @param {Object} stats - Objekt se statistikami aplikace.
 * @param {number} stats.totalAnswers - Celkový počet odpovědí.
 * @param {number} stats.totalCorrect - Počet správných odpovědí.
 * @param {number} stats.totalWrong - Počet špatných odpovědí.
 * @param {number} stats.successRate - Celková úspěšnost v procentech.
 * @returns {void}
 */
export function renderStatsChart(containerId, stats) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const svg = createSvgElement("svg", {
    width: "520",
    height: "290",
    viewBox: "0 0 520 290",
    role: "img",
    "aria-label": "Graf správných a špatných odpovědí"
  });

  const title = createSvgElement("title");
  title.textContent = "Graf správných a špatných odpovědí";
  svg.appendChild(title);

  if (stats.totalAnswers === 0) {
    const emptyText = createSvgElement("text", {
      x: "260",
      y: "130",
      "text-anchor": "middle",
      class: "svg-empty-text"
    });

    emptyText.textContent = "Zatím nejsou dostupná data pro graf.";
    svg.appendChild(emptyText);
    container.appendChild(svg);
    return;
  }

  /**
 * Nakreslí vodorovnou osu grafu.
 *
 * @param {SVGElement} svg - SVG element, do kterého se osa vloží.
 * @returns {void}
 */
  drawAxis(svg);
  drawBar(svg, {
    label: "Správně",
    value: stats.totalCorrect,
    x: 130,
    maxValue: Math.max(stats.totalCorrect, stats.totalWrong, 1),
    className: "svg-bar-correct"
  });

  drawBar(svg, {
    label: "Špatně",
    value: stats.totalWrong,
    x: 310,
    maxValue: Math.max(stats.totalCorrect, stats.totalWrong, 1),
    className: "svg-bar-wrong"
  });

  const successText = createSvgElement("text", {
    x: "260",
    y: "265",
    "text-anchor": "middle",
    class: "svg-success-text"
  });

  successText.textContent = `Celková úspěšnost: ${stats.successRate}%`;
  svg.appendChild(successText);

  container.appendChild(svg);
}

/**
 * Nakreslí vodorovnou osu grafu.
 *
 * @param {SVGElement} svg - SVG element, do kterého se osa vloží.
 * @returns {void}
 */
function drawAxis(svg) {
  const axis = createSvgElement("line", {
    x1: "70",
    y1: "200",
    x2: "450",
    y2: "200",
    class: "svg-axis"
  });

  svg.appendChild(axis);
}

/**
 * Nakreslí jeden sloupec grafu.
 * Výška sloupce se vypočítá podle hodnoty a maximální hodnoty v grafu.
 *
 * @param {SVGElement} svg - SVG element, do kterého se sloupec vloží.
 * @param {Object} options - Nastavení sloupce.
 * @param {string} options.label - Popisek sloupce.
 * @param {number} options.value - Hodnota sloupce.
 * @param {number} options.x - Pozice sloupce na ose X.
 * @param {number} options.maxValue - Nejvyšší hodnota v grafu.
 * @param {string} options.className - CSS třída pro vzhled sloupce.
 * @returns {void}
 */
function drawBar(svg, options) {
  const maxBarHeight = 140;
  const barWidth = 80;

  const barHeight = options.maxValue === 0
    ? 0
    : Math.round((options.value / options.maxValue) * maxBarHeight);

  const y = 200 - barHeight;

  const rect = createSvgElement("rect", {
    x: String(options.x),
    y: String(y),
    width: String(barWidth),
    height: String(barHeight),
    rx: "8",
    class: options.className
  });

  const valueText = createSvgElement("text", {
    x: String(options.x + barWidth / 2),
    y: String(y - 10),
    "text-anchor": "middle",
    class: "svg-value-text"
  });

  valueText.textContent = String(options.value);

  const labelText = createSvgElement("text", {
    x: String(options.x + barWidth / 2),
    y: "232",
    "text-anchor": "middle",
    class: "svg-label-text"
  });

  labelText.textContent = options.label;

  svg.appendChild(rect);
  svg.appendChild(valueText);
  svg.appendChild(labelText);
}

/**
 * Vytvoří SVG element se zadanými atributy.
 * Funkce používá správný SVG namespace, aby se elementy korektně vykreslily.
 *
 * @param {string} name - Název SVG elementu, například "svg", "rect", "text" nebo "line".
 * @param {Object} [attributes={}] - Objekt s atributy, které se mají nastavit.
 * @returns {SVGElement} Vytvořený SVG element.
 */
function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}