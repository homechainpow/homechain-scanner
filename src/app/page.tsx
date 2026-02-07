"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, Database, Users, Box, Search, ArrowRightLeft, Cpu } from "lucide-react";

export default function Home() {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ height: 0, total_supply: 0, total_txs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: blocksData } = await supabase
                    .from("blocks")
                    .select("*")
                    .order("id", { ascending: false })
                    .limit(10);

                const { data: statsData } = await supabase
                    .from("stats")
                    .select("*")
                    .eq("id", 1)
                    .single();

                if (blocksData) setBlocks(blocksData);
                if (statsData) setStats(statsData);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // 10s refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
                        <Cpu className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white">HomeChain<span className="text-primary italic">Scan</span></h1>
                        <p className="text-slate-400 text-sm">V2.0.0 Optimized Ecosystem</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by block # or hash..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={<Box className="w-5 h-5 text-blue-400" />}
                    label="Current Height"
                    value={stats.height.toLocaleString()}
                    sub="Blocks Processed"
                />
                <StatCard
                    icon={<Database className="w-5 h-5 text-emerald-400" />}
                    label="Total Supply"
                    value={`${(Number(stats.total_supply) / 10 ** 8).toLocaleString()} $HOME`}
                    sub="Circulating Coins"
                />
                <StatCard
                    icon={<Users className="w-5 h-5 text-purple-400" />}
                    label="Network Status"
                    value="Online"
                    sub="PPLNS Enabled"
                />
            </div>

            {/* Blocks Table */}
            <section className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Latest Blocks
                    </h2>
                    <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded-full">Real-time Update</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/20 text-slate-400 text-xs text-left uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Block</th>
                                <th className="px-6 py-4 font-medium">Hash</th>
                                <th className="px-6 py-4 font-medium">Validator</th>
                                <th className="px-6 py-4 font-medium">TXs</th>
                                <th className="px-6 py-4 font-medium">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            {blocks.map((block) => (
                                <tr key={block.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-primary font-mono font-bold">#{block.id}</td>
                                    <td className="px-6 py-4 text-slate-400 font-mono truncate max-w-[150px]">{block.hash}</td>
                                    <td className="px-6 py-4 text-slate-200">{block.validator}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">{block.tx_count} Transactions</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {new Date(block.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {blocks.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-600">
                        Waiting for genesis block...
                    </div>
                )}
            </section>
        </main>
    );
}

function StatCard({ icon, label, value, sub }: any) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
            <p className="text-xs text-slate-400">{sub}</p>
        </div>
    );
}
