"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Box, ArrowLeft, Clock, Hash, User, Database, Zap, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { timeAgo, formatAmount, formatHash } from "@/lib/utils";

export default function BlockDetailPage() {
    const params = useParams();
    const blockId = params.id;
    const [block, setBlock] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlock = async () => {
            const { data: blockData } = await supabase
                .from("blocks")
                .select("*")
                .eq("id", blockId)
                .single();

            const { data: txData } = await supabase
                .from("transactions")
                .select("*")
                .eq("block_id", blockId);

            const { data: rewardData } = await supabase
                .from("rewards")
                .select("*")
                .eq("block_id", blockId);

            if (blockData) setBlock(blockData);
            if (txData) setTransactions(txData);
            if (rewardData) setRewards(rewardData);
            setLoading(false);
        };
        fetchBlock();
    }, [blockId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!block) return (
        <div className="p-12 text-center">
            <h1 className="text-2xl font-bold text-slate-400">Block not found</h1>
            <Link href="/blocks" className="text-primary hover:underline mt-4 inline-block font-bold">Back to Blocks</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Link href="/blocks" className="inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 transition-all hover:bg-primary/20">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Blocks
                </Link>
                <div className="flex gap-2">
                    <Link href={`/block/${Number(blockId) - 1}`} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors">Previous</Link>
                    <Link href={`/block/${Number(blockId) + 1}`} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors">Next</Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
                <div className="flex items-center gap-5">
                    <div className="bg-primary/20 p-4 rounded-3xl border border-primary/30 shadow-2xl shadow-primary/10">
                        <Box className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white">Block <span className="text-primary italic">#{block.id}</span></h1>
                        <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" /> {new Date(block.timestamp * 1000).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Network Weight</p>
                        <p className="text-lg font-mono font-bold text-emerald-400">{block.difficulty || 'PoW Active'}</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-emerald-500/50" />
                </div>
            </div>

            {/* Block Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
                    <h2 className="text-xl font-bold flex items-center gap-3 mb-2">
                        <Database className="w-6 h-6 text-primary" />
                        Network Data
                    </h2>
                    <DetailRow label="Block Hash" value={block.hash} mono copyable />
                    <DetailRow label="Previous Hash" value={block.prev_hash || 'Genesis Block'} mono copyable />
                    <DetailRow
                        label="Validator / Miner"
                        value={block.validator}
                        mono
                        link={`/address/${block.validator}`}
                    />
                    <DetailRow label="Difficulty" value={block.difficulty || block.target} mono />
                </div>

                <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
                    <h2 className="text-xl font-bold flex items-center gap-3 mb-2">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        Statistics
                    </h2>
                    <DetailRow label="Transactions" value={`${block.tx_count} confirmed transactions`} />
                    <DetailRow label="Rewards" value={`${block.reward_count} PPLNS distributions`} />
                    <DetailRow label="Block Age" value={timeAgo(block.timestamp)} />
                    <DetailRow label="Timestamp" value={new Date(block.timestamp).toISOString()} />
                </div>
            </div>

            {/* Transactions */}
            <div className="grid grid-cols-1 gap-8">
                <section className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                            Confirmed Transactions
                        </h2>
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-lg">LIVE</span>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {transactions.length > 0 ? transactions.map((tx) => (
                            <Link key={tx.id} href={`/tx/${tx.id}`} className="block p-6 hover:bg-slate-800/30 transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-left">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">From:</p>
                                                <p className="font-mono text-xs text-slate-300 group-hover:text-primary transition-colors">{formatHash(tx.sender)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">To:</p>
                                                <p className="font-mono text-xs text-slate-300 group-hover:text-primary transition-colors">{formatHash(tx.receiver)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-emerald-400 tabular-nums">+{formatAmount(tx.amount)}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">$HOME</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="p-16 text-center text-slate-600 font-bold italic">
                                No user transactions in this block.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function DetailRow({ label, value, mono = false, link = "", copyable = false }: { label: string; value: string; mono?: boolean; link?: string; copyable?: boolean }) {
    return (
        <div className="flex flex-col space-y-1.5 py-4 border-b border-slate-800/50 last:border-0">
            <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</dt>
            <dd className="flex items-center gap-2">
                {link ? (
                    <Link href={link} className={`text-sm font-bold text-primary hover:underline ${mono ? 'font-mono' : ''}`}>
                        {value}
                    </Link>
                ) : (
                    <span className={`text-sm font-bold text-slate-200 ${mono ? 'font-mono break-all' : ''}`}>
                        {value}
                    </span>
                )}
            </dd>
        </div>
    );
}
