"""
Unico punto del backend que conoce y usa la API Key de OpenAI.

Todas las demas clases del proyecto (TranslatorService, DocumentParser, etc.)
dependen de esta clase por inyeccion de dependencias, nunca acceden a
`os.environ["OPENAI_API_KEY"]` directamente. Esto es lo que garantiza que la
credencial nunca se filtre a otras capas ni, mucho menos, al frontend.
"""

import os
import base64
from openai import OpenAI, OpenAIError

from .exceptions import OpenAIServiceError

# Modelos por defecto. Se documentan y explican en el README (seccion
# "Uso de la API de OpenAI") por que se elige cada uno.
CHAT_MODEL = "gpt-4o-mini"          # texto y razonamiento sobre imagenes (vision)
TRANSCRIPTION_MODEL = "whisper-1"   # voz -> texto
TTS_MODEL = "tts-1"                 # texto -> voz (traduccion hablada)


class OpenAIClient:
    """Wrapper delgado sobre el SDK oficial de OpenAI.

    Encapsula la creacion del cliente y traduce cualquier error del SDK a
    una excepcion propia de la aplicacion (OpenAIServiceError), para que el
    resto del backend nunca necesite conocer los detalles internos del SDK.
    """

    def __init__(self, api_key: str | None = None):
        key = api_key or os.environ.get("OPENAI_API_KEY")
        if not key:
            # Esto es un error de configuracion del servidor, no del usuario.
            raise OpenAIServiceError(
                "El servicio de IA no esta configurado correctamente en el servidor."
            )
        self._client = OpenAI(api_key=key)

    # ------------------------------------------------------------------
    # Chat / texto (traduccion de texto, chat, resultado de vision, etc.)
    # ------------------------------------------------------------------
    def chat_completion(self, messages: list[dict], temperature: float = 0.3) -> str:
        try:
            response = self._client.chat.completions.create(
                model=CHAT_MODEL,
                messages=messages,
                temperature=temperature,
            )
            content = response.choices[0].message.content
            if not content:
                raise OpenAIServiceError("La IA devolvio una respuesta vacia.")
            return content.strip()
        except OpenAIError as exc:
            raise OpenAIServiceError(f"Error al comunicarse con OpenAI: {exc}") from exc

    # ------------------------------------------------------------------
    # Vision (imagenes con texto)
    # ------------------------------------------------------------------
    def chat_completion_with_image(self, prompt: str, image_bytes: bytes, mime_type: str) -> str:
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64_image}"
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ]
        return self.chat_completion(messages, temperature=0.2)

    # ------------------------------------------------------------------
    # Audio: voz -> texto
    # ------------------------------------------------------------------
    def transcribe_audio(self, file_like, filename: str) -> str:
        try:
            file_like.name = filename  # el SDK usa el nombre para inferir el formato
            result = self._client.audio.transcriptions.create(
                model=TRANSCRIPTION_MODEL,
                file=file_like,
            )
            text = (result.text or "").strip()
            return text
        except OpenAIError as exc:
            raise OpenAIServiceError(f"Error al transcribir el audio: {exc}") from exc

    # ------------------------------------------------------------------
    # Audio: texto -> voz (traduccion "hablada")
    # ------------------------------------------------------------------
    def synthesize_speech(self, text: str) -> bytes:
        try:
            response = self._client.audio.speech.create(
                model=TTS_MODEL,
                voice="alloy",
                input=text,
            )
            return response.read()
        except OpenAIError as exc:
            raise OpenAIServiceError(f"Error al generar audio traducido: {exc}") from exc
