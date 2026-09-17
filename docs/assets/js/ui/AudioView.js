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

    this._recordBtn = document.getElementById("audio-record-btn");
    this._recordDot = document.getElementById("audio-record-dot");
    this._recordLabel = document.getElementById("audio-record-label");
    this._recordTime = document.getElementById("audio-record-time");
    this._recordPreview = document.getElementById("audio-record-preview");

    this._mediaRecorder = null;
    this._mediaStream = null;
    this._recordedChunks = [];
    this._recordSeconds = 0;
    this._recordTimerId = null;

    this._ui = new UIStateManager(document.getElementById("audio-status"), this._translateBtn);

    this._chooseBtn.addEventListener("click", () => this._fileInput.click());
    this._fileInput.addEventListener("change", () => this._handleFileSelected());
    this._translateBtn.addEventListener("click", () => this._handleTranslate());
    this._recordBtn.addEventListener("click", () => this._handleRecordToggle());
  }

  _handleFileSelected() {
    this._selectedFile = this._fileInput.files[0] || null;
    this._filenameLabel.textContent = this._selectedFile ? this._selectedFile.name : "";
    this._recordPreview.hidden = true;
    this._ui.clear();
  }

  // ------------------------------------------------------------------
  // Grabacion de nota de voz desde el microfono (req. 1.3: reconocer audio
  // grabado directamente desde la app, no solo archivos subidos).
  // ------------------------------------------------------------------
  async _handleRecordToggle() {
    if (this._mediaRecorder && this._mediaRecorder.state === "recording") {
      this._mediaRecorder.stop();
      return;
    }
    await this._startRecording();
  }

  async _startRecording() {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      this._ui.error("Este navegador no permite grabar audio desde el microfono.");
      return;
    }

    try {
      this._mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      this._ui.error("No se pudo acceder al microfono. Revisa los permisos del navegador.");
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

    this._mediaRecorder = mimeType
      ? new MediaRecorder(this._mediaStream, { mimeType })
      : new MediaRecorder(this._mediaStream);
    this._recordedChunks = [];

    this._mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) this._recordedChunks.push(event.data);
    });
    this._mediaRecorder.addEventListener("stop", () => this._handleRecordingStopped());

    this._mediaRecorder.start();
    this._setRecordingUi(true);
  }

  _handleRecordingStopped() {
    this._mediaStream.getTracks().forEach((track) => track.stop());
    this._setRecordingUi(false);

    const type = this._mediaRecorder.mimeType || "audio/webm";
    const blob = new Blob(this._recordedChunks, { type });
    const extension = type.includes("mp4") ? "m4a" : "webm";
    this._selectedFile = new File([blob], `nota-de-voz.${extension}`, { type });

    this._filenameLabel.textContent = this._selectedFile.name;
    this._recordPreview.src = URL.createObjectURL(blob);
    this._recordPreview.hidden = false;
    this._ui.clear();
  }

  _setRecordingUi(isRecording) {
    this._recordDot.hidden = !isRecording;
    this._recordLabel.textContent = isRecording ? "Detener grabacion" : "Grabar nota de voz";
    this._chooseBtn.disabled = isRecording;
    this._recordTime.hidden = !isRecording;

    if (isRecording) {
      this._recordSeconds = 0;
      this._recordTime.textContent = "00:00";
      this._recordTimerId = setInterval(() => {
        this._recordSeconds += 1;
        const minutes = String(Math.floor(this._recordSeconds / 60)).padStart(2, "0");
        const seconds = String(this._recordSeconds % 60).padStart(2, "0");
        this._recordTime.textContent = `${minutes}:${seconds}`;
      }, 1000);
    } else if (this._recordTimerId) {
      clearInterval(this._recordTimerId);
      this._recordTimerId = null;
    }
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
