// components/shared/Header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import MobileNav from "./MobileNav";
import NotificationBell from "./NotificationBell";
import {
  Package2,
  User as UserIcon,
  LogOut,
  Ticket,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const isLoggedIn = Boolean(user);

  // Tính tên hiển thị và avatar
  const displayName = user ? user.fullName || user.username : "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-700 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60 md:px-6">
      {/* Logo & Nav Desktop */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white"
        >
          <Package2 className="h-6 w-6 text-gray-800 dark:text-white" />
          <span>EMS</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex lg:gap-6">
          <Link
            href="/events"
            className="text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            Sự kiện
          </Link>
          {isLoggedIn && (
            <Link
              href="/create-event"
              className="text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Tổ chức sự kiện
            </Link>
          )}
        </nav>
      </div>

      {/* Auth / User Menu & Mobile Nav */}
      <div className="flex items-center gap-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 hidden md:block dark:bg-gray-700" />
            <Skeleton className="h-8 w-8 rounded-full dark:bg-gray-700" />
          </div>
        )}

        {/* Logged out */}
        {!isLoading && !isLoggedIn && (
          <div className="hidden gap-2 md:flex">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Đăng ký</Link>
            </Button>
          </div>
        )}

        {/* Logged in */}
        {!isLoading && isLoggedIn && user && (
          <>
            {/* Notification Bell */}
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full bg-white dark:bg-gray-800"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatarUrl || "/imgs/default-avatar.png"}
                      alt={displayName}
                    />
                    <AvatarFallback>
                      {displayName?.slice(0, 2)?.toUpperCase() ?? "??"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-white dark:bg-gray-800"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-800 dark:text-white">
                      {displayName}
                    </p>
                    {user.email && (
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-tickets"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    Vé của tôi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-gray-200 dark:border-gray-700" />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Mobile Nav Button */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
