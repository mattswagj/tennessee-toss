"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { SaladBowlIcon } from "@/components/brand/SaladBowlIcon";

const STORAGE_KEY = "tn-toss-chat";
const MAX_STORED = 40;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES_EN = [
  "What's your most popular salad?",
  "Do you have vegan options?",
  "How does the loyalty program work?",
  "Build-your-own prices?",
];
const QUICK_REPLIES_ES = [
  "¿Cuál es la ensalada más popular?",
  "¿Tienen opciones veganas?",
  "¿Cómo funciona el programa de lealtad?",
  "¿Precios para armar la mía?",
];

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 items-center py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const t = useTranslations("chat");
  const { locale } = useLanguage();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed.slice(-MAX_STORED));
        return;
      }
    } catch {}
    setMessages([{ role: "assistant", content: t("greeting") }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {}
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, streaming]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);
    setStreamingText("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          language: locale,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Bad response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingText(accumulated);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: accumulated || "…" }]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const fallback = locale === "es"
        ? "Algo salió mal. Por favor, inténtalo de nuevo."
        : "Something went wrong. Please try again!";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setStreaming(false);
      setStreamingText("");
      abortRef.current = null;
    }
  }, [messages, streaming, locale]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const quickReplies = locale === "es" ? QUICK_REPLIES_ES : QUICK_REPLIES_EN;
  const showQuickReplies = messages.length <= 1 && !streaming;

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-3 sm:right-5 z-50 w-[calc(100vw-1.5rem)] max-w-[360px] flex flex-col rounded-2xl shadow-soft-lg overflow-hidden border border-brown/10 bg-white animate-fade-up">
          {/* Header */}
          <div className="bg-brown px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <SaladBowlIcon size={28} />
              <div>
                <p className="font-bold text-cream text-sm leading-none">{t("title")}</p>
                <p className="text-cream/60 text-[10px] leading-none mt-0.5">
                  {streaming ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft inline-block" />
                      {locale === "es" ? "Escribiendo…" : "Typing…"}
                    </span>
                  ) : (
                    locale === "es" ? "En línea" : "Online"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-cream/60 hover:text-cream transition-colors p-1"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream scrollbar-hide"
            style={{ maxHeight: "360px", minHeight: "200px" }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-brown text-cream rounded-br-sm"
                      : "bg-white text-brown shadow-soft rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Streaming bubble */}
            {streaming && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white text-brown shadow-soft px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
                  {streamingText ? streamingText : <ThinkingDots />}
                </div>
              </div>
            )}

            {/* Quick reply chips */}
            {showQuickReplies && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs bg-white text-brown border border-brown/15 px-3 py-1.5 rounded-full hover:bg-cream hover:border-brown/30 transition-colors shadow-sm text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-brown/8 bg-white p-3 flex gap-2 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              disabled={streaming}
              className="flex-1 text-sm border border-brown/15 rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-cream text-brown placeholder:text-brown/40 disabled:opacity-60"
            />
            <button
              onClick={() => send(input)}
              disabled={streaming || !input.trim()}
              className="bg-primary hover:bg-primary-600 disabled:opacity-40 text-white p-2 rounded-xl transition-colors flex-shrink-0"
              aria-label={t("send")}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-3 sm:right-5 z-50 w-14 h-14 bg-brown hover:bg-brown-700 text-cream rounded-full shadow-soft-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <CloseIcon /> : <SaladBowlIcon size={30} />}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-cream" />
        )}
      </button>
    </>
  );
}
