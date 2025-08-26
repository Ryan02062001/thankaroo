import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ReminderProvider } from "@/app/contexts/ReminderContext";
import Footer from "@/components/Footer";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const poppins = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thankaroo – Wedding Gift Tracker & Thank-You Manager",
  description: "Thankaroo is a wedding gift tracking app that helps you keep track of gifts and manage thank-you notes, all in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased font-sans`}>
        <Header />
        <ReminderProvider>
          {children}
        </ReminderProvider>
        <Footer />
      </body>
    </html>
  );
}