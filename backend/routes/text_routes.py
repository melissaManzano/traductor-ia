"""Endpoint de traduccion de texto simple (req. 1.1)."""

from flask import Blueprint, request, jsonify

from core.openai_client import OpenAIClient
from core.translator_service import TranslatorService

text_bp = Blueprint("text_routes", __name__)


@text_bp.route("/translate-text", methods=["POST"])
def translate_text():
    body = request.get_json(silent=True) or {}
    text = body.get("text", "")
    source_lang = body.get("source_lang")  # opcional: "es" | "en" | None (auto)
    target_lang = body.get("target_lang")  # opcional

    client = OpenAIClient()
    service = TranslatorService(client)
    result = service.translate(text, source_lang=source_lang, target_lang=target_lang)

    return jsonify({"ok": True, "data": result})
