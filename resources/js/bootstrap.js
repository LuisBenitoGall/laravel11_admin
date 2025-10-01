import axios from 'axios';
window.axios = axios;

// 1️⃣ Envío de cookies en todas las peticiones (incluida XSRF-TOKEN)
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// Peticiones AJAX identificadas correctamente
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 2️⃣ Inyección manual del token desde <meta>
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found');
}

// 3️⃣ Configuración de axios para cookie→header automáticos
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
axios.get('/sanctum/csrf-cookie').catch(() => {
  // en caso de que no uses Sanctum, puedes exponer una ruta
  // GET /csrf-cookie que haga: return response()->json([], 204)
});
