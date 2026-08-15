import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "./CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: "BadFaculty.com — The Record, Plainly Stated",
  description:
    "BadFaculty.com is a searchable public-record directory of resolved K-12 educator misconduct cases.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "xkcyvrnnna");`}
        </Script>
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
