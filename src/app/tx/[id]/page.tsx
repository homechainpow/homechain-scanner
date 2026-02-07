"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Hash, CreditCard, ArrowRight, ShieldCheck, Database, Box } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { timeAgo, formatAmount, formatHash } from "@/lib/utils";

export default function TransactionDetailPage() {
    const params = useParams();
    const txId = params.id;
    const [tx, setTx] = useState<any>(null);
    const [block, setBlock] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTx = async () => {
            setLoading(true);
            const { data: txData } = await supabase
                .from("transactions")
                .select("*, blocks(id, hash, timestamp)")
                .eq("id", txId)
                .single();

            if (txData) {
                setTx(txData);
                setBlock(txData.blocks);
            }
            setLoading(false);
        };
        fetchTx();
    }, [txId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!tx) return (
        <div className="p-12 text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-400">Transaction Not Found</h1>
            <p className="text-slate-600">The transaction ID might be invalid or not yet indexed.</p>
            <Link href="/transactions" className="text-primary hover:underline font-bold inline-block px-6 py-2 bg-primary/10 rounded-xl border border-primary/20">Back to Transactions</Link>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link href="/transactions" className="inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 transition-all hover:bg-primary/20">
                <ArrowLeft className="w-4 h-4" />
                All Transactions
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-10">
                <div className="flex items-center gap-6">
                    <div className="bg-emerald-500/10 p-5 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
                        <CreditCard className="w-12 h-12 text-emerald-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-black text-white">TX <span className="text-primary italic">#{tx.id}</span></h1>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">Success</span>
                        </div>
                        <p className="text-slate-500 font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {new Date(tx.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-5 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Value</p>
                        <p className="text-3xl font-black text-white tabular-nums">{formatAmount(tx.amount)} <span className="text-primary text-sm italic font-black">HOME</span></p>
                    </div>
                </div>
            </div>

            {/* Main Transaction Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 space-y-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-primary/10" />

                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 bg-slate-800/20 rounded-2xl border border-slate-700/50">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sender Address</p>
                                    <Link href={`/address/${tx.sender}`} className="text-sm font-mono font-bold text-primary hover:underline break-all block">
                                        {tx.sender}
                                    </Link>
                                </div>
                                <div className="hidden md:block bg-slate-700/50 p-2 rounded-full">
                                    <ArrowRight className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="space-y-2 md:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 md:justify-end flex">Receiver Address</p>
                                    <Link href={`/address/${tx.receiver}`} className="text-sm font-mono font-bold text-emerald-400 hover:underline break-all block">
                                        {tx.receiver}
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <DetailRow label="Transaction Fee" value={`${formatAmount(tx.fee)} HOME`} highlight />
                                    <DetailRow label="Nonce" value={tx.nonce || '0'} mono />
                                </div>
                                <div className="space-y-6">
                                    <DetailRow label="Gas Used" value="Standard" />
                                    <DetailRow label="Network Weight" value="PoW Secured" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-2xl">
                        <h2 className="text-lg font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                            <Box className="w-5 h-5 text-primary" />
                            Inclusion Data
                        </h2>
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mined in Block</p>
                                <Link href={`/block/${tx.block_id}`} className="text-xl font-black text-primary hover:underline flex items-center gap-2 group">
                                    #{tx.block_id}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <DetailRow label="Block Hash" value={formatHash(block?.hash || '')} mono link={`/block/${tx.block_id}`} />
                            <DetailRow label="Confirmations" value="Finalized" highlight />
                        </div>
                    </section>

                    <section className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <p className="text-sm font-black text-white uppercase tracking-tight">Security Verified</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            This transaction was successfully matched and verified by all validators on the HomeChain Mainnet.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, mono = false, link = "", highlight = false }: { label: string; value: string; mono?: boolean; link?: string; highlight?: boolean }) {
    return (
        <div className="space-y-2">
            <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</dt>
            <dd className="flex items-center gap-2">
                {link ? (
                    <Link href={link} className={`text-sm font-bold text-primary hover:underline ${mono ? 'font-mono' : ''}`}>
                        {value}
                    </Link>
                ) : (
                    <span className={`text-sm font-bold ${highlight ? 'text-white' : 'text-slate-300'} ${mono ? 'font-mono break-all font-medium text-xs' : ''}`}>
                        {value}
                    </span>
                )}
            </dd>
        </div>
    );
}
