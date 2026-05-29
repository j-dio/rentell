import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getSession } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries/messages";
import SiteNav from "@/components/SiteNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RenTell",
  description: "Student housing directory near campus",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  const unreadCount = user ? await getUnreadCount(user.userId) : 0;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SiteNav user={user} unreadCount={unreadCount} />
        {children}
      </body>
    </html>
  );
}
