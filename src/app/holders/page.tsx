"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, TrendingUp, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { timeAgo, formatAmount, formatHash } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";

export default function HoldersPage() {
    const [holders, setHolders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 50;

    useEffect(() => {
        const fetchHolders = async () => {
            setLoading(true);
            const { data, count } = await supabase
                .from("holders")
                .select("*", { count: "exact" })
                .order("balance", { ascending: false })
                .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

            if (data) setHolders(data);
            if (count !== null) setTotalCount(count);
            setLoading(false);
        };
        fetchHolders();
        const interval = setInterval(fetchHolders, 15000);
        return () => clearInterval(interval);
    }, [page]);

    const totalSupply = holders.reduce((sum, h) => sum + Number(h.balance), 0);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    Top Holders
                </h1>
                <div className="flex items-center gap-4 text-sm">
                    <p className="text-slate-500">Total: <span className="text-slate-200 font-bold">{totalCount.toLocaleString()}</span> addresses</p>
                    <div className="h-4 w-px bg-slate-800" />
                    <p className="text-slate-500">Page <span className="text-slate-200 font-bold">{page + 1}</span> of {totalPages || 1}</p>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/20 text-slate-400 text-xs text-left uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Rank</th>
                                <th className="px-6 py-4 font-medium">Address</th>
                                <th className="px-6 py-4 font-medium">Balance</th>
                                <th className="px-6 py-4 font-medium">Percentage</th>
                                <th className="px-6 py-4 font-medium">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm">
                            {holders.map((holder, index) => {
                                const rank = (page * itemsPerPage) + index + 1;
                                const percentage = totalSupply > 0 ? (Number(holder.balance) / totalSupply * 100) : 0;
                                return (
                                    <tr key={holder.address} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {rank <= 3 && <TrendingUp className="w-4 h-4 text-yellow-400" />}
                                                <span className={`font-bold ${rank <= 3 ? 'text-yellow-400' : 'text-slate-400'}`}>#{rank}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/address/${holder.address}`} className="font-mono text-xs text-primary hover:text-primary-light hover:underline transition-colors block max-w-xs md:max-w-lg truncate">
                                                    {formatHash(holder.address, 12)}
                                                </Link>
                                                <CopyButton text={holder.address} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-emerald-400 tabular-nums">
                                            {formatAmount(holder.balance)} $HOME
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 min-w-[120px]">
                                                <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 w-8">{percentage.toFixed(2)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                                            {timeAgo(holder.last_updated)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {holders.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-600">
                        No holders found on this page.
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-800/50 flex items-center justify-between bg-slate-800/10">
                    <button
                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="text-xs text-slate-500 font-medium">
                        Showing {page * itemsPerPage + 1} - {Math.min((page + 1) * itemsPerPage, totalCount)} of {totalCount}
                    </div>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

const ChevronRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
);
