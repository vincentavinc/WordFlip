/**
 * Třída pro ovládání zvuků v aplikaci.
 * Pracuje se zvukem otočení kartičky, zvukem správné odpovědi,
 * zvukem špatné odpovědi a s hudbou na pozadí.
 */
export class AudioController {
  constructor() {
    this.flipSound = document.getElementById("flipSound");
    this.correctSound = document.getElementById("correctSound");
    this.wrongSound = document.getElementById("wrongSound");
    this.backgroundMusic = document.getElementById("backgroundMusic");

    if (this.backgroundMusic) {
      this.backgroundMusic.volume = 0.25;
    }
  }

  /**
   * Přehraje zvuk otočení kartičky.
   *
   * @returns {void}
   */
  playFlip() {
    this.playSound(this.flipSound);
  }

  /**
   * Přehraje zvuk správné odpovědi.
   *
   * @returns {void}
   */
  playCorrect() {
    this.playSound(this.correctSound);
  }

   /**
   * Přehraje zvuk špatné odpovědi.
   *
   * @returns {void}
   */
  playWrong() {
    this.playSound(this.wrongSound);
  }

  /**
   * Zapne nebo vypne hudbu na pozadí.
   * Pokud hudba právě stojí, pokusí se ji spustit.
   * Pokud hudba hraje, pozastaví ji.
   *
   * @returns {boolean} Vrací true, pokud se hudba má zobrazit jako zapnutá, jinak false.
   */
  toggleMusic() {
    if (!this.backgroundMusic) {
      return false;
    }

    if (this.backgroundMusic.paused) {
      this.backgroundMusic.play().catch(() => {
        console.log("Hudbu se nepodařilo spustit.");
      });

      return true;
    }

    this.backgroundMusic.pause();
    return false;
  }

  /**
   * Přehraje zadaný audio element od začátku.
   * Pokud audio element neexistuje nebo prohlížeč přehrávání zablokuje,
   * funkce aplikaci nezastaví a pouze vypíše zprávu do konzole.
   *
   * @param {HTMLAudioElement|null} audioElement - Audio element, který se má přehrát.
   * @returns {void}
   */
  playSound(audioElement) {
    if (!audioElement) {
      return;
    }

    audioElement.currentTime = 0;

    audioElement.play().catch(() => {
      console.log("Zvuk se nepodařilo přehrát.");
    });
  }
}