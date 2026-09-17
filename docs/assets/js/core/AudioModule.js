/**
 * AudioModule
 * -----------
 * Encapsula la validacion local (req. 6) y el envio de un archivo de
 * audio al backend (req. 1.3). La validacion aqui es solo la primera
 * linea de defensa para dar feedback rapido al usuario; el backend
 * vuelve a validar siempre.
 */
class AudioModule {
  constructor(apiClient, maxSizeMb) {
    this._apiClient = apiClient;
    this._maxSizeBytes = maxSizeMb * 1024 * 1024;
    this._allowedExtensions = ["mp3", "wav", "m4a", "webm", "ogg"];
  }

  validateLocally(file) {
    if (!file) {
      throw new ApiClientError("NO_FILE_PROVIDED", "Selecciona un archivo de audio.");
    }
    const extension = file.name.split(".").pop().toLowerCase();
    if (!this._allowedExtensions.includes(extension)) {
      throw new ApiClientError(
        "UNSUPPORTED_FILE_TYPE",
        `Formato .${extension} no permitido. Usa: ${this._allowedExtensions.join(", ")}.`
      );
    }
    if (file.size > this._maxSizeBytes) {
      throw new ApiClientError(
        "FILE_TOO_LARGE",
        "El audio excede el tamano maximo permitido."
      );
    }
  }

  async translate(file) {
    this.validateLocally(file);
    const formData = new FormData();
    formData.append("audio", file);
    return this._apiClient.postFormData("/api/translate-audio", formData);
  }
}
