"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, TrendingUp, Database, Activity, Zap } from "lucide-react";

export default function StatsPage() {
    const [stats, setStats] = useState<any>({ height: 0, total_supply: 0, total_txs: 0, difficulty: '' });
    const [blocks, setBlocks] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const { data: statsData } = await supabase
                .from("stats")
                .select("*")
                .eq("id", 1)
                .single();

            const { data: blocksData } = await supabase
                .from("blocks")
                .select("*")
                .order("id", { ascending: false })
                .limit(144);

            if (statsData) setStats(statsData);
            if (blocksData) setBlocks(blocksData);
        };
        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    const avgBlockTime = blocks.length > 1
        ? (new Date(blocks[0].timestamp).getTime() - new Date(blocks[blocks.length - 1].timestamp).getTime()) / (blocks.length - 1) / 1000
        : 0;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
                    <FileText className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Network Statistics</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    icon={<Database className="w-6 h-6 text-emerald-400" />}
                    label="Total Supply"
                    value={`${(Number(stats.total_supply) / 10 ** 8).toLocaleString()} $HOME`}
                    sub={`Max: 21,000,000,000 $HOME`}
                />
                <StatCard
                    icon={<Activity className="w-6 h-6 text-blue-400" />}
                    label="Block Height"
                    value={stats.height.toLocaleString()}
                    sub="Blocks Mined"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
                    label="Total Transactions"
                    value={stats.total_txs.toLocaleString()}
                    sub="All-time TXs"
                />
                <StatCard
                    icon={<Zap className="w-6 h-6 text-yellow-400" />}
                    label="Avg Block Time"
                    value={`${avgBlockTime.toFixed(1)}s`}
                    sub="Last 144 blocks"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6 text-pink-400" />}
                    label="Network Difficulty"
                    value={stats.difficulty ? `${stats.difficulty.substring(0, 10)}...` : 'N/A'}
                    sub="Current Target"
                />
                <StatCard
                    icon={<Users className="w-6 h-6 text-cyan-400" />}
                    label="PPLNS Status"
                    value="Active"
                    sub="Fair Reward Distribution"
                />
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Network Information</h2>
                <div className="space-y-4">
                    <InfoRow label="Consensus Mechanism" value="Proof of Work (PoW)" />
                    <InfoRow label="Reward Model" value="PPLNS (Pay Per Last N Shares)" />
                    <InfoRow label="Block Reward" value="10,000 $HOME (50% Winner, 50% Community)" />
                    <InfoRow label="Halving Schedule" value="Every 14,400 blocks (~10 days)" />
                    <InfoRow label="Max Supply" value="21,000,000,000 $HOME" />
                    <InfoRow label="Pruning Window" value="30 days" />
                    <InfoRow label="Rate Limit" value="10 seconds per miner" />
                    <InfoRow label="Last Updated" value={new Date(stats.last_updated).toLocaleString()} />
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub }: any) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
            <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
            <p className="text-xs text-slate-400">{sub}</p>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-slate-800/50 last:border-0">
            <dt className="text-sm font-medium text-slate-500 md:w-1/3">{label}</dt>
            <dd className="mt-1 md:mt-0 text-sm text-slate-200">{value}</dd>
        </div>
    );
}
