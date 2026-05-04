'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import api from '../lib/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy tu asistente financiero virtual. ¿En qué te puedo ayudar hoy?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const pathname = usePathname();

  // Resetear el chat al cerrar sesión (ir al login)
  useEffect(() => {
    if (pathname === '/') {
      setMessages([{ text: '¡Hola! Soy tu asistente financiero virtual. ¿En qué te puedo ayudar hoy?', sender: 'bot' }]);
      setUserData(null);
      setIsOpen(false);
    }
  }, [pathname]);

  const fetchUserData = async () => {
    try {
      const mes = new Date().getMonth() + 1;
      const anio = new Date().getFullYear();
      const [repRes, presRes] = await Promise.all([
        api.get(`/reportes/?mes=${mes}&anio=${anio}`),
        api.get('/presupuestos/')
      ]);
      setUserData({
        reporte: repRes.data,
        presupuestos: presRes.data
      });
    } catch (err) {
      console.log("No se pudo cargar el contexto del usuario (probablemente no está logueado)");
    }
  };

  const toggleChat = () => {
    if (!isOpen) fetchUserData();
    setIsOpen(!isOpen);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { text: input, sender: 'user' };
    const currentMessages = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg.text,
          history: currentMessages.filter(m => m.text !== '¡Hola! Soy tu asistente financiero virtual. ¿En qué te puedo ayudar hoy?'),
          userData: userData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
      } else {
        setMessages(prev => [...prev, { text: "Ups, tuve un problema procesando eso. Intenta de nuevo.", sender: 'bot' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Error de conexión con el servidor.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <Bot size={28} />
      </button>

      {/* Ventana de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 glass-card overflow-hidden flex flex-col shadow-2xl z-50"
            style={{ height: '450px' }}
          >
            {/* Header del Chat */}
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-bold">FinanzasIA Bot</h3>
              </div>
              <button onClick={toggleChat} className="hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/80">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white/10 text-white rounded-bl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-background/90 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta algo..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button 
                type="submit"
                className="p-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors flex items-center justify-center min-w-[40px]"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
