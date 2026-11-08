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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeId = (prefix) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sendChatRequest = async (message) => {
  const payload = { message, prompt: message };
  const retryStatuses = new Set([502, 503, 504]);
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${CHATBOT_API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("QUOTA_EXCEEDED");
        }
        if (retryStatuses.has(response.status) && attempt < maxAttempts) {
          await sleep(600 * attempt);
          continue;
        }
        throw new Error(`Chatbot request failed (${response.status})`);
      }

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => "");

      const reply = typeof data === "string" ? data : extractReply(data);
      if (reply) return reply;
      return "I am here. How can I help you with movies today?";
    } catch (error) {
      if (error?.name === "AbortError" && attempt < maxAttempts) {
        await sleep(600 * attempt);
        continue;
      }
      if (attempt < maxAttempts) {
        await sleep(600 * attempt);
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("Chatbot request failed");
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "bot",
      text: "Hi! How can I help you today?",
    },
  ]);

  const endRef = useRef(null);
  const canSend = useMemo(() => {
    const now = Date.now();
    return input.trim().length > 0 && !isSending && now >= cooldownUntil;
  }, [input, isSending, cooldownUntil]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, open]);

  const handleSend = async () => {
    const message = input.trim();
    const now = Date.now();
    if (!message || isSending || now < cooldownUntil) return;

    setInput("");
    setError(null);
    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      { id: makeId("user"), role: "user", text: message },
    ]);

    try {
      const reply = await sendChatRequest(message);
      setMessages((prev) => [
        ...prev,
        { id: makeId("bot"), role: "bot", text: reply },
      ]);
    } catch (err) {
      if (err?.message === "QUOTA_EXCEEDED") {
        setCooldownUntil(Date.now() + 2 * 60 * 1000);
        setError("Daily quota reached. Please try again later.");
      } else {
        setError("Unable to reach the chatbot right now.");
      }
      setMessages((prev) => [
        ...prev,
        {
          id: makeId("bot-error"),
          role: "bot",
          text:
            err?.message === "QUOTA_EXCEEDED"
              ? "We hit the free-tier limit. Please try again later."
              : "Sorry, I am having trouble connecting. Please try again soon.",
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
        <div className="mb-4 w-[320px] sm:w-[360px] h-[70vh] rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-[0_25px_60px_rgba(18,24,38,0.2)] backdrop-blur-xl flex flex-col overflow-hidden dark:border-white/10 dark:bg-black/80 dark:text-white dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 via-white to-amber-50 border-b border-slate-200 dark:from-[#1a0a0a]/90 dark:via-[#0f141a]/90 dark:to-[#121826]/90 dark:border-white/10">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-red-600 dark:text-red-400">MovieDb AI</p>
              <p className="text-xs text-slate-500 dark:text-white/70">Powered by your assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition"
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={`${msg.id}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-md ${
                  msg.role === "user"
                    ? "ml-auto bg-red-500/90 text-white"
                    : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[60%] rounded-2xl px-3 py-2 text-sm text-slate-600 bg-slate-100 dark:text-white/80 dark:bg-white/10">
                Thinking...
              </div>
            )}
            {error && (
              <div className="text-xs text-red-500 dark:text-red-300">{error}</div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white dark:border-white/10 dark:from-black/70 dark:to-[#0f141a]/70">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-2 dark:bg-white/5 dark:border-white/10">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about movies..."
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-white dark:placeholder:text-white/40"
                aria-label="Chat message"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className={`h-9 w-9 rounded-full flex items-center justify-center transition ${
                  canSend
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/10 dark:text-white/40"
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
        className={`${open && 'hidden'} rounded-full flex w-10 h-10 items-center justify-center shadow-[0_15px_35px_rgba(229,9,20,0.4)] bg-gradient-to-tr from-red-600 via-red-500 to-amber-400 border border-white/10 hover:scale-105 transition`}
        aria-label="Open chatbot"
      >
        <FaComments className="text-xl text-white" />
      </button>
    </div>
  );
};

export default ChatbotWidget;
