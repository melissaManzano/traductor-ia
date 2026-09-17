/**
 * DocumentView
 * ------------
 * Conecta la seccion de documentos del DOM con DocumentModule (req. 1.4).
 */
class DocumentView {
  constructor(documentModule) {
    this._documentModule = documentModule;
    this._selectedFile = null;

    this._fileInput = document.getElementById("document-input");
    this._chooseBtn = document.getElementById("document-choose-btn");
    this._filenameLabel = document.getElementById("document-filename");
    this._translateBtn = document.getElementById("document-translate-btn");
    this._resultBlock = document.getElementById("document-result");
    this._truncatedNotice = document.getElementById("document-truncated-notice");
    this._originalEl = document.getElementById("document-original");
    this._translatedEl = document.getElementById("document-translated");

    this._ui = new UIStateManager(document.getElementById("document-status"), this._translateBtn);

    this._chooseBtn.addEventListener("click", () => this._fileInput.click());
    this._fileInput.addEventListener("change", () => this._handleFileSelected());
    this._translateBtn.addEventListener("click", () => this._handleTranslate());
  }

  _handleFileSelected() {
    this._selectedFile = this._fileInput.files[0] || null;
    this._filenameLabel.textContent = this._selectedFile ? this._selectedFile.name : "";
    this._ui.clear();
  }

  async _handleTranslate() {
    this._resultBlock.hidden = true;
    this._ui.loading("Leyendo y traduciendo documento...");
    try {
      const result = await this._documentModule.translate(this._selectedFile);
      this._renderResult(result);
      this._ui.success("Traduccion completada.");
    } catch (error) {
      this._ui.error(UIStateManager.messageFor(error));
    }
  }

  _renderResult(result) {
    this._originalEl.textContent = result.original_text;
    this._translatedEl.textContent = result.translated_text;
    this._truncatedNotice.hidden = !result.truncated;
    this._resultBlock.hidden = false;
  }
}
