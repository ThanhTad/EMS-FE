"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import MobileNav from "./MobileNav";
// import Image from "next/image";
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
  const { user, token, logout, isLoading } = useAuth();
  const isLoggedIn = Boolean(token && user);

  // Tính tên hiển thị và avatar
  const displayName = user ? user.fullName || user.username : "";
  // const avatarSrc =
  //   user && "avatarUrl" in user ? user.avatarUrl || undefined : undefined;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      {/* Logo & Nav Desktop */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          <span>EMS</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex lg:gap-6">
          <Link
            href="/events"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sự kiện
          </Link>
          {isLoggedIn && (
            <Link
              href="/create-event"
              className="text-muted-foreground transition-colors hover:text-foreground"
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
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/public/imgs/cute_2.png"
                    alt={displayName}
                  />
                  <AvatarFallback>
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/my-tickets">
                  <Ticket className="mr-2 h-4 w-4" />
                  Vé của tôi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Hồ sơ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
