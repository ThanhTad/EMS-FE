// app/(auth)/layout.tsx
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-100 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 md:p-8 transition-colors duration-700">
      {/* Decorative blur circle */}
      <div className="pointer-events-none absolute rounded-full bg-indigo-400 opacity-20 blur-3xl dark:bg-indigo-900" />
      <div className="pointer-events-none absolute rounded-full bg-purple-300 opacity-20 blur-3xl dark:bg-purple-800" />
      <div className="z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
