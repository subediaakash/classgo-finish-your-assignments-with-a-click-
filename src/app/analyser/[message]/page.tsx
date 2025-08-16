"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Chatbot from "@/components/analyser/chat-bot";

interface MessageData {
  Addiction: string;
  Experience: string;
  Goal: string;
}

export default function AnalyserPage() {
  const params = useParams();
  const [messageData, setMessageData] = useState<MessageData | null>(null);
  const [formattedMessage, setFormattedMessage] = useState("");

  useEffect(() => {
    if (params.message) {
      try {
        const decodedMessage = decodeURIComponent(params.message as string);
        const parsedData: MessageData = JSON.parse(decodedMessage);
        setMessageData(parsedData);

        const formatted = `I am struggling with ${parsedData.Addiction} addiction. 

My experience: ${parsedData.Experience}

My goal: ${parsedData.Goal}

Please create a detailed seven-day plan to help me overcome this addiction.`;

        setFormattedMessage(formatted);
      } catch (error) {
        console.error("Error parsing message data:", error);
      }
    }
  }, [params.message]);

  if (!messageData || !formattedMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Preparing your personalized detox plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
          Your Personalized Detox Plan
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Your Information:
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="font-medium text-emerald-700 mb-2">Addiction:</h3>
              <p className="text-gray-900">{messageData.Addiction}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="font-medium text-emerald-700 mb-2">Experience:</h3>
              <p className="text-gray-900">{messageData.Experience}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <h3 className="font-medium text-emerald-700 mb-2">Goal:</h3>
              <p className="text-gray-900">{messageData.Goal}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <Chatbot message={formattedMessage} />
        </div>
      </div>
    </div>
  );
}
