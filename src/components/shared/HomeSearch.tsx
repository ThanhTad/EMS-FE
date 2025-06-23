// components/home/HomeSearch.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HomeSearch() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (keyword.trim()) {
      // Chuyển hướng đến trang tìm kiếm sự kiện với query `keyword`
      router.push(
        `/events/search?keyword=${encodeURIComponent(keyword.trim())}`
      );
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Cho phép tìm kiếm bằng cách nhấn Enter
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="text"
        placeholder="Nhập tên sự kiện, địa điểm, nghệ sĩ..."
        className="h-12 flex-grow text-base"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button
        size="lg"
        className="h-12 text-base sm:w-auto transition-all hover:scale-105"
        onClick={handleSearch}
      >
        <Search className="mr-2 h-5 w-5" /> Tìm kiếm
      </Button>
    </div>
  );
}
