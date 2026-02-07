"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded transition-colors group"
            title={`Copy ${label || 'to clipboard'}`}
        >
            <span className="text-slate-400 group-hover:text-primary transition-colors">
                {text.length > 20 ? `${text.substring(0, 8)}...${text.substring(text.length - 8)}` : text}
            </span>
            {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
            ) : (
                <Copy className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors" />
            )}
        </button>
    );
}
