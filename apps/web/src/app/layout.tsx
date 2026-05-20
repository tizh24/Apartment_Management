import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body style={{ padding: 0, margin: 0 }}>{children}</body>
        </html>
    );
}
