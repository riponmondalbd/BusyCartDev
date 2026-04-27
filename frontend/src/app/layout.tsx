import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import { WishlistProvider } from "@/store/WishlistContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://busycart.dev",
  ),
  title: {
    default: "BusyCart | The Future of eCommerce",
    template: "%s | BusyCart",
  },
  description:
    "A secure, clean, modern, and futuristic eCommerce platform built for the next generation of online shopping.",
  keywords: ["eCommerce", "future", "shopping", "next-gen", "secure", "tech"],
  authors: [{ name: "BusyCart Team" }],
  creator: "BusyCart",
  publisher: "BusyCart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "BusyCart | The Future of eCommerce",
    description:
      "Experience the next generation of neural processing and urban cyberware.",
    url: "https://busycart.dev",
    siteName: "BusyCart",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BusyCart Future of eCommerce",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BusyCart | The Future of eCommerce",
    description: "The next generation of neural processing is here.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider />
        <WishlistProvider>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}
