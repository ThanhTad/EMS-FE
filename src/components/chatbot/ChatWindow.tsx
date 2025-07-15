//src/components/chatbot/ChatWindow.tsx
"use client";
import React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { cn } from "@/lib/utils";

export const ChatWindow = () => {
  const { isOpen, toggleChat, messages, isLoading, sendMessage } =
    useChatContext();

  return (
    <div
      className={cn(
        "fixed bottom-24 right-5 w-[calc(100vw-40px)] max-w-md h-[70vh] max-h-[600px] z-50 transition-all duration-300 ease-in-out",
        isOpen
          ? "transform-none opacity-100"
          : "translate-y-10 opacity-0 pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <Card className="h-full w-full flex flex-col shadow-2xl rounded-xl">
        <CardHeader className="p-0 flex-shrink-0">
          <ChatHeader onClose={toggleChat} />
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="p-0 border-t flex-shrink-0">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </CardFooter>
      </Card>
    </div>
  );
};
