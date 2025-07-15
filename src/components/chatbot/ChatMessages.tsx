// src/components/chatbot/ChatMessages.tsx
import React, { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { Bot, Loader2 } from "lucide-react";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cuộn xuống tin nhắn mới nhất
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex items-start gap-3 my-4 justify-start">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div className="p-3 rounded-lg bg-muted flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Bot đang trả lời...
            </span>
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
};
