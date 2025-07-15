// src/components/chatbot/ChatMessage.tsx
import React from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === "bot";

  return (
    <div
      className={cn(
        "flex items-start gap-3 my-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Bot size={20} />
        </div>
      )}
      <div
        className={cn(
          "p-3 rounded-lg max-w-[85%] break-words",
          isBot
            ? "bg-muted rounded-bl-none"
            : "bg-primary text-primary-foreground rounded-br-none"
        )}
      >
        <div className="prose dark:prose-invert prose-p:my-0 prose-ul:my-1 prose-li:my-0">
          <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
        </div>
      </div>
      {!isBot && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <User size={20} />
        </div>
      )}
    </div>
  );
};
