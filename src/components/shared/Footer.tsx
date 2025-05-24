import Link from "next/link";
import React from "react";

const Footer = () => {
  const curYear = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-muted/40 dark:border-gray-700 dark:bg-muted/40">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
          ©{curYear} Event Management System. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href="/term"
            className="text-sm text-muted-foreground dark:text-muted-foreground hover:underline"
          >
            Điều khoản
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground dark:text-muted-foreground hover:underline"
          >
            Chính sách bảo mật
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground dark:text-muted-foreground hover:underline"
          >
            Liên hệ
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
