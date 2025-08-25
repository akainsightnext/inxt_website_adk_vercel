"use client";

import { BackendHealthChecker } from "@/components/chat/BackendHealthChecker";
import { ChatContent } from "./ChatContent";
import { ChatInput } from "./ChatInput";

/**
 * ChatLayout - Pure layout component for chat interface
 * Handles only UI structure and layout, no business logic
 * Uses context for all state management
 */
export function ChatContainer(): React.JSX.Element {
  return (
    <div className="h-full flex flex-col bg-white relative">
      <BackendHealthChecker>
        {/* Clean background */}
        <div className="absolute inset-0 bg-white pointer-events-none"></div>

        {/* Scrollable Messages Area - takes full space without header */}
        <div className="relative z-10 flex-1 min-h-0">
          <ChatContent />
        </div>

        {/* Fixed Input Area - always at bottom */}
        <div className="relative z-10 flex-shrink-0">
          <ChatInput />
        </div>
      </BackendHealthChecker>
    </div>
  );
}
