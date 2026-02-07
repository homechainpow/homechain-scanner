"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Box, ArrowRightLeft, Users, FileText, Search } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const navItems = [
        { name: "Dashboard", href: "/", icon: Home },
        { name: "Blocks", href: "/blocks", icon: Box },
        { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
        { name: "Holders", href: "/holders", icon: Users },
        { name: "Stats", href: "/stats", icon: FileText },
    ];

    const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();

        const query = searchQuery.trim();
        if (!query) return;

        // 1. Check if it's a numeric Block ID (e.g., "42" or "#42")
        const blockMatch = query.match(/^#?(\d+)$/);
        if (blockMatch) {
            router.push(`/block/${blockMatch[1]}`);
            setSearchQuery("");
            return;
        }

        // 2. Check if it's a numeric Transaction ID (e.g., "tx10" or "10")
        // Note: Our current scanner uses numeric IDs for transactions too. 
        // If they enter a long hex, it's likely an address.
        if (query.length > 20) {
            router.push(`/address/${query}`);
        } else {
            // Assume transaction if it's a small number that didn't match the block prefix logic 
            // Or if we just want to try TX page.
            router.push(`/tx/${query.replace('#', '')}`);
        }

        setSearchQuery("");
    };

    return (
        <nav className="bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 group hover:border-primary/60 transition-colors">
                            <Box className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">
                                HomeChain<span className="text-primary italic font-black">Scan</span>
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mainnet Live</p>
                            </div>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-primary text-slate-950 shadow-lg shadow-primary/20 font-bold"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative hidden lg:block group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Address / Txn / Block..."
                            className="w-80 bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </form>
                </div>
            </div>
        </nav>
    );
}
