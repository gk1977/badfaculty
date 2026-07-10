import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
