"use client";

import { useState } from "react";
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
  const { user, token, logout, isLoading } = useAuth();
  const isLoggedIn = Boolean(token && user);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" disabled={isLoading}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col">
        <div className="flex flex-col gap-6 pt-6">
          <SheetClose asChild>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span>EMS</span>
            </Link>
          </SheetClose>

          <Separator />

          <nav className="flex flex-col gap-4">
            <SheetClose asChild>
              <Link
                href="/events"
                className="text-lg font-medium hover:underline"
              >
                Sự kiện
              </Link>
            </SheetClose>

            {isLoggedIn && (
              <>
                <SheetClose asChild>
                  <Link
                    href="/create-event"
                    className="text-lg font-medium hover:underline"
                  >
                    Tổ chức sự kiện
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/my-tickets"
                    className="text-lg font-medium hover:underline"
                  >
                    Vé của tôi
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/profile"
                    className="text-lg font-medium hover:underline"
                  >
                    Hồ sơ
                  </Link>
                </SheetClose>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-2 pb-6">
          <Separator className="my-4" />

          {!isLoading && !isLoggedIn && (
            <>
              <SheetClose asChild>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href="/register">
                  <Button className="w-full">Đăng ký</Button>
                </Link>
              </SheetClose>
            </>
          )}

          {!isLoading && isLoggedIn && (
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="justify-start w-full"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
