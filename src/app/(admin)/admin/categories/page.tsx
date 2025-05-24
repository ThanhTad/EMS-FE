// app/(admin)/categories/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getCategories, adminDeleteCategory } from "@/lib/api";
import { Category } from "@/types";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.content);
    } catch {
      toast.error("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;
    setDeletingId(id);
    try {
      await adminDeleteCategory(id);
      toast.success("Đã xóa danh mục.");
      fetchCategories();
    } catch {
      toast.error("Xóa danh mục thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Quản lý danh mục</h1>
        <Button asChild>
          <Link href="/admin/categories/new">Tạo danh mục</Link>
        </Button>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Tên danh mục</th>
              <th className="border px-2 py-1">Mô tả</th>
              <th className="border px-2 py-1">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="border px-2 py-1">{cat.name}</td>
                <td className="border px-2 py-1">{cat.description}</td>
                <td className="border px-2 py-1">
                  <Button asChild variant="outline" size="sm" className="mr-2">
                    <Link href={`/admin/categories/${cat.id}/edit`}>Sửa</Link>
                  </Button>
                  <Button
                    onClick={() => handleDelete(cat.id)}
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === cat.id}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
