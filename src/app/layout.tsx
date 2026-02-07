import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "HomeChainScan | Professional Blockchain Explorer",
    description: "Real-time ledger monitoring for the HomeChain Network",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="font-sans antialiased bg-slate-950 text-slate-200">
                <Navbar />
                <main className="min-h-screen">
                    {children}
                </main>
                <footer className="bg-slate-900/50 border-t border-slate-800 py-8 mt-20">
                    <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                        <p>HomeChain V2.0.0 | PPLNS Enabled | Powered by Supabase</p>
                        <p className="mt-2">© 2026 HomeChain Network. All rights reserved.</p>
                    </div>
                </footer>
            </body>
        </html>
    );
}