import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";


export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your farming assistant. How can I help you today?",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = { id: Date.now(), text: inputText, isUser: true };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        text: "I understand your question about farming. Let me help you with that...",
        isUser: false,
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="bg-green-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <h3 className="font-semibold">AI Assistant</h3>
        <button onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.isUser
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your question..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <Button onClick={sendMessage} size="sm">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
