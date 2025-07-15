// src/components/chatbot/ChatWidget.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { useChatContext } from "@/contexts/ChatContext";

export const ChatWidget = () => {
  const { isOpen, toggleChat } = useChatContext();

  return (
    <>
      <ChatWindow />
      <Button
        className="fixed bottom-5 right-5 h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center"
        onClick={toggleChat}
        aria-label={isOpen ? "Đóng cửa sổ chat" : "Mở cửa sổ chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </Button>
    </>
  );
};
