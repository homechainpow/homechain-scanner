import type { Metadata } from "next";

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
            <body style={{ margin: 0, padding: 0 }}>
                {children}
            </body>
        </html>
    );
}