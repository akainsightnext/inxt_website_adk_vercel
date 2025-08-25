"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownRenderer, mdComponents } from "./MarkdownRenderer";

import { Copy, CopyCheck, Loader2, Bot, User, Target } from "lucide-react";
import { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  isLoading?: boolean;
  onCopy?: (text: string, messageId: string) => void;
  copiedMessageId?: string | null;
}

/**
 * Individual message component that handles both human and AI messages
 * with proper styling, copy functionality, and activity timeline
 */
export function MessageItem({
  message,
  isLoading = false,
  onCopy,
  copiedMessageId,
}: MessageItemProps) {
  const handleCopy = (text: string, messageId: string) => {
    if (onCopy) {
      onCopy(text, messageId);
    }
  };

  // Human message rendering
  if (message.type === "human") {
    return (
      <div className="flex items-start justify-end gap-3 max-w-[85%] ml-auto">
        <div className="bg-blue-600 text-white p-4 rounded-xl rounded-tr-sm shadow-sm">
          <ReactMarkdown
            components={{
              ...mdComponents,
              // Override styles for human messages (white text)
              p: ({ children, ...props }) => (
                <p
                  className="mb-2 leading-relaxed text-white last:mb-0"
                  {...props}
                >
                  {children}
                </p>
              ),
              h1: ({ children, ...props }) => (
                <h1
                  className="text-xl font-bold mb-3 text-white leading-tight"
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2
                  className="text-lg font-semibold mb-2 text-white leading-tight"
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  className="text-base font-medium mb-2 text-white leading-tight"
                  {...props}
                >
                  {children}
                </h3>
              ),
              code: ({ children, ...props }) => (
                <code
                  className="bg-blue-800/50 text-blue-100 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              ),
              strong: ({ children, ...props }) => (
                <strong className="font-semibold text-white" {...props}>
                  {children}
                </strong>
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
          <User className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }

  // AI message rendering - simplified without timeline
  if (isLoading) {
    return (
      <div className="flex items-start max-w-[90%]">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md mr-3">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          {/* Show content if it exists while loading */}
          {message.content && (
            <div className="prose max-w-none mb-3 text-sm leading-relaxed" style={{ color: '#000000 !important' }}>
              <div style={{ color: '#000000 !important' }}>
                <MarkdownRenderer content={message.content} />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-700">
              {message.content
                ? "Still processing..."
                : "Thinking..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // AI message with no content
  if (!message.content) {
    return (
      <div className="flex items-start max-w-[90%]">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md mr-3">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-sm text-gray-700">No content</span>
        </div>
      </div>
    );
  }

  // Regular AI message display with content
  return (
    <div className="flex items-start max-w-[90%]">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md mr-3">
        <Target className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group">
        {/* Message content */}
        <div className="prose max-w-none text-sm leading-relaxed ai-message-text" style={{ color: '#000000 !important' }}>
          <div style={{ color: '#000000 !important' }}>
            <MarkdownRenderer content={message.content} />
          </div>
        </div>

        {/* Copy button */}
        {onCopy && (
          <button
            onClick={() => handleCopy(message.content, message.id)}
            className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Copy message"
          >
            {copiedMessageId === message.id ? (
              <CopyCheck className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}

        {/* Timestamp */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
