"use client";

import { InputForm } from "@/components/InputForm";
import { useChatContext } from "@/components/chat/ChatProvider";

/**
 * ChatInput - Input form wrapper with context integration
 * Handles message submission through context instead of prop drilling
 * Extracted from ChatMessagesView input section
 */
export function ChatInput(): React.JSX.Element {
  const { handleSubmit, isLoading, sessionId, userId } = useChatContext();

  // Show session creation state
  const isCreatingSession = !sessionId && userId;

  return (
    <div className="relative z-10 flex-shrink-0 border-t border-gray-200 bg-white shadow-sm">
      <div className="max-w-full mx-auto w-full p-3">
        {isCreatingSession ? (
          <div className="flex items-center justify-center p-4 text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Creating session...</span>
            </div>
          </div>
        ) : (
          <InputForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            context="chat"
          />
        )}
        
        {/* Suggestion tags below input */}
        <div className="mt-3 space-y-2">
          <p className="text-gray-700 text-center text-xs">Try asking about:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors cursor-pointer">
              Our services
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors cursor-pointer">
              AI solutions
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors cursor-pointer">
              Data analytics
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200 transition-colors cursor-pointer">
              Case studies
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
