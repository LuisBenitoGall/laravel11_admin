import React from 'react';
import { Link } from '@inertiajs/react';
import { parseISO, format as formatDate } from 'date-fns';
import PhonesCell from '@/Components/PhonesCell';

export default function renderCellContent(value, column, rowData = {}) {
	if (column.render && typeof column.render === 'function') {
		return column.render({ value, rowData });
	}

	// Imágenes: soportar varios shapes comunes (logo_url, avatar_url, avatar object, value as string path)
	if (column.type === 'image') {
		const possible = [
			rowData.logo_url,
			rowData.logo,
			rowData.avatar_url,
			rowData.avatar?.url,
			rowData.image,
			value,
		];

		const logoUrl = possible.find(v => typeof v === 'string' && v.length) || null;

		if (logoUrl) {
			return (
				<img
					src={logoUrl}
					alt={column.name || ''}
					style={{
						width: '30px',
						height: '30px',
						objectFit: 'cover',
						borderRadius: '50%'
					}}
				/>
			);
		}
		if (column.icon) {
			return <i className={`la la-${column.icon} text-muted`} style={{ fontSize: '24px' }}></i>;
		}
		return '';
	}

	// Categorías
	if (column.key === 'categories' && Array.isArray(value)) {
		return (
			<div className="d-flex flex-wrap gap-1">
				{value.map((cat, i) => (
					<span key={i} className="badge bg-primary text-light">
						{cat}
					</span>
				))}
			</div>
		);
	}

	// Empresas/Companies: array de objetos { id, name, link }
	if (column.key === 'companies' && Array.isArray(value)) {
		if (!value.length) {
			return '—';
		}

		return (
			<>
				{value.map((company, index) => (
					<React.Fragment key={company.id || index}>
						{index > 0 && ', '}
						<Link href={company.link} className="link-text">
							{company.name}
						</Link>
					</React.Fragment>
				))}
			</>
		);
	}

	// Teléfonos: delegado a PhonesCell (primer teléfono + badge con popover del resto)
	if (column.key === 'phones') {
		return <PhonesCell phones={value} />;
	}

	// Enlaces
	if (column.type === 'link') {
		if (value) {
			let href = '#';

			try {
				if (typeof column.link === 'function') {
					// El dev construye la URL manualmente
					href = column.link(rowData) || '#';
				} else if (typeof column.link === 'string') {
					// Asumimos que es un nombre de ruta tipo 'categories.edit'
					// 1) Prioridad: buildParams(row) si existe
					let params = {};
					if (typeof column.buildParams === 'function') {
						params = column.buildParams(rowData) || {};
					} else if (rowData && rowData.__routeParams && !Array.isArray(rowData.__routeParams)) {
						// 2) Soporte de params nombrados inyectados desde la fila
						params = rowData.__routeParams;
					} else if (column.routeParams && !Array.isArray(column.routeParams)) {
						// 3) Alternativa: column.routeParams estático (objeto)
						params = column.routeParams;
					}

					// 4) Intento principal: parámetros nombrados
					try {
						href = route(column.link, params);
					} catch (errNamed) {
						// 5) Fallback ultra-legacy: posicional con id
						// Solo si rowData.id existe; si no, dejamos '#'
						if (rowData?.id != null) {
							try {
								href = route(column.link, rowData.id);
							} catch (errPositional) {
								// nos quedamos en '#'
								console.warn('[renderCellContent] Ruta inválida:', column.link, { params, id: rowData?.id }, errPositional);
							}
						} else {
							console.warn('[renderCellContent] Parámetros insuficientes para ruta:', column.link, params, errNamed);
						}
					}
				} else {
					// Valor literal de href
					href = String(value);
				}
			} catch (fatal) {
				// Nunca tumbar la UI por Ziggy
				console.warn('[renderCellContent] Error generando href:', fatal);
				href = '#';
			}

			return <Link href={href} className="link-text">{value}</Link>;
		}
		return '';
	}

	// Date formatting
	const looksLikeDateKey = typeof column.key === 'string' && /date|created_at|updated_at|birth/i.test(column.key);
	if (column.filter === 'date' || looksLikeDateKey) {
		if (typeof value === 'string' && value.length) {
			try {
				const dt = parseISO(value);
				return formatDate(dt, 'dd/MM/yyyy');
			} catch (e) {
				try {
					const dt2 = new Date(value);
					if (!isNaN(dt2)) return formatDate(dt2, 'dd/MM/yyyy');
				} catch (e2) {}
			}
		}
	}

	// Booleano-like helper
	const isBooleanLike = (val) => {
		if (typeof val === 'number') return val === 0 || val === 1;
		if (typeof val === 'string') {
			const v = val.trim().toLowerCase();
			return ['0','1','true','false','yes','no','si','sí'].includes(v);
		}
		return false;
	};

	// Si es booleano real, iconos
	if (typeof value === 'boolean') {
		return value
			? <i className="la la-check text-success"></i>
			: <i className="la la-ban text-danger"></i>;
	}

	// Si column.booleanLike está activo, iconos para boolean-like
	if (column.booleanLike && isBooleanLike(value)) {
		let v = value;
		if (typeof v === 'string') v = v.trim().toLowerCase();
		if (v === 1 || v === '1' || v === 'true' || v === 'yes' || v === 'si' || v === 'sí') {
			return <i className="la la-check text-success"></i>;
		}
		if (v === 0 || v === '0' || v === 'false' || v === 'no') {
			return <i className="la la-ban text-danger"></i>;
		}
	}

	// Añadir símbolo de moneda si column.currency está definido
	if (column.currency && column.currency.symbol) {
		return (
			<span>
				{value} <span className="text-muted">{column.currency.symbol}</span>
			</span>
		);
	}

	// HTML
	if (column.type === 'html' && typeof value === 'string') {
		return <div dangerouslySetInnerHTML={{ __html: value }} />;
	}

	// Arrays genéricos (cuando no haya caso específico como phones/categories)
	if (Array.isArray(value)) {
		const items = value.map(v => {
			if (v && typeof v === 'object') {
				return v.phone ?? v.number ?? v.value ?? JSON.stringify(v);
			}
			return v;
		}).filter(Boolean);
		return items.join(', ');
	}

	if (value === null || value === undefined || value === '') {
		return '';
	}

	// Si es un objeto, intentar convertirlo a una representación legible
	if (typeof value === 'object') {
		// Usuario / persona: name + surname
		if ('name' in value || 'surname' in value) {
			return [value.name, value.surname].filter(Boolean).join(' ');
		}

		// Objetos con label / title / email
		if ('label' in value) return value.label;
		if ('title' in value) return value.title;
		if ('email' in value) return value.email;

		// Fallback: stringify (evitar devolver el objeto directamente)
		try {
			return JSON.stringify(value);
		} catch (e) {
			return String(value);
		}
	}

	return value;
}
