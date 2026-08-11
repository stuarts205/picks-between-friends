import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Picks Between Friends",
  description: "A site for football picks among friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <html lang="en">
          <head>
            <script
              defer
              data-website-id="d6e64d2e-11c9-4f73-a6e8-4085c84d4be0"
              data-domain="https://picks-between-friends.vercel.app"
              src="https://web-track-seven.vercel.app/analytics.js">
            </script>
          </head>
          
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Toaster />
            {children}
          </body>
        </html>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
