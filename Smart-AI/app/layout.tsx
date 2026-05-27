import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { AuthProvider } from "@/components/auth/auth-context";
import { PWARegister } from "@/components/pwa/pwa-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "M1ETREPX | AI Powered Fitness OS",
  description: "Experience the next generation of AI-driven motion tracking and fitness coaching.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "M1ETREPX",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <AuthProvider>
          <SidebarShell>
            {children}
          </SidebarShell>
          <PWARegister />
        </AuthProvider>
      </body>
    </html>
  );
}
