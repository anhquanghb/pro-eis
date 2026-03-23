export const sortOutlineCode = (aCode: string | undefined, bCode: string | undefined) => {
    const aStr = aCode || '';
    const bStr = bCode || '';
    const aParts = aStr.split('.').map(p => parseInt(p, 10) || 0);
    const bParts = bStr.split('.').map(p => parseInt(p, 10) || 0);
    const len = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < len; i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
    }
    return aStr.localeCompare(bStr);
};
