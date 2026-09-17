/**
 * Translator
 * ----------
 * Orquesta la traduccion de texto simple (req. 1.1). Es deliberadamente
 * pequena: solo sabe pedirle al ApiClient que traduzca, y devuelve el
 * resultado ya estructurado para que la vista lo pinte.
 */
class Translator {
  constructor(apiClient) {
    this._apiClient = apiClient;
  }

  /** @returns {Promise<{original_text, source_lang, target_lang, translated_text}>} */
  async translate(text) {
    return this._apiClient.postJson("/api/translate-text", { text });
  }
}
