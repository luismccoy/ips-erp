import React, { useState, useRef, useEffect } from 'react';
import { ChatTeardropText, X, PaperPlaneRight, Robot, Sparkle } from '@phosphor-icons/react';

interface Message {
    id: string;
    type: 'user' | 'bot';
    text: string;
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'bot',
            text: '¡Hola! Soy el especialista virtual de IPS-ERP. ¿Le gustaría saber cómo nuestra IA optimiza las alertas de inventario o le defiende de glosas automáticamente?'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: inputValue
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate secure backend response with a delay
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                text: '¡Es una excelente pregunta para nuestro equipo de implementación! Solo estoy autorizado para discutir funcionalidades generales como los RIPS y la inteligencia artificial para turnos. Por favor, solicite acceso a la beta para que un experto pueda detallarle el aspecto técnico de su IPS.'
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-blue-500/50 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'} flex items-center justify-center`}
            >
                <ChatTeardropText className="w-6 h-6" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-full md:w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5 fade-in duration-300 flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 flex justify-between items-center text-white shadow-md relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
                                <Robot className="w-5 h-5 text-blue-100" weight="fill" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">Especialista IPS-ERP</h3>
                                <p className="text-[11px] text-blue-200 flex items-center gap-1.5 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                                    Conectado (AWS IA)
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white bg-white/5 hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="h-[380px] p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4 relative">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                            backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}></div>
                        <div className="text-center my-2">
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 bg-slate-200/50 px-2 py-1 rounded-full">Hoy</span>
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
                                <div className={`max-w-[85%] p-3.5 text-[13px] leading-relaxed shadow-sm ${msg.type === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex w-full justify-start relative z-10 animate-in fade-in duration-300">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-1.5 h-[42px]">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100 z-10 relative">
                        <form onSubmit={handleSend} className="flex gap-2 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Pregúnteme sobre el ERP..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
                            >
                                <PaperPlaneRight className="w-4 h-4 ml-0.5" weight="bold" />
                            </button>
                        </form>
                        <div className="text-[10px] text-center text-slate-400 mt-2.5 flex items-center justify-center gap-1.5 font-medium uppercase tracking-wider">
                            <Sparkle className="w-3.5 h-3.5 text-amber-500" weight="fill" />
                            Respuestas seguras y auditadas
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
