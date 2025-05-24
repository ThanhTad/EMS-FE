// components/admin/AdminHeader.tsx
// components/admin/AdminHeader.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, Search, Home, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import AdminSidebarLinks from "./AdminSidebarLinks";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Những route nào có DataTable
const DATA_TABLE_PATHS = ["/admin/users", "/admin/roles"];

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Search logic
  const showSearch = DATA_TABLE_PATHS.some((p) => pathname.startsWith(p));
  const keywordParam = params.get("keyword") || "";
  const [keyword, setKeyword] = useState(keywordParam);

  useEffect(() => {
    setKeyword(keywordParam);
  }, [keywordParam]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const ps = new URLSearchParams(params);
      if (keyword) ps.set("keyword", keyword);
      else ps.delete("keyword");
      ps.set("page", "1");
      router.replace(`${pathname}?${ps.toString()}`);
    }
  };

  // Theme toggle
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 border-b bg-white dark:bg-gray-800 px-4 lg:px-8 h-14"
      role="banner"
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <AdminSidebarLinks onLinkClick={() => {}} />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb */}
      <div className="flex-1">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Bảng điều khiển</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {pathname.startsWith("/admin/users") && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin/users">Người dùng</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {pathname.startsWith("/admin/roles") && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin/roles">Vai trò</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {pathname.includes("/edit") && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Sửa</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {pathname.endsWith("/new") && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Thêm mới</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search input */}
      {showSearch && (
        <div className="relative flex-1 md:grow-0">
          <label htmlFor="admin-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
            <Input
              id="admin-search"
              type="search"
              placeholder="Tìm kiếm..."
              className="w-full rounded-lg bg-gray-100 dark:bg-gray-700 pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
      )}

      <Button variant="outline" size="sm" asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" aria-hidden="true" /> Home
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/public/imgs/default-avatar.png"
                  alt={user.fullName || user.username}
                />
                <AvatarFallback>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" role="menu">
            <DropdownMenuLabel>
              {user.fullName || user.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                onClick={logout}
                type="button"
                className="flex items-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default AdminHeader;
