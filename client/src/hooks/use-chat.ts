import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  timestamp: string;
  isUser: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message: "Hello! I'm your farming assistant. How can I help you today? You can ask me about crops, weather, diseases, or market prices.",
      timestamp: new Date().toISOString(),
      isUser: false
    }
  ]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, userId, language, location }: {
      message: string;
      userId?: string;
      language?: string;
      location?: string;
    }) => {
      const res = await apiRequest("POST", "/api/chat", {
        message,
        userId,
        language,
        location
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString() + "-user",
        message: variables.message,
        timestamp: new Date().toISOString(),
        isUser: true
      };

      // Add AI response
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + "-ai",
        message: data.response,
        timestamp: new Date().toISOString(),
        isUser: false
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
    }
  });

  const sendMessage = (message: string, options?: {
    userId?: string;
    language?: string;
    location?: string;
  }) => {
    sendMessageMutation.mutate({
      message,
      ...options
    });
  };

  return {
    messages,
    sendMessage,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error
  };
}
