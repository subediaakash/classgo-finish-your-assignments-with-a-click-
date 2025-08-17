"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ChatbotProps {
  message: string;
}

export default function Chatbot({ message }: ChatbotProps) {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setResponse(""); // Clear previous response

    try {
      const requestBody = {
        input: message,
      };

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
  };

  // Automatically send message when component loads
  useEffect(() => {
    if (message && !hasInitialized) {
      setHasInitialized(true);
      sendMessage();
    }
  }, [message, hasInitialized]);

  const formatResponse = (text: string) => {
    // Split by lines and format for better readability
    return text.split("\n").map((line, index) => {
      if (line.trim() === "") return <br key={index} />;

      // Check if line starts with a number (day indicator)
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="font-semibold text-emerald-700 mt-4 mb-2">
            {line}
          </div>
        );
      }

      // Check if line starts with a dash (bullet point)
      if (line.trim().startsWith("-")) {
        return (
          <div key={index} className="ml-4 mb-1 text-gray-700">
            {line}
          </div>
        );
      }

      return (
        <div key={index} className="mb-2 text-gray-800">
          {line}
        </div>
      );
    });
  };

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
          <div className="prose prose-emerald max-w-none">
            {formatResponse(response)}
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
