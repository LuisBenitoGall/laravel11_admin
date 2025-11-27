// import axios from 'axios';
// window.axios = axios;

// // 1️⃣ Envío de cookies en todas las peticiones (incluida XSRF-TOKEN)
// window.axios.defaults.withCredentials = true;
// window.axios.defaults.withXSRFToken = true;

// // Peticiones AJAX identificadas correctamente
// window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// // 2️⃣ Inyección manual del token desde <meta>
// const token = document.head.querySelector('meta[name="csrf-token"]');
// if (token) {
//     axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
// } else {
//     console.error('CSRF token not found');
// }

// // 3️⃣ Configuración de axios para cookie→header automáticos
// axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
// axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
// axios.get('/sanctum/csrf-cookie').catch(() => {
//   // en caso de que no uses Sanctum, puedes exponer una ruta
//   // GET /csrf-cookie que haga: return response()->json([], 204)
// });

import axios from 'axios';
window.axios = axios;

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Si NO usas Sanctum SPA, llama a tu endpoint 204 que ya tienes
axios.get('/csrf-cookie').catch(() => {});

// helpers/csrf-fetch.js (o al final de bootstrap.js)
function getCookie(name){
  return document.cookie
    .split('; ')
    .find(c => c.startsWith(name + '='))
    ?.split('=')[1];
}

const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  const token = decodeURIComponent(getCookie('XSRF-TOKEN') || '');
  if (token && !headers.has('X-XSRF-TOKEN')) {
    headers.set('X-XSRF-TOKEN', token);
  }
  // Asegura X-Requested-With para Laravel
  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
  }
  return originalFetch(input, { ...init, headers });
};

