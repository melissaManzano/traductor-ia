/**
 * ChatView
 * --------
 * Conecta el formulario de chat del DOM con ChatModule, y pinta cada
 * mensaje nuevo distinguiendo claramente texto original vs. traduccion
 * (req. 1.2: "evitar que el usuario confunda el mensaje original con el
 * mensaje traducido").
 */
class ChatView {
  constructor(chatModule) {
    this._chatModule = chatModule;

    this._form = document.getElementById("chat-form");
    this._senderSelect = document.getElementById("chat-sender");
    this._langSelect = document.getElementById("chat-sender-lang");
    this._input = document.getElementById("chat-input");
    this._messagesContainer = document.getElementById("chat-messages");
    this._sendButton = document.getElementById("chat-send-btn");

    this._ui = new UIStateManager(document.getElementById("chat-status"), this._sendButton);

    this._form.addEventListener("submit", (event) => this._handleSubmit(event));
  }

  async _handleSubmit(event) {
    event.preventDefault();
    const sender = this._senderSelect.value;
    const sourceLang = this._langSelect.value;
    const text = this._input.value;

    if (!text.trim()) {
      this._ui.error("Escribe un mensaje antes de enviarlo.");
      return;
    }

    this._ui.loading("Traduciendo mensaje...");
    try {
      const message = await this._chatModule.sendMessage(sender, text, sourceLang);
      this._renderMessage(message);
      this._input.value = "";
      this._ui.success("Mensaje enviado.");
    } catch (error) {
      this._ui.error(UIStateManager.messageFor(error));
    }
  }

  _renderMessage(message) {
    const isParticipantB = message.sender === "Participante B";
    const wrapper = document.createElement("div");
    wrapper.className = `chat-message${isParticipantB ? " chat-message--b" : ""}`;

    const senderEl = document.createElement("div");
    senderEl.className = "chat-message__sender";
    senderEl.textContent = `${message.sender} (${message.source_lang.toUpperCase()})`;

    const originalEl = document.createElement("div");
    originalEl.className = "chat-message__original";
    originalEl.textContent = message.original_text;

    const translationEl = document.createElement("div");
    translationEl.className = "chat-message__translation";
    translationEl.textContent = `Traducción (${message.target_lang.toUpperCase()}): ${message.translated_text}`;

    wrapper.append(senderEl, originalEl, translationEl);
    this._messagesContainer.appendChild(wrapper);
    this._messagesContainer.scrollTop = this._messagesContainer.scrollHeight;
  }
}
