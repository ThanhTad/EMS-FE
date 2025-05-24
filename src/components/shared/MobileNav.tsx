"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Package2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading}
          className="bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <div className="flex flex-col gap-6 pt-6 px-4">
          <SheetClose asChild>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 font-semibold text-gray-800 dark:text-white"
            >
              <Package2 className="h-6 w-6 text-gray-800 dark:text-white" />
              <span>EMS</span>
            </Link>
          </SheetClose>

          <Separator className="border-gray-200 dark:border-gray-700" />

          <nav className="flex flex-col gap-4">
            <SheetClose asChild>
              <Link
                href="/events"
                className="text-lg font-medium hover:underline text-gray-800 dark:text-gray-100"
              >
                Sự kiện
              </Link>
            </SheetClose>

            {isLoggedIn && (
              <>
                <SheetClose asChild>
                  <Link
                    href="/create-event"
                    className="text-lg font-medium hover:underline text-gray-800 dark:text-gray-100"
                  >
                    Tổ chức sự kiện
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/my-tickets"
                    className="text-lg font-medium hover:underline text-gray-800 dark:text-gray-100"
                  >
                    Vé của tôi
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/profile"
                    className="text-lg font-medium hover:underline text-gray-800 dark:text-gray-100"
                  >
                    Hồ sơ
                  </Link>
                </SheetClose>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-2 px-4 pb-6">
          <Separator className="border-gray-200 dark:border-gray-700 my-4" />

          {!isLoading && !isLoggedIn && (
            <>
              <SheetClose asChild>
                <Link href="/login">
                  <Button className="w-full bg-white dark:bg-gray-700 dark:text-gray-100">
                    Đăng nhập
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href="/register">
                  <Button className="w-full bg-primary dark:bg-primary dark:text-white">
                    Đăng ký
                  </Button>
                </Link>
              </SheetClose>
            </>
          )}

          {!isLoading && isLoggedIn && (
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start w-full text-gray-800 dark:text-gray-100"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4 text-gray-800 dark:text-gray-100" />
                Đăng xuất
              </Button>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
