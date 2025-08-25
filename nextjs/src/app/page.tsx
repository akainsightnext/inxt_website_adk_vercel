import { Suspense } from "react";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ava - AI Chat",
  description: "Get instant answers about InsightNext's AI and data analytics solutions",
};

export default function HomePage(): React.JSX.Element {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-600">Loading...</div>}>
        <ChatProvider>
          <ChatContainer />
        </ChatProvider>
      </Suspense>
    </div>
  );
}
