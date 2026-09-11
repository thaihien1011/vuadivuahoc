import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Compass } from 'lucide-react';
import { askRaccoonAI } from '../../services/aiAssistant';
import { useActiveTheme } from '../../services/theme';

export default function RaccoonAiModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào Nhà thám hiểm! Raccoon đây! Bạn có thắc mắc gì về Lịch sử hay Địa lý các tỉnh thành Việt Nam không? Hãy hỏi Raccoon nhé ⭐!'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const { logoUrl, faceLogoUrl } = useActiveTheme();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    const isFirstUserMsg = messages.length <= 1;

    setLoading(true);
    try {
      const aiReply = await askRaccoonAI(userText, '', isFirstUserMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Raccoon đang bận thám hiểm một chút, bạn thử lại sau giây lát nhé ⭐!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 pb-16 sm:pb-3 animate-fade-in">
      <div className="bg-white border-2 border-sky-400 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] overflow-hidden mb-0">
        {/* HEADER */}
        <div className="bg-sky-500 p-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 p-0.5 shrink-0">
              <img src={faceLogoUrl || logoUrl} alt="Logo Raccoon AI" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight flex items-center gap-1.5">
                Raccoon Thám Hiểm
                <img src={faceLogoUrl || logoUrl} alt="Raccoon" className="w-5 h-5 rounded-full object-cover border border-white/40 shadow-sm shrink-0" />
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              </h3>
              <p className="text-[11px] text-sky-100 font-extrabold uppercase tracking-wider">Trợ Lý AI Lịch Sử & Địa Lý</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors"
            title="Đóng cửa sổ chat"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.sender === 'ai' ? (
                <div className="w-9 h-9 rounded-xl bg-white border border-sky-300 overflow-hidden shrink-0 shadow-sm p-0.5">
                  <img src={faceLogoUrl || logoUrl} alt="Raccoon AI" className="w-full h-full object-cover rounded-lg" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm font-black text-xs">
                  Bạn
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-bold leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky-600 animate-pulse pl-11">
              <Compass className="w-4 h-4 animate-spin" /> Raccoon đang suy nghĩ & tìm câu trả lời...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT FORM WITH 3-LINE TEXTAREA */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-end gap-2.5 shrink-0">
          <textarea
            rows={3}
            value={inputQuestion}
            onChange={e => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Hỏi Raccoon về Lịch Sử hoặc Địa Lý... (Nhấn Enter để gửi, Shift + Enter để xuống dòng)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500 focus:bg-white resize-none leading-relaxed shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="btn-duo-blue py-3 px-4 text-xs font-bold gap-1.5 shrink-0 self-end h-[74px] flex flex-col items-center justify-center rounded-2xl"
          >
            <Send className="w-4 h-4" />
            <span>Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
