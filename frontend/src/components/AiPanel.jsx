import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { llmAPI } from '../services/api';

export default function AiPanel({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI Placement Analytics Assistant. Ask me anything about your placement data — trends, insights, predictions, or improvement strategies.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await llmAPI.chat(userMsg);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: res.data.response, model: res.data.model },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please make sure the backend is running and try again.',
                },
            ]);
        }
        setLoading(false);
    };

    const quickQuestions = [
        'Give me a placement overview',
        'Which department has best placements?',
        'How can students improve placement chances?',
        'Predict next year trends',
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-screen w-96 z-50 bg-dark-800/95 backdrop-blur-xl 
            border-l border-white/5 flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 
                flex items-center justify-center">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">AI Assistant</h3>
                                <p className="text-[10px] text-slate-500">Powered by Ollama</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-700 text-slate-400 
              hover:text-slate-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${msg.role === 'user'
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'bg-accent-400/20 text-accent-400'}`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`max-w-[280px] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-primary-500/20 text-slate-200 rounded-tr-sm'
                                        : 'bg-dark-700/50 text-slate-300 rounded-tl-sm border border-white/5'}`}>
                                    {msg.content}
                                    {msg.model && msg.model !== 'error' && msg.model !== 'fallback' && (
                                        <p className="text-[10px] text-slate-500 mt-2">via {msg.model}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-accent-400/20 text-accent-400 
                  flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                                <div className="px-4 py-3 bg-dark-700/50 rounded-2xl rounded-tl-sm border border-white/5">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Loader2 size={14} className="animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {quickQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(q); }}
                                    className="px-3 py-1.5 text-xs bg-dark-700/50 border border-white/5 rounded-lg
                    text-slate-400 hover:text-slate-200 hover:border-primary-500/20 transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-white/5">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask about your placement data..."
                                className="flex-1 px-4 py-2.5 bg-dark-700/50 border border-white/5 rounded-xl
                  text-sm text-slate-200 placeholder-slate-500 outline-none
                  focus:border-primary-500/30 transition-colors"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600
                  text-white disabled:opacity-50 hover:shadow-lg hover:shadow-primary-500/25
                  transition-all active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
