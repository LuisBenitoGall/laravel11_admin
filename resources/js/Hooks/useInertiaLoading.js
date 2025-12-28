// resources/js/Hooks/useInertiaLoading.js
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

/**
 * Hook para controlar un estado "loading" basado en eventos del router de Inertia.
 *
 * Devuelve:
 *  - loading: boolean
 *
 * Opciones:
 *  - initial: valor inicial del loading (default false)
 */
export function useInertiaLoading({ initial = false } = {}) {
  const [loading, setLoading] = useState(!!initial);

  useEffect(() => {
    // Inertia router: router.on() devuelve un "unsubscribe"
    const removeStart = router.on('start', () => setLoading(true));
    const removeFinish = router.on('finish', () => setLoading(false));

    return () => {
      // Limpieza segura
      if (typeof removeStart === 'function') removeStart();
      if (typeof removeFinish === 'function') removeFinish();
    };
  }, []);

  return { loading };
}
