import './polyfills/global';
import './bootstrap';
import '../sass/app.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { createRoot, hydrateRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';

const appName = import.meta.env.VITE_APP_NAME || 'Radnify';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        if (import.meta.env.DEV) {
            createRoot(el).render(<App {...props} />);
            return
        }

        hydrateRoot(el, <App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
