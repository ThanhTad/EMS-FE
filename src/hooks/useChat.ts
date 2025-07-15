// src/hooks/useChat.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, DialogflowRequest } from "@/types";
import { sendChatMessageToApi } from "@/lib/api";

export const useChat = (initialSessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const sessionId = useRef(initialSessionId || uuidv4());

  useEffect(() => {
    // Thêm tin nhắn chào mừng ban đầu
    setMessages([
      {
        id: "initial-bot-message",
        text: "Xin chào! Tôi là Trợ lý ảo của TicketApp. Tôi có thể giúp bạn tìm thông tin về sự kiện, giá vé, và tình trạng vé. Bạn cần hỗ trợ gì ạ?",
        sender: "bot",
      },
    ]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { id: uuidv4(), text, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const request: DialogflowRequest = {
        text,
        sessionId: sessionId.current,
      };
      const response = await sendChatMessageToApi(request);

      const botMessage: ChatMessage = {
        id: uuidv4(),
        text: response.fulfillmentText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API Error:", error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: "Rất xin lỗi, đã có sự cố kết nối. Vui lòng thử lại trong giây lát.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { messages, isLoading, isOpen, sendMessage, toggleChat };
};
