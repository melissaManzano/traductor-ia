/**
 * DocumentModule
 * --------------
 * Valida y envia documentos (PDF, DOCX, TXT) al backend (req. 1.4).
 */
class DocumentModule {
  constructor(apiClient, maxSizeMb) {
    this._apiClient = apiClient;
    this._maxSizeBytes = maxSizeMb * 1024 * 1024;
    this._allowedExtensions = ["pdf", "docx", "txt"];
  }

  validateLocally(file) {
    if (!file) {
      throw new ApiClientError("NO_FILE_PROVIDED", "Selecciona un documento.");
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
        "El documento excede el tamano maximo permitido."
      );
    }
  }

  async translate(file) {
    this.validateLocally(file);
    const formData = new FormData();
    formData.append("document", file);
    return this._apiClient.postFormData("/api/translate-document", formData);
  }
}
