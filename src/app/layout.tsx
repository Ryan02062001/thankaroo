import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ReminderProvider } from "@/app/contexts/ReminderContext";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";
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
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-10967263816" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'AW-10967263816');`}
        </Script>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1936098137232512');
fbq('track', 'PageView');`}
        </Script>
      </head>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased font-sans`}>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1936098137232512&ev=PageView&noscript=1" alt="" />
        </noscript>
        <Header />
        <main id="main-content" role="main">
          <ReminderProvider>
            {children}
          </ReminderProvider>
          <Analytics />
        </main>
        <Footer />
      </body>
    </html>
  );
}