"use client";

import { Bot } from "lucide-react";
import { UserIdInput } from "@/components/chat/UserIdInput";
import { useChatContext } from "@/components/chat/ChatProvider";

/**
 * ChatHeader - User and session management interface
 * Extracted from ChatMessagesView header section
 * Handles user ID input and session selection
 */
export function ChatHeader(): React.JSX.Element {
  const {
    userId,
    sessionId,
    handleUserIdChange,
    handleUserIdConfirm,
  } = useChatContext();

  return (
    <div className="relative z-10 flex-shrink-0 border-b border-slate-700/50 bg-slate-800/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center p-4">
        {/* Left side - App branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100">
              AI Chat Assistant
            </h1>
            <p className="text-xs text-slate-400">Auto-session enabled • Powered by Vertex AI</p>
          </div>
        </div>

        {/* Right side - User controls (simplified for auto-session) */}
        <div className="flex items-center gap-4">
          {/* Show session status */}
          {sessionId && (
            <div className="text-xs text-slate-400">
              Session: {sessionId.slice(-8)}...
            </div>
          )}
          
          {/* Optional: Keep user ID input for customization */}
          <UserIdInput
            currentUserId={userId}
            onUserIdChange={handleUserIdChange}
            onUserIdConfirm={handleUserIdConfirm}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
