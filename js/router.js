export class Router {

  /**
   * Vytvoří novou instanci routeru.
   *
   * @param {Object.<string, Function>} routes - Objekt, kde klíčem je cesta a hodnotou funkce pro vykreslení stránky.
   */
  constructor(routes) {
    this.routes = routes;
  }

  /**
   * Inicializuje router.
   * Nastaví obsluhu kliknutí na odkazy s atributem data-link,
   * obsluhu změny hash v URL a provede první vykreslení stránky.
   *
   * @returns {void}
   */
  init() {
    document.addEventListener("click", event => {
      const link = event.target.closest("[data-link]");

      if (!link) {
        return;
      }

      event.preventDefault();

      const path = this.normalizePath(link.getAttribute("href"));
      this.navigate(path);
    });

    window.addEventListener("hashchange", () => {
      this.render(this.getCurrentPath());
    });

    this.render(this.getCurrentPath());
  }

  /**
   * Přejde na zadanou cestu.
   * Pokud je uživatel už na stejné cestě, stránka se pouze znovu vykreslí.
   * Jinak se změní location.hash, což vyvolá událost hashchange.
   *
   * @param {string} path - Cesta, na kterou má aplikace přejít.
   * @returns {void}
   */
  navigate(path) {
    const normalizedPath = this.normalizePath(path);

    if (this.getCurrentPath() === normalizedPath) {
      this.render(normalizedPath);
      return;
    }

    location.hash = normalizedPath;
  }

  /**
   * Získá aktuální cestu z hash části URL.
   * Pokud hash není nastavený, vrátí hlavní stránku "/".
   *
   * @returns {string} Aktuální normalizovaná cesta.
   */
  getCurrentPath() {
    const hash = location.hash.replace("#", "");

    if (!hash || hash === "/") {
      return "/";
    }

    return this.normalizePath(hash);
  }

  /**
   * Sjednotí formát cesty.
   * Odstraní znak # a zajistí, že cesta začíná lomítkem.
   *
   * @param {string} path - Původní cesta z odkazu nebo URL.
   * @returns {string} Normalizovaná cesta.
   */
  normalizePath(path) {
    if (!path || path === "#") {
      return "/";
    }

    let cleanPath = path.replace("#", "");

    if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
    }

    return cleanPath;
  }

  /**
   * Najde odpovídající route a vykreslí příslušnou stránku.
   * Pokud žádná cesta neodpovídá, zobrazí se hlavní stránka.
   *
   * @param {string} path - Cesta, která se má vykreslit.
   * @returns {void}
   */
  render(path) {
    const route = this.findRoute(path);

    if (!route) {
      this.routes["/"]({});
      this.setActiveLink("/");
      return;
    }

    route.handler(route.params);
    this.setActiveLink(path);
  }

  /**
   * Najde route, která odpovídá aktuální cestě.
   * Podporuje i dynamické parametry, například /deck/:id.
   *
   * @param {string} currentPath - Aktuální cesta z URL.
   * @returns {{handler: Function, params: Object}|null} Nalezená route s parametry nebo null.
   */
  findRoute(currentPath) {
    for (const routePath in this.routes) {
      const params = this.matchRoute(routePath, currentPath);

      if (params) {
        return {
          handler: this.routes[routePath],
          params
        };
      }
    }

    return null;
  }

  /**
   * Porovná definovanou route s aktuální cestou.
   * Pokud route obsahuje parametr začínající dvojtečkou, uloží jeho hodnotu do objektu params.
   *
   * @param {string} routePath - Definovaná cesta v routeru, například /deck/:id.
   * @param {string} currentPath - Aktuální cesta, například /deck/123.
   * @returns {Object|null} Objekt s parametry nebo null, pokud cesty neodpovídají.
   */
  matchRoute(routePath, currentPath) {
    const routeParts = routePath.split("/").filter(Boolean);
    const currentParts = currentPath.split("/").filter(Boolean);

    if (routeParts.length !== currentParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const currentPart = currentParts[i];

      if (routePart.startsWith(":")) {
        const paramName = routePart.slice(1);
        params[paramName] = currentPart;
      } else if (routePart !== currentPart) {
        return null;
      }
    }

    return params;
  }

  /**
   * Nastaví aktivní položku v hlavní navigaci podle aktuální cesty.
   *
   * @param {string} path - Aktuální cesta.
   * @returns {void}
   */
  setActiveLink(path) {
    document.querySelectorAll(".main-nav a").forEach(link => {
      const linkPath = this.normalizePath(link.getAttribute("href"));
      link.classList.toggle("active", linkPath === path);
    });
  }
}