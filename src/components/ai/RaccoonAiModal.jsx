import React, { useState } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Compass } from 'lucide-react';
import { askRaccoonAI } from '../../services/aiAssistant';
import { useActiveTheme } from '../../services/theme';

export default function RaccoonAiModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào Nhà thám hiểm! 🦊 Raccoon đây! Bạn có thắc mắc gì về Lịch sử hay Địa lý các tỉnh thành Việt Nam không? Hãy hỏi Raccoon nhé ⭐!'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const { logoUrl } = useActiveTheme();

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    setLoading(true);
    try {
      const aiReply = await askRaccoonAI(userText);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Raccoon đang bận thám hiểm một chút, bạn thử lại sau giây lát nhé ⭐!' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionPrompts = [
    'Chiến dịch Điện Biên Phủ diễn ra năm nào?',
    'Thái Nguyên nổi tiếng với đặc sản gì?',
    'Cao nguyên Mộc Châu ở tỉnh nào?'
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 pb-16 sm:pb-3 animate-fade-in">
      <div className="bg-white border-2 border-sky-400 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[78vh] sm:max-h-[85vh] overflow-hidden mb-0">
        {/* HEADER */}
        <div className="bg-sky-500 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 p-0.5 shrink-0">
              <img src={logoUrl} alt="Logo Raccoon AI" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight flex items-center gap-1.5">
                Raccoon Thám Hiểm <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              </h3>
              <p className="text-[11px] text-sky-100 font-extrabold uppercase tracking-wider">Trợ Lý AI Lịch Sử & Địa Lý</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors"
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
                <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm font-black text-xs">
                  Bạn
                </div>
              )}

              <div
                className={`p-3 rounded-2xl max-w-[80%] text-xs font-bold leading-relaxed shadow-sm ${
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
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky-600 animate-pulse pl-10">
              <Compass className="w-4 h-4 animate-spin" /> Raccoon đang tìm câu trả lời...
            </div>
          )}
        </div>

        {/* SUGGESTION PROMPTS */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="font-black text-slate-400 shrink-0">Gợi ý:</span>
          {suggestionPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => setInputQuestion(prompt)}
              className="bg-white border border-sky-300 text-sky-700 font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-sky-50 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={e => setInputQuestion(e.target.value)}
            placeholder="Hỏi Raccoon về Lịch Sử hoặc Địa Lý..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="btn-duo-blue py-2.5 px-4 text-xs font-bold gap-1 shrink-0"
          >
            <Send className="w-4 h-4" />
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
