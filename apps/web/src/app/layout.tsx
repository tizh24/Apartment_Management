import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ padding: 0, margin: 0 }}>
        {children}
        <Toaster position="top-right" closeButton richColors expand={false} />
      </body>
    </html>
  );
}

