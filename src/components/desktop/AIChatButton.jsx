import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, ArrowRight } from 'lucide-react';
import Teemane from '../shared/Teemane';
import Button from '../shared/Button';
import { supabase } from '../../lib/supabase';

export const AIChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Dumela! I am Teemane, your TalentHub AI Assistant. Ask me anything about your job postings, candidate screening, or help with writing interview descriptions.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Try to call Supabase Edge Function for AI Chat if available
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage],
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'I processed your request, but there was an issue returning the text.' },
      ]);
    } catch (err) {
      console.error('AI Chat function error, falling back to mock response:', err);
      
      // Smart local fallback responses for key recruiter tasks:
      setTimeout(() => {
        let reply = "I'm processing that for you. Here is an draft proposal.";
        const text = userMessage.content.toLowerCase();
        if (text.includes('screening') || text.includes('question')) {
          reply = "Here are 3 suggested pre-screening questions for your role:\n\n1. *Multiple Choice:* \"How many years of professional experience do you have with CIPS / supply chain logistics?\" (0-2 years, 3-5 years, 6+ years)\n2. *Free Text:* \"Briefly describe a time you optimized a procurement process in Botswana. What was the outcome?\"\n3. *Multiple Choice:* \"Are you currently registered with the BICA / ACCA professional body?\" (Yes, No, In Progress)";
        } else if (text.includes('job') || text.includes('description') || text.includes('draft')) {
          reply = "Sure! Here is a outline for your job description:\n\n**Role:** Senior Accountant\n**Location:** Gaborone, Botswana\n**Key Requirements:**\n- Bachelor's Degree in Finance or Accounting\n- ACCA/BICA professional qualification is mandatory\n- 3-5 years experience in credit risk assessment and financial planning\n- Fluent in Setswana and English\n\n*Would you like me to tailor this for a specific industry like Mining or Tourism?*";
        } else if (text.includes('candidate') || text.includes('compare')) {
          reply = "To compare candidates, you can use our side-by-side **Candidate Comparison View** inside the applications pipeline. I can also score their uploaded CVs automatically (giving them a score out of 100 based on your job requirements) if you have the **AI CV Scoring** feature flag toggled on in settings!";
        } else {
          reply = "That sounds like a great hiring plan. I can help you analyze candidates, write custom Setwana-friendly job listings, or draft interview scripts. How would you like to proceed?";
        }
        
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        setLoading(false);
      }, 1000);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group"
        >
          <Sparkles className="w-5 h-5 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm font-semibold tracking-wide font-display">Teemane AI</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[380px] h-[500px] rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 bg-primary text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-tight">Teemane Recruiter AI</h3>
                <p className="text-[10px] text-white/80 font-medium">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Stack */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-zinc-900/50 no-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                    <Teemane pose={loading ? 'thinking' : 'default'} size={24} animate={false} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-sans ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800 shadow-sm rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                  <Teemane pose="thinking" size={24} animate={true} />
                </div>
                <div className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 shadow-sm px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-500 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask about candidates, jobs..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-sans"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatButton;
