"""Endpoint de traduccion de documentos: PDF, Word y TXT (req. 1.4)."""

from flask import Blueprint, request, jsonify

from core.openai_client import OpenAIClient
from core.translator_service import TranslatorService
from core.validators import document_validator
from core.document_parser import get_parser_for_extension

document_bp = Blueprint("document_routes", __name__)

# Limite de caracteres enviados a la IA en una sola llamada. Documentos muy
# extensos se recortan para mantener el ejercicio dentro de un alcance
# razonable (se documenta como limitacion conocida en el README).
MAX_CHARACTERS_PER_REQUEST = 12000


@document_bp.route("/translate-document", methods=["POST"])
def translate_document():
    file_storage = request.files.get("document")
    target_lang = request.form.get("target_lang")  # opcional

    validator = document_validator()
    extension = validator.validate(file_storage)

    file_bytes = file_storage.read()
    parser = get_parser_for_extension(extension)
    extracted_text = parser.extract_and_validate(file_bytes)

    truncated = len(extracted_text) > MAX_CHARACTERS_PER_REQUEST
    text_to_translate = extracted_text[:MAX_CHARACTERS_PER_REQUEST]

    client = OpenAIClient()
    service = TranslatorService(client)
    result = service.translate(text_to_translate, target_lang=target_lang)

    return jsonify({
        "ok": True,
        "data": {
            **result,
            "file_name": file_storage.filename,
            "truncated": truncated,
        },
    })
