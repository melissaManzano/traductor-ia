"""
Endpoint de traduccion de audio (req. 1.3).

Flujo: audio (voz) -> Whisper (transcripcion) -> TranslatorService (texto
origen -> texto destino) -> TTS opcional (texto destino -> voz).

La respuesta siempre incluye el texto transcrito y el texto traducido para
que la interfaz pueda mostrarlos de forma legible, ademas de un audio en
base64 con la version hablada de la traduccion.
"""

import base64
import io

from flask import Blueprint, request, jsonify

from core.openai_client import OpenAIClient
from core.translator_service import TranslatorService
from core.validators import audio_validator
from core.exceptions import UnusableAudioError

audio_bp = Blueprint("audio_routes", __name__)


@audio_bp.route("/translate-audio", methods=["POST"])
def translate_audio():
    file_storage = request.files.get("audio")
    validator = audio_validator()
    extension = validator.validate(file_storage)

    audio_bytes = file_storage.read()
    audio_stream = io.BytesIO(audio_bytes)

    client = OpenAIClient()
    transcribed_text = client.transcribe_audio(audio_stream, f"audio.{extension}")

    if not transcribed_text:
        raise UnusableAudioError(
            "No se pudo reconocer contenido hablado en el audio proporcionado."
        )

    service = TranslatorService(client)
    result = service.translate(transcribed_text)

    # Genera el audio hablado de la traduccion (requisito: "traducir en forma
    # hablada"). Si falla la sintesis de voz, la traduccion en texto de
    # todas formas se entrega: no se bloquea la respuesta completa por esto.
    spoken_audio_b64 = None
    try:
        spoken_audio_bytes = client.synthesize_speech(result["translated_text"])
        spoken_audio_b64 = base64.b64encode(spoken_audio_bytes).decode("utf-8")
    except Exception:
        spoken_audio_b64 = None

    return jsonify({
        "ok": True,
        "data": {
            **result,
            "transcribed_text": transcribed_text,
            "spoken_translation_base64": spoken_audio_b64,
        },
    })
