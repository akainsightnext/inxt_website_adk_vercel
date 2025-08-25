"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Target } from "lucide-react";
import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onCopy?: (text: string, messageId: string) => void;
  copiedMessageId?: string | null;
  scrollAreaRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Message list component that efficiently renders all messages
 * with proper scrolling and performance optimization
 */
export function MessageList({
  messages,
  isLoading = false,
  onCopy,
  copiedMessageId,
  scrollAreaRef,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isLoading) {
      const scrollInterval = setInterval(() => {
        scrollToBottom();
      }, 500); // Scroll every 500ms during streaming

      return () => clearInterval(scrollInterval);
    }
  }, [isLoading]);

  // If no messages, show empty state
  if (messages.length === 0) {
    return (
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="text-slate-500 text-lg">💬</div>
            <p className="text-slate-400 text-sm">
              No messages yet. Start a conversation!
            </p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            // Only show loading for the last message
            isLoading={isLoading && index === messages.length - 1}
            onCopy={onCopy}
            copiedMessageId={copiedMessageId}
          />
        ))}

        {/* Show "Thinking..." if the last message is human and we are loading */}
        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].type === "human" && (
            <div className="flex items-start max-w-[90%]">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md mr-3">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-700">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        
        {/* Invisible element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
