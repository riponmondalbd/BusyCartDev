import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WishlistProvider } from "@/store/WishlistContext";

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
        <WishlistProvider>
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}
