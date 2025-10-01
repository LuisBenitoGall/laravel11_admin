import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import Tabs from '@/Components/Tabs';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

//Tabs (deberás crear estos partials):
import ProductData from './Partials/ProductData';
import ProductImages from './Partials/ProductImages';
import ProductSales from './Partials/ProductSales';
import ProductPurchases from './Partials/ProductPurchases';
import ProductUnits from './Partials/ProductUnits';
import ProductCategories from './Partials/ProductCategories';
import ProductAttributes from './Partials/ProductAttributes';
import ProductPriceHistory from './Partials/ProductPriceHistory';
import ProductSerialization from './Partials/ProductSerialization';

export default function Edit({ auth, session, title, subtitle, availableLocales, product, production_status, patterns }) {
	const __ = useTranslation();
	const props = usePage()?.props || {};
	const locale = props.locale || false;
	const languages = props.languages || [];
	const permissions = props.permissions || {};

	//Acciones:
	const actions = [];
	if (permissions?.['products.index']) {
		actions.push({
			text: __('productos_volver'),
			icon: 'la-angle-left',
			url: 'products.index',
			modal: false
		});
	}
	if (permissions?.['products.create']) {
		actions.push({
			text: __('producto_nuevo'),
			icon: 'la-plus',
			url: 'products.create',
			modal: false
		});
	}
	if (permissions?.['products.destroy']) {
		actions.push({
			text: __('eliminar'),
			icon: 'la-trash',
			method: 'delete',
			url: 'products.destroy',
			params: [product.id],
			title: __('producto_eliminar'),
			message: __('producto_eliminar_confirm'),
			modal: false
		});
	}

	//Tabs para producto
	const tabs = [
		{ key: 'product-data', label: __('producto') },
		{ key: 'product-images', label: __('imagenes') },
		{ key: 'product-sales', label: __('ventas') },
		{ key: 'product-purchases', label: __('compras') },
		{ key: 'product-units', label: __('unidades_venta_medicion') },
		{ key: 'product-categories', label: __('categorias') },
		{ key: 'product-attributes', label: __('atributos') },
		{ key: 'product-price-history', label: __('precios_historico') },
		{ key: 'product-serialization', label: __('serializacion') },
	];

	return (
		<AdminAuthenticatedLayout
			user={auth.user}
			title={title}
			subtitle={subtitle}
			actions={actions}
		>
			<Head title={title} />

			{/* Contenido */}
			<div className="contents pb-4">
				<div className="row">
					<div className="col-12">
						<h2>
							{__('producto')} <u>{ product.name }</u>
						</h2>
					</div>

					{/* Info */}
					<div className="col-12 mt-2 mb-4">
						<span className="text-muted me-5">
							{__('creado')}: <strong>{product.formatted_created_at}</strong> 
						</span>

                        {product.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{product.created_by_name}</strong>
                            </span>
                        )}

						<span className="text-muted me-5">
							{__('actualizado')}: <strong>{product.formatted_updated_at}</strong>
						</span>

                        {product.updated_by_name && (
                            <span className="text-muted me-5">
                                {__('actualizado_por')}: <strong>{product.updated_by_name}</strong>
                            </span>
                        )}
					</div>
				</div>

				{/* Tabs */}
				<Tabs
					defaultActive="product-data"
					items={tabs}
				>
					{/* Panels */}
					{(activeKey) => {
						switch (activeKey) {
							case 'product-data':
								return <ProductData 
									product={product} 
									arr_production_status={production_status} 
									arr_patterns={patterns} 
								/>;
							case 'product-images':
								return <ProductImages product={product} />;
							case 'product-sales':
								return <ProductSales product={product} />;
							case 'product-purchases':
								return <ProductPurchases product={product} />;
							case 'product-units':
								return <ProductUnits product={product} />;
							case 'product-categories':
								return <ProductCategories product={product} />;
							case 'product-attributes':
								return <ProductAttributes product={product} />;
							case 'product-price-history':
								return <ProductPriceHistory product={product} />;
							case 'product-serialization':
								return <ProductSerialization product={product} />;
							default:
								return null;
						}
					}}
				</Tabs>              
			</div>
		</AdminAuthenticatedLayout>
	);
}
