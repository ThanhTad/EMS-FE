// src/components/chatbot/ChatHeader.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const ChatHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="p-4 border-b flex justify-between items-center bg-background rounded-t-xl">
    <div>
      <h3 className="font-semibold text-lg">Trợ lý ảo TicketApp</h3>
      <p className="text-sm text-muted-foreground">Sẵn sàng hỗ trợ 24/7</p>
    </div>
    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">
      <X size={20} />
    </Button>
  </div>
);
