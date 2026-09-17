"""
Servicio central de traduccion.

Todos los modulos (chat, audio, documentos, imagenes) terminan reutilizando
este mismo servicio para el paso final de "convertir texto de un idioma a
otro". Esto evita duplicar prompts y logica de traduccion en cada endpoint
(principio de reutilizacion de codigo, req. 4.1.3).
"""

from .openai_client import OpenAIClient
from .language_detector import LanguageDetector
from .exceptions import EmptyContentError

LANG_NAMES = {"es": "espanol", "en": "ingles"}


class TranslatorService:
    def __init__(self, openai_client: OpenAIClient, language_detector: LanguageDetector | None = None):
        self._client = openai_client
        self._detector = language_detector or LanguageDetector(openai_client)

    def translate(self, text: str, source_lang: str | None = None, target_lang: str | None = None) -> dict:
        """Traduce `text`.

        Si no se especifica `source_lang`, se detecta automaticamente.
        Si no se especifica `target_lang`, se usa el idioma opuesto al detectado.

        Devuelve un dict con: texto original, idioma origen, idioma destino
        y la traduccion, para que la interfaz pueda mostrar ambos con claridad
        (req. 1.1).
        """
        if not text or not text.strip():
            raise EmptyContentError("El texto a traducir esta vacio.")

        detected_source = source_lang or self._detector.detect(text)
        final_target = target_lang or LanguageDetector.opposite(detected_source)

        prompt = self._build_prompt(text, detected_source, final_target)
        translation = self._client.chat_completion(prompt)

        return {
            "original_text": text,
            "source_lang": detected_source,
            "target_lang": final_target,
            "translated_text": translation,
        }

    @staticmethod
    def _build_prompt(text: str, source_lang: str, target_lang: str) -> list[dict]:
        source_name = LANG_NAMES.get(source_lang, source_lang)
        target_name = LANG_NAMES.get(target_lang, target_lang)
        system_prompt = (
            f"Eres un traductor profesional de {source_name} a {target_name}. "
            "Traduce fielmente conservando el significado y produce una redaccion "
            "natural en el idioma de destino. Conserva nombres propios, cifras, "
            "fechas, unidades, terminos tecnicos y siglas, adaptandolos solo si "
            "es razonable hacerlo. No agregues explicaciones ni comentarios: "
            "responde UNICAMENTE con el texto traducido."
        )
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ]
