import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Chirp",
  description: "A social media platform for 😃",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Chirp",
    description: "A social media platform for 😃",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 400,
        height: 400,
        alt: "Chirp Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`font-sans ${inter.variable}`}>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#333",
                color: "#fff",
              },
            }}
          />
          <Analytics />
          <TRPCReactProvider headers={headers()}>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
