/**
 * Configuracion global del frontend.
 *
 * IMPORTANTE: aqui NUNCA debe aparecer una API Key. Este archivo solo
 * contiene la URL publica del backend desplegado en Vercel; la credencial
 * de OpenAI vive unicamente en el backend (variable de entorno).
 */
window.APP_CONFIG = {
  // Reemplaza esta URL por la de tu backend ya desplegado en Vercel.
  // Ejemplo: "https://traductor-ia-backend.vercel.app"
  BACKEND_BASE_URL: "https://TU-BACKEND.vercel.app",

  MAX_AUDIO_SIZE_MB: 15,
  MAX_DOCUMENT_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 8,
};
