import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Definitely Decodable",
  description:
    "An adaptive decoding-intervention engine for intermediate and older struggling readers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        <DataProvider>
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}
