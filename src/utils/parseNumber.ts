/** Parses a number string that may use various thousands/decimal separators. */
export function parseNumber(str: string): number | null {
    const s = str.replace(/\s/g, '');

    const commas = (s.match(/,/g) ?? []).length;
    const dots = (s.match(/\./g) ?? []).length;

    let normalized: string;

    if (commas >= 1 && dots >= 1) {
        const lastComma = s.lastIndexOf(',');
        const lastDot = s.lastIndexOf('.');
        if (lastDot > lastComma) {
            normalized = s.replace(/,/g, '');
        } else {
            normalized = s.replace(/\./g, '').replace(',', '.');
        }
    } else if (commas === 1 && dots === 0) {
        const [, dec] = s.split(',');
        normalized = dec.length === 3 ? s.replace(',', '') : s.replace(',', '.');
    } else if (dots === 1 && commas === 0) {
        const [, dec] = s.split('.');
        normalized = dec.length === 3 ? s.replace('.', '') : s;
    } else if (commas > 1) {
        normalized = s.replace(/,/g, '');
    } else if (dots > 1) {
        normalized = s.replace(/\./g, '');
    } else {
        normalized = s;
    }

    const n = parseFloat(normalized);
    return isNaN(n) ? null : n;
}