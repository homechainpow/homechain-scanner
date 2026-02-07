"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowRightLeft, Clock, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { timeAgo, formatAmount, formatHash } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";
import Link from "next/link";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 50;

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const { data, count } = await supabase
                .from("transactions")
                .select("*, blocks(id)", { count: "exact" })
                .order("id", { ascending: false })
                .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

            if (data) setTransactions(data);
            if (count !== null) setTotalCount(count);
            setLoading(false);
        };
        fetchTransactions();
        const interval = setInterval(fetchTransactions, 10000);
        return () => clearInterval(interval);
    }, [page]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ArrowRightLeft className="w-8 h-8 text-primary" />
                    All Transactions
                </h1>
                <div className="flex items-center gap-4 text-sm">
                    <p className="text-slate-500">Total: <span className="text-slate-200 font-bold">{totalCount.toLocaleString()}</span> txns</p>
                    <div className="h-4 w-px bg-slate-800" />
                    <p className="text-slate-500">Page <span className="text-slate-200 font-bold">{page + 1}</span> of {totalPages || 1}</p>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/20 text-slate-400 text-xs text-left uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">TX ID</th>
                                <th className="px-6 py-4 font-medium text-center">Block</th>
                                <th className="px-6 py-4 font-medium">From</th>
                                <th className="px-6 py-4 font-medium">To</th>
                                <th className="px-6 py-4 font-medium text-right">Amount</th>
                                <th className="px-6 py-4 font-medium text-right text-slate-500">Fee</th>
                                <th className="px-6 py-4 font-medium">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm font-medium">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Link href={`/tx/${tx.id}`} className="text-primary font-mono font-bold hover:underline">
                                            #{tx.id}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={`/block/${tx.blocks?.id}`} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                            #{tx.blocks?.id || 'N/A'}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/address/${tx.sender}`}
                                                className="font-mono text-xs text-slate-400 group-hover:text-primary transition-colors"
                                            >
                                                {formatHash(tx.sender)}
                                            </Link>
                                            <CopyButton text={tx.sender} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/address/${tx.receiver}`}
                                                className="font-mono text-xs text-slate-400 group-hover:text-primary transition-colors"
                                            >
                                                {formatHash(tx.receiver)}
                                            </Link>
                                            <CopyButton text={tx.receiver} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-400 tabular-nums">
                                        {formatAmount(tx.amount)} $HOME
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 text-[10px] tabular-nums font-bold">
                                        {formatAmount(tx.fee)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                                        {timeAgo(tx.timestamp)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {transactions.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-600 font-medium">
                        No transactions found on this page.
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-800/50 flex items-center justify-between bg-slate-800/10">
                    <button
                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 shadow-inner"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="text-xs text-slate-500 font-medium">
                        Showing {page * itemsPerPage + 1} - {Math.min((page + 1) * itemsPerPage, totalCount)} of {totalCount}
                    </div>
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 shadow-inner"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
