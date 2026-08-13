"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Message = {
  role: "agent" | "user";
  text: string;
  showWaButton?: boolean;
  userMessage?: string;
};

export default function FloatingChat() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", text: "Welcome to MANTRA. Do you need assistance with sizing, stock, or our collection?" }
  ]);
  const [input, setInput] = useState("");

  // NOMOR WA ADMIN MANTRA (Gunakan awalan 62)
  const waNumber = "6281234567890"; 

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userText = input;
    
    // 1. Tambahkan pesan user ke layar
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");

    // 2. Bot otomatis membalas dengan membawa tombol WA
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "agent", 
        text: "For a faster response, please continue this conversation directly with our Admin via WhatsApp.",
        showWaButton: true,
        userMessage: userText
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={cn(
          "bg-[#050505] border border-[#1f1f1f] w-80 mb-4 transition-all duration-300 transform origin-bottom-right flex flex-col shadow-2xl",
          isOpen ? "scale-100 opacity-100 h-96" : "scale-0 opacity-0 h-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="border-b border-[#1f1f1f] p-4 flex justify-between items-center bg-[#111111]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[#ececec] text-xs uppercase tracking-widest font-bold">Mantra Support</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#ececec]/60 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Kondisi: Jika user BELUM login */}
        {!session?.user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#111] border border-[#1f1f1f] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#ececec]/60" />
            </div>
            <p className="text-[#ececec]/60 text-xs leading-relaxed">
              Please log in to your account to start a conversation with our support team.
            </p>
            <button 
              onClick={() => router.push("/login?redirect=/")}
              className="bg-[#ececec] text-[#050505] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
            >
              Log In to Chat
            </button>
          </div>
        ) : (
          /* Kondisi: Jika user SUDAH login */
          <>
            {/* Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={cn("max-w-[85%] p-3 text-sm flex flex-col gap-2", msg.role === "agent" ? "bg-[#1f1f1f] text-[#ececec] self-start" : "bg-[#ececec] text-[#050505] self-end")}>
                  <span>{msg.text}</span>
                  
                  {msg.showWaButton && (
                    <a 
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello MANTRA Admin, I would like to ask: "${msg.userMessage}"`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#20b858] transition-colors border border-transparent"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12.031 21.054c-1.895 0-3.753-.497-5.418-1.442l-.388-.22-4.024 1.055 1.076-3.923-.242-.385C2.105 14.398 1.547 12.513 1.547 10.61c0-5.753 4.685-10.435 10.457-10.435 2.79 0 5.41 1.085 7.382 3.057 1.972 1.973 3.058 4.594 3.058 7.382 0 5.754-4.685 10.44-10.413 10.44zm-7.61-3.084l2.42-.635.43.25c1.46.85 3.12 1.3 4.82 1.3 4.67 0 8.47-3.8 8.47-8.47 0-2.26-.88-4.39-2.48-5.99-1.6-1.6-3.73-2.48-5.99-2.48-4.67 0-8.47 3.8-8.47 8.47 0 1.74.47 3.44 1.36 4.93l.26.44-.72 2.63z" />
                        <path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.09-.43-.14-.62.14-.18.28-.71.9-.88 1.09-.16.18-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.38-.82-.74-1.38-1.66-1.54-1.94-.16-.28-.02-.44.12-.58.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.18.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.05-.22-.54-.45-.47-.62-.48-.16-.01-.35-.01-.54-.01-.18 0-.49.07-.74.35-.25.28-.97.95-.97 2.3 0 1.36 1 2.67 1.14 2.86.14.18 1.95 2.98 4.73 4.18.66.28 1.18.45 1.58.58.67.21 1.28.18 1.76.11.54-.08 1.64-.67 1.88-1.32.22-.65.22-1.2.16-1.32-.07-.11-.25-.18-.54-.32z" />
                      </svg>
                      Continue to WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="border-t border-[#1f1f1f] p-2 flex bg-[#111111]">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent text-[#ececec] text-sm focus:outline-none px-2 placeholder-[#ececec]/30"
              />
              <button type="submit" className="p-2 text-[#ececec]/60 hover:text-white cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Floating Button Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 bg-[#ececec] text-[#050505] flex items-center justify-center rounded-none hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer",
          isOpen && "rotate-90 opacity-0 pointer-events-none absolute"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}