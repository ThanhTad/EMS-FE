// src/components/chatbot/ChatInput.tsx
"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex gap-2 items-center">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Hỏi về sự kiện, vé..."
        disabled={isLoading}
        autoComplete="off"
        aria-label="Nhập câu hỏi"
      />
      <Button
        type="submit"
        disabled={isLoading || !text.trim()}
        size="icon"
        aria-label="Gửi tin nhắn"
      >
        <SendHorizonal size={20} />
      </Button>
    </form>
  );
};
