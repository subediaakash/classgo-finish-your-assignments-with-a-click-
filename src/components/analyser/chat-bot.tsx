"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Markdown from 'react-markdown'


interface ChatbotProps {
  message: string;
}

export default function Chatbot({ message }: ChatbotProps) {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const requestBody = {
        input: message,
      };

      console.log("Preparing to send request with message:", message);
      console.log("Request body:", requestBody);
      console.log("Sending request:", JSON.stringify(requestBody, null, 2));

      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        throw new Error(`HTTP ${chatResponse.status}: ${errorText}`);
      }

      const reader = chatResponse.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          result += chunk;
          setResponse(result);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse(
        `Sorry, there was an error processing your request: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [message]);

  // Automatically send message when component loads
  useEffect(() => {
    if (message && !hasInitialized) {
      setHasInitialized(true);
      sendMessage();
    }
  }, [message, hasInitialized, sendMessage]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your 7-Day Detox Plan
        </h2>
        {!isLoading && response && (
          <Button
            onClick={sendMessage}
            variant="outline"
            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
          >
            Generate New Plan
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 text-lg">
            Creating your personalized detox plan...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This may take a few moments
          </p>
        </div>
      )}

      {response && !isLoading && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="prose prose-emerald max-w-none prose-headings:text-emerald-800 prose-strong:text-emerald-700 prose-p:text-gray-700 prose-li:text-gray-700">
            <Markdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-emerald-800 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-emerald-700 mb-3 mt-6">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-emerald-600 mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 space-y-1">{children}</ul>,
                li: ({ children }) => <li className="ml-4 text-gray-700 list-disc">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-emerald-700">{children}</strong>,
              }}
            >
              {response}
            </Markdown>
          </div>
        </div>
      )}

      {!response && !isLoading && hasInitialized && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No response generated yet.</p>
          <Button
            onClick={sendMessage}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Generate Detox Plan
          </Button>
        </div>
      )}
    </div>
  );
}
