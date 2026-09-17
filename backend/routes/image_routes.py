"""Endpoint de traduccion de texto contenido en imagenes (req. 1.5)."""

from flask import Blueprint, request, jsonify

from core.openai_client import OpenAIClient
from core.validators import image_validator
from core.exceptions import NoReadableTextInImageError

image_bp = Blueprint("image_routes", __name__)

_EXTENSION_TO_MIME = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
}

_NO_TEXT_MARKER = "NO_TEXT_FOUND"

_PROMPT_TEMPLATE = (
    "Observa la imagen adjunta. Si contiene texto legible (en espanol o "
    "ingles), extrae ese texto y traducelo al idioma opuesto (si el texto "
    "esta en espanol, traduce a ingles; si esta en ingles, traduce a "
    "espanol). Responde ESTRICTAMENTE en este formato, sin nada mas:\n"
    "IDIOMA_ORIGEN: <es|en>\n"
    "TEXTO_ORIGINAL: <texto exacto encontrado en la imagen>\n"
    "TRADUCCION: <texto traducido>\n"
    f"Si la imagen no contiene texto legible o la calidad no permite leerlo "
    f"con confianza, responde UNICAMENTE con: {_NO_TEXT_MARKER}"
)


@image_bp.route("/translate-image", methods=["POST"])
def translate_image():
    file_storage = request.files.get("image")
    validator = image_validator()
    extension = validator.validate(file_storage)

    image_bytes = file_storage.read()
    mime_type = _EXTENSION_TO_MIME[extension]

    client = OpenAIClient()
    raw_response = client.chat_completion_with_image(_PROMPT_TEMPLATE, image_bytes, mime_type)

    if _NO_TEXT_MARKER in raw_response:
        raise NoReadableTextInImageError(
            "La imagen no contiene texto legible o la calidad no permite "
            "obtener un resultado confiable."
        )

    parsed = _parse_structured_response(raw_response)

    return jsonify({
        "ok": True,
        "data": {
            "source_lang": parsed["source_lang"],
            "target_lang": "en" if parsed["source_lang"] == "es" else "es",
            "original_text": parsed["original_text"],
            "translated_text": parsed["translated_text"],
        },
    })


def _parse_structured_response(raw_text: str) -> dict:
    """Convierte la respuesta con formato fijo del prompt en un dict.

    Se usa un formato de texto simple (en vez de pedir JSON) porque los
    modelos de vision son mas confiables devolviendo texto plano
    estructurado que JSON estricto cuando el contenido incluye caracteres
    especiales o saltos de linea dentro del texto extraido.
    """
    lines = raw_text.strip().splitlines()
    result = {"source_lang": "es", "original_text": "", "translated_text": ""}
    current_key = None
    buffer: dict[str, list[str]] = {"original_text": [], "translated_text": []}

    for line in lines:
        if line.upper().startswith("IDIOMA_ORIGEN:"):
            value = line.split(":", 1)[1].strip().lower()
            result["source_lang"] = "en" if value.startswith("en") else "es"
            current_key = None
        elif line.upper().startswith("TEXTO_ORIGINAL:"):
            buffer["original_text"].append(line.split(":", 1)[1].strip())
            current_key = "original_text"
        elif line.upper().startswith("TRADUCCION:"):
            buffer["translated_text"].append(line.split(":", 1)[1].strip())
            current_key = "translated_text"
        elif current_key:
            buffer[current_key].append(line)

    result["original_text"] = "\n".join(buffer["original_text"]).strip()
    result["translated_text"] = "\n".join(buffer["translated_text"]).strip()
    return result
