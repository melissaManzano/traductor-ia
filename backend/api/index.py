"""
Punto de entrada del backend, publicado en Vercel como funcion serverless
de Python.

En esta version inicial solo se expone un endpoint de salud (/api/ping)
para validar que el despliegue en Vercel funciona antes de conectar
cualquier logica de traduccion. Los blueprints de cada modulo se
registraran en commits posteriores.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, request

from core.exceptions import AppError, UnauthorizedOriginError

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
