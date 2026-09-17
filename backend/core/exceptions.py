"""
Excepciones personalizadas del dominio.

Centralizar los errores aqui permite que TODOS los endpoints devuelvan
el mismo formato de respuesta de error hacia el frontend (ver
routes/*.py -> funcion handle_error).
"""


class AppError(Exception):
    """Excepcion base de la aplicacion. Todas las excepciones de negocio
    deben heredar de esta clase para poder ser capturadas de forma generica
    en los endpoints y traducidas a una respuesta HTTP controlada."""

    status_code = 400
    error_code = "APP_ERROR"

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class EmptyContentError(AppError):
    """Entrada vacia o mensaje sin contenido (req. 7.1.1)."""
    status_code = 400
    error_code = "EMPTY_CONTENT"


class NoFileProvidedError(AppError):
    """Archivo no seleccionado (req. 7.1.2)."""
    status_code = 400
    error_code = "NO_FILE_PROVIDED"


class UnsupportedFileTypeError(AppError):
    """Formato de archivo no permitido (req. 7.1.3)."""
    status_code = 415
    error_code = "UNSUPPORTED_FILE_TYPE"


class FileTooLargeError(AppError):
    """Archivo que excede el tamano admitido (req. 7.1.4)."""
    status_code = 413
    error_code = "FILE_TOO_LARGE"


class UnusableAudioError(AppError):
    """Audio sin contenido utilizable (req. 7.1.5)."""
    status_code = 422
    error_code = "UNUSABLE_AUDIO"


class NoReadableTextInImageError(AppError):
    """Imagen sin texto legible (req. 7.1.6)."""
    status_code = 422
    error_code = "NO_READABLE_TEXT_IN_IMAGE"


class EmptyDocumentError(AppError):
    """Documento sin contenido procesable (req. 7.1.7)."""
    status_code = 422
    error_code = "EMPTY_DOCUMENT"


class UnauthorizedOriginError(AppError):
    """Problema de autorizacion u origen (req. 7.1.9)."""
    status_code = 403
    error_code = "UNAUTHORIZED_ORIGIN"


class OpenAIServiceError(AppError):
    """Error de la API de OpenAI o respuesta inesperada (req. 7.1.10)."""
    status_code = 502
    error_code = "OPENAI_SERVICE_ERROR"
