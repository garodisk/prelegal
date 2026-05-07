'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ALL_FIELD_KEYS = [
  'document_type',
  'party1_name', 'party1_title', 'party1_company', 'party1_email',
  'party2_name', 'party2_title', 'party2_company', 'party2_email',
  'customer_name', 'provider_name',
  'effective_date', 'governing_law', 'jurisdiction',
  'purpose', 'mnda_term_years',
  'subscription_period', 'pilot_period', 'general_cap_amount',
  'services_description', 'payment_terms', 'uptime_target',
] as const;

interface Props {
  onFormChange: (values: Record<string, string>) => void;
}

export default function ChatSection({ onFormChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/chat/greeting`)
      .then(r => r.json())
      .then(data => {
        setMessages([{ role: 'assistant', content: data.reply }]);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      const newFields = { ...fields };
      for (const key of ALL_FIELD_KEYS) {
        if (data[key] != null) newFields[key] = data[key];
      }
      setFields(newFields);
      onFormChange(newFields);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
        <p className="text-[11px] font-semibold text-[#032147] uppercase tracking-widest">AI Assistant</p>
        <p className="text-[11px] text-[#888888] mt-0.5">Chat to fill the document</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#209dd7] text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#209dd7] focus:border-[#209dd7] disabled:opacity-50 transition-colors"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-[#209dd7] text-white text-sm rounded-lg hover:bg-[#1b8ec0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
