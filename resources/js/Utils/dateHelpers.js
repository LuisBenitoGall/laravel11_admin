/**
 * Convierte un Date a string 'YYYY-MM-DD' en horario local.
 */
export function toLocalYmd(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return null;
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

/**
 * Convierte un valor 'YYYY-MM-DD' (o Date) a Date local.
 * No usa new Date('YYYY-MM-DD') para evitar UTC y desajustes de día.
 */
export function parseLocalYmd(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    // Esperamos 'YYYY-MM-DD'
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const [, y, m, d] = match;

    const date = new Date(
        Number(y),
        Number(m) - 1,
        Number(d)
    );

    return isNaN(date.getTime()) ? null : date;
}
