"""Deteccion simple de idioma origen (ES/EN) usada antes de traducir."""

from .openai_client import OpenAIClient


class LanguageDetector:
    """Determina si un texto esta en espanol o ingles.

    Se apoya en el propio modelo de OpenAI (no se usa una libreria externa
    de deteccion) para mantener consistencia con el requisito de que la IA
    participe realmente en el procesamiento del contenido.
    """

    def __init__(self, openai_client: OpenAIClient):
        self._client = openai_client

    def detect(self, text: str) -> str:
        """Devuelve 'es' o 'en'."""
        messages = [
            {
                "role": "system",
                "content": (
                    "Responde UNICAMENTE con 'es' si el siguiente texto esta "
                    "escrito en espanol, o 'en' si esta escrito en ingles. "
                    "No agregues nada mas a la respuesta."
                ),
            },
            {"role": "user", "content": text[:2000]},
        ]
        result = self._client.chat_completion(messages, temperature=0)
        normalized = result.strip().lower()
        return "en" if normalized.startswith("en") else "es"

    @staticmethod
    def opposite(lang: str) -> str:
        return "en" if lang == "es" else "es"
