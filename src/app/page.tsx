"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, Database, Users, TrendingUp, Clock, Zap, Shield, BarChart3, Box, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { timeAgo, formatAmount, formatHash } from "@/lib/utils";

export default function Home() {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ height: 0, total_supply: 0, total_txs: 0 });
    const [holdersCount, setHoldersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Blocks
                const { data: blocksData } = await supabase
                    .from("blocks")
                    .select("*")
                    .order("id", { ascending: false })
                    .limit(6);

                // 2. Transactions
                const { data: txData } = await supabase
                    .from("transactions")
                    .select("*, blocks(id)")
                    .order("timestamp", { ascending: false })
                    .limit(6);

                // 3. Network Stats
                const { data: statsData } = await supabase
                    .from("stats")
                    .select("*")
                    .eq("id", 1)
                    .single();

                // 4. Holders Count
                const { count } = await supabase
                    .from("holders")
                    .select("*", { count: "exact", head: true });

                if (blocksData) setBlocks(blocksData);
                if (txData) setTransactions(txData);
                if (statsData) setStats(statsData);
                if (count !== null) setHoldersCount(count);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const marketCap = (Number(stats.total_supply) / 10 ** 8) * 0.50; // Mock $0.50 price

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            {/* Hero Section */}
            <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                        <Zap className="w-3 h-3 fill-primary" /> Multi-Validator V2
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
                        The Future of <span className="text-primary italic">HomeMining</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                        Secure, community-driven, and high-performance blockchain.
                        Tracking <span className="text-white font-bold">{stats.height.toLocaleString()}</span> blocks and
                        <span className="text-white font-bold"> {stats.total_txs.toLocaleString()}</span> transactions.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link href="/blocks" className="px-6 py-3 bg-primary text-slate-950 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">Explore Blocks</Link>
                        <Link href="/holders" className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">Top Holders</Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<BarChart3 className="w-6 h-6 text-emerald-400" />}
                    label="Market Cap"
                    value={`$${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    sub={`@ $0.50 / $HOME`}
                />
                <StatCard
                    icon={<Database className="w-6 h-6 text-blue-400" />}
                    label="Block Height"
                    value={stats.height.toLocaleString()}
                    sub="Mining Progress"
                />
                <StatCard
                    icon={<Users className="w-6 h-6 text-purple-400" />}
                    label="Active Wallets"
                    value={holdersCount.toLocaleString()}
                    sub="Unique Holders"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-yellow-400" />}
                    label="Total TXs"
                    value={stats.total_txs.toLocaleString()}
                    sub="Network Activity"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                {/* Latest Blocks */}
                <section className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl transition-all hover:border-slate-700/50">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Box className="w-6 h-6 text-primary" />
                            Recent Blocks
                        </h2>
                        <Link href="/blocks" className="text-xs font-bold text-primary hover:underline hover:opacity-80 transition-all uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">All Blocks →</Link>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                        {blocks.map((block) => (
                            <Link
                                key={block.id}
                                href={`/block/${block.id}`}
                                className="block p-5 hover:bg-slate-800/30 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-800/80 p-3 rounded-2xl group-hover:bg-primary/20 transition-colors border border-slate-700/50 group-hover:border-primary/30">
                                            <Box className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-black text-white text-lg group-hover:text-primary transition-colors">#{block.id}</p>
                                            <p className="text-xs text-slate-500 font-bold">{timeAgo(block.timestamp)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-sm text-slate-200 font-bold">{block.tx_count} Transactions</p>
                                        <p className="text-[10px] text-slate-500 font-mono italic max-w-[120px] truncate">{formatHash(block.validator)}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Latest Transactions */}
                <section className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl transition-all hover:border-slate-700/50">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <ArrowRightLeft className="w-6 h-6 text-blue-400" />
                            Recent TXs
                        </h2>
                        <Link href="/transactions" className="text-xs font-bold text-blue-400 hover:underline hover:opacity-80 transition-all uppercase tracking-widest bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20">All TXs →</Link>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                        {transactions.length > 0 ? transactions.map((tx) => (
                            <Link
                                key={tx.id}
                                href={`/tx/${tx.id}`}
                                className="block p-5 hover:bg-slate-800/30 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-800/80 p-3 rounded-2xl group-hover:bg-blue-500/20 transition-colors border border-slate-700/50 group-hover:border-blue-500/30">
                                            <ArrowRightLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <div className="max-w-[180px] md:max-w-xs">
                                            <p className="font-mono text-sm text-slate-300 font-bold truncate group-hover:text-white">{formatHash(tx.sender)}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">To: {formatHash(tx.receiver)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-emerald-400 tabular-nums">{formatAmount(tx.amount)}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">$HOME</p>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="p-16 text-center text-slate-600 italic font-medium">
                                Waiting for network activity...
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub }: any) {
    return (
        <div className="bg-slate-900/40 border border-slate-800 p-7 rounded-3xl relative overflow-hidden group hover:border-primary/40 hover:bg-slate-800/40 transition-all shadow-lg hover:shadow-primary/5">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                {icon}
            </div>
            <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</p>
                <h3 className="text-3xl font-black text-white group-hover:text-primary transition-colors">{value}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                    <p className="text-xs text-slate-400 font-bold">{sub}</p>
                </div>
            </div>
        </div>
    );
}

