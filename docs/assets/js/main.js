/**
 * main.js
 * -------
 * Punto de arranque de la aplicacion. Instancia el ApiClient una sola vez
 * y lo inyecta en cada modulo de dominio, y estos a su vez en cada vista.
 * Este es el "composition root": el unico lugar donde se conectan todas
 * las piezas (evidencia de bajo acoplamiento entre clases, req. 4.1.3).
 */
document.addEventListener("DOMContentLoaded", () => {
  const apiClient = new ApiClient(window.APP_CONFIG.BACKEND_BASE_URL);

  // ---- Modulo 1: Texto simple (req. 1.1) ----
  const translator = new Translator(apiClient);
  const textInput = document.getElementById("text-input");
  const textOutput = document.getElementById("text-output");
  const textTranslateBtn = document.getElementById("text-translate-btn");
  const textUi = new UIStateManager(document.getElementById("text-status"), textTranslateBtn);

  textTranslateBtn.addEventListener("click", async () => {
    const text = textInput.value;
    if (!text.trim()) {
      textUi.error("Escribe un texto antes de traducir.");
      return;
    }
    textUi.loading("Traduciendo...");
    try {
      const result = await translator.translate(text);
      textOutput.value = result.translated_text;
      textUi.success(
        `Traducido de ${result.source_lang.toUpperCase()} a ${result.target_lang.toUpperCase()}.`
      );
    } catch (error) {
      textUi.error(UIStateManager.messageFor(error));
    }
  });

  // ---- Modulo 2: Chat (req. 1.2) ----
  new ChatView(new ChatModule(apiClient));

  // ---- Modulo 3: Audio (req. 1.3) ----
  new AudioView(new AudioModule(apiClient, window.APP_CONFIG.MAX_AUDIO_SIZE_MB));

  // ---- Modulo 4: Documentos (req. 1.4) ----
  new DocumentView(new DocumentModule(apiClient, window.APP_CONFIG.MAX_DOCUMENT_SIZE_MB));

  // ---- Modulo 5: Imagenes (req. 1.5) ----
  new ImageView(new ImageModule(apiClient, window.APP_CONFIG.MAX_IMAGE_SIZE_MB));
});
