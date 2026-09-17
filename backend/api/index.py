"""
Punto de entrada unico del backend, publicado en Vercel como funcion
serverless de Python.

Responsabilidades de este archivo (y solo estas):
  1. Crear la app de Flask.
  2. Registrar los Blueprints de cada modulo (texto, chat, audio, doc, img).
  3. Configurar CORS restringido al dominio del frontend (req. 5.3).
  4. Traducir cualquier AppError (o error inesperado) a JSON (req. 7.2).

La logica de negocio real vive en `core/` y `routes/`, nunca aqui.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, request

from core.exceptions import AppError, UnauthorizedOriginError
from routes.text_routes import text_bp
from routes.chat_routes import chat_bp
from routes.audio_routes import audio_bp
from routes.document_routes import document_bp
from routes.image_routes import image_bp

app = Flask(__name__)

ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.before_request
def check_origin():
    if request.method == "OPTIONS":
        return None
    if ALLOWED_ORIGIN != "*":
        origin = request.headers.get("Origin", "")
        if origin and origin != ALLOWED_ORIGIN:
            raise UnauthorizedOriginError("Origen no autorizado para consumir este servicio.")


app.register_blueprint(text_bp, url_prefix="/api")
app.register_blueprint(chat_bp, url_prefix="/api")
app.register_blueprint(audio_bp, url_prefix="/api")
app.register_blueprint(document_bp, url_prefix="/api")
app.register_blueprint(image_bp, url_prefix="/api")


@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"ok": True, "message": "Backend activo."})


@app.errorhandler(AppError)
def handle_app_error(error: AppError):
    return jsonify({
        "ok": False,
        "error_code": error.error_code,
        "message": error.message,
    }), error.status_code


@app.errorhandler(Exception)
def handle_unexpected_error(error: Exception):
    app.logger.exception("Error inesperado en el backend")
    return jsonify({
        "ok": False,
        "error_code": "INTERNAL_ERROR",
        "message": "Ocurrio un error inesperado al procesar la solicitud.",
    }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
