# Puente ES/EN — Traductor con Inteligencia Artificial

Aplicación web que traduce contenido entre español e inglés mediante texto,
conversación tipo chat, audio, documentos e imágenes, usando la API de
OpenAI como motor real de traducción.

## Problema que resuelve

Reunir en una sola plataforma las formas más comunes en las que una persona
necesita traducir contenido en su vida diaria (un mensaje de texto, una
conversación con alguien que habla otro idioma, una nota de voz, un
documento o una fotografía con texto), evitando depender de herramientas
distintas para cada caso.

## Funcionalidades implementadas

- Traducción bidireccional de texto (ES ↔ EN) con detección automática de
  idioma de origen.
- Conversación tipo chat entre dos participantes que escriben en idiomas
  distintos, mostrando siempre el mensaje original y su traducción.
- Traducción de audio: grabación de voz en vivo desde el navegador (o carga de un
  archivo), transcripción, traducción del texto y generación de un audio hablado con
  la traducción.
- Traducción de documentos PDF, Word (.docx) y texto plano (.txt).
- Traducción de texto contenido en imágenes (fotografías, capturas,
  señalizaciones, menús, etiquetas).
- Indicadores de carga/procesamiento y mensajes de error comprensibles en
  los 5 módulos.

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (clases ES6), Bootstrap 5 |
| Backend | Python 3, Flask |
| IA | API de OpenAI (chat, Whisper, visión, texto a voz) |
| Control de versiones | Git y GitHub |
| Publicación frontend | GitHub Pages |
| Publicación backend | Vercel (Serverless Functions) |

## Arquitectura general

```
Frontend (GitHub Pages)  --HTTPS-->  Backend Flask (Vercel)  -->  API de OpenAI
     |                                      |
  clases JS                            clases Python
  (Translator, ChatModule,             (OpenAIClient, TranslatorService,
   AudioModule, DocumentModule,         LanguageDetector, DocumentParser,
   ImageModule + vistas UI)             FileValidator)
```

El frontend nunca conoce la API Key de OpenAI: solo llama a los endpoints
del backend, y este es el único componente que se comunica con OpenAI.

## Uso de la API de OpenAI

- **Chat Completions (`gpt-4o-mini`)**: traducción de texto, detección de
  idioma y análisis de imágenes (el mismo modelo soporta entradas de
  imagen). Se eligió por su buen balance entre calidad y costo para un
  proyecto académico.
- **Whisper (`whisper-1`)**: transcripción de audio hablado a texto.
- **Text-to-Speech (`tts-1`)**: generación de la traducción en forma
  hablada a partir del texto ya traducido.

## Aplicación de Programación Orientada a Objetos

**Backend:** `OpenAIClient` (único punto que usa la API Key) →
`TranslatorService` (construye el prompt y traduce) → `LanguageDetector`
(detecta ES/EN) → `DocumentParser` (clase abstracta con `PDFParser`,
`WordParser`, `TextParser` como subclases) → `FileValidator` (valida
extensión y tamaño) → excepciones propias (`AppError` y subclases) para un
manejo de errores uniforme.

**Frontend:** `ApiClient` (único punto que hace `fetch` al backend) →
módulos de dominio (`Translator`, `ChatModule`, `AudioModule`,
`DocumentModule`, `ImageModule`) → vistas (`ChatView`, `AudioView`,
`DocumentView`, `ImageView`) que conectan el DOM con esos módulos →
`UIStateManager` reutilizado por todas las vistas para mostrar
carga/éxito/error.

## Consideraciones de seguridad y privacidad

- La API Key de OpenAI se configura como variable de entorno en Vercel;
  nunca aparece en el código, el HTML ni el repositorio.
- El backend restringe las peticiones (CORS) al dominio exacto del
  frontend publicado en GitHub Pages mediante la variable `ALLOWED_ORIGIN`.
- Todo archivo se valida en el backend (extensión, tamaño y contenido),
  sin confiar únicamente en la validación del navegador.
- La interfaz advierte al usuario que el contenido subido se envía a un
  servicio externo de IA y que debe evitar información sensible.
- La protección de la API Key **no es igual** a la protección completa del
  servicio: este proyecto añade validación de origen y de archivos, pero
  no incluye autenticación de usuarios ni límite de peticiones por IP, lo
  cual queda documentado como limitación conocida.

## Formatos de archivo soportados

| Módulo | Formatos | Tamaño máximo |
|---|---|---|
| Audio | MP3, WAV, M4A, WEBM, OGG | 15 MB |
| Documentos | PDF, DOCX, TXT | 10 MB |
| Imágenes | PNG, JPG/JPEG, WEBP | 8 MB |

## Limitaciones conocidas

- Los documentos muy extensos se traducen solo hasta un límite de
  caracteres por petición (se indica en la interfaz cuando esto ocurre).
- La traducción de documentos no reconstruye la maquetación original
  (tablas, imágenes o estilos); se enfoca en el contenido textual.
- El chat no persiste el historial entre sesiones (vive solo en memoria
  del navegador durante la sesión activa).
- La protección de origen (CORS) no sustituye un sistema de autenticación
  completo.

## Autor

Manzano Luna Claudia Melissa — 23200168
Instituto Tecnológico Nacional de México, Campus Pachuca
Inteligencia Artificial aplicada a las TIC — Ing. Víctor Manuel Pinedo Fernández

## URL pública de la aplicación

- Frontend (GitHub Pages): `https://melissamanzano.github.io/traductor-ia/`
- Backend (Vercel): `https://backend-puce-two-15.vercel.app`

---

## Cómo ejecutar el proyecto en local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...   # En Windows (PowerShell): $env:OPENAI_API_KEY="sk-..."
python api/index.py
# Backend disponible en http://localhost:5000
```

### Frontend

Edita `docs/assets/js/config.js` y apunta `BACKEND_BASE_URL` a
`http://localhost:5000`, luego abre `docs/index.html` con una extensión
de servidor local (por ejemplo Live Server de VS Code) para evitar
problemas de CORS con `file://`.

### Despliegue

1. Sube el repositorio a GitHub.
2. En GitHub: **Settings → Pages** → publica la carpeta `docs/` (rama `main`).
3. En Vercel: importa el repositorio con **Root Directory = `backend`** y
   configura la variable de entorno `OPENAI_API_KEY` (y `ALLOWED_ORIGIN`
   con la URL de GitHub Pages).
4. Actualiza `docs/assets/js/config.js` con la URL final de Vercel.