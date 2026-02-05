"use client";

import { useEffect, useState } from "react";
import { Activity, Box, Database, Globe, Hash, Search, Zap } from "lucide-react";
import axios from "axios";

const SEED_NODE = "http://ec2-13-220-187-107.compute-1.amazonaws.com:5000";

interface Block {
    index: number;
    timestamp: number;
    transactions: any[];
    previous_hash: string;
    hash: string;
    validator: string;
    difficulty: number;
}

export default function Home() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [stats, setStats] = useState({
        height: 0,
        supply: 0,
        difficulty: 0,
        status: "Syncing...",
    });

    const fetchData = async () => {
        try {
            const resp = await axios.get(`${SEED_NODE}/chain`);
            const chain = resp.data;
            const latest = chain[chain.length - 1];

            setBlocks([...chain].reverse().slice(0, 15));
            setStats({
                height: chain.length,
                supply: chain.length * 132575,
                difficulty: latest.difficulty || 4,
                status: "Live",
            });
        } catch (e) {
            console.error("Failed to fetch from Node", e);
            setStats(prev => ({ ...prev, status: "Offline (Node Unreachable)" }));
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-[#050508] text-[#f0f0f5]">
            {/* Navbar */}
            <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5 text-black" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">
                            HomeChain<span className="text-primary italic">Scan</span>
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
                        <a href="#" className="hover:text-primary transition-colors">Explorer</a>
                        <a href="#" className="hover:text-primary transition-colors">Stats</a>
                        <a href="#" className="hover:text-primary transition-colors">Nodes</a>
                        <a href="#" className="hover:text-primary transition-colors">API</a>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-primary/50 transition-all font-mono"
                            placeholder="Search address / tx / block"
                        />
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard icon={<Database className="w-5 h-5 text-primary" />} label="Block Height" value={stats.height.toLocaleString()} />
                    <StatCard icon={<Zap className="w-5 h-5 text-yellow-400" />} label="Difficulty" value={stats.difficulty.toString()} />
                    <StatCard icon={<Activity className="w-5 h-5 text-secondary" />} label="Market Cap (HOME)" value={stats.supply.toLocaleString()} sub="~ Supply Circulating" />
                    <StatCard icon={<Globe className="w-5 h-5 text-green-400" />} label="Network Status" value={stats.status} pulse={stats.status === "Live"} />
                </div>

                {/* Latest Blocks Table */}
                <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Box className="w-5 h-5 text-primary" />
                            Latest Blocks
                        </h2>
                        <button className="text-sm font-medium text-primary hover:underline">View All &rarr;</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs uppercase tracking-widest text-white/40 border-b border-white/5">
                                    <th className="px-6 py-4">Block</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Validator</th>
                                    <th className="px-6 py-4">Transactions</th>
                                    <th className="px-6 py-4 text-right">Reward</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {blocks.map((b) => (
                                    <tr key={b.index} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-primary font-mono font-bold">#{b.index}</span>
                                                <span className="text-[10px] text-white/30 uppercase">{new Date(b.timestamp * 1000).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase">
                                                Confirmed
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-white/50 hover:text-primary transition-colors cursor-pointer">
                                                {b.validator.substring(0, 16)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono text-white/70">{b.transactions.length}</span>
                                                <span className="text-[10px] text-white/20 uppercase">TXs</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-green-400 font-bold font-mono">132,575</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ icon, label, value, sub, pulse }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">{label}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    {pulse && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    {value}
                </span>
            </div>
            {sub && <span className="text-[10px] uppercase text-white/20 mt-1 block tracking-wider">{sub}</span>}
        </div>
    );
}
