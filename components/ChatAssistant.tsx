import React, { useState, useEffect, useRef } from 'react';
import { DetailedPlan } from '../types';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, SparklesIcon } from './icons/Icons';
import { createTravelChatSession } from '../services/geminiService';

interface ChatAssistantProps {
  currentPlan: DetailedPlan | null;
  onUpdatePlan: (newPlan: DetailedPlan) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentPlan, onUpdatePlan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm Aither, your AI travel assistant. How can I help you refine your trip?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createTravelChatSession(currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text: userText, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userText });
      
      let aiText = response.text || '';
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls.find((c: any) => c.name === 'updatePlan');
        if (call) {
          onUpdatePlan(call.args as DetailedPlan);
          if (!aiText) {
            aiText = "I've updated your travel plan as requested! Check out the changes.";
          }
        }
      }

      if (aiText) {
        setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text: aiText, sender: 'ai' }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text: "Sorry, I encountered an error. Please try again.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-secondary text-brand-dark shadow-[0_0_20px_rgba(255,193,7,0.4)] flex items-center justify-center hover:scale-110 transition-transform z-40 ${isOpen ? 'hidden' : ''}`}
      >
        <ChatBubbleLeftRightIcon className="w-7 h-7" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] max-w-[400px] h-[600px] max-h-[80vh] bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-white/10 border-b border-white/10 p-4 flex justify-between items-center">
            <div className="flex items-center text-white font-bold">
              <SparklesIcon className="w-5 h-5 text-brand-secondary mr-2" />
              Aither Assistant
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-brand-secondary text-brand-dark rounded-2xl rounded-tr-sm font-medium' 
                    : 'bg-white/10 text-white border border-white/10 rounded-2xl rounded-tl-sm font-light'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white border border-white/10 rounded-2xl rounded-tl-sm p-4 flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask to change the plan..."
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-secondary text-brand-dark p-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
