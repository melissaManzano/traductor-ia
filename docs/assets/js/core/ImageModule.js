/**
 * ImageModule
 * -----------
 * Valida y envia imagenes con texto al backend (req. 1.5).
 */
class ImageModule {
  constructor(apiClient, maxSizeMb) {
    this._apiClient = apiClient;
    this._maxSizeBytes = maxSizeMb * 1024 * 1024;
    this._allowedExtensions = ["png", "jpg", "jpeg", "webp"];
  }

  validateLocally(file) {
    if (!file) {
      throw new ApiClientError("NO_FILE_PROVIDED", "Selecciona una imagen.");
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
        "La imagen excede el tamano maximo permitido."
      );
    }
  }

  async translate(file) {
    this.validateLocally(file);
    const formData = new FormData();
    formData.append("image", file);
    return this._apiClient.postFormData("/api/translate-image", formData);
  }
}
