/**
 * ChatModule
 * ----------
 * Mantiene el historial de una conversacion bilingue en memoria durante
 * la sesion (req. 1.2: "la conversacion debera permanecer visible durante
 * la sesion"). El backend no guarda estado; este modulo es la unica
 * fuente de verdad del historial en el frontend.
 */
class ChatModule {
  constructor(apiClient) {
    this._apiClient = apiClient;
    this._messages = []; // { sender, original_text, source_lang, target_lang, translated_text }
  }

  /**
   * Envia y traduce un nuevo mensaje, lo agrega al historial y lo devuelve.
   */
  async sendMessage(sender, text, sourceLang) {
    const result = await this._apiClient.postJson("/api/translate-chat", {
      sender,
      text,
      source_lang: sourceLang,
    });
    this._messages.push(result);
    return result;
  }

  getHistory() {
    return this._messages;
  }
}
