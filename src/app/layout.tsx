import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"; // Thêm nếu dùng sonner
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Event Management System",
  description: "Find and manage events easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider> {children}</AuthProvider>
        </ThemeProvider>
        <Toaster /> {/* Nếu bạn dùng Toast/UI notifications */}
      </body>
    </html>
  );
}
