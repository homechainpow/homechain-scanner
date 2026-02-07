"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";
import { Box, Clock, Hash, User, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function BlocksPage() {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 50;

    useEffect(() => {
        const fetchBlocks = async () => {
            setLoading(true);
            const { data, count } = await supabase
                .from("blocks")
                .select("*", { count: "exact" })
                .order("id", { ascending: false })
                .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

            if (data) setBlocks(data);
            if (count !== null) setTotalCount(count);
            setLoading(false);
        };
        fetchBlocks();
        const interval = setInterval(fetchBlocks, 10000);
        return () => clearInterval(interval);
    }, [page]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Box className="w-8 h-8 text-primary" />
                    All Blocks
                </h1>
                <div className="flex items-center gap-4 text-sm">
                    <p className="text-slate-500">Total: <span className="text-slate-200 font-bold">{totalCount.toLocaleString()}</span> blocks</p>
                    <div className="h-4 w-px bg-slate-800" />
                    <p className="text-slate-500">Page <span className="text-slate-200 font-bold">{page + 1}</span> of {totalPages || 1}</p>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-800/20 text-slate-400 text-xs text-left uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium text-center">Block</th>
                                <th className="px-6 py-4 font-medium">Hash</th>
                                <th className="px-6 py-4 font-medium">Validator</th>
                                <th className="px-6 py-4 font-medium text-center">TXs</th>
                                <th className="px-6 py-4 font-medium text-center">Rewards</th>
                                <th className="px-6 py-4 font-medium">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-sm font-medium">
                            {blocks.map((block) => (
                                <tr key={block.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-center">
                                        <Link href={`/block/${block.id}`} className="text-primary font-mono font-bold hover:underline">
                                            #{block.id}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-3.5 h-3.5 text-slate-500" />
                                            <Link href={`/block/${block.id}`} className="text-slate-400 font-mono text-xs truncate max-w-[150px] group-hover:text-primary transition-colors">
                                                {block.hash}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/address/${block.validator}`}
                                            className="font-mono text-xs text-slate-400 hover:text-primary transition-colors"
                                        >
                                            {block.validator.substring(0, 16)}...
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">
                                            {block.tx_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-emerald-900/20 border border-emerald-800/30 text-emerald-400 rounded text-[10px] uppercase font-bold tracking-wider">
                                            {block.reward_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                                        {timeAgo(block.timestamp)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
