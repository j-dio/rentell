import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { getSession } from "@/lib/session";
import UserNav from "@/components/UserNav";

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

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b">
          <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center">
                <Image
                  src="/rentell-logo.svg"
                  alt="RenTell"
                  width={100}
                  height={32}
                  priority
                />
              </Link>
              <Link
                href="/housing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Housing
              </Link>
              <Link
                href="/carinderias"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Carinderias
              </Link>
              {user?.isHost && (
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
            <div>
              {user ? (
                <UserNav user={user} />
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
