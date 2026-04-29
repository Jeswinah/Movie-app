import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";

const CHATBOT_API_BASE = "https://ai-chatbot-im82.onrender.com";

const RESPONSE_FIELDS = [
  "reply",
  "response",
  "answer",
  "message",
  "text",
  "output",
];

const extractReply = (data) => {
  if (!data) return "";
  for (const field of RESPONSE_FIELDS) {
    if (typeof data[field] === "string" && data[field].trim().length > 0) {
      return data[field];
    }
  }
  if (typeof data?.data === "string") return data.data;
  if (typeof data?.data?.response === "string") return data.data.response;
  return "";
};

const sendChatRequest = async (message) => {
  const response = await fetch(`${CHATBOT_API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Chatbot request failed (${response.status})`);
  }

  const data = await response.json().catch(() => null);
  const reply = extractReply(data);
  if (reply) return reply;
  return "I am here. How can I help you with movies today?";
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "bot",
      text: "Hi! How can I help you today?",
    },
  ]);

  const endRef = useRef(null);
  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, open]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    setInput("");
    setError(null);
    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", text: message },
    ]);

    try {
      const reply = await sendChatRequest(message);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-bot`, role: "bot", text: reply },
      ]);
    } catch (err) {
      setError("Unable to reach the chatbot right now.");
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot-error`,
          role: "bot",
          text: "Sorry, I am having trouble connecting. Please try again soon.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-[320px] sm:w-[360px] max-h-[70vh] rounded-2xl border border-white/10 bg-black/80 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1a0a0a]/90 via-[#0f141a]/90 to-[#121826]/90 border-b border-white/10">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-red-400">Movie AI</p>
              <p className="text-xs text-white/70">Powered by your assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition"
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-md ${
                  msg.role === "user"
                    ? "ml-auto bg-red-500/90 text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[60%] rounded-2xl px-3 py-2 text-sm text-white/80 bg-white/10">
                Thinking...
              </div>
            )}
            {error && (
              <div className="text-xs text-red-300">{error}</div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-white/10 bg-gradient-to-r from-black/70 to-[#0f141a]/70">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about movies..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                aria-label="Chat message"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className={`h-9 w-9 rounded-full flex items-center justify-center transition ${
                  canSend
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                }`}
                aria-label="Send message"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-14 w-14 rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(229,9,20,0.4)] bg-gradient-to-tr from-red-600 via-red-500 to-amber-400 border border-white/10 hover:scale-105 transition"
        aria-label="Open chatbot"
      >
        <FaComments className="text-xl text-white" />
      </button>
    </div>
  );
};

export default ChatbotWidget;
