import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { DetailedPlan } from '../types';
import DetailedPlanView from './DetailedPlanView';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, UsersIcon, ChatBubbleLeftIcon, PaperAirplaneIcon } from './icons/Icons';
import ChatAssistant from './ChatAssistant';

interface CollaborativeSessionProps {
  sessionId: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

const CollaborativeSession: React.FC<CollaborativeSessionProps> = ({ sessionId }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [plan, setPlan] = useState<DetailedPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSockets
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_session', { sessionId, user: { id: user.id || Math.random().toString(), name: user.name } });
    });

    newSocket.on('session_state', (state) => {
      if (state.plan) setPlan(state.plan);
      if (state.messages) setMessages(state.messages);
      if (state.users) setActiveUsers(state.users);
    });

    newSocket.on('user_joined', (newUser) => {
      setActiveUsers((prev) => {
        if (!prev.find(u => u.id === newUser.id)) {
           return [...prev, newUser];
        }
        return prev;
      });
    });

    newSocket.on('user_left', (socketId) => {
      // In a real app we'd map socketId to userId, for brevity we rely on state sync or simple mapping.
      // Easiest is just waiting for a full state sync if needed, or we just keep it simple.
    });

    newSocket.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on('plan_updated', (newPlan: DetailedPlan) => {
      setPlan(newPlan);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !user) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      userId: user.id || 'unknown',
      userName: user.name,
      text: inputText,
      timestamp: Date.now()
    };

    socket.emit('send_message', { sessionId, message: newMsg });
    // Optimistic update
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleUpdatePlan = (newPlan: DetailedPlan) => {
    setPlan(newPlan);
    if (socket) {
      socket.emit('update_plan', { sessionId, newPlan });
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}?session=${sessionId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard! Share it with your friends to co-plan.');
  };

  if (!plan) return <div className="text-center p-12 text-white">Loading collaborative session...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-8 w-full h-auto lg:h-[calc(100vh-140px)]">
      {/* Plan View (Left) */}
      <div className="w-full lg:w-2/3 h-auto max-h-[600px] lg:max-h-none lg:h-full overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
        <div className="bg-brand-secondary/20 border border-brand-secondary/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center backdrop-blur-md">
          <div>
            <h2 className="font-bold text-brand-secondary flex items-center">
              <UsersIcon className="w-5 h-5 mr-2" />
              Live Group Session
            </h2>
            <p className="text-sm text-white/70 font-light">Anyone with the link can view and edit this plan.</p>
          </div>
          <button onClick={copyLink} className="bg-brand-secondary text-brand-dark px-4 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-colors shrink-0 w-full sm:w-auto">
            Copy Invite Link
          </button>
        </div>
        
        {/* We reuse the DetailedPlanView but pass a prop to hide its own spacing if needed, though default is fine */}
        <DetailedPlanView plan={plan} onPlanUpdated={handleUpdatePlan} isCollaborative={true} />
      </div>

      {/* Chat & Presence (Right) */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 overflow-hidden shadow-2xl h-[450px] lg:h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shadow-sm">
          <h3 className="font-bold flex items-center">
            <ChatBubbleLeftIcon className="w-5 h-5 mr-2 text-brand-secondary" />
            Group Chat
          </h3>
          <div className="flex flex-col text-right">
             <span className="text-xs text-white/60">Active now:</span>
             <span className="text-sm font-bold text-brand-secondary">{activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-white/50 mb-1 ml-1">{msg.userName}</span>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${isMe ? 'bg-brand-secondary text-brand-dark rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm border border-white/10'}`}>
                   {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Chat with friends..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-secondary transition-colors"
            />
            <button type="submit" disabled={!inputText.trim()} className="bg-brand-secondary p-2 rounded-xl text-brand-dark hover:bg-yellow-400 disabled:opacity-50 transition-colors">
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      
      <ChatAssistant currentPlan={plan!} onUpdatePlan={handleUpdatePlan} />
    </div>
  );
};

export default CollaborativeSession;
