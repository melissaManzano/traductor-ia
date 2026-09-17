"""
Endpoint de conversacion tipo Chat entre dos participantes en idiomas
distintos (req. 1.2).

El backend no guarda estado de la conversacion (no hay base de datos):
el historial vive en el frontend (clase ChatModule) y en cada peticion
solo se traduce el ULTIMO mensaje enviado. Esto simplifica el diseno y
evita depender de infraestructura adicional para un requisito que no la
exige explicitamente.
"""

from flask import Blueprint, request, jsonify

from core.openai_client import OpenAIClient
from core.translator_service import TranslatorService
from core.exceptions import EmptyContentError

chat_bp = Blueprint("chat_routes", __name__)


@chat_bp.route("/translate-chat", methods=["POST"])
def translate_chat_message():
    body = request.get_json(silent=True) or {}
    sender = body.get("sender", "").strip()
    text = body.get("text", "")
    source_lang = body.get("source_lang")  # idioma en el que escribio el emisor

    if not sender:
        raise EmptyContentError("Falta indicar quien envia el mensaje.")

    client = OpenAIClient()
    service = TranslatorService(client)
    result = service.translate(text, source_lang=source_lang)

    return jsonify({
        "ok": True,
        "data": {
            "sender": sender,
            **result,
        },
    })
