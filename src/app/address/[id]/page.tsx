"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Coins,
    History,
    Hash,
    Clock,
    ChevronLeft,
    TrendingUp,
    Gift
} from "lucide-react";
import Link from "next/link";
import { timeAgo, formatHash, formatAmount } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";

export default function AddressDetailPage() {
    const params = useParams();
    const address = params?.id as string;

    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'txs' | 'rewards'>('txs');

    useEffect(() => {
        if (!address) return;

        const fetchData = async () => {
            setLoading(true);

            // 1. Fetch Balance
            const { data: balanceData } = await supabase
                .from("holders")
                .select("balance")
                .eq("address", address)
                .single();

            if (balanceData) setBalance(Number(balanceData.balance));

            // 2. Fetch Transactions (Sent & Received)
            const { data: txData } = await supabase
                .from("transactions")
                .select("*")
                .or(`sender.eq.${address},receiver.eq.${address}`)
                .order("timestamp", { ascending: false })
                .limit(50);

            if (txData) setTransactions(txData);

            // 3. Fetch Rewards
            const { data: rewardData } = await supabase
                .from("rewards")
                .select("*")
                .eq("receiver", address)
                .order("timestamp", { ascending: false })
                .limit(50);

            if (rewardData) setRewards(rewardData);

            setLoading(false);
        };

        fetchData();
    }, [address]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/holders" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {address === "SYSTEM" ? (
                            <>
                                <Hash className="w-8 h-8 text-primary animate-pulse" />
                                Protocol System / Genesis
                            </>
                        ) : (
                            <>
                                <Wallet className="w-8 h-8 text-primary" />
                                Address Details
                            </>
                        )}
                    </h1>
                    <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-slate-500">
                            {address === "SYSTEM" ? "Blockchain Internal Treasury & Minting" : formatHash(address, 12)}
                        </p>
                        {address !== "SYSTEM" && <CopyButton text={address} />}
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Coins className="w-24 h-24 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-slate-400 text-sm font-medium">Current Balance</p>
                        <h2 className="text-4xl font-bold text-emerald-400">
                            {formatAmount(balance)} <span className="text-lg text-emerald-600 font-normal">$HOME</span>
                        </h2>
                    </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <History className="w-24 h-24 text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-slate-400 text-sm font-medium">Activity</p>
                        <div className="flex gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-200">{transactions.length}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Transactions</p>
                            </div>
                            <div className="w-px h-10 bg-slate-800" />
                            <div>
                                <h3 className="text-2xl font-bold text-slate-200">{rewards.length}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Rewards</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reward Type Card (Mini Chart Placeholder or Info) */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-slate-400 text-sm font-medium">Income Type</p>
                        <div className="space-y-1">
                            {rewards.some(r => r.type === 'reward_winner') && (
                                <p className="text-xs text-yellow-500 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" /> Block Finder
                                </p>
                            )}
                            {rewards.some(r => r.type === 'reward_community') && (
                                <p className="text-xs text-blue-500 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Community Pool
                                </p>
                            )}
                            <p className="text-xs text-slate-500 italic mt-2">Latest activity: {rewards.length > 0 ? timeAgo(rewards[0].timestamp) : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="space-y-4">
                <div className="flex gap-4 border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('txs')}
                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'txs' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Transactions
                        {activeTab === 'txs' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full ring-4 ring-primary/20" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'rewards' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Mining Rewards
                        {activeTab === 'rewards' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full ring-4 ring-primary/20" />}
                    </button>
                </div>

                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                    {activeTab === 'txs' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/20 text-slate-400 text-xs text-left uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Block</th>
                                        <th className="px-6 py-4 font-medium">Address</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 text-sm">
                                    {transactions.map((tx, idx) => {
                                        const isOutgoing = tx.sender === address;
                                        return (
                                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    {isOutgoing ? (
                                                        <span className="flex items-center gap-1.5 text-rose-400 font-bold bg-rose-400/10 px-2 py-1 rounded-lg w-fit">
                                                            <ArrowUpRight className="w-3.5 h-3.5" /> Out
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-lg w-fit">
                                                            <ArrowDownLeft className="w-3.5 h-3.5" /> In
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link href={`/block/${tx.block_id}`} className="text-primary hover:underline font-bold">
                                                        #{tx.block_id}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={`/address/${isOutgoing ? tx.receiver : tx.sender}`}
                                                        className="font-mono text-xs text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        {formatHash(isOutgoing ? tx.receiver : tx.sender)}
                                                    </Link>
                                                </td>
                                                <td className={`px-6 py-4 font-bold ${isOutgoing ? 'text-slate-300' : 'text-emerald-400'}`}>
                                                    {isOutgoing ? '-' : '+'}{formatAmount(tx.amount)} $HOME
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                                                    {timeAgo(tx.timestamp)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-600">No transactions found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/20 text-slate-400 text-xs text-left uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Block</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 text-sm">
                                    {rewards.map((reward, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {reward.type === 'reward_winner' ? (
                                                        <Gift className="w-4 h-4 text-yellow-500" />
                                                    ) : (
                                                        <Users className="w-4 h-4 text-blue-500" />
                                                    )}
                                                    <span className={`font-bold uppercase text-[10px] tracking-widest ${reward.type === 'reward_winner' ? 'text-yellow-500' : 'text-blue-500'}`}>
                                                        {reward.type === 'reward_winner' ? 'Finder' : 'Community'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/block/${reward.block_id}`} className="text-primary hover:underline font-bold">
                                                    #{reward.block_id}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-400">
                                                +{formatAmount(reward.amount)} $HOME
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                                                {timeAgo(reward.timestamp)}
                                            </td>
                                        </tr>
                                    ))}
                                    {rewards.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-slate-600">No mining rewards found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const Users = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
