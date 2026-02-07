import type { Metadata } from "next";
import "./globals.css";

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
                {children}
            </body>
        </html>
    );
}