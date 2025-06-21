// components/features/events/EventDiscussionSection.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDiscussionsByEvent, createDiscussion } from "@/lib/api";
import { EventDiscussion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, LoaderIcon } from "lucide-react";
import Link from "next/link";
import CommentForm from "./CommentForm";
import DiscussionComment from "./DiscussionComment";

interface EventDiscussionSectionProps {
  eventId: string;
}

// Hàm trợ giúp để thêm một reply vào đúng vị trí trong cây bình luận
const addReplyToCommentTree = (
  comments: EventDiscussion[],
  newReply: EventDiscussion
): EventDiscussion[] => {
  return comments.map((comment) => {
    if (comment.id === newReply.parentCommentId) {
      return {
        ...comment,
        replies: [newReply, ...(comment.replies || [])],
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToCommentTree(comment.replies, newReply),
      };
    }
    return comment;
  });
};

export default function EventDiscussionSection({
  eventId,
}: EventDiscussionSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [discussions, setDiscussions] = useState<EventDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchDiscussions = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      try {
        const response = await getDiscussionsByEvent(eventId, {
          page: pageNum,
          size: 5,
        });
        setDiscussions((prev) =>
          pageNum === 0 ? response.content : [...prev, ...response.content]
        );
        setHasMore(!response.last);
      } catch (error) {
        console.error("Lỗi khi tải bình luận:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [eventId]
  );

  useEffect(() => {
    fetchDiscussions(0);
  }, [fetchDiscussions]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscussions(nextPage);
  };

  const handlePostComment = async (content: string, parentId?: string) => {
    const newComment = await createDiscussion({
      eventId,
      content,
      parentCommentId: parentId,
    });

    if (parentId) {
      // Đây là một reply
      setDiscussions((prev) => addReplyToCommentTree(prev, newComment));
    } else {
      // Đây là một bình luận gốc
      setDiscussions((prev) => [newComment, ...prev]);
    }
  };

  const renderContent = () => {
    if (isLoading && page === 0) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (discussions.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <MessageSquare className="mx-auto h-12 w-12" />
          <p className="mt-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {discussions.map((comment) => (
          <DiscussionComment
            key={comment.id}
            comment={comment}
            onReplySubmit={handlePostComment}
          />
        ))}
        {hasMore && (
          <div className="text-center">
            <Button onClick={handleLoadMore} disabled={isLoading}>
              {isLoading && (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Tải thêm bình luận
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Thảo luận ({/* Có thể thêm tổng số bình luận ở đây nếu API hỗ trợ */})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAuthenticated && user ? (
          <CommentForm onSubmit={(content) => handlePostComment(content)} />
        ) : (
          <div className="text-center p-4 bg-muted/50 rounded-md">
            <p>
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Đăng nhập
              </Link>{" "}
              để tham gia thảo luận.
            </p>
          </div>
        )}
        <Separator />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
