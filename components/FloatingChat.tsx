"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "agent", text: "Welcome to MANTRA. Do you need assistance with sizing or our collection?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", text: input }]);
    const userText = input;
    setInput("");

    // Mock auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "agent", 
        text: "An agent is currently not available, but your message has been recorded. We will reach out via email shortly." 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={cn(
          "bg-[#050505] border border-[#1f1f1f] w-80 mb-4 transition-all duration-300 transform origin-bottom-right flex flex-col",
          isOpen ? "scale-100 opacity-100 h-96" : "scale-0 opacity-0 h-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="border-b border-[#1f1f1f] p-4 flex justify-between items-center bg-[#111111]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[#ececec] text-xs uppercase tracking-widest font-bold">Mantra Support</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#ececec]/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
          {messages.map((msg, i) => (
            <div key={i} className={cn("max-w-[85%] p-3 text-sm", msg.role === "agent" ? "bg-[#1f1f1f] text-[#ececec] self-start" : "bg-[#ececec] text-[#050505] self-end")}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-[#1f1f1f] p-2 flex bg-[#111111]">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-[#ececec] text-sm focus:outline-none px-2 placeholder-[#ececec]/30"
          />
          <button type="submit" className="p-2 text-[#ececec]/60 hover:text-white">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 bg-[#ececec] text-[#050505] flex items-center justify-center rounded-none hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]",
          isOpen && "rotate-90 opacity-0 pointer-events-none absolute"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
