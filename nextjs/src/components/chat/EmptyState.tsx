"use client";

import { Target } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * EmptyState - AI Goal Planner welcome screen
 * Extracted from ChatMessagesView empty state section
 * Displays when no messages exist in the current session
 */
export function EmptyState(): React.JSX.Element {
  const [welcomeText, setWelcomeText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  
  const fullWelcomeText = "Hi there! 👋 Welcome to InsightNext! I'm your AI assistant, ready to help you discover how our AI and data analytics solutions can transform your business. What can I help you with today? 🚀";

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 30; // milliseconds per character

    const typeText = () => {
      if (currentIndex < fullWelcomeText.length) {
        setWelcomeText(fullWelcomeText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, typingSpeed);
      } else {
        setIsTyping(false);
      }
    };

    // Start typing after a short delay
    setTimeout(typeText, 500);
  }, []);

  // Auto-scroll during welcome message streaming
  useEffect(() => {
    if (isTyping) {
      const scrollToBottom = () => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      };

      const scrollInterval = setInterval(scrollToBottom, 100);
      return () => clearInterval(scrollInterval);
    }
  }, [isTyping]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center min-h-[60vh]">
      <div className="max-w-sm w-full space-y-6">
        {/* Main header */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">InsightNext Assistant</h1>
        </div>

        {/* Streaming welcome message */}
        <div className="space-y-4 flex-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-left">
            <div className="flex-1">
              <p className="text-sm leading-relaxed ai-message-text" style={{ color: '#000000 !important', fontWeight: 'normal' }}>
                <span style={{ color: '#000000 !important' }}>
                  {welcomeText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </span>
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
