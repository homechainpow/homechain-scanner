export function timeAgo(timestamp: string | number): string {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

export function formatHash(hash: string, length: number = 10): string {
    if (!hash) return 'N/A';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - 6)}`;
}

export function formatAmount(amount: number | string, decimals: number = 8): string {
    const num = Number(amount) / (10 ** decimals);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
