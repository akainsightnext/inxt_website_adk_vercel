"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface InputFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  context?: "homepage" | "chat"; // Add context prop for different placeholder text
}

export function InputForm({
  onSubmit,
  isLoading,
  context = "homepage",
}: InputFormProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && context === "homepage") {
      textareaRef.current.focus();
    }
  }, [context]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const placeholderText =
    context === "chat"
      ? "Ask about our services, AI solutions, or how we can help..."
      : "What goal would you like to achieve? e.g., Build a mobile app, Plan a marketing campaign, Learn a new skill...";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
          relative flex items-end gap-3 p-3 rounded-xl border transition-all duration-200
          ${
            isFocused
              ? "border-blue-500 bg-white shadow-md shadow-blue-500/10"
              : "border-gray-200 bg-white hover:border-gray-300"
          }
        `}
        >
          {/* Input Area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholderText}
              rows={1}
              className="
                resize-none border-0 bg-transparent text-gray-800 placeholder-gray-500
                focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none
                min-h-[80px] max-h-32
                scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300
                px-0 py-2
              "
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            />

            {/* Character count for long messages */}
            {inputValue.length > 500 && (
              <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white rounded px-1">
                {inputValue.length}/2000
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isLoading}
            className="
              h-9 px-4 bg-blue-600 hover:bg-blue-700
              text-white border-0 shadow-sm transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:bg-gray-400
              flex items-center gap-2 rounded-lg
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Thinking...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {context === "chat" ? "Send" : "Plan Goal"}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
