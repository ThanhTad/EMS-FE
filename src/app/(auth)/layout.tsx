// app/(auth)/layout.tsx
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-sky-50 to-purple-100 dark:from-slate-900 dark:via-gray-800 dark:to-slate-900 p-4 sm:p-6 md:p-8 transition-colors duration-700">
      {/* Enhanced Decorative Elements */}
      {/* More subtle and positioned blur circles */}
      <div
        className="pointer-events-none absolute -top-1/4 -left-1/4 h-1/2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-indigo-300/30 to-purple-300/30 opacity-50 blur-[100px] dark:from-indigo-700/40 dark:to-purple-700/40 dark:opacity-30"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 animate-pulse rounded-full bg-gradient-to-l from-sky-300/30 to-pink-300/30 opacity-50 blur-[100px] dark:from-sky-700/40 dark:to-pink-700/40 dark:opacity-30"
        style={{ animationDuration: "10s", animationDelay: "2s" }}
      />

      {/* Optional: Grid pattern for subtle background texture */}
      {/* <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div> */}

      <div className="z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
