/**
 * UIStateManager
 * --------------
 * Centraliza como se muestran los estados de carga/exito/error en
 * cualquier parte de la interfaz (req. 2.1: "indicadores visuales durante
 * procesos", "mensajes comprensibles de exito, advertencia y error").
 *
 * Cada modulo de vista (ChatView, AudioView, etc.) reutiliza esta misma
 * clase en vez de reinventar su propio manejo de mensajes.
 */
class UIStateManager {
  /**
   * @param {HTMLElement} statusElement elemento donde se escribe el mensaje
   * @param {HTMLButtonElement} [actionButton] boton que se deshabilita durante la carga
   */
  constructor(statusElement, actionButton = null) {
    this._statusElement = statusElement;
    this._actionButton = actionButton;
  }

  loading(message = "Procesando...") {
    this._render(message, "loading");
    if (this._actionButton) this._actionButton.disabled = true;
  }

  success(message = "Listo.") {
    this._render(message, "success");
    if (this._actionButton) this._actionButton.disabled = false;
  }

  error(message = "Ocurrio un error.") {
    this._render(message, "error");
    if (this._actionButton) this._actionButton.disabled = false;
  }

  clear() {
    this._render("", "idle");
    if (this._actionButton) this._actionButton.disabled = false;
  }

  /** Traduce un ApiClientError a un mensaje entendible para el usuario final. */
  static messageFor(error) {
    const FRIENDLY_MESSAGES = {
      CONNECTION_ERROR: "No fue posible conectar con el servidor. Verifica tu conexion.",
      EMPTY_CONTENT: "Escribe o selecciona contenido antes de traducir.",
      NO_FILE_PROVIDED: "Selecciona un archivo antes de continuar.",
      UNSUPPORTED_FILE_TYPE: error.message,
      FILE_TOO_LARGE: error.message,
      UNUSABLE_AUDIO: "No se detecto voz reconocible en el audio.",
      NO_READABLE_TEXT_IN_IMAGE: "La imagen no contiene texto legible o su calidad no es suficiente.",
      EMPTY_DOCUMENT: "El documento no contiene texto que se pueda traducir.",
      UNAUTHORIZED_ORIGIN: "Esta aplicacion no esta autorizada para usar el servicio desde este origen.",
      OPENAI_SERVICE_ERROR: "El servicio de Inteligencia Artificial no respondio correctamente. Intenta de nuevo.",
      INTERNAL_ERROR: "Ocurrio un error inesperado en el servidor.",
    };
    return FRIENDLY_MESSAGES[error.code] || error.message || "Ocurrio un error inesperado.";
  }

  _render(message, state) {
    this._statusElement.textContent = message;
    this._statusElement.setAttribute("data-state", state);
  }
}
