import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../tokens/design-tokens.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-family-base",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SecureGate - Authentication Gateway",
  description: "Secure identity and access management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
