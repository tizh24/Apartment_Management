import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Apartment Management",
  description: "Frontend starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
