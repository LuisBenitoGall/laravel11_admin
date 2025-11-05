import React from 'react';
import { Link } from '@inertiajs/react';
import { parseISO, format as formatDate } from 'date-fns';

export default function renderCellContent(value, column, rowData = {}) {
	if (column.render && typeof column.render === 'function') {
		return column.render({ value, rowData });
	}

	//Imágenes: soportar varios shapes comunes (logo_url, avatar_url, avatar object, value as string path)
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

	//Categorías:
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

	//Enlaces:
	if (column.type === 'link') {
		if (value) {
			let href = '#';

			if (typeof column.link === 'function') {
				href = column.link(rowData);
			} else if (typeof column.link === 'string') {
				// Asumimos que es una ruta tipo 'companies.edit'
				href = route(column.link, rowData.id);
			} else {
				href = value;
			}

			return <Link href={href} className="link-text">{value}</Link>;
		}
		return '';
	}

	// Date formatting: if column.filter === 'date' or column.key looks like a date, format it
	const looksLikeDateKey = typeof column.key === 'string' && /date|created_at|updated_at|birth/i.test(column.key);
	if (column.filter === 'date' || looksLikeDateKey) {
		if (typeof value === 'string' && value.length) {
			try {
				const dt = parseISO(value);
				// fallback to original value if parse fails
				return formatDate(dt, 'dd/MM/yyyy');
			} catch (e) {
				// not an ISO string, try Date constructor
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

	// Si es booleano real, siempre iconos
	if (typeof value === 'boolean') {
		return value
			? <i className="la la-check text-success"></i>
			: <i className="la la-ban text-danger"></i>;
	}

	// Si column.booleanLike está activo, mostrar iconos para boolean-like
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

	// HTML:
	if (column.type === 'html' && typeof value === 'string') {
		return <div dangerouslySetInnerHTML={{ __html: value }} />;
	}

	// Phones or arrays: render nicely
	if (Array.isArray(value)) {
		// If array of objects with 'phone' or 'number', map those
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

	return value;
}
