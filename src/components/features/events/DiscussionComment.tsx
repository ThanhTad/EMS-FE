// components/features/events/DiscussionComment.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EventDiscussion } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CommentForm from "./CommentForm";

interface DiscussionCommentProps {
  comment: EventDiscussion;
  onReplySubmit: (content: string, parentId: string) => Promise<void>;
}

export default function DiscussionComment({
  comment,
  onReplySubmit,
}: DiscussionCommentProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async (content: string) => {
    await onReplySubmit(content, comment.id);
    setIsReplying(false); // Đóng form sau khi gửi
  };

  return (
    <div className="flex items-start gap-4">
      <Avatar>
        <AvatarImage
          src={comment.user?.avatarUrl}
          alt={comment.user?.username}
        />
        <AvatarFallback>
          {comment.user?.username?.[0].toUpperCase() ?? "Ẩ"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">
            {comment.user?.username ?? "Người dùng ẩn danh"}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </p>
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
          {comment.content}
        </p>
        <div className="mt-2">
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
            >
              Trả lời
            </Button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4">
            <CommentForm
              onSubmit={handleReply}
              placeholder={`Trả lời ${comment.user?.username}...`}
              submitLabel="Trả lời"
            />
          </div>
        )}

        {/* Render các bình luận con (replies) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 pl-4 dark:border-gray-700">
            {comment.replies.map((reply) => (
              <DiscussionComment
                key={reply.id}
                comment={reply}
                onReplySubmit={onReplySubmit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
