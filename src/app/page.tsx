"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ fontFamily: 'system-ui', background: '#0a0a0f', color: '#e0e0e0', minHeight: '100vh', padding: '20px' }}>
            <header style={{ maxWidth: '1200px', margin: '0 auto 40px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#00ffcc', marginBottom: '8px' }}>
                    HomeChain<span style={{ color: '#fff', fontStyle: 'italic' }}>Scan</span>
                </h1>
                <p style={{ color: '#888', fontSize: '14px' }}>V2.0.0 Optimized Ecosystem</p>
            </header>

            <div style={{ maxWidth: '1200px', margin: '0 auto 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <StatCard label="Current Height" value={stats.height.toLocaleString()} sub="Blocks Processed" />
                <StatCard label="Total Supply" value={`${(Number(stats.total_supply) / 10 ** 8).toLocaleString()} $HOME`} sub="Circulating Coins" />
                <StatCard label="Network Status" value="Online" sub="PPLNS Enabled" />
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#151520', border: '1px solid #2a2a3a', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #2a2a3a' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Latest Blocks</h2>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#1a1a24', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Block</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Hash</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Validator</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>TXs</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '14px' }}>
                            {blocks.map((block) => (
                                <tr key={block.id} style={{ borderTop: '1px solid #2a2a3a' }}>
                                    <td style={{ padding: '16px', color: '#00ffcc', fontFamily: 'monospace', fontWeight: 'bold' }}>#{block.id}</td>
                                    <td style={{ padding: '16px', color: '#888', fontFamily: 'monospace', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.hash}</td>
                                    <td style={{ padding: '16px' }}>{block.validator}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ padding: '4px 8px', background: '#1a1a24', borderRadius: '4px', fontSize: '12px' }}>{block.tx_count} Transactions</span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#666', fontSize: '12px' }}>
                                        {new Date(block.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {blocks.length === 0 && !loading && (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                        Waiting for genesis block...
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, sub }: any) {
    return (
        <div style={{ background: '#151520', border: '1px solid #2a2a3a', padding: '24px', borderRadius: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>{label}</p>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>{value}</h3>
            <p style={{ fontSize: '12px', color: '#888' }}>{sub}</p>
        </div>
    );
}
