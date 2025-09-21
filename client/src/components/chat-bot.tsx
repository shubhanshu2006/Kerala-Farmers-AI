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

  // 👇 Chatbot logic (rule-based for now)
  const handleBotResponse = (userMessage: string) => {
    let reply = "";

    if (userMessage.toLowerCase().includes("farming")) {
      reply = "Farming is the backbone of our economy 🌱. Do you want info about crops, techniques, or markets?";
    } else if (userMessage.toLowerCase().includes("crop")) {
      reply = "Which crop are you interested in? (Wheat, Rice, Maize, etc.)";
    } else if (userMessage.toLowerCase().includes("weather")) {
      reply = "Weather plays a big role in farming ☀️🌧️. Do you want today's forecast or weekly details?";
    } else if (userMessage.toLowerCase().includes("today")) {
      reply = "Today's weather is sunny with a high of 30°C and a low of 20°C. Perfect for farming! 🌞";
    }
      else if (userMessage.toLowerCase().includes("weekly")) {
      reply = "This week looks great for farming! Expect sunny days with occasional showers. 🌤️🌦️";
    }
      else if (userMessage.toLowerCase().includes("bye")) {
      reply = "Goodbye! 👋 Happy farming!";
    }
      else if (userMessage.toLowerCase().includes("help")) {
      reply = "Sure! I'm here to assist you with farming-related queries. What do you need help with?";
    }
      else if (userMessage.toLowerCase().includes("tips")) {
      reply = "Here are some farming tips: 1. Rotate your crops 🌾. 2. Use organic fertilizers 🌿. 3. Monitor soil health 🧪. Anything specific you want to know?";
    }
      else if (userMessage.toLowerCase().includes("market")) {
      reply = "The current market prices are: Wheat - $200/ton, Rice - $250/ton, Maize - $180/ton. Prices may vary based on location and quality.";
    }
      else if (userMessage.toLowerCase().includes("price")) {
      reply = "Which crop's price are you interested in? (Wheat, Rice, Maize, etc.)";
    }
      else if (userMessage.toLowerCase().includes("soil")) {
      reply = "Soil health is crucial for good yields 🌱. Regularly test your soil, add organic matter, and avoid over-tilling. Need more details?";
    }
      else if (userMessage.toLowerCase().includes("pest")) {
      reply = "Pest management is key to protecting your crops 🐛. Use integrated pest management (IPM) techniques and consider natural predators. Want specific advice?";
    }
      else if (userMessage.toLowerCase().includes("disease")) {
      reply = "Crop diseases can be managed by crop rotation, resistant varieties, and proper field sanitation 🦠. Do you have a specific disease in mind?";
    }
      else if (userMessage.toLowerCase().includes("What can Krishi Sahayi do")) {
      reply = "Krishi Sahayi is your personal farming assistant! It can provide information on crops, weather, market prices, farming tips, pest management, and more. How can I assist you today?";
    }
    else if (userMessage.toLowerCase().includes("hello")) {
      reply = "Hello! 👋 How can I help you today?";
    } else if (userMessage.toLowerCase().includes("thank")) {
      reply = "You're welcome! 😊 If you have more questions, feel free to ask.";
    } else if (userMessage.toLowerCase().includes("wheat")) {
      reply = "Wheat is a staple crop 🌾. It requires well-drained soil and moderate rainfall. Anything specific you want to know?";
    } else if (userMessage.toLowerCase().includes("rice")) {
      reply = "Rice thrives in warm, wet conditions 🌾💧. It needs plenty of water during its growing season. Any particular aspect you're curious about?";
    } else if (userMessage.toLowerCase().includes("maize")) {
      reply = "Maize, or corn, is a versatile crop 🌽. It prefers well-drained soil and full sun. Do you want tips on cultivation or pest management?";
    }
    else {
      reply = "I didn’t quite get that 🤔. Could you rephrase?";
    }

    return reply;
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = { id: Date.now(), text: inputText, isUser: true };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        text: handleBotResponse(inputText), // <-- dynamic response here
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
