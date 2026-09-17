"""
Validacion de archivos entrantes (req. 6.1 - 6.3).

Se valida SIEMPRE en el backend, sin confiar en las validaciones que ya
haya hecho el frontend, porque cualquiera podria llamar al backend
directamente sin pasar por la interfaz.
"""

from .exceptions import NoFileProvidedError, UnsupportedFileTypeError, FileTooLargeError

# Limites y formatos admitidos. Se documentan tal cual en el README.
MAX_AUDIO_SIZE_MB = 15
MAX_DOCUMENT_SIZE_MB = 10
MAX_IMAGE_SIZE_MB = 8

ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "m4a", "webm", "ogg"}
ALLOWED_DOCUMENT_EXTENSIONS = {"pdf", "docx", "txt"}
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


class FileValidator:
    """Valida un archivo recibido en una peticion (objeto tipo werkzeug FileStorage)."""

    def __init__(self, allowed_extensions: set[str], max_size_mb: int):
        self._allowed_extensions = allowed_extensions
        self._max_size_bytes = max_size_mb * 1024 * 1024
        self._max_size_mb = max_size_mb

    def validate(self, file_storage) -> str:
        """Valida el archivo y devuelve su extension en minusculas."""
        if file_storage is None or file_storage.filename == "":
            raise NoFileProvidedError("No se selecciono ningun archivo.")

        extension = self._extract_extension(file_storage.filename)
        if extension not in self._allowed_extensions:
            allowed = ", ".join(sorted(self._allowed_extensions))
            raise UnsupportedFileTypeError(
                f"Formato .{extension} no permitido. Formatos admitidos: {allowed}."
            )

        size_bytes = self._get_size(file_storage)
        if size_bytes > self._max_size_bytes:
            raise FileTooLargeError(
                f"El archivo excede el tamano maximo permitido ({self._max_size_mb} MB)."
            )

        return extension

    @staticmethod
    def _extract_extension(filename: str) -> str:
        return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    @staticmethod
    def _get_size(file_storage) -> int:
        stream = file_storage.stream
        stream.seek(0, 2)  # ir al final
        size = stream.tell()
        stream.seek(0)  # regresar al inicio para que se pueda leer despues
        return size


def audio_validator() -> FileValidator:
    return FileValidator(ALLOWED_AUDIO_EXTENSIONS, MAX_AUDIO_SIZE_MB)


def document_validator() -> FileValidator:
    return FileValidator(ALLOWED_DOCUMENT_EXTENSIONS, MAX_DOCUMENT_SIZE_MB)


def image_validator() -> FileValidator:
    return FileValidator(ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE_MB)
