// components/features/events/CommentForm.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderIcon, SendIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
}

export default function CommentForm({
  onSubmit,
  placeholder = "Viết bình luận của bạn...",
  submitLabel = "Gửi",
  className = "",
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      // Có thể thêm state để hiển thị lỗi cho người dùng
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-start gap-4 ${className}`}
    >
      <Avatar>
        <AvatarImage src={user?.avatarUrl} alt={user?.username} />
        <AvatarFallback>
          {user?.username?.[0].toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? (
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="mr-2 h-4 w-4" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
