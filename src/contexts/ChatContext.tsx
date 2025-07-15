// src/contexts/ChatContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useChat } from "@/hooks/useChat";

type ChatContextType = ReturnType<typeof useChat>;

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const chatState = useChat();
  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
