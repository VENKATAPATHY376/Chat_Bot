export const formatDate = (date: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
};

export const calculatePercentage = (part: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
};

export const sortByDate = (items: Array<{ date: string }>): Array<{ date: string }> => {
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};