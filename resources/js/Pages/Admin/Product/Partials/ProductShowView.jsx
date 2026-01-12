import React from 'react';

//Components:
import ProductImagesCarousel from '@/Components/carousels/ProductImagesCarousel';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function ProductShowView({ record }) {
    const __ = useTranslation();
    const product = record;
    const today = new Date();
    const ref = product.ref ?? product.manual_ref ?? '';

    

   

    return (
        <div className="contact-show-view">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 className="mb-1">
                        {product.name}{ref ? ` ${ref}` : ''}
                    </h4>
                </div>

                <div className="btn-group">
                    <a
                        href={route('products.edit', { product: product.id })}
                        className="btn btn-sm btn-primary"
                    >
                        <i className="la la-edit me-1" />
                        { __('editar') }
                    </a>
                    {/* Otros CTAs que quieras */}
                </div>
            </div>
            <hr />

            <div className="vertical-scroll">
                {/* Info general */}
                <div className="row mb-4">
                    <div className="col-md-9">
                        <h5 className="mb-3">{ __('datos_basicos') }</h5>
                        {ref && (
                            <p className="mb-1">
                                <strong>Ref:</strong> {ref}
                            </p>
                        )}
                        <p className="mb-1">
                            <strong>{ __('fecha_creacion') }:</strong> {product.formatted_created_at ?? ''}
                        </p>

                        <p className="mb-1">
                            <strong>{ __('creado_por') }:</strong> {product.created_by_name ?? ''}
                        </p>
                    </div>
                </div>
                <hr/>

                {/* Imágenes */}
                <div className="row mb-4">
                    <div className="col-12">
                        <h5 className="mb-3">{ __('imagenes') }</h5>

                        <ProductImagesCarousel
                            fetchUrl={route('product-docs.show', product.id)}
                            height={200}
                            objectFit="cover"
                            showIndicators
                            showControls
                            autoPlay={false}
                        />
                    </div>
                </div>
                <hr/>

            </div>
        </div>
    );
}
