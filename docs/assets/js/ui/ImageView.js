/**
 * ImageView
 * ---------
 * Conecta la seccion de imagenes del DOM con ImageModule (req. 1.5).
 * Muestra la imagen cargada junto con el texto detectado y su traduccion.
 */
class ImageView {
  constructor(imageModule) {
    this._imageModule = imageModule;
    this._selectedFile = null;

    this._fileInput = document.getElementById("image-input");
    this._chooseBtn = document.getElementById("image-choose-btn");
    this._filenameLabel = document.getElementById("image-filename");
    this._translateBtn = document.getElementById("image-translate-btn");
    this._resultBlock = document.getElementById("image-result");
    this._previewEl = document.getElementById("image-preview");
    this._originalEl = document.getElementById("image-original");
    this._translatedEl = document.getElementById("image-translated");

    this._ui = new UIStateManager(document.getElementById("image-status"), this._translateBtn);

    this._chooseBtn.addEventListener("click", () => this._fileInput.click());
    this._fileInput.addEventListener("change", () => this._handleFileSelected());
    this._translateBtn.addEventListener("click", () => this._handleTranslate());
  }

  _handleFileSelected() {
    this._selectedFile = this._fileInput.files[0] || null;
    this._filenameLabel.textContent = this._selectedFile ? this._selectedFile.name : "";
    this._ui.clear();

    if (this._selectedFile) {
      this._previewEl.src = URL.createObjectURL(this._selectedFile);
    }
  }

  async _handleTranslate() {
    this._resultBlock.hidden = true;
    this._ui.loading("Analizando imagen...");
    try {
      const result = await this._imageModule.translate(this._selectedFile);
      this._renderResult(result);
      this._ui.success("Traduccion completada.");
    } catch (error) {
      this._ui.error(UIStateManager.messageFor(error));
    }
  }

  _renderResult(result) {
    this._originalEl.textContent = result.original_text;
    this._translatedEl.textContent = result.translated_text;
    this._resultBlock.hidden = false;
  }
}
