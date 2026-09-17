/**
 * ApiClient
 * ---------
 * Unico punto del frontend que se comunica con el backend. Ninguna otra
 * clase hace fetch() directamente: todas pasan por aqui. Esto permite
 * centralizar el manejo de errores de red y de respuestas de error del
 * servidor (req. 7.1.8 y 7.1.10) en un solo lugar.
 */
class ApiClient {
  constructor(baseUrl) {
    this._baseUrl = baseUrl;
  }

  /** POST con cuerpo JSON. Usado por texto y chat. */
  async postJson(path, payload) {
    let response;
    try {
      response = await fetch(`${this._baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      throw new ApiClientError(
        "CONNECTION_ERROR",
        "No fue posible conectar con el servidor. Verifica tu conexion e intenta de nuevo."
      );
    }
    return this._parseResponse(response);
  }

  /** POST con FormData. Usado por audio, documentos e imagenes. */
  async postFormData(path, formData) {
    let response;
    try {
      response = await fetch(`${this._baseUrl}${path}`, {
        method: "POST",
        body: formData,
      });
    } catch (networkError) {
      throw new ApiClientError(
        "CONNECTION_ERROR",
        "No fue posible conectar con el servidor. Verifica tu conexion e intenta de nuevo."
      );
    }
    return this._parseResponse(response);
  }

  async _parseResponse(response) {
    let body;
    try {
      body = await response.json();
    } catch (parseError) {
      throw new ApiClientError(
        "INVALID_RESPONSE",
        "El servidor devolvio una respuesta inesperada."
      );
    }

    if (!response.ok || body.ok === false) {
      throw new ApiClientError(
        body.error_code || "UNKNOWN_ERROR",
        body.message || "Ocurrio un error al procesar la solicitud."
      );
    }

    return body.data;
  }
}

/** Error tipado que las vistas usan para mostrar mensajes amigables. */
class ApiClientError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
