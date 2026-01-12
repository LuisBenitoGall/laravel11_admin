import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

/**
 * RemoteCarousel
 * - Puede recibir items directamente (modo controlado) o hacer fetch desde fetchUrl.
 * - Muy configurable: renderItem, mapeo de src/alt, autoplay, indicadores, controles, tamaños.
 */
export default function RemoteCarousel({
  // Data
  fetchUrl = null,
  fetchMethod = 'get',
  fetchParams = null,
  fetchHeaders = null,
  items = null, // si se pasa, NO hace fetch
  transformResponse = (res) => res?.data?.images ?? res?.data ?? [],

  // Mapping / rendering
  getKey = (item, index) => item?.id ?? item?.uuid ?? index,
  getSrc = (item) => item?.url ?? item?.src ?? item?.path ?? null,
  getAlt = (item, index) => item?.alt ?? item?.name ?? `Imagen ${index + 1}`,
  getCaption = (item) => item?.caption ?? null,
  renderItem = null, // (item, index, helpers) => ReactNode

  // UI
  className = '',
  style = null,
  rounded = true,
  shadow = false,

  height = 220, // px (si no usas aspectRatio)
  aspectRatio = null, // ej: "16/9" o "4/3". Si se pasa, manda sobre height.
  objectFit = 'contain', // 'cover' | 'contain'
  background = '#f8f9fa',

  showControls = true,
  showIndicators = true,
  allowKeyboard = true,

  // Autoplay
  autoPlay = false,
  intervalMs = 4500,
  pauseOnHover = true,

  // Empty / loading / error
  loadingText = 'Cargando imágenes…',
  emptyText = 'Sin imágenes',
  errorText = 'No se pudieron cargar las imágenes',
  emptyState = null,
  onLoaded = null, // (items) => void
  onError = null,  // (error) => void
  onItemClick = null, // (item, index) => void
}) {
  const [remoteItems, setRemoteItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [active, setActive] = useState(0);

  const hoveredRef = useRef(false);
  const timerRef = useRef(null);

  const finalItems = useMemo(() => {
    if (Array.isArray(items)) return items;
    return remoteItems;
  }, [items, remoteItems]);

  const hasItems = Array.isArray(finalItems) && finalItems.length > 0;
  const activeSafe = hasItems ? Math.min(active, finalItems.length - 1) : 0;

  // --- Fetch (solo si no hay items prop) ---
  useEffect(() => {
    if (Array.isArray(items)) return; // controlado
    if (!fetchUrl) return;

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const method = String(fetchMethod || 'get').toLowerCase();
        const res = await axios.request({
          url: fetchUrl,
          method,
          params: fetchParams ?? undefined,
          headers: fetchHeaders ?? undefined,
          signal: ac.signal,
        });

        const list = transformResponse(res) ?? [];
        const arr = Array.isArray(list) ? list : [];

        setRemoteItems(arr);
        setActive(0);
        onLoaded?.(arr);
      } catch (e) {
        // Ignora abort
        if (axios.isCancel?.(e) || e?.name === 'CanceledError') return;
        setErr(e);
        onError?.(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      ac.abort();
    };
  }, [items, fetchUrl, fetchMethod, fetchParams, fetchHeaders, transformResponse, onLoaded, onError]);

  // --- Autoplay ---
  useEffect(() => {
    if (!autoPlay) return;
    if (!hasItems) return;
    if (finalItems.length <= 1) return;

    const clear = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    clear();
    timerRef.current = setInterval(() => {
      if (pauseOnHover && hoveredRef.current) return;
      setActive((prev) => (prev + 1) % finalItems.length);
    }, Math.max(1200, Number(intervalMs) || 4500));

    return clear;
  }, [autoPlay, intervalMs, pauseOnHover, hasItems, finalItems]);

  // --- Keyboard ---
  useEffect(() => {
    if (!allowKeyboard) return;
    if (!hasItems || finalItems.length <= 1) return;

    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowKeyboard, hasItems, finalItems.length]);

  const prev = () => {
    if (!hasItems) return;
    setActive((p) => (p - 1 + finalItems.length) % finalItems.length);
  };

  const next = () => {
    if (!hasItems) return;
    setActive((p) => (p + 1) % finalItems.length);
  };

  const containerStyle = useMemo(() => {
    const base = {
      background,
      overflow: 'hidden',
      ...(rounded ? { borderRadius: '0.75rem' } : null),
      ...(shadow ? { boxShadow: '0 .25rem .75rem rgba(0,0,0,.08)' } : null),
      ...(style ?? null),
    };

    if (aspectRatio) {
      // CSS aspect-ratio acepta "16/9"
      base.aspectRatio = String(aspectRatio);
      base.width = '100%';
    } else {
      base.height = Number(height) || 220;
      base.width = '100%';
    }

    return base;
  }, [background, rounded, shadow, style, aspectRatio, height]);

  const helpers = useMemo(() => ({
    next,
    prev,
    setActive,
    active: activeSafe,
    count: finalItems?.length ?? 0,
  }), [activeSafe, finalItems]);

  // --- States ---
  if (loading) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${className}`} style={containerStyle}>
        <div className="text-muted small">{loadingText}</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className={`d-flex flex-column align-items-center justify-content-center ${className}`} style={containerStyle}>
        <div className="text-danger small">{errorText}</div>
        <div className="text-muted small mt-1">{String(err?.message ?? '')}</div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${className}`} style={containerStyle}>
        {emptyState ?? <div className="text-muted small">{emptyText}</div>}
      </div>
    );
  }

  const item = finalItems[activeSafe];
  const src = getSrc(item);
  const alt = getAlt(item, activeSafe);
  const caption = getCaption(item);

  return (
    <div
      className={`position-relative ${className}`}
      style={containerStyle}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
    >
      {/* Slide */}
      <div className="w-100 h-100 d-flex align-items-center justify-content-center">
        {renderItem ? (
          renderItem(item, activeSafe, helpers)
        ) : (
          <button
            type="button"
            className="btn p-0 border-0 w-100 h-100"
            style={{ background: 'transparent' }}
            onClick={() => onItemClick?.(item, activeSafe)}
            title={alt}
          >
            {src ? (
              <img
                src={src}
                alt={alt}
                className="w-100 h-100"
                style={{ objectFit, display: 'block' }}
                loading="lazy"
              />
            ) : (
              <div className="text-muted small">Imagen sin URL</div>
            )}
          </button>
        )}
      </div>

      {/* Caption */}
      {caption ? (
        <div className="position-absolute bottom-0 start-0 end-0 px-2 py-1" style={{ background: 'rgba(0,0,0,.35)' }}>
          <div className="text-white small text-truncate">{caption}</div>
        </div>
      ) : null}

      {/* Controls */}
      {showControls && finalItems.length > 1 ? (
        <>
          <button
            type="button"
            className="btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y ms-2"
            onClick={prev}
            aria-label="Anterior"
            title="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
            onClick={next}
            aria-label="Siguiente"
            title="Siguiente"
          >
            ›
          </button>
        </>
      ) : null}

      {/* Indicators */}
      {showIndicators && finalItems.length > 1 ? (
        <div className="position-absolute bottom-0 start-50 translate-middle-x pb-2 d-flex gap-1">
          {finalItems.map((it, idx) => {
            const key = getKey(it, idx);
            const isActive = idx === activeSafe;
            return (
              <button
                key={key}
                type="button"
                className={`btn p-0 border-0`}
                onClick={() => setActive(idx)}
                aria-label={`Ir a ${idx + 1}`}
                title={`Ir a ${idx + 1}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  opacity: isActive ? 0.95 : 0.35,
                  background: isActive ? '#fff' : '#fff',
                }}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
