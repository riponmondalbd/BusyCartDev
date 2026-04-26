import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ToastProvider";
import { WishlistProvider } from "@/store/WishlistContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BusyCart | The Future of eCommerce",
  description: "A secure, clean, modern, and futuristic eCommerce platform.",
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
