import React from 'react';
import RemoteCarousel from './RemoteCarousel';

export default function ProductImagesCarousel({
  fetchUrl,
  images = null, // si ya las tienes en props, pásalas aquí y no hará fetch
  height = 220,
  aspectRatio = null,
  objectFit = 'contain',
  className = '',
  showIndicators = true,
  showControls = true,
  autoPlay = false,
  intervalMs = 4500,
  onItemClick = null,
}) {
  return (
    <RemoteCarousel
      fetchUrl={fetchUrl}
      items={images}
      height={height}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      className={className}
      showIndicators={showIndicators}
      showControls={showControls}
      autoPlay={autoPlay}
      intervalMs={intervalMs}
      emptyText="Este producto no tiene imágenes"
      getKey={(img, i) => img?.id ?? i}
      getSrc={(img) => img?.url ?? img?.full_url ?? img?.path ?? null}
      getAlt={(img, i) => img?.alt ?? img?.name ?? `Imagen ${i + 1}`}
      getCaption={(img) => img?.caption ?? null}
      onItemClick={onItemClick}
      // por defecto asumo JSON { images: [...] }
      transformResponse={(res) => res?.data?.images ?? []}
    />
  );
}
