/**
 * AudioView
 * ---------
 * Conecta la seccion de audio del DOM con AudioModule. Muestra los
 * estados de carga/procesando/traduciendo/error que exige el req. 1.3.
 */
class AudioView {
  constructor(audioModule) {
    this._audioModule = audioModule;
    this._selectedFile = null;

    this._fileInput = document.getElementById("audio-input");
    this._chooseBtn = document.getElementById("audio-choose-btn");
    this._filenameLabel = document.getElementById("audio-filename");
    this._translateBtn = document.getElementById("audio-translate-btn");
    this._resultBlock = document.getElementById("audio-result");
    this._transcribedEl = document.getElementById("audio-transcribed");
    this._translatedEl = document.getElementById("audio-translated");
    this._audioPlayer = document.getElementById("audio-player");

    this._ui = new UIStateManager(document.getElementById("audio-status"), this._translateBtn);

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
    this._ui.loading("Subiendo y transcribiendo audio...");
    try {
      const result = await this._audioModule.translate(this._selectedFile);
      this._renderResult(result);
      this._ui.success("Traduccion completada.");
    } catch (error) {
      this._ui.error(UIStateManager.messageFor(error));
    }
  }

  _renderResult(result) {
    this._transcribedEl.textContent = result.transcribed_text;
    this._translatedEl.textContent = result.translated_text;
    this._resultBlock.hidden = false;

    if (result.spoken_translation_base64) {
      this._audioPlayer.src = `data:audio/mp3;base64,${result.spoken_translation_base64}`;
      this._audioPlayer.hidden = false;
    } else {
      this._audioPlayer.hidden = true;
    }
  }
}
