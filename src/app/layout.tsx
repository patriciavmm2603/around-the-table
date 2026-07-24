import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Around the Table",
  description: "Plan less. Gather more.",
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
